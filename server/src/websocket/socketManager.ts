import { Server as SocketServer } from 'socket.io';
import http from 'http';

export class SocketManager {
  private static instance: SocketManager;
  private io!: SocketServer;

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  initialize(server: http.Server): SocketServer {
    this.io = new SocketServer(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('joinUserRoom', (userId: string) => {
        socket.join(`user:${userId}`);
      });

      socket.on('joinZoneRoom', (zoneId: string) => {
        socket.join(`zone:${zoneId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  getIO(): SocketServer {
    return this.io;
  }
}
