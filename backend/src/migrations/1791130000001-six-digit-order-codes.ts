import { MigrationInterface, QueryRunner } from 'typeorm';

export class SixDigitOrderCodes1791130000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE "order_six_digit_code_seq"
            INCREMENT BY 1 MINVALUE 100000 MAXVALUE 999999 START WITH 100000 NO CYCLE
        `);
        // Continue after any existing six-digit codes, without modifying old orders.
        await queryRunner.query(`
            SELECT setval(
                'order_six_digit_code_seq',
                GREATEST(100000, COALESCE((
                    SELECT MAX("code"::integer) + 1
                    FROM "order"
                    WHERE "code" ~ '^[0-9]{6}$'
                ), 100000)),
                false
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE "order_six_digit_code_seq"`);
    }
}
