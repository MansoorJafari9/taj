import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlogPostProducts1791044715742 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blog_post_product" ("blogPostId" integer NOT NULL, "productId" integer NOT NULL, CONSTRAINT "PK_blog_post_product" PRIMARY KEY ("blogPostId", "productId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_blog_post_product_product" ON "blog_post_product" ("productId")`);
        await queryRunner.query(`ALTER TABLE "blog_post_product" ADD CONSTRAINT "FK_blog_post_product_post" FOREIGN KEY ("blogPostId") REFERENCES "blog_post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blog_post_product" ADD CONSTRAINT "FK_blog_post_product_product" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_post_product" DROP CONSTRAINT "FK_blog_post_product_product"`);
        await queryRunner.query(`ALTER TABLE "blog_post_product" DROP CONSTRAINT "FK_blog_post_product_post"`);
        await queryRunner.query(`DROP INDEX "IDX_blog_post_product_product"`);
        await queryRunner.query(`DROP TABLE "blog_post_product"`);
    }
}
