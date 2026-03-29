import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePropertyInquiryDto {
  @ApiProperty({ description: 'Property id that the inquiry targets' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Inquiry body sent to the property owner' })
  @IsString()
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({ description: 'Display name of the sender' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ description: 'Sender email address' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Sender phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}
