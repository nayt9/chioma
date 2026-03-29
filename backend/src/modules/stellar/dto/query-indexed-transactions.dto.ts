import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const INDEXED_TRANSACTION_STATUSES = [
  'pending',
  'indexed',
  'confirmed',
  'failed',
] as const;

export type IndexedTransactionStatusFilter =
  (typeof INDEXED_TRANSACTION_STATUSES)[number];

export class QueryIndexedTransactionsDto {
  @ApiPropertyOptional({
    enum: INDEXED_TRANSACTION_STATUSES,
    description: 'Filter by derived indexing status',
  })
  @IsOptional()
  @IsIn(INDEXED_TRANSACTION_STATUSES)
  status?: IndexedTransactionStatusFilter;

  @ApiPropertyOptional({
    description:
      'Free-text search across transaction id, hash, accounts, related entity ids, memo, and metadata',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Inclusive transaction creation start date',
    example: '2026-03-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Inclusive transaction creation end date',
    example: '2026-03-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
