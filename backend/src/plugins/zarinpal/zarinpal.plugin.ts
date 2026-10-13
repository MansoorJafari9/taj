import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
    ActiveOrderService, Allow, Ctx, LanguageCode, OrderService, PaymentMethodHandler,
    PaymentMethodService, Permission, PluginCommonModule, RequestContext, Transaction, TransactionalConnection, VendurePlugin,
} from '@vendure/core';
import gql from 'graphql-tag';
import { ZarinpalAttempt } from './zarinpal-attempt.entity';
import { requestPayment, verifyPayment } from './zarinpal.gateway';

export const zarinpalPaymentHandler = new PaymentMethodHandler({
    code: 'zarinpal',
    description: [{ languageCode: LanguageCode.fa, value: 'پرداخت آنلاین زرین‌پال' }],
    args: {},
    init(injector) { paymentConnection = injector.get(TransactionalConnection); },
    async createPayment(ctx, order, amount, _args, metadata) {
        const authority = typeof metadata.authority === 'string' ? metadata.authority : '';
        const attempt = authority ? await paymentConnection.getRepository(ctx, ZarinpalAttempt).findOne({ where: { authority } }) : null;
        if (!attempt || attempt.orderId !== String(order.id) || attempt.userId !== String(ctx.activeUserId) ||
            order.currencyCode !== 'IRR' || amount !== attempt.amount * 100 || amount !== order.totalWithTax) {
            return { amount, state: 'Error' as const, errorMessage: 'اطلاعات تراکنش با سفارش مطابقت ندارد.' };
        }
        try {
            const referenceId = attempt.referenceId ?? await verifyPayment(attempt.amount, authority);
            if (attempt.referenceId && attempt.referenceId !== referenceId) throw new Error('شناسهٔ تراکنش نامعتبر است.');
            attempt.referenceId = referenceId;
            await paymentConnection.getRepository(ctx, ZarinpalAttempt).save(attempt);
            return { amount, state: 'Settled' as const, transactionId: referenceId, metadata: { authority, referenceId } };
        } catch {
            return { amount, state: 'Error' as const, errorMessage: 'پرداخت تأیید نشد یا ارتباط با زرین‌پال برقرار نشد.' };
        }
    },
    settlePayment: async () => ({ success: false, errorMessage: 'پرداخت فقط از طریق تأیید زرین‌پال تسویه می‌شود.' }),
});

let paymentConnection: TransactionalConnection;

@Resolver()
class ZarinpalResolver {
    constructor(
        private readonly activeOrders: ActiveOrderService,
        private readonly orders: OrderService,
        private readonly paymentMethods: PaymentMethodService,
        private readonly connection: TransactionalConnection,
    ) {}

    @Mutation()
    @Allow(Permission.Authenticated)
    async startZarinpalPayment(@Ctx() ctx: RequestContext) {
        const order = await this.activeOrders.getActiveOrder(ctx, undefined);
        if (!ctx.activeUserId || !order || order.state !== 'ArrangingPayment' ||
            order.currencyCode !== 'IRR' || !Number.isSafeInteger(order.totalWithTax / 100) || order.totalWithTax <= 0) {
            throw new Error('سفارش برای پرداخت آماده نیست یا ارز آن تومان نیست.');
        }
        const completeOrder = await this.orders.findOne(ctx, order.id, ['lines', 'customer', 'customer.user']);
        if (!completeOrder?.lines?.length || String(completeOrder.customer?.user?.id) !== String(ctx.activeUserId)) {
            throw new Error('برای پرداخت باید وارد حساب صاحب سفارش شوید.');
        }
        const eligible = await this.paymentMethods.getEligiblePaymentMethods(ctx, order);
        if (!eligible.some(method => method.code === 'zarinpal' && method.isEligible)) {
            throw new Error('روش پرداخت زرین‌پال برای این کانال فعال نیست.');
        }
        const storefrontUrl = process.env.STOREFRONT_URL?.replace(/\/$/, '');
        if (!storefrontUrl || !/^https:\/\//.test(storefrontUrl) && !/^http:\/\/localhost(?::\d+)?$/.test(storefrontUrl)) {
            throw new Error('آدرس معتبر فروشگاه در تنظیمات سرور تعریف نشده است.');
        }
        const locale = ctx.languageCode === LanguageCode.en ? 'en' : 'fa';
        const result = await requestPayment(order.totalWithTax / 100, order.code, `${storefrontUrl}/${locale}/payment/return`);
        const attempt = new ZarinpalAttempt();
        attempt.authority = result.authority;
        attempt.orderId = String(order.id);
        attempt.userId = String(ctx.activeUserId);
        attempt.amount = order.totalWithTax / 100;
        attempt.referenceId = null;
        await this.connection.getRepository(ctx, ZarinpalAttempt).save(attempt);
        return { url: result.url, authority: result.authority };
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    @Transaction()
    async confirmZarinpalPayment(@Ctx() ctx: RequestContext, @Args('authority') authority: string, @Args('status') status: string) {
        if (!ctx.activeUserId || !/^[A-Za-z0-9_-]{8,100}$/.test(authority)) throw new Error('تراکنش نامعتبر است.');
        const attempt = await this.connection.getRepository(ctx, ZarinpalAttempt).createQueryBuilder('attempt')
            .where('attempt.authority = :authority', { authority }).setLock('pessimistic_write').getOne();
        if (!attempt || attempt.userId !== String(ctx.activeUserId)) throw new Error('این تراکنش متعلق به حساب شما نیست.');
        const order = await this.orders.findOne(ctx, attempt.orderId, ['payments', 'customer', 'customer.user']);
        if (!order || String(order.customer?.user?.id) !== String(ctx.activeUserId)) throw new Error('سفارش یافت نشد.');
        const settled = order.payments?.find(payment => payment.state === 'Settled' && payment.metadata?.authority === authority);
        if (settled) return { success: true, orderCode: order.code, referenceId: attempt.referenceId };
        if (status !== 'OK') return { success: false, orderCode: order.code, referenceId: null };
        if (order.state !== 'ArrangingPayment' || order.totalWithTax !== attempt.amount * 100 || order.currencyCode !== 'IRR') {
            throw new Error('مبلغ یا وضعیت سفارش پس از شروع پرداخت تغییر کرده است.');
        }
        const result = await this.orders.addPaymentToOrder(ctx, order.id, { method: 'zarinpal', metadata: { authority } });
        if ('errorCode' in result) throw new Error(result.message || 'ثبت پرداخت سفارش ناموفق بود.');
        return { success: true, orderCode: order.code, referenceId: attempt.referenceId };
    }
}

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [ZarinpalAttempt],
    shopApiExtensions: {
        schema: gql`
            type ZarinpalStartResult { url: String!, authority: String! }
            type ZarinpalConfirmResult { success: Boolean!, orderCode: String!, referenceId: String }
            extend type Mutation {
                startZarinpalPayment: ZarinpalStartResult!
                confirmZarinpalPayment(authority: String!, status: String!): ZarinpalConfirmResult!
            }
        `,
        resolvers: [ZarinpalResolver],
    },
})
export class ZarinpalPlugin {}
