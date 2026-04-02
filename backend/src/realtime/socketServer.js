const { Server } = require('socket.io');

let ioInstance = null;

exports.initializeSocketServer = (httpServer, clientOrigin) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: clientOrigin,
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.emit('alerts:connected', {
      message: 'Alert stream connected',
      timestamp: new Date().toISOString(),
    });
  });

  return ioInstance;
};

exports.getSocketServer = () => ioInstance;
