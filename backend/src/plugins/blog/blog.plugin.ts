import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, PluginCommonModule, RequestContext, VendurePlugin } from '@vendure/core';
import gql from 'graphql-tag';
import { BlogPost } from './blog-post.entity';
import { BlogPostInput, BlogService } from './blog.service';

const commonSchema = gql`
    type BlogPost {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        slug: String!
        languageCode: LanguageCode!
        title: String!
        excerpt: String!
        body: String!
        coverImageUrl: String
        category: String
        seoTitle: String
        seoDescription: String
        published: Boolean!
        publishedAt: DateTime
        productIds: [ID!]!
    }
    type BlogPostList { items: [BlogPost!]!, totalItems: Int! }
    input BlogPostListOptions { skip: Int, take: Int, languageCode: LanguageCode, category: String }
`;

@Resolver()
class ShopBlogResolver {
    constructor(private readonly blog: BlogService) {}

    @Query()
    @Allow(Permission.Public)
    blogPosts(@Ctx() ctx: RequestContext, @Args('options') options?: { skip?: number; take?: number; category?: string }) {
        return this.blog.list(ctx, { ...options, languageCode: ctx.languageCode }, true);
    }

    @Query()
    @Allow(Permission.Public)
    blogPost(@Ctx() ctx: RequestContext, @Args('slug') slug: string) {
        return this.blog.findBySlug(ctx, slug, ctx.languageCode, true);
    }
}

@Resolver()
class AdminBlogResolver {
    constructor(private readonly blog: BlogService) {}

    @Query()
    @Allow(Permission.ReadCatalog)
    blogPosts(@Ctx() ctx: RequestContext, @Args('options') options?: { skip?: number; take?: number; languageCode?: string; category?: string }) {
        return this.blog.list(ctx, options ?? {}, false);
    }

    @Query()
    @Allow(Permission.ReadCatalog)
    blogPost(@Ctx() ctx: RequestContext, @Args('id') id: ID) {
        return this.blog.findOne(ctx, id);
    }

    @Mutation()
    @Allow(Permission.UpdateCatalog)
    createBlogPost(@Ctx() ctx: RequestContext, @Args('input') input: BlogPostInput) {
        return this.blog.save(ctx, input);
    }

    @Mutation()
    @Allow(Permission.UpdateCatalog)
    updateBlogPost(@Ctx() ctx: RequestContext, @Args('id') id: ID, @Args('input') input: BlogPostInput) {
        return this.blog.save(ctx, input, id);
    }

    @Mutation()
    @Allow(Permission.UpdateCatalog)
    deleteBlogPost(@Ctx() ctx: RequestContext, @Args('id') id: ID) {
        return this.blog.remove(ctx, id);
    }
}

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [BlogPost],
    providers: [BlogService],
    shopApiExtensions: {
        schema: gql`
            ${commonSchema}
            extend type Query {
                blogPosts(options: BlogPostListOptions): BlogPostList!
                blogPost(slug: String!): BlogPost
            }
        `,
        resolvers: [ShopBlogResolver],
    },
    adminApiExtensions: {
        schema: gql`
            ${commonSchema}
            input BlogPostInput {
                slug: String!
                languageCode: LanguageCode!
                title: String!
                excerpt: String!
                body: String!
                coverImageUrl: String
                category: String
                seoTitle: String
                seoDescription: String
                published: Boolean!
                productIds: [ID!]
            }
            extend type Query {
                blogPosts(options: BlogPostListOptions): BlogPostList!
                blogPost(id: ID!): BlogPost
            }
            extend type Mutation {
                createBlogPost(input: BlogPostInput!): BlogPost!
                updateBlogPost(id: ID!, input: BlogPostInput!): BlogPost!
                deleteBlogPost(id: ID!): Boolean!
            }
        `,
        resolvers: [AdminBlogResolver],
    },
    dashboard: './dashboard/index.tsx',
})
export class BlogPlugin {}
