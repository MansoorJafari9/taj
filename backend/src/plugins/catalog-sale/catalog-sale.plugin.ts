import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, PluginCommonModule, ProductVariant, PromotionService, RequestContext, TransactionalConnection, VendurePlugin } from '@vendure/core';
import gql from 'graphql-tag';

type SaleOffer = { percentage: number };

function arg(args: Array<{ name: string; value: string }>, name: string): string | undefined {
    return args.find(item => item.name === name)?.value;
}

function ids(value?: string): string[] {
    try {
        const parsed: unknown = JSON.parse(value ?? '[]');
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
}

@Resolver('ProductVariant')
class CatalogSaleResolver {
    private readonly offersByRequest = new WeakMap<RequestContext, Promise<Map<string, SaleOffer>>>();

    constructor(
        private readonly promotions: PromotionService,
        private readonly connection: TransactionalConnection,
    ) {}

    @ResolveField()
    async saleOffer(@Ctx() ctx: RequestContext, @Parent() variant: ProductVariant): Promise<SaleOffer | null> {
        let pending = this.offersByRequest.get(ctx);
        if (!pending) {
            pending = this.loadOffers(ctx);
            this.offersByRequest.set(ctx, pending);
        }
        return (await pending).get(String(variant.id)) ?? null;
    }

    private async loadOffers(ctx: RequestContext): Promise<Map<string, SaleOffer>> {
        const offers = new Map<string, SaleOffer>();
        const ambiguous = new Set<string>();
        const now = Date.now();
        const promotions = await this.promotions.getActivePromotionsInChannel(ctx);
        const exhausted = await this.promotions.getExhaustedPromotionIds(ctx, promotions);
        for (const promotion of promotions) {
            if (promotion.couponCode || promotion.perCustomerUsageLimit != null || exhausted.has(String(promotion.id)) ||
                (promotion.startsAt && +new Date(promotion.startsAt) > now) ||
                (promotion.endsAt && +new Date(promotion.endsAt) < now) ||
                promotion.conditions.length !== 1 || promotion.actions.length !== 1) continue;
            const condition = promotion.conditions[0];
            const action = promotion.actions[0];
            if (condition.code !== 'contains_products' || Number(arg(condition.args, 'minimum')) !== 1) continue;
            const percentage = Number(arg(action.args, 'discount'));
            if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) continue;
            const eligible = new Set(ids(arg(condition.args, 'productVariantIds')));
            let discountedIds: string[];
            if (action.code === 'products_percentage_discount') {
                discountedIds = ids(arg(action.args, 'productVariantIds')).filter(id => eligible.has(id));
            } else if (action.code === 'facet_based_discount') {
                const facetIds = ids(arg(action.args, 'facets'));
                if (!eligible.size || !facetIds.length) continue;
                // Vendure matches both a variant's own facets and its product's
                // facets. Query the same two relations before showing an offer.
                const variants = await this.connection.getRepository(ctx, ProductVariant)
                    .createQueryBuilder('variant')
                    .leftJoinAndSelect('variant.product', 'product')
                    .leftJoinAndSelect('variant.facetValues', 'variantFacets')
                    .leftJoinAndSelect('product.facetValues', 'productFacets')
                    .where('variant.id IN (:...ids)', { ids: [...eligible] })
                    .getMany();
                discountedIds = variants
                    .filter(variant => {
                        const variantFacets = new Set([
                            ...variant.facetValues.map(facet => String(facet.id)),
                            ...variant.product.facetValues.map(facet => String(facet.id)),
                        ]);
                        return facetIds.every(id => variantFacets.has(id));
                    })
                    .map(variant => String(variant.id));
            } else {
                continue;
            }
            for (const id of discountedIds) {
                // Multiple simultaneous promotions can stack; don't advertise a
                // single guessed price in that case. The cart remains authoritative.
                if (offers.has(id)) ambiguous.add(id);
                else offers.set(id, { percentage });
            }
        }
        for (const id of ambiguous) offers.delete(id);
        return offers;
    }
}

@VendurePlugin({
    imports: [PluginCommonModule],
    shopApiExtensions: {
        schema: gql`
            type CatalogSaleOffer { percentage: Float! }
            extend type ProductVariant { saleOffer: CatalogSaleOffer }
        `,
        resolvers: [CatalogSaleResolver],
    },
})
export class CatalogSalePlugin {}
