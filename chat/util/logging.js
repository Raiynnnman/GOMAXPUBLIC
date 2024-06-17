const config = require('config');



module.exports.error = function(m,...args) { 
    console.log("ERR:" + new Date().toISOString() + ":" + m);
} 
module.exports.info = function(m,...args) { 
    console.log("INF:" + new Date().toISOString() + ":" + m,args);
} 
module.exports.debug = function(m,...args) { 
    var t = config.get("debug");
    if (!t || t.length < 1) { return; }
    console.log("DBG:" + new Date().toISOString() + ":" + m,args);
} 
