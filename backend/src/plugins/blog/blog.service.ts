import { Injectable } from '@nestjs/common';
import { ID, ProductService, RequestContext, TransactionalConnection } from '@vendure/core';
import { BlogPost } from './blog-post.entity';

export type BlogPostInput = {
    slug: string;
    languageCode: string;
    title: string;
    excerpt: string;
    body: string;
    coverImageUrl?: string | null;
    category?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    published: boolean;
    productIds?: ID[];
};

type ListOptions = { skip?: number; take?: number; languageCode?: string; category?: string };

@Injectable()
export class BlogService {
    constructor(
        private readonly connection: TransactionalConnection,
        private readonly productService: ProductService,
    ) {}

    async list(ctx: RequestContext, options: ListOptions, publicOnly: boolean) {
        const skip = Math.max(0, options.skip ?? 0);
        const take = Math.min(50, Math.max(1, options.take ?? 12));
        const query = this.connection.getRepository(ctx, BlogPost).createQueryBuilder('post')
            .leftJoinAndSelect('post.products', 'product');
        if (options.languageCode) query.andWhere('post.languageCode = :languageCode', { languageCode: options.languageCode });
        if (options.category) query.andWhere('post.category = :category', { category: options.category });
        if (publicOnly) query.andWhere('post.published = true AND post.publishedAt <= :now', { now: new Date() });
        const [items, totalItems] = await query
            .orderBy('post.publishedAt', 'DESC', 'NULLS LAST')
            .addOrderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getManyAndCount();
        return { items, totalItems };
    }

    findOne(ctx: RequestContext, id: ID) {
        return this.connection.getRepository(ctx, BlogPost).findOne({ where: { id }, relations: ['products'] });
    }

    findBySlug(ctx: RequestContext, slug: string, languageCode: string, publicOnly: boolean) {
        const query = this.connection.getRepository(ctx, BlogPost).createQueryBuilder('post')
            .leftJoinAndSelect('post.products', 'product')
            .where('post.slug = :slug AND post.languageCode = :languageCode', { slug, languageCode });
        if (publicOnly) query.andWhere('post.published = true AND post.publishedAt <= :now', { now: new Date() });
        return query.getOne();
    }

    async save(ctx: RequestContext, input: BlogPostInput, id?: ID) {
        const slug = input.slug.trim().toLowerCase();
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            throw new Error('Article slug must contain only lowercase English letters, numbers, and hyphens.');
        }
        if (!input.title.trim() || !input.excerpt.trim() || !input.body.trim()) {
            throw new Error('Article title, excerpt, and body are required.');
        }
        const repository = this.connection.getRepository(ctx, BlogPost);
        const existing = id ? await repository.findOne({ where: { id }, relations: ['products'] }) : null;
        if (id && !existing) throw new Error('Article not found.');
        const duplicate = await repository.findOne({ where: { slug, languageCode: input.languageCode } });
        if (duplicate && String(duplicate.id) !== String(id ?? '')) {
            throw new Error('An article with this slug and language already exists.');
        }
        const post = existing ?? new BlogPost();
        post.slug = slug;
        post.languageCode = input.languageCode;
        post.title = input.title.trim();
        post.excerpt = input.excerpt.trim();
        post.body = input.body;
        post.coverImageUrl = input.coverImageUrl?.trim() || null;
        post.category = input.category?.trim() || null;
        post.seoTitle = input.seoTitle?.trim() || null;
        post.seoDescription = input.seoDescription?.trim() || null;
        post.published = input.published;
        post.publishedAt = input.published ? (post.publishedAt ?? new Date()) : null;
        const productIds = [...new Set((input.productIds ?? existing?.productIds ?? []).map(String))];
        if (productIds.length > 12) throw new Error('At most 12 products can be attached to an article.');
        const products = productIds.length ? await this.productService.findByIds(ctx, productIds) : [];
        if (products.length !== productIds.length) throw new Error('One or more selected products are unavailable in this channel.');
        const byId = new Map(products.map(product => [String(product.id), product]));
        post.products = productIds.map(productId => byId.get(productId)!);
        return repository.save(post);
    }

    async remove(ctx: RequestContext, id: ID) {
        const result = await this.connection.getRepository(ctx, BlogPost).delete(id);
        return (result.affected ?? 0) > 0;
    }
}
