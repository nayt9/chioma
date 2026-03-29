import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { WebSocketSessionService } from '../messaging/websocket-session.service';
import { User } from '../users/entities/user.entity';
import { NotificationsRealtimeService } from './notifications-realtime.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@WebSocketGateway({
  namespace: '/notifications',
  cors: true,
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sessionService: WebSocketSessionService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly realtimeService: NotificationsRealtimeService,
  ) {}

  afterInit() {
    this.realtimeService.registerServer(this.server);
  }

  async handleConnection(socket: Socket) {
    try {
      const userId = await this.resolveAuthenticatedUserId(socket);
      if (!userId) {
        this.logger.warn(`Connection rejected — invalid token: ${socket.id}`);
        socket.disconnect();
        return;
      }

      const session = await this.sessionService.createSession(
        userId,
        socket.id,
      );
      socket.data.sessionId = session.id;
      socket.data.userId = userId;

      socket.join(this.userRoom(userId));
      this.logger.log(
        `Notification client connected: ${socket.id} | user: ${userId} | session: ${session.id}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`handleConnection error: ${message}`);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    if (socket.data.sessionId) {
      await this.sessionService.deleteSession(socket.data.sessionId);
    }
    this.logger.log(`Notification client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('session:ping')
  async handlePing(@ConnectedSocket() socket: Socket) {
    const valid = await this.sessionService.validateSession(
      socket.data.sessionId,
    );

    if (!valid) {
      socket.emit('session:expired');
      socket.disconnect();
      return;
    }

    await this.sessionService.updateActivity(socket.data.sessionId);
    return { status: 'ok', sessionId: socket.data.sessionId };
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private async resolveAuthenticatedUserId(
    socket: Socket,
  ): Promise<string | null> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      this.logger.error('JWT_SECRET is not configured for socket auth');
      return null;
    }

    const handshakeToken =
      (socket.handshake.auth?.token as string | undefined) ||
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!handshakeToken) {
      return null;
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      handshakeToken,
      { secret },
    );

    if (!payload.sub || payload.type !== 'access') {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
      select: ['id'],
    });

    return user?.id ?? null;
  }
}
