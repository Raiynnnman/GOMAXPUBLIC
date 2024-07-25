const config = require('config');
const db = require("../util/DBOps.js")
const log = require("../util/logging.js")

module.exports.saveMessage = function(room_id, to_user, from_user, user_id, message) {
    log.debug('savingMessage', room_id, to_user, from_user, user_id, message);
    
    db.query(`
        SELECT office_id FROM office_user WHERE user_id = ?
    `, [to_user], function(err, results) {
        if (err) {
            log.error("Error fetching office ID:", err);
            return;
        }

        if (results.length === 0) {
            log.error("No office ID found for user:", to_user);
            return;
        }

        log.debug("Look here", results)

        const office_id = results[0].office_id;
        db.query(`
            SELECT COUNT(*) AS count FROM office WHERE id = ?
        `, [office_id], function(err, officeResults) {
            if (err) {
                log.error("Error checking office ID:", err);
                return;
            }
            if (officeResults[0].count === 0) {
                log.debug("Office with id", office_id, "does not exist. Ignoring...");
                return;
            }
                log.debug("Office with id", office_id, "exists. Proceeding to save the message.");
            db.query(`
                INSERT INTO chat_room_discussions 
                    (chat_rooms_id, from_user_id, to_user_id, to_office_id, text) 
                VALUES
                    (?, ?, ?, ?, ?)
            `, [room_id, from_user, to_user, office_id, message], function(err, res) {
                if (err) {
                    log.error("Error saving message:", err);
                } else {
                    log.debug("Message saved successfully:", res);
                }
            });
        });
    });
}

module.exports.getMissedMessages = function(last,user_id,room_id,callback) { 
    log.debug("gmm:",user_id,room_id)
    db.query(`
        select
            from_user_id as user_id,u.first_name,u.last_name,u.title,
            crd.text,crd.created
         from
            chat_room_discussions crd,
            users u
         where
            u.id = crd.from_user_id and
            crd.chat_rooms_id= ? and
            crd.id > ?
        order by 
            crd.created desc
    `,[room_id,last],callback)

}

module.exports.verifyRoom = function(user_id,room_id,callback) { 
    log.debug("verify:",user_id,room_id)
    db.query(
      `select 
            cr.id,cr.name
        from 
            chat_room_invited cri,
            chat_rooms cr
        where
           cr.id = cri.chat_rooms_id and
           cri.user_id = ? and
           cri.chat_rooms_id = ? 
        UNION 
        select
            cri.id,cr.name
        from 
            chat_room_invited cri,
            chat_rooms cr, office o,
            office_user ou
        where
           ou.office_id = o.id and
           cr.id = cri.chat_rooms_id and
           cri.chat_rooms_id = ? 
        group by o.id
        `,[user_id,room_id,room_id],
         callback)
} 

module.exports.getRoomUsers = function(room_id,callback) { 
    console.log("roomUsers:",room_id,callback)
    db.query(
            `  
            WITH chat_rooms_cte AS (
                SELECT 
                    client_intake_id, 
                    client_intake_offices_id,
                    name
                FROM 
                    chat_rooms
                WHERE 
                    id = ?
            )
            
            SELECT 
                ci.user_id AS user_id, 
                cte.name AS room_name, 
                u.first_name AS first_name, 
                u.last_name AS last_name, 
                u.title AS title
            FROM 
                chat_rooms_cte cte
            JOIN 
                client_intake ci ON ci.id = cte.client_intake_id
            JOIN 
                users u ON ci.user_id = u.id
            
            UNION
            
            SELECT 
                ou.user_id AS user_id, 
                cte.name AS room_name, 
                u.first_name AS first_name, 
                u.last_name AS last_name, 
                u.title AS title
            FROM 
                chat_rooms_cte cte
            JOIN 
                client_intake_offices cio ON cio.id = cte.client_intake_offices_id
            JOIN 
                office_user ou ON cio.office_id = ou.office_id
            JOIN 
                users u ON ou.user_id = u.id;
            
        `,[room_id],callback)
}
