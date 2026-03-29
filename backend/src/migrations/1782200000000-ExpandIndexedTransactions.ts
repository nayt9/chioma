import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandIndexedTransactions1782200000000 implements MigrationInterface {
  name = 'ExpandIndexedTransactions1782200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "transaction_hash" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "ledger" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "ledger_close_time" TIMESTAMPTZ NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "successful" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "transaction_type" character varying(50) NOT NULL DEFAULT 'other'`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "source_account" character varying(56) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "destination_account" character varying(56)`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "amount" character varying(100) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "asset_code" character varying(12) NOT NULL DEFAULT 'XLM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "asset_issuer" character varying(56)`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "fee" character varying(100) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "memo" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "memo_type" character varying(10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "agreement_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "property_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "payment_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "deposit_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "operations" jsonb NOT NULL DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "indexed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_name = 'indexed_transactions' AND column_name = 'hash'
         ) THEN
           UPDATE "indexed_transactions"
           SET
             "transaction_hash" = COALESCE("transaction_hash", "hash"),
             "indexed" = CASE
               WHEN "indexed" = false AND "indexed_at" IS NOT NULL THEN true
               ELSE "indexed"
             END,
             "created_at" = COALESCE("created_at", "indexed_at", now()),
             "ledger_close_time" = COALESCE("ledger_close_time", "indexed_at", now());
         END IF;
       END $$`,
    );

    await queryRunner.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_name = 'indexed_transactions' AND column_name = 'value'
         ) THEN
           UPDATE "indexed_transactions"
           SET "amount" = CASE
             WHEN "amount" = '0' AND "value" IS NOT NULL THEN "value"::text
             ELSE "amount"
           END;
         END IF;
       END $$`,
    );

    await queryRunner.query(
      `UPDATE "indexed_transactions"
       SET "transaction_hash" = id::text
       WHERE "transaction_hash" IS NULL OR "transaction_hash" = ''`,
    );

    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ALTER COLUMN "transaction_hash" SET NOT NULL`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_indexed_transactions_transaction_hash" ON "indexed_transactions" ("transaction_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_indexed_transactions_ledger" ON "indexed_transactions" ("ledger")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_indexed_transactions_source_account" ON "indexed_transactions" ("source_account")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_indexed_transactions_destination_account" ON "indexed_transactions" ("destination_account")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_indexed_transactions_transaction_type" ON "indexed_transactions" ("transaction_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_indexed_transactions_agreement_id" ON "indexed_transactions" ("agreement_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "value"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "hash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" ADD COLUMN IF NOT EXISTS "value" numeric(20,8)`,
    );

    await queryRunner.query(
      `DO $$
       BEGIN
         UPDATE "indexed_transactions"
         SET
           "hash" = COALESCE("hash", "transaction_hash"),
           "value" = CASE
             WHEN "amount" ~ '^[0-9]+([.][0-9]+)?$' THEN "amount"::numeric
             ELSE 0
           END;
       END $$`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_indexed_transactions_agreement_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_indexed_transactions_transaction_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_indexed_transactions_destination_account"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_indexed_transactions_source_account"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_indexed_transactions_ledger"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_indexed_transactions_transaction_hash"`,
    );

    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "transaction_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "ledger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "ledger_close_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "successful"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "transaction_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "source_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "destination_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "asset_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "asset_issuer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "fee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "memo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "memo_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "agreement_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "property_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "payment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "deposit_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "operations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "metadata"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "indexed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "indexed_transactions" DROP COLUMN IF EXISTS "created_at"`,
    );
  }
}
