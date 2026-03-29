import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class EmailNotificationPreferencesDto {
  @ApiProperty()
  @IsBoolean()
  newPropertyMatches: boolean;

  @ApiProperty()
  @IsBoolean()
  paymentReminders: boolean;

  @ApiProperty()
  @IsBoolean()
  maintenanceUpdates: boolean;
}

class PushNotificationPreferencesDto {
  @ApiProperty()
  @IsBoolean()
  newMessages: boolean;

  @ApiProperty()
  @IsBoolean()
  criticalAlerts: boolean;
}

class NotificationPreferencesDto {
  @ApiProperty({ type: EmailNotificationPreferencesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => EmailNotificationPreferencesDto)
  email: EmailNotificationPreferencesDto;

  @ApiProperty({ type: PushNotificationPreferencesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PushNotificationPreferencesDto)
  push: PushNotificationPreferencesDto;

  @ApiProperty()
  @IsBoolean()
  inAppSummary: boolean;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({ type: NotificationPreferencesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notifications: NotificationPreferencesDto;

  @ApiProperty({ enum: ['light', 'dark', 'system'] })
  @IsIn(['light', 'dark', 'system'])
  appearanceTheme: 'light' | 'dark' | 'system';

  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  currency: string;
}
