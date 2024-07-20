const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('config');
const socketIO = require("socket.io");
const message = require("./message/messsage.js"); // Fixed typo in the path
const user = require("./user/user.js");
const db = require("./util/DBOps.js");
const log = require("./util/logging.js");
const { createAdapter } = require("@socket.io/cluster-adapter");
const { setupWorker } = require("@socket.io/sticky");

const app = express();
const port = config.get("chat_port");

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
};

const deploy_status = parseInt(config.get("chat_deploy"), 10);
console.log("deploy_status", deploy_status);

if (deploy_status === 0) {
    app.use(cors(corsOptions)); // Add CORS middleware
}

app.use(express.json());

const server = http.createServer(app);

const ioOptions = deploy_status === 0 ? {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
} : {};

const io = socketIO(server, ioOptions);

if (deploy_status === 1) {
  io.adapter(createAdapter());
  setupWorker(io);
}

io.on("connection", (socket) => {
  // For a new user joining the room
  socket.on("joinRoom", ({ last, room_id }) => {
    log.debug("joiningRoom", room_id);
    log.debug("last", last);
    const auth = socket.handshake.headers.authorization;
    user.verifyUser(auth, (err, res) => {
      if (err || !res || res.length < 1) {
        log.error("verifyFailed for " + room_id);
        return;
      }
      const u = res[0];
      message.verifyRoom(u.user_id, room_id, (err, res) => {
        if (err || res.length < 1 || !res[0].name) return;
        log.debug("socket_id=", socket.id);
        socket.join(res[0].name);
        message.getMissedMessages(last, u.user_id, room_id, (err, res) => {
          if (err) {
            log.error(err);
            return;
          }
          res.forEach((e) => {
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
  });

  // User sending message
  socket.on("chat", (text) => {
    log.debug("chat", text);
    const auth = socket.handshake.headers.authorization;
    const room_id = text.room_id;
    user.verifyUser(auth, (err, res) => {
      if (err || !res || res.length < 1) {
        log.error("verifyFailed for " + room_id);
        return;
      }
      const u = res[0];
      message.verifyRoom(u.user_id, room_id, (err, res) => {
        if (err || res.length < 1) return;
        message.getRoomUsers(room_id, (err, res) => {
          if (err || !res || res.length < 1) {
            log.error("getRoomUsers returned no records for " + u.user_id + "/" + room_id);
            return;
          }
          const room_name = res[0].name;
          socket.emit("message", {
            mid: Math.floor(Math.random() * 10000),
            from_user_id: u.user_id,
            title: u.title,
            first_name: u.first_name,
            last_name: u.last_name,
            text: text.message,
            created: new Date()
          });
          socket.to(room_name).emit("message", {
            mid: Math.floor(Math.random() * 10000),
            title: u.title,
            first_name: u.first_name,
            last_name: u.last_name,
            from_user_id: u.user_id,
            created: new Date(),
            text: text.message
          });
          message.saveMessage(room_id, u.user_id, u.user_id, u.user_id, text.message);
        });
      });
    });
  });

  // When the user exits the room
  socket.on("disconnect", () => {
    log.debug("disconnect");
    // Handle user disconnect logic if needed
  });
});

server.listen(port, () => {
  console.log('Server is running on port ' + port);
});
