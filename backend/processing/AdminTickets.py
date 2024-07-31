import sys
import os
import json
import traceback
from util import encryption, calcdate
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.Admin import AdminBase
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin, check_crm

log = Logging()
config = settings.config()
config.read("settings.cfg")

class TicketUpdate(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def processRow(self, params, user, db):
        email = params.get('email')
        office_id, user_id, ticket_id = 0, 0, 0

        if not email:
            raise ValueError("Email is required")

        # Query to check existing records
        result = db.query("""
            SELECT 
                sq.id AS ticket_id, sq.office_id, u.id AS user_id
            FROM
                support_queue sq
                LEFT JOIN users u ON u.email = %s
                LEFT JOIN office o ON sq.office_id = o.id
            WHERE
                o.id = %s
        """, (email, params['office_id']))
        
        for row in result:
            office_id = row['office_id']
            ticket_id = row['ticket_id']
            user_id = row['user_id']
        
        if ticket_id == 0:
            # Insert into users table
            db.update("""
                INSERT INTO users (email, first_name, last_name, phone) 
                VALUES (%s, %s, %s, %s)
            """, (params['email'], params['first_name'], params['last_name'], params['phone']))
            
            user_id = db.query("SELECT LAST_INSERT_ID()")[0]['LAST_INSERT_ID()']

            # Insert into office table
            db.update("""
                INSERT INTO office (name, office_type_id, email, user_id, billing_system_id)
                VALUES (%s, %s, %s, %s, %s)
            """, (params['name'], params['office_type_id'], params['email'], user_id, params['billing_system_id']))
            
            office_id = db.query("SELECT LAST_INSERT_ID()")[0]['LAST_INSERT_ID()']

            # Insert into office_history
            db.update("""
                INSERT INTO office_history (office_id, user_id, text)
                VALUES (%s, %s, 'Created (New Record)')
            """, (office_id, user['id']))

            # Insert into support_queue table
            db.update("""
                INSERT INTO support_queue (office_id, assignee_id, support_status_id, description)
                VALUES (%s, %s, %s, %s)
            """, (office_id, user_id, params['support_status_id'], params['description']))
            
            ticket_id = db.query("SELECT LAST_INSERT_ID()")[0]['LAST_INSERT_ID()']

            # Insert into support_queue_history
            db.update("""
                INSERT INTO support_queue_history (support_queue_id, office_id, assignee_id, support_status_id, description)
                VALUES (%s, %s, %s, %s, %s)
            """, (ticket_id, office_id, user_id, params['support_status_id'], params['description']))

            # Insert into office_user
            db.update("""
                INSERT INTO office_user (office_id, user_id)
                VALUES (%s, %s)
            """, (office_id, user_id))
        else:
            # Update office email
            db.update("""
                UPDATE office 
                SET email = %s 
                WHERE id = %s
            """, (params['email'].lower(), office_id))

            # Update users table
            db.update("""
                UPDATE users 
                SET email = %s, first_name = %s, last_name = %s, phone = %s 
                WHERE id = %s
            """, (params['email'], params['first_name'], params['last_name'], params['phone'], user_id))

            # Update support_queue table
            db.update("""
                UPDATE support_queue 
                SET support_status_id = %s, description = %s, updated = CURRENT_TIMESTAMP 
                WHERE office_id = %s
            """, (params['support_status_id'], params['description'], office_id))

            # Insert into support_queue_history
            db.update("""
                INSERT INTO support_queue_history (support_queue_id, office_id, assignee_id, support_status_id, description)
                VALUES (%s, %s, %s, %s, %s)
            """, (ticket_id, office_id, user_id, params['support_status_id'], params['description']))

        # Handle comments
        if 'comments' in params:
            for comment in params['comments']:
                if 'id' in comment:
                    continue
                encrypted_text = encryption.encrypt(comment['text'], config.getKey('encryption_key'))
                db.update("""
                    INSERT INTO support_queue_comments (support_queue_id, user_id, text, uuid)
                    VALUES (%s, %s, %s, UUID())
                """, (ticket_id, user['id'], encrypted_text))
                
                db.update("""
                    INSERT INTO office_history (office_id, user_id, text)
                    VALUES (%s, %s, 'Added Comment')
                """, (office_id, user['id']))

        db.commit()

    @check_crm
    def execute(self, *args, **kwargs):
        job, user, off_id, params = self.getArgs(*args, **kwargs)
        if not params:
            raise ValueError("Params cannot be None")
        db = Query()
        if 'bulk' in params:
            for g in params['bulk']:
                self.processRow(g, user, db)
        else:
            self.processRow(params, user, db)
        return {'success': True}
 
class TicketList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_crm
    def execute(self, *args, **kwargs):
        job, user, off_id, params = self.getArgs(*args, **kwargs)
        if not params:
            raise ValueError("Params cannot be None")
        limit = params.get('limit', 10000)
        offset = params.get('offset', 0)
        print("limit: ", limit, "offset: ", offset, params)

        db = Query()
        q = """
            SELECT 
                sq.id, o.name, o.email, o.id as office_id, ss.status_name as status,
                sq.support_status_id, sq.created, sq.updated, sq.description,
                sq.assignee_id, u.first_name, u.last_name, u.email as user_email,
                oas.name as office_alternate_status_name, op.id as plan_id,
                sq.urgency  -- Add this line to select urgency
            FROM
                support_queue sq
                LEFT JOIN office o ON sq.office_id = o.id
                LEFT JOIN office_addresses oa ON oa.office_id = o.id
                LEFT JOIN support_status ss ON ss.id = sq.support_status_id
                LEFT JOIN users u ON sq.assignee_id = u.id
                LEFT JOIN office_alternate_status oas ON o.office_alternate_status_id = oas.id
                LEFT JOIN office_plans op ON op.office_id = o.id
            WHERE 1 = 1 
        """

        search_params = []
        
        if 'ticket_id' in params and params['ticket_id']:
            q += " AND sq.id = %s "
            search_params.append(int(params['ticket_id']))
        elif 'mine' in params:
            q += " AND (o.commission_user_id = %s OR o.setter_user_id = %s)"
            search_params.append(user['id'])
            search_params.append(user['id'])

        if 'status' in params:
            q += " AND sq.support_status_id IN (" + ",".join(["%s"] * len(params['status'])) + ")"
            search_params.extend(params['status'])

        if 'search' in params:
            search_term = params['search']
            if 'state:' in search_term.lower():
                q += " AND oa.state = %s "
                search_params.append(search_term.split(":")[1].strip())
            elif 'created:' in search_term.lower():
                search_date = search_term.split(":")[1].strip()
                if len(search_date) == 10:
                    q += " AND sq.created = %s "
                    search_params.append(search_date)
            elif 'id:' in search_term.lower():
                q += " AND sq.id = %s "
                search_params.append(search_term.split(":")[1].strip())
            else:
                q += """
                    AND (
                        o.email LIKE %s OR o.name LIKE %s OR u.last_name LIKE %s 
                        OR u.first_name LIKE %s OR oa.name LIKE %s
                    ) 
                """
                search_val = '%' + search_term + '%'
                search_params.extend([search_val] * 5)

            q += " AND o.office_alternate_status_id IS NULL "

        q += " GROUP BY o.id "

        count_result = db.query("SELECT COUNT(id) as cnt FROM (" + q + ") as t", search_params)
        total = count_result[0]['cnt']

        if 'sort' in params:
            sort_col = 'updated'
            sort_dir = params.get('direction', 'asc')
            q += f" ORDER BY {sort_col} {sort_dir}"
        else:
            q += " ORDER BY sq.id ASC"

        search_params.extend([limit, offset * limit])
        q += " LIMIT %s OFFSET %s"

        results = db.query(q, search_params)
        ret = {
            'tickets': results,
            'total': total,
            'comments': db.query("""
                SELECT
                    sqc.support_queue_id, sqc.text, sqc.created, u.first_name, u.last_name
                FROM
                    support_queue_comments sqc
                    LEFT JOIN users u ON sqc.user_id = u.id
                WHERE
                    sqc.support_queue_id IN (""" + ",".join(["%s"] * len(results)) + """)
            """, [r['id'] for r in results
            ]),
            
        }

        return ret

