import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function initIO(server: any) {
  io = new IOServer(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });
  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('IO not initialized');
  return io;
}
