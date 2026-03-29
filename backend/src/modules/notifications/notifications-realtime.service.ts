import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsRealtimeService {
  private readonly logger = new Logger(NotificationsRealtimeService.name);
  private server: Server | null = null;

  registerServer(server: Server) {
    this.server = server;
    this.logger.log('Notification realtime server registered');
  }

  emitToUser(userId: string, notification: Notification) {
    if (!this.server) {
      this.logger.warn(
        `Realtime server not ready; skipped live emit for user ${userId}`,
      );
      return;
    }

    this.server.to(this.userRoom(userId)).emit('notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      type: notification.type,
      createdAt: notification.createdAt,
    });
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }
}
