import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../users/entities/user.entity';
import { QueryIndexedTransactionsDto } from '../dto/query-indexed-transactions.dto';
import { IndexedTransactionsService } from '../services/indexed-transactions.service';

@ApiTags('Indexed Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('v1/indexed-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class IndexedTransactionsController {
  constructor(
    private readonly indexedTransactionsService: IndexedTransactionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: '[Admin] List indexed transactions' })
  @ApiResponse({ status: 200, description: 'Paginated indexed transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listTransactions(@Query() query: QueryIndexedTransactionsDto) {
    return this.indexedTransactionsService.listTransactions(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '[Admin] Get indexed transaction statistics' })
  @ApiResponse({ status: 200, description: 'Indexed transaction statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats() {
    return this.indexedTransactionsService.getTransactionStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get indexed transaction detail' })
  @ApiParam({ name: 'id', description: 'Indexed transaction ID' })
  @ApiResponse({ status: 200, description: 'Indexed transaction detail' })
  @ApiResponse({ status: 404, description: 'Indexed transaction not found' })
  async getTransaction(@Param('id') id: string) {
    return this.indexedTransactionsService.getTransaction(id);
  }
}
