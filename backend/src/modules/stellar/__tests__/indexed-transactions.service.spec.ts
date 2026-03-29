import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IndexedTransactionsService } from '../services/indexed-transactions.service';
import {
  IndexedTransaction,
  IndexedTransactionType,
} from '../../transactions/entities/indexed-transaction.entity';

describe('IndexedTransactionsService', () => {
  let service: IndexedTransactionsService;

  const mockIndexedTransactionRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndexedTransactionsService,
        {
          provide: getRepositoryToken(IndexedTransaction),
          useValue: mockIndexedTransactionRepo,
        },
      ],
    }).compile();

    service = module.get<IndexedTransactionsService>(
      IndexedTransactionsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated indexed transactions with derived fields', async () => {
    const queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          {
            id: 'indexed-1',
            transactionHash: 'stellar-hash-1',
            ledger: 245,
            ledgerCloseTime: new Date('2026-03-28T12:00:00.000Z'),
            successful: true,
            transactionType: IndexedTransactionType.PAYMENT,
            sourceAccount: 'GAAA',
            destinationAccount: 'GBBB',
            amount: '200',
            assetCode: 'USDC',
            assetIssuer: null,
            fee: '0.00001',
            memo: 'Rent',
            memoType: null,
            agreementId: null,
            propertyId: null,
            paymentId: null,
            depositId: null,
            operations: [{ type: 'payment' }],
            metadata: { retryCount: 1 },
            indexed: true,
            indexedAt: new Date('2026-03-28T12:01:00.000Z'),
            createdAt: new Date('2026-03-28T12:00:10.000Z'),
          },
        ],
        1,
      ]),
    };

    mockIndexedTransactionRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.listTransactions({
      page: 1,
      limit: 20,
      status: 'confirmed',
      search: 'stellar-hash-1',
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      id: 'indexed-1',
      indexingStatus: 'confirmed',
      retryCount: 1,
      blockNumber: 245,
      dataIndexed: 1,
    });
  });

  it('calculates indexed transaction statistics', async () => {
    mockIndexedTransactionRepo.find.mockResolvedValue([
      {
        id: 'pending-1',
        indexed: false,
        successful: false,
        metadata: {},
        operations: [],
        indexedAt: null,
        createdAt: new Date('2026-03-28T12:00:00.000Z'),
      },
      {
        id: 'indexed-1',
        indexed: true,
        successful: false,
        metadata: {},
        operations: [{ type: 'payment' }],
        indexedAt: new Date('2026-03-28T12:02:00.000Z'),
        createdAt: new Date('2026-03-28T12:00:00.000Z'),
      },
      {
        id: 'confirmed-1',
        indexed: true,
        successful: true,
        metadata: {},
        operations: [{ type: 'payment' }],
        indexedAt: new Date('2026-03-28T12:04:00.000Z'),
        createdAt: new Date('2026-03-28T12:00:00.000Z'),
      },
      {
        id: 'failed-1',
        indexed: false,
        successful: false,
        metadata: { error: 'failed to index' },
        operations: [],
        indexedAt: null,
        createdAt: new Date('2026-03-28T12:00:00.000Z'),
      },
    ]);

    const result = await service.getTransactionStats();

    expect(result).toEqual({
      total: 4,
      pending: 1,
      indexed: 1,
      confirmed: 1,
      failed: 1,
      averageIndexingTimeSeconds: 180,
      successRate: 50,
    });
  });
});
