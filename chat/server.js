const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('config');
const socketIO = require('socket.io');
const message = require('./message/messsage.js'); // Fixed typo in the path
const user = require('./user/user.js');
const db = require('./util/DBOps.js');
const log = require('./util/logging.js');
const { createAdapter } = require('@socket.io/cluster-adapter');
const { setupWorker } = require('@socket.io/sticky');

const app = express();
const port = config.get('chat_port');

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

const deploy_status = parseInt(config.get('chat_deploy'), 10);
console.log("deploy_status", deploy_status);

if (deploy_status === 0) {
  app.use(cors(corsOptions));
}

app.use(express.json());

const server = http.createServer(app);

const ioOptions = deploy_status === 0 ? {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
} : {};

const io = socketIO(server, ioOptions);

if (deploy_status === 1) {
  io.adapter(createAdapter());
  setupWorker(io);
}

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', ({ last, room_id }) => {
    console.log(`joinRoom event received for room_id: ${room_id}`);
    log.debug('joiningRoom', room_id);
    const auth = socket.handshake.headers.authorization;
    user.verifyUser(auth, (err, res) => {
      if (err || !res || res.length < 1) {
        log.error('verifyFailed for ' + room_id);
        console.error('User verification failed');
        return;
      }
      const u = res[0];
      console.log('User verified:', u);
      message.verifyRoom(u.user_id, room_id, (err, res) => {
        if (err || res.length < 1 || !res[0].name) {
          console.error('Room verification failed');
          return;
        }
        const room_name = res[0].name;
        socket.join(room_name);
        console.log(`Joined room: ${room_name}`);
        message.getMissedMessages(last, u.user_id, room_id, (err, res) => {
          if (err) {
            log.error(err);
            console.error('Error getting missed messages:', err);
            return;
          }
          console.log('Missed messages:', res);
          res.forEach((e) => {
            socket.emit('message', {
              mid: Math.floor(Math.random() * 10000),
              from_user_id: e.user_id,
              title: e.title,
              first_name: e.first_name,
              last_name: e.last_name,
              text: e.text,
              created: e.created,
            });
          });
        });
      });
    });
  });

  socket.on('chat', (text) => {
    console.log(`chat event received: ${text.message}`);
    const auth = socket.handshake.headers.authorization;
    const room_id = text.room_id;
    user.verifyUser(auth, (err, res) => {
      if (err || !res || res.length < 1) {
        log.error('verifyFailed for ' + room_id);
        console.error('User verification failed');
        return;
      }
      const u = res[0];
      console.log('User verified:', u);
      message.verifyRoom(u.user_id, room_id, (err, res) => {
        if (err || res.length < 1) {
          console.error('Room verification failed');
          return;
        }
        message.getRoomUsers(room_id, (err, res) => {
          if (err || !res || res.length < 1) {
            log.error('getRoomUsers returned no records for ' + u.user_id + '/' + room_id);
            console.error('Error getting room users');
            return;
          }
          const room_name = res[0].name;
          console.log(`Sending message to room: ${room_name}`);
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
          message.saveMessage(room_id, u.user_id, u.user_id, u.user_id, text.message, (err, result) => {
            if (err) {
              console.error('Error saving message:', err);
              return;
            }
            console.log('Message saved to DB successfully:', result);
          });
        });
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    log.debug('disconnect');
  });
});

server.listen(port, () => {
  console.log('Server is running on port ' + port);
});
