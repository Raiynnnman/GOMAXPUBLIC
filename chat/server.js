const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const config = require('config');
const message = require('./message/messsage.js');
const user = require('./user/user.js');
const db = require('./util/DBOps.js');
const log = require('./util/logging.js');
const { createAdapter } = require('@socket.io/cluster-adapter');
const { setupWorker } = require('@socket.io/sticky');

const app = express();
const port = config.get('chat_port');
const deploy_status = parseInt(config.get('chat_deploy'), 10);

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

if (deploy_status === 0) {
  app.use(cors(corsOptions));
}

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

if (deploy_status === 1) {
  io.adapter(createAdapter());
  setupWorker(io);
}

io.on('connection', (socket) => {
  log.info(`User connected: ${socket.id}`);

  // User verification
  const auth = socket.handshake.headers.authorization;
  user.verifyUser(auth, (err, res) => {
    if (err || !res || res.length < 1) {
      log.error('Error verifying user:', err || 'User not found');
      return;
    }

    const u = res[0];
    log.info(`User ID: ${u.user_id}, Name: ${u.first_name} ${u.last_name} connected.`);

    socket.on('joinRoom', ({ last, room_id }) => {
      message.verifyRoom(u.user_id, room_id, (err, res) => {
        if (err || !res || res.length < 1) {
          log.error('Error verifying room:', err || 'Room not found');
          return;
        }

        const room = res[0].name;
        socket.join(room);

        message.getMissedMessages(last, u.user_id, room_id, (err, messages) => {
          if (err) {
            log.error('Error getting missed messages:', err);
            return;
          }

          messages.forEach((msg) => {
            socket.emit('message', {
              mid: msg.mid,
              from_user_id: msg.user_id,
              title: msg.title,
              first_name: msg.first_name,
              last_name: msg.last_name,
              text: msg.text,
              created: msg.created,
            });
          });
        });
      });
    });

    socket.on('chat', (text) => {
      const room_id = text.room_id;
      if (!room_id) {
        log.error('room_id is undefined or null. Cannot proceed.');
        return;
      }

      message.verifyRoom(u.user_id, room_id, (err, res) => {
        if (err || !res || res.length < 1) {
          log.error('Error verifying room:', err || 'Room not found');
          return;
        }

        message.getRoomUsers(room_id, (err, users) => {
          if (err || !users || users.length < 1) {
            log.error('Error getting room users:', err || 'No users found');
            return;
          }

          const otherUser = users.find((user) => user.user_id !== u.user_id);
          if (!otherUser) {
            log.error('No other user found in the room.');
            return;
          }

          const to_user_id = otherUser.user_id;
          const room_name = res[0].name;

          const messageData = {
            mid: Math.floor(Math.random() * 10000),
            from_user_id: u.user_id,
            title: u.title,
            first_name: u.first_name,
            last_name: u.last_name,
            text: text.message,
            created: new Date(),
          };

          socket.emit('message', messageData);
          socket.to(room_name).emit('message', messageData);
          
          message.saveMessage(room_id, to_user_id, u.user_id, u.user_id, text.message);  
        });
      });
    });

    socket.on('disconnect', () => {
      log.info(`User disconnected: ${socket.id}`);
    });
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
