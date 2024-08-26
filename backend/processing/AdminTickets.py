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
 
class TicketCreate(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def processRow(self, params, user, db):
        user = params.get('user')
        if user:
            office_id = user.get('office_id')
            email = user.get('email')
            user_id = user.get('id')
        else:
            raise ValueError("User is required")

        if not email:
            raise ValueError("Email is required")

        db.update("""
            INSERT INTO support_queue (office_id, assignee_id, support_status_id, urgency_id, description, summary)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (office_id, user_id, params['status'], params['urgency'], params['description'], params['ticketName']))
        
        ticket_id = db.query("SELECT LAST_INSERT_ID()")[0]['LAST_INSERT_ID()']

        db.commit()

        # Return the created entry
        return db.query("""
            SELECT 
                sq.id AS ticket_id, sq.office_id, 
                sq.assignee_id, sq.support_status_id, 
                sq.urgency_id, sq.description, sq.created, sq.updated, sq.summary
            FROM
                support_queue sq
            WHERE
                sq.id = %s
        """, (ticket_id,))

    @check_crm
    def execute(self, *args, **kwargs):
        job, user, off_id, params = self.getArgs(*args, **kwargs)
        if not params:
            raise ValueError("Params cannot be None")
        db = Query()
        results = []
        if 'bulk' in params:
            for g in params['bulk']:
                result = self.processRow(g, user, db)
                results.append(result)
        else:
            result = self.processRow(params, user, db)
            results.append(result)
        return {'success': True, 'results': results}

    
class TicketUpdate(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def processRow(self, params, user, db):
        
        # Get office_id from user or params
        office_id = user.get('offices', [None])[0]  # Assuming 'offices' is a list
        email = user.get('email')
        user_id = user.get('id')


        if not email:
            raise ValueError("Email is required")
        if not office_id:
            raise ValueError("Office ID is required")

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
        """, (email, office_id))
    
        ticket_id = None
        for row in result:
            office_id = row['office_id']
            ticket_id = row['ticket_id']
            user_id = row['user_id']
          
        
        if ticket_id:
            if 'comments' in params:
                for comment in params['comments']:
                    if 'id' in comment:
                        continue
                    encrypted_text = encryption.encrypt(comment['text'], config.getKey('encryption_key'))
                    try:
                        db.update("""
                            INSERT INTO support_queue_comments (support_queue_id, user_id, text, uuid)
                            VALUES (%s, %s, %s, UUID())
                        """, (ticket_id, user_id, encrypted_text))
                        
                        # db.update("""
                        #     INSERT INTO support_queue_history (support_queue_id, user_id, text)
                        #     VALUES (%s, %s, 'Added Comment')
                        # """, (ticket_id, user_id))
                    except Exception as e:
                        print(f"Error inserting comment: {e}")
            else:
                # Update support_queue table if other params are present
                try:
                    db.update("""
                        UPDATE support_queue 
                        SET support_status_id = %s, description = %s, updated = CURRENT_TIMESTAMP 
                        WHERE id = %s
                    """, (params['status'], params['description'], ticket_id))
                except Exception as e:
                    print(f"Error updating support queue: {e}")

        db.commit()

        # Return the updated entry including comments
        return {
            'ticket': db.query("""
                SELECT 
                    sq.id AS ticket_id, sq.office_id, sq.assignee_id, sq.support_status_id, sq.urgency_id, sq.description, sq.created, sq.updated
                FROM
                    support_queue sq
                WHERE
                    sq.id = %s
            """, (ticket_id,)),
            'comments': db.query("""
                SELECT
                    sqc.support_queue_id, sqc.text, sqc.created, u.first_name, u.last_name, sqc.user_id
                FROM
                    support_queue_comments sqc
                    LEFT JOIN users u ON sqc.user_id = u.id
                WHERE
                    sqc.support_queue_id = %s
            """, (ticket_id,))
        }

    @check_crm
    def execute(self, *args, **kwargs):
        job, user, off_id, params = self.getArgs(*args, **kwargs)
        if not params:
            raise ValueError("Params cannot be None")
        db = Query()
        results = []
        if 'bulk' in params:
            for g in params['bulk']:
                result = self.processRow(g, user, db)
                results.append(result)
        else:
            result = self.processRow(params, user, db)
            results.append(result)
        return {'success': True, 'results': results}


class TicketList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_crm
    def execute(self, *args, **kwargs):
        job, user, off_id, params = self.getArgs(*args, **kwargs)

        limit = params.get('limit', 10000)
        offset = params.get('offset', 0)

        db = Query()
        base_query = """
            SELECT 
                sq.id, sq.summary, o.id as office_id, ss.name as status,
                sq.support_urgency_id, sq.support_status_id, sq.created, 
                sq.updated, sq.description,sq.first_name as contact_first_name,
                sq.last_name as contact_last_name,
                sq.email as contact_email,sq.phone as contact_phone,
                o.name as office_name, sq.assignee_id, 
                u2.first_name as linked_user_first_name,
                u2.last_name as linked_user_last_name,
                u2.phone as linked_user_phone,
                u2.email as linked_user_email,
                o.email as office_email,
                u.first_name as assignee_first, 
                u.last_name as assignee_last, u.email as assignee_email, 
                urg.name as urgency_level
            FROM
                support_queue sq
                LEFT OUTER JOIN office o ON sq.office_id = o.id
                LEFT OUTER JOIN support_status ss ON ss.id = sq.support_status_id
                LEFT OUTER JOIN users u ON sq.assignee_id = u.id
                LEFT OUTER JOIN users u2 ON sq.contact_user_id = u.id
                LEFT OUTER JOIN support_urgency urg ON sq.support_urgency_id = urg.id
            WHERE 1 = 1
        """
        search_params = []
        if 'ticket_id' in params and params['ticket_id']:
            base_query += " AND sq.id = %s"
            search_params.append(int(params['ticket_id']))
        elif 'mine' in params:
            base_query += " AND (o.assignee_id = %s)"
            search_params.append(user['id'])
        if 'status' in params:
            base_query += " AND sq.support_status_id IN (" + ",".join(["%s"] * len(params['status'])) + ")"
            search_params.extend(params['status'])
        if 'search' in params:
            search_term = params['search']
            base_query += """
                AND (
                    o.email LIKE %s OR o.name LIKE %s OR u.last_name LIKE %s 
                    OR u.first_name LIKE %s 
                )
            """
            search_val = '%' + search_term + '%'
            search_params.extend([search_val] * 5)

        base_query += " GROUP BY sq.id"

        count_query = "SELECT COUNT(*) as cnt FROM (" + base_query + ") as t"
        count_result = db.query(count_query, search_params)
        total = count_result[0]['cnt']

        if 'sort' in params:
            sort_col = params.get('sort', 'updated')
            sort_dir = params.get('direction', 'asc')
            base_query += f" ORDER BY {sort_col} {sort_dir}"
        else:
            base_query += " ORDER BY sq.id ASC"

        search_params.extend([limit, offset])
        base_query += " LIMIT %s OFFSET %s"

        ret = {
            'data': [],
            'total': total,
        }

        ret['config'] = {}
        ret['config']['support_status'] = db.query(""" select id, name from support_status """)
        ret['config']['support_urgency'] = db.query(""" select id, name from support_urgency """)
        ret['config']['assignees'] = db.query(""" 
            select
                u.id,u.first_name,u.last_name
            from users u
            where id in
            (select user_id
                from user_entitlements ue,entitlements e
                where ue.entitlements_id=e.id and e.name='SupportUser')
            UNION ALL
            select
                u.id,u.first_name,u.last_name
            from users u
            where id in
            (select user_id
                from user_entitlements ue,entitlements e
                where ue.entitlements_id=e.id and e.name='CRMUser')
            UNION ALL
            select
                u.id,u.first_name,u.last_name
            from users u
            where id in
            (select user_id
                from user_entitlements ue,entitlements e
                where ue.entitlements_id=e.id and e.name='Admin')
            UNION ALL
            select 1,'System',''
            """
        )

        o = db.query(base_query, search_params)
        ret['data'] = []
        for x in o:
            x['ticket_id'] = str(x['id']).zfill(6)
            x['history'] = db.query("""
                    SELECT
                        sqc.support_queue_id, sqc.text, sqc.created, u.first_name, u.last_name, sqc.user_id
                    FROM
                        support_queue_history sqc
                        LEFT OUTER JOIN users u ON sqc.user_id = u.id
                    WHERE
                        sqc.support_queue_id = %s
                """,(x['id'],)
            )
            x['comments'] = db.query(
                """
                    SELECT
                        sqc.support_queue_id, sqc.text, sqc.created, u.first_name, u.last_name, sqc.user_id
                    FROM
                        support_queue_comments sqc
                        LEFT OUTER JOIN users u ON sqc.user_id = u.id
                    WHERE
                        sqc.support_queue_id = %s
                """,(x['id'],)
            )
            ret['data'].append(x)
        return ret


