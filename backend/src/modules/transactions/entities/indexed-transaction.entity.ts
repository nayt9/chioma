import {
  CreateDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

const JSON_COLUMN_TYPE =
  process.env.DB_TYPE === 'sqlite' ? 'simple-json' : 'jsonb';
const TIMESTAMP_COLUMN_TYPE =
  process.env.DB_TYPE === 'sqlite' ? 'datetime' : 'timestamptz';

export enum IndexedTransactionType {
  PAYMENT = 'payment',
  PATH_PAYMENT = 'path_payment',
  CREATE_ACCOUNT = 'create_account',
  CHANGE_TRUST = 'change_trust',
  MANAGE_OFFER = 'manage_offer',
  ACCOUNT_MERGE = 'account_merge',
  SET_OPTIONS = 'set_options',
  ALLOW_TRUST = 'allow_trust',
  CLAIMABLE_BALANCE = 'claimable_balance',
  OTHER = 'other',
}

export enum IndexedTransactionMemoType {
  TEXT = 'text',
  ID = 'id',
  HASH = 'hash',
}

@Entity('indexed_transactions')
export class IndexedTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'transaction_hash',
    type: 'varchar',
    unique: true,
    length: 64,
  })
  transactionHash: string;

  @Column({ type: 'integer' })
  ledger: number;

  @Column({ name: 'ledger_close_time', type: TIMESTAMP_COLUMN_TYPE })
  ledgerCloseTime: Date;

  @Column({ type: 'boolean' })
  successful: boolean;

  @Column({
    name: 'transaction_type',
    type: 'simple-enum',
    enum: IndexedTransactionType,
    default: IndexedTransactionType.OTHER,
  })
  transactionType: IndexedTransactionType;

  @Column({ name: 'source_account', type: 'varchar', length: 56 })
  sourceAccount: string;

  @Column({
    name: 'destination_account',
    type: 'varchar',
    length: 56,
    nullable: true,
  })
  destinationAccount: string | null;

  @Column({ type: 'varchar', length: 100 })
  amount: string;

  @Column({ name: 'asset_code', type: 'varchar', length: 12 })
  assetCode: string;

  @Column({ name: 'asset_issuer', type: 'varchar', length: 56, nullable: true })
  assetIssuer: string | null;

  @Column({ type: 'varchar', length: 100 })
  fee: string;

  @Column({ type: 'text', nullable: true })
  memo: string | null;

  @Column({
    name: 'memo_type',
    type: 'simple-enum',
    enum: IndexedTransactionMemoType,
    nullable: true,
  })
  memoType: IndexedTransactionMemoType | null;

  @Column({ name: 'agreement_id', type: 'uuid', nullable: true })
  agreementId: string | null;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId: string | null;

  @Column({ name: 'deposit_id', type: 'uuid', nullable: true })
  depositId: string | null;

  @Column({
    type: JSON_COLUMN_TYPE,
    default: () => (process.env.DB_TYPE === 'sqlite' ? "'[]'" : "'[]'::jsonb"),
  })
  operations: Array<Record<string, unknown>>;

  @Column({
    type: JSON_COLUMN_TYPE,
    default: () => (process.env.DB_TYPE === 'sqlite' ? "'{}'" : "'{}'::jsonb"),
  })
  metadata: Record<string, unknown>;

  @Column({ type: 'boolean', default: false })
  indexed: boolean;

  @Column({ name: 'indexed_at', type: TIMESTAMP_COLUMN_TYPE, nullable: true })
  indexedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: TIMESTAMP_COLUMN_TYPE })
  createdAt: Date;
}
