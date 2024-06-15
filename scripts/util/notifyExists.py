# util/notifyExists.py

def notify_if_not_exists(db, office_id, notification_category_id):
    existing_notification = db.query("""
        SELECT id FROM office_notifications
        WHERE office_id = %s AND office_notifications_category_id = %s
    """, (office_id, notification_category_id))
    
    return bool(existing_notification)
