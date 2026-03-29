import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export interface NotificationPreferences {
  email: {
    newPropertyMatches: boolean;
    paymentReminders: boolean;
    maintenanceUpdates: boolean;
  };
  push: {
    newMessages: boolean;
    criticalAlerts: boolean;
  };
  inAppSummary: boolean;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  notifications: NotificationPreferences;
  appearanceTheme: ThemePreference;
  language: string;
  currency: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: UserPreferences = {
  notifications: {
    email: {
      newPropertyMatches: true,
      paymentReminders: true,
      maintenanceUpdates: true,
    },
    push: {
      newMessages: true,
      criticalAlerts: true,
    },
    inAppSummary: true,
  },
  appearanceTheme: 'system',
  language: 'en',
  currency: 'NGN',
};

@Entity('user_notification_preferences')
export class UserNotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'preferences',
    type: process.env.DB_TYPE === 'sqlite' ? 'simple-json' : 'jsonb',
    default: () =>
      process.env.DB_TYPE === 'sqlite'
        ? '\'{"notifications":{"email":{"newPropertyMatches":true,"paymentReminders":true,"maintenanceUpdates":true},"push":{"newMessages":true,"criticalAlerts":true},"inAppSummary":true},"appearanceTheme":"system","language":"en","currency":"NGN"}\''
        : '\'{"notifications":{"email":{"newPropertyMatches":true,"paymentReminders":true,"maintenanceUpdates":true},"push":{"newMessages":true,"criticalAlerts":true},"inAppSummary":true},"appearanceTheme":"system","language":"en","currency":"NGN"}\'::jsonb',
  })
  preferences: UserPreferences;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
