import { Product, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';

@Entity()
@Index(['slug', 'languageCode'], { unique: true })
export class BlogPost extends VendureEntity {
    constructor() { super(); }

    @Column({ type: 'varchar', length: 190 })
    slug: string;

    @Column({ type: 'varchar', length: 8 })
    languageCode: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    excerpt: string;

    @Column({ type: 'text' })
    body: string;

    @Column({ type: 'varchar', length: 1024, nullable: true })
    coverImageUrl: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    seoTitle: string | null;

    @Column({ type: 'varchar', length: 320, nullable: true })
    seoDescription: string | null;

    @Column({ type: 'boolean', default: false })
    published: boolean;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt: Date | null;

    @ManyToMany(() => Product)
    @JoinTable({
        name: 'blog_post_product',
        joinColumn: { name: 'blogPostId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
    })
    products: Product[];

    get productIds(): string[] {
        return this.products?.map(product => String(product.id)) ?? [];
    }
}
