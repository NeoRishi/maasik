import Razorpay from 'razorpay';

let cachedClient: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (cachedClient) return cachedClient;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not set');
  }
  cachedClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return cachedClient;
}

export interface CreatePaymentLinkArgs {
  user_id: string;
  email: string;
  name: string;
  amount_inr: number;        // e.g., 99 for first month
  description: string;       // e.g., "MAASIK first month"
  expires_in_days?: number;  // default 30
}

/**
 * Creates a Razorpay Payment Link with user_id baked into notes.
 * Returns the short_url that the user opens to pay.
 */
export async function createPaymentLink(args: CreatePaymentLinkArgs): Promise<string> {
  const razorpay = getRazorpay();

  const expiresAt = Math.floor(Date.now() / 1000) + (args.expires_in_days || 30) * 24 * 60 * 60;

  const link: any = await razorpay.paymentLink.create({
    amount: args.amount_inr * 100,  // Razorpay uses paise
    currency: 'INR',
    accept_partial: false,
    description: args.description,
    customer: {
      name: args.name,
      email: args.email,
    },
    notify: {
      sms: false,
      email: false,  // we send our own emails
    },
    reminder_enable: false,
    notes: {
      user_id: args.user_id,
      product: 'maasik',
      tier: args.amount_inr === 99 ? 'first_month' : args.amount_inr === 299 ? 'monthly' : 'other',
    },
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
    callback_method: 'get',
    expire_by: expiresAt,
  });

  return link.short_url;  // e.g., "https://rzp.io/i/AbCd1234"
}

export interface CreateOrderArgs {
  user_id: string;
  email: string;
  name: string;
  amount_inr: number;
}

export interface CreatedOrder {
  order_id: string;
  amount: number; // paise
  currency: string;
  key_id: string;
}

/**
 * Creates a Razorpay Order for the inline Checkout modal flow.
 * Returns the order_id plus key_id/amount/currency that the client
 * needs to open Razorpay Checkout.
 */
export async function createOrder(args: CreateOrderArgs): Promise<CreatedOrder> {
  const razorpay = getRazorpay();
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('RAZORPAY_KEY_ID not set');
  }

  const amount = args.amount_inr * 100; // paise
  const receipt = `maasik_${args.user_id.slice(0, 8)}_${Date.now().toString(36)}`;

  const order: any = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt,
    notes: {
      user_id: args.user_id,
      email: args.email,
      name: args.name,
      product: 'maasik',
      tier:
        args.amount_inr === 99
          ? 'first_month'
          : args.amount_inr === 299
            ? 'monthly'
            : 'other',
    },
  });

  return {
    order_id: order.id,
    amount: Number(order.amount),
    currency: String(order.currency),
    key_id: keyId,
  };
}
