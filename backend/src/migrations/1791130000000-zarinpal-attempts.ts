import { MigrationInterface, QueryRunner } from 'typeorm';

export class ZarinpalAttempts1791130000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "zarinpal_attempt" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authority" character varying(100) NOT NULL, "orderId" character varying(64) NOT NULL, "userId" character varying(64) NOT NULL, "amount" integer NOT NULL, "referenceId" character varying(100), "id" SERIAL NOT NULL, CONSTRAINT "PK_zarinpal_attempt" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_zarinpal_attempt_authority" ON "zarinpal_attempt" ("authority")`);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_zarinpal_attempt_authority"`);
        await queryRunner.query(`DROP TABLE "zarinpal_attempt"`);
    }
}
