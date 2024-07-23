const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const config = require('config');
const port = config.get("chat_port");
const socket = require("socket.io");
const message = require("./message/messsage.js");
const user = require("./user/user.js");
const db = require("./util/DBOps.js");
const log = require("./util/logging.js");
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
var deploy_status = parseInt(config.get("chat_deploy"));
console.log("deploy_status", deploy_status);
if (deploy_status === 0) {
    app.use(cors(corsOptions)); // Add cors middleware
}

app.use(express());
var options = {};
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
    () => { console.log('Server is running on port ' + port); }
);

var httpServer = http.createServer(app);
const io = require("socket.io")(server, options);

if (deploy_status === 1) { 
    io.adapter(createAdapter());
    setupWorker(io);
}

io.on("connect", (socket) => {
    log.info(`User connected: ${socket.id}`);

    // User verification
    var auth = socket.handshake.headers.authorization;
    user.verifyUser(auth, function(err, res) {
        if (err) {
            log.error("Error verifying user:", err);
            return;
        }
        if (!res || res.length < 1) {
            log.error("User verification failed.");
            return;
        }
        const u = res[0];
        log.info(`User ID: ${u.user_id}, Name: ${u.first_name} ${u.last_name} connected.`);

        // For a new user joining the room
        socket.on("joinRoom", ({ last, room_id }) => {
            log.debug("joiningRoom", room_id);
            log.debug("last", last);

            message.verifyRoom(u.user_id, room_id, function(err, res) {
                if (err) {
                    log.error("Error verifying room:", err);
                    return;
                }
                if (res.length < 1) { return; }
                if (!res[0].name) { return; }
                log.debug("socket_id=", socket.id);
                socket.join(res[0].name);
                message.getMissedMessages(last, u.user_id, room_id, function(err, res) {
                    if (err) {
                        log.error("Error getting missed messages:", err);
                        return;
                    }
                    log.debug("gmmcb", res);
                    res.forEach((e) => {
                        log.debug("e", e);
                        socket.emit("message", {
                            mid: Math.floor(Math.random() * 10000),
                            from_user_id: e.user_id,
                            title: e.title,
                            first_name: e.first_name,
                            last_name: e.last_name,
                            text: e.text,
                            created: e.created
                        });
                    });
                });
            });
        });

        // User sending message
        socket.on("chat", (text) => {
            log.debug("chat", text);
            log.debug("Received chat text:", text);
            const room_id = text.room_id;
            log.debug("Extracted room_id:", room_id);

            if (!room_id) {
                log.error("room_id is undefined or null. Cannot proceed.");
                return;
            }

            // Verify the room is legal
            log.debug("LOOK HERE THIS IS THE USER MAKING MESSAGE", u);
            message.verifyRoom(u.user_id, room_id, function(err, res) {
                if (err) {
                    log.error("Error verifying room:", err);
                    return;
                }
                if (!res || res.length < 1) {
                    return;
                }
                message.getRoomUsers(room_id, function(err, res) {
                    if (err) {
                        log.error("Error getting room users:", err);
                        return;
                    }
                    log.debug("gru", err, res, res.length);
                    if (!res || res.length < 1) {
                        log.error("getRoomUsers returned no records for " + u.user_id + "/" + room_id);
                        return;
                    }
                    const e = res[0];
                    const otherUser = res.find(user => user.user_id !== u.user_id);
                    if (!otherUser) {
                        log.error("No other user found in the room for " + u.user_id + "/" + room_id);
                        return;
                    }
                    const to_user_id = otherUser.user_id;
                    log.debug("recieving", to_user_id);
                    log.debug("sender", u.user_id);
                    
                    socket.emit("message", {
                        mid: Math.floor(Math.random() * 10000),
                        from_user_id: u.user_id,
                        title: u.title,
                        first_name: u.first_name,
                        last_name: u.last_name,
                        text: text.message,
                        created: new Date()
                    });
                    var room_name = e.name;
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
                    message.saveMessage(room_id, u.user_id, to_user_id, u.user_id, text.message);
                }); // getRoomUsers
            }); // verifyRoom
        });

        // When the user exits the room
        socket.on("disconnect", () => {
            log.info(`User disconnected: ${socket.id}`);
        });
    });
});
