const config = require('config');
var jwt = require('jsonwebtoken');
const db = require("../util/DBOps.js")
const log = require("../util/logging.js")

module.exports.verifyUser = function(header,callback) { 
    if (!header) { return false; } 
    var token = header;
    token = token.replace("Bearer ","");
    var key = config.get("encryption_key");
    try { 
        var j = jwt.verify(token,key);
        db.query(`
            select 
                id as user_id,first_name,last_name,title
            from users u
            where u.id = ? 
        `,[j.user_id],callback)
    } catch (e) { 
        log.error("Unable to authenticate user")
    } 
}

module.exports.userOffices = function(user_id) { 
    db.query(`
    select 
        name,id
        from office u
        where u.id = ?
        `,[user_id],
        function(err,res) {
        }
    )
}

