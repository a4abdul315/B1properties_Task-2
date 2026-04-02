import { io } from 'socket.io-client';

let socket;

export function connectAlertSocket() {
  if (socket) {
    return socket;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const socketBaseUrl = apiBaseUrl.replace(/\/api\/v1$/, '');

  socket = io(socketBaseUrl, {
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectAlertSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
