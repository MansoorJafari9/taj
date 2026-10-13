type GatewayResponse = { data?: { code?: number; authority?: string; ref_id?: number | string }; errors?: unknown };

function endpoint(path: string): string {
    return `${process.env.ZARINPAL_SANDBOX === 'true' ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com'}/pg/v4/payment/${path}.json`;
}

async function post(path: string, body: Record<string, unknown>): Promise<GatewayResponse> {
    const response = await fetch(endpoint(path), {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error('ارتباط با درگاه پرداخت برقرار نشد. لطفاً دوباره تلاش کنید.');
    return await response.json() as GatewayResponse;
}

function merchantId(): string {
    const value = process.env.ZARINPAL_MERCHANT_ID?.trim();
    if (!value || !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value)) {
        throw new Error('کد پذیرندهٔ زرین‌پال در تنظیمات سرور معتبر نیست.');
    }
    return value;
}

export async function requestPayment(amount: number, orderCode: string, callbackUrl: string) {
    const response = await post('request', {
        merchant_id: merchantId(), amount, currency: 'IRT',
        description: `پرداخت سفارش ${orderCode}`, callback_url: callbackUrl,
        metadata: { order_id: orderCode },
    });
    const authority = response.data?.authority;
    if (response.data?.code !== 100 || !authority || !/^[A-Za-z0-9_-]+$/.test(authority)) {
        throw new Error('درخواست پرداخت توسط زرین‌پال پذیرفته نشد.');
    }
    const host = process.env.ZARINPAL_SANDBOX === 'true' ? 'sandbox.zarinpal.com' : 'payment.zarinpal.com';
    return { authority, url: `https://${host}/pg/StartPay/${authority}` };
}

export async function verifyPayment(amount: number, authority: string): Promise<string> {
    const response = await post('verify', { merchant_id: merchantId(), amount, authority });
    if (![100, 101].includes(response.data?.code ?? 0) || !response.data?.ref_id) {
        throw new Error('پرداخت توسط زرین‌پال تأیید نشد.');
    }
    return String(response.data.ref_id);
}
