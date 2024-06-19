const config = require('config');
const db = require("../util/DBOps.js")
const log = require("../util/logging.js")

module.exports.saveMessage = function(room_id,to_user,from_user,user_id,message) { 
    log.debug('savingMessage',room_id);
    db.query(`
        insert into chat_room_discussions 
            (chat_rooms_id,from_user_id,to_user_id,text) values
            (?, ?, ?, ?)
    `,[room_id,from_user,to_user,message],
    function(err,res) {
        if (err) { 
            log.debug("err",err);
            log.debug("res",res);
        }
    })

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
      `select 
            cri.user_id,cr.name,u.first_name,
            u.last_name,u.title
        from 
            chat_room_invited cri,
            chat_rooms cr, users u
        where
           cr.id = cri.chat_rooms_id and
           cri.user_id = u.id and
           cri.chat_rooms_id = ? 
        UNION
        select
            u.id as user_id,'' as name,u.first_name,
            u.last_name,u.title
        from 
            users u, context c 
        where 
            c.user_id = u.id
        `,[room_id],callback)
}
