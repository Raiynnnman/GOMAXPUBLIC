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

        print("Creating ticket with params:", params)
        print("email", email, "office", office_id, "user", user_id)

        if not email:
            raise ValueError("Email is required")

        # Insert into support_queue table
        db.update("""
            INSERT INTO support_queue (office_id, assignee_id, support_status_id, urgency_id, description)
            VALUES (%s, %s, %s, %s, %s)
        """, (office_id, user_id, params['status'], params['urgency'], params['description']))
        
        ticket_id = db.query("SELECT LAST_INSERT_ID()")[0]['LAST_INSERT_ID()']

        db.commit()

        # Return the created entry
        return db.query("""
            SELECT 
                sq.id AS ticket_id, sq.office_id, sq.assignee_id, sq.support_status_id, sq.urgency_id, sq.description, sq.created, sq.updated
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
        print("User:", user, "Params:", params)
        
        # Get office_id from user or params
        office_id = user.get('offices', [None])[0]  # Assuming 'offices' is a list
        email = user.get('email')
        user_id = user.get('id')

        print("Updating ticket with params:", params)
        print("email", email, "office", office_id, "user", user_id)

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
                        
                        db.update("""
                            INSERT INTO support_queue_history (support_queue_id, user_id, text)
                            VALUES (%s, %s, 'Added Comment')
                        """, (ticket_id, user_id))
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
        if not params:
            raise ValueError("Params cannot be None")

        limit = params.get('limit', 10000)
        offset = params.get('offset', 0)

        db = Query()
        base_query = """
            SELECT 
                sq.id, o.name, u.email, o.id as office_id, ss.status_name as status,
                sq.support_status_id, sq.created, sq.updated, sq.description,
                sq.assignee_id, u.first_name, u.last_name, u.email as user_email, urg.level_name as urgency_level
            FROM
                support_queue sq
                LEFT JOIN office o ON sq.office_id = o.id
                LEFT JOIN office_addresses oa ON oa.office_id = o.id
                LEFT JOIN support_status ss ON ss.id = sq.support_status_id
                LEFT JOIN users u ON sq.assignee_id = u.id
                LEFT JOIN office_plans op ON op.office_id = o.id
                LEFT JOIN urgency_levels urg ON sq.urgency_id = urg.id
            WHERE 1 = 1
        """
        search_params = []
        if 'ticket_id' in params and params['ticket_id']:
            base_query += " AND sq.id = %s"
            search_params.append(int(params['ticket_id']))
        elif 'mine' in params:
            base_query += " AND (o.commission_user_id = %s OR o.setter_user_id = %s)"
            search_params.append(user['id'])
            search_params.append(user['id'])

        if 'status' in params:
            base_query += " AND sq.support_status_id IN (" + ",".join(["%s"] * len(params['status'])) + ")"
            search_params.extend(params['status'])

        if 'search' in params:
            search_term = params['search']
            if 'state:' in search_term.lower():
                base_query += " AND oa.state = %s"
                search_params.append(search_term.split(":")[1].strip())
            elif 'created:' in search_term.lower():
                search_date = search_term.split(":")[1].strip()
                if len(search_date) == 10:
                    base_query += " AND sq.created = %s"
                    search_params.append(search_date)
            elif 'id:' in search_term.lower():
                base_query += " AND sq.id = %s"
                search_params.append(search_term.split(":")[1].strip())
            else:
                base_query += """
                    AND (
                        o.email LIKE %s OR o.name LIKE %s OR u.last_name LIKE %s 
                        OR u.first_name LIKE %s OR oa.name LIKE %s
                    )
                """
                search_val = '%' + search_term + '%'
                search_params.extend([search_val] * 5)

        base_query += " AND o.office_alternate_status_id IS NULL"
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

        print(f"Executing query: {base_query}")
        print(f"With params: {search_params}")

        ret = {
            'tickets': [],
            'total': total,
            'comments': []
        }

        results = db.query(base_query, search_params)
        if results:
            ret['tickets'] = results
            ret['comments'] = db.query(
                """
                    SELECT
                        sqc.support_queue_id, sqc.text, sqc.created, u.first_name, u.last_name, sqc.user_id
                    FROM
                        support_queue_comments sqc
                        LEFT JOIN users u ON sqc.user_id = u.id
                    WHERE
                        sqc.support_queue_id IN (""" + ",".join(["%s"] * len(results)) + """)
                """, [r['id'] for r in results]
            )

        return ret


# class TicketListByUser(TicketList):
#     def execute(self, *args, **kwargs):
#         job, user, off_id, params = self.getArgs(*args, **kwargs)
#         if not params:
#             raise ValueError("Params cannot be None")

#         params['mine'] = True  # Ensure we filter tickets by the current user
#         return super().execute(*args, **kwargs)
