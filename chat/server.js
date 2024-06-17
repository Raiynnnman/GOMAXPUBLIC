
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const config = require('config');
const port = config.get("chat_port");
const socket = require("socket.io")
const message = require("./message/messsage.js")
const user = require("./user/user.js")
const db = require("./util/DBOps.js")
const log = require("./util/logging.js")
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");


var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
var deploy_status = parseInt(config.get("chat_deploy"));
console.log("deploy_status", deploy_status)
if (deploy_status === 0) {
    app.use(cors(corsOptions)); // Add cors middleware
}

app.use(express());
var options = {}
if (deploy_status === 0) {
    options = {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
      }
    }
}

var server = app.listen(
    port,
    () => { 'Server is running on port ' + port }
);

var httpServer = http.createServer(app);
const io = require("socket.io")(server, options);

if (deploy_status === 1) { 
    io.adapter(createAdapter())
    setupWorker(io)
}

io.on("connect", (socket) => {
    //for a new user joining the room
    socket.on("joinRoom", ({ last, room_id }) => {

            log.debug("joiningRoom",room_id)
            log.debug("last",last)
            var auth = socket.handshake.headers.authorization;
            user.verifyUser(auth,function(err,res) { 
                if (!res || res.length < 1) { 
                    log.error("verifyFailed for " + room_id);
                    return;
                } 
                const u = res[0]
                message.verifyRoom(u.user_id,room_id,function(err,res) { 
                    log.debug("verify=", err, res);
                    if (res.length < 1) { return; }
                    if (!res[0].name) { return; }
                    log.debug("socket_id=",socket.id);
                    socket.join(res[0].name);
                    message.getMissedMessages(last,u.user_id,room_id,function(err,res) { 
                        log.debug("gmmcb",res);
                        if (err) { log.error(err); }
                        res.map((e) => { 
                            log.debug("e",e)
                            socket.emit("message", { 
                                  mid: Math.floor(Math.random() * 10000),
                                  from_user_id: e.user_id,
                                  title: e.title,
                                  first_name: e.first_name,
                                  last_name: e.last_name,
                                  text: e.text,
                                  created: e.created
                            })
                        })
                    })
                });
            });

  });

  //user sending message
  socket.on("chat", (text) => {
    log.debug("chat",text);
    var auth = socket.handshake.headers.authorization;
    const room_id = text.room_id;
    user.verifyUser(auth,function(err,res) { 
        log.debug("vu",err,res)
        if (!res || res.length < 1) { 
            log.error("verifyFailed for " + room_id);
            return;
        } 
        const u = res[0]
        log.debug("user=" + u);
        // Verify the room is legal
        message.verifyRoom(u.user_id,room_id,
            function(err,res) { 
                // get all of the users in that room
                log.debug("vr",err,res);
                if (!res || res.length < 1) { 
                    return;
                } 
                message.getRoomUsers(room_id,
                    function(err,res) { 
                        log.debug("gru",err,res,res.length);
                        log.debug("replying to sender");
                        if (!res || res.length < 1) { 
                            log.error("getRoomUsers returned no records for " + u.user_id + "/" + room_id);
                            return;
                        } 
                        const e = res[0]
                        log.debug("sending message back to user",u.user_id);
                        socket.emit("message", { 
                              mid: Math.floor(Math.random() * 10000),
                              from_user_id: u.user_id,
                              title: u.title,
                              first_name: u.first_name,
                              last_name: u.last_name,
                              text: text.message,
                              created: new Date()
                        })
                        var room_name = res[0].name
                        //log.info("user " + u.user_id + " joining room "  + room_name);
                        //socket.join(room_name);
                        log.debug("sending message to " + room_name);
                        socket.to(room_name).emit("message", {
                          mid: Math.floor(Math.random() * 10000),
                          title: u.title,
                          first_name: u.first_name,
                          last_name: u.last_name,
                          from_user_id: u.user_id,
                          created: new Date(),
                          text: text.message
                        }); 
                        log.debug("updating db");
                        message.saveMessage(room_id,u.user_id,u.user_id,u.user_id,text.message);
                    }) //getRoomUsers
                }) //verifyRoom
            }) // verifyUser
  });

  //when the user exits the room
  socket.on("disconnect", () => {
    //the user is deleted from array of users and a left room message displayed
    log.debug("disconnect")
    //const p_user = user_Disconnect(socket.id);

    /*if (p_user) {
      io.to(p_user.room).emit("message", {
        userId: p_user.id,
        username: p_user.username,
        text: `${p_user.username} has left the room`,
      });
    }*/
  });
});


