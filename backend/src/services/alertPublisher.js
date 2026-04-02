const { getSocketServer } = require('../realtime/socketServer');

exports.publishAlertCreated = (alert) => {
  const io = getSocketServer();

  if (io) {
    io.emit('alerts:new', alert);
  }
};

exports.publishAlertUpdated = (alert) => {
  const io = getSocketServer();

  if (io) {
    io.emit('alerts:updated', alert);
  }
};
