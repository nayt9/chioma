import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePropertyInquiries1782000000000 implements MigrationInterface {
  name = 'CreatePropertyInquiries1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "property_inquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "property_id" uuid NOT NULL,
        "from_user_id" uuid NOT NULL,
        "to_user_id" uuid NOT NULL,
        "message" text NOT NULL,
        "sender_name" character varying(120),
        "sender_email" character varying(255),
        "sender_phone" character varying(40),
        "status" character varying NOT NULL DEFAULT 'pending',
        "viewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_inquiries_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_property_inquiries_property_id" ON "property_inquiries" ("property_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_property_inquiries_to_user_id" ON "property_inquiries" ("to_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_property_inquiries_from_user_id" ON "property_inquiries" ("from_user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_property_inquiries_from_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_property_inquiries_to_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_property_inquiries_property_id"`,
    );
    await queryRunner.query(`DROP TABLE "property_inquiries"`);
  }
}
