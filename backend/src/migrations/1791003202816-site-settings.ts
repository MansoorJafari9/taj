import {MigrationInterface, QueryRunner} from "typeorm";

export class SiteSettings1791003202816 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsSitename" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsSitelogourl" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsFaviconurl" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsAboutcontent" text`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsContactcontent" text`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsContactemail" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsContactphone" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsContactaddress" text`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsContactaddress"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsContactphone"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsContactemail"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsContactcontent"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsAboutcontent"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsFaviconurl"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsSitelogourl"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsSitename"`, undefined);
   }

}
