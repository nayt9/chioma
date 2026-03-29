import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserNotificationPreferences1782100000000 implements MigrationInterface {
  name = 'CreateUserNotificationPreferences1782100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_notification_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "preferences" jsonb NOT NULL DEFAULT '{"notifications":{"email":{"newPropertyMatches":true,"paymentReminders":true,"maintenanceUpdates":true},"push":{"newMessages":true,"criticalAlerts":true},"inAppSummary":true},"appearanceTheme":"system","language":"en","currency":"NGN"}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notification_preferences_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_notification_preferences_user_id" UNIQUE ("user_id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_notification_preferences"
       ADD CONSTRAINT "FK_user_notification_preferences_user"
       FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notification_preferences" DROP CONSTRAINT "FK_user_notification_preferences_user"`,
    );
    await queryRunner.query(`DROP TABLE "user_notification_preferences"`);
  }
}
