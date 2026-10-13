import {
    Injector,
    Order,
    OrderByCodeAccessStrategy,
    OrderCodeStrategy,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';

/**
 * A PostgreSQL sequence gives each new cart/order a unique six-digit code,
 * including when multiple server instances create orders concurrently.
 * Existing order codes are never changed.
 */
export class SixDigitOrderCodeStrategy implements OrderCodeStrategy {
    private connection: TransactionalConnection;

    init(injector: Injector) {
        this.connection = injector.get(TransactionalConnection);
    }

    async generate(_ctx: RequestContext): Promise<string> {
        const rows: Array<{ code: string }> = await this.connection.rawConnection.query(
            `SELECT nextval('order_six_digit_code_seq')::text AS code`,
        );
        const code = rows[0]?.code;
        if (!code || !/^\d{6}$/.test(code)) {
            throw new Error('The six-digit order code range is exhausted. Increase the order code length.');
        }
        return code;
    }
}

/** A short code is not a secret: only the order's authenticated owner may look it up. */
export class OwnerOnlyOrderByCodeAccessStrategy implements OrderByCodeAccessStrategy {
    canAccessOrder(ctx: RequestContext, order: Order): boolean {
        const ownerId = order.customer?.user?.id;
        return !!ctx.activeUserId && !!ownerId && String(ctx.activeUserId) === String(ownerId);
    }
}
