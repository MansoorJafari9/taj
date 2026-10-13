import {MigrationInterface, QueryRunner} from "typeorm";

export class BlogPosts1791044715741 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "blog_post" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "slug" character varying(190) NOT NULL, "languageCode" character varying(8) NOT NULL, "title" character varying(255) NOT NULL, "excerpt" text NOT NULL, "body" text NOT NULL, "coverImageUrl" character varying(1024), "category" character varying(100), "seoTitle" character varying(255), "seoDescription" character varying(320), "published" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP, "id" SERIAL NOT NULL, CONSTRAINT "PK_694e842ad1c2b33f5939de6fede" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d79c17a0c43c2ee72ef4514421" ON "blog_post" ("slug", "languageCode") `, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d79c17a0c43c2ee72ef4514421"`, undefined);
        await queryRunner.query(`DROP TABLE "blog_post"`, undefined);
   }

}
