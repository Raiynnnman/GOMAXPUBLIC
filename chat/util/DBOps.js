var mysql = require('mysql');
const config = require('config');

var pool = null;
pool  = mysql.createPool({
  connectionLimit : 10,
  host     : config.get("mysql_host"),
  user     : config.get("mysql_user"),
  password : config.get("mysql_pass"),
  database : config.get("mysql_db")
});

module.exports.query = function(query,params,cb) { 
    pool.query(query,params,cb);
}
