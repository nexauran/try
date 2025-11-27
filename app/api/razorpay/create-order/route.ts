// app/api/razorpay/create-order/route.ts
import { NextResponse } from "next/server";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function basicAuthHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

/**
 * Expected body: { orderNumber, amount, currency }
 * amount should be in paise (integer). If you pass rupees, multiply by 100 on server.
 *
 * Returns: { ok: true, id, amount, currency, keyId }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    if (!keyId || !keySecret) {
      return NextResponse.json({ message: "razorpay_keys_not_set" }, { status: 500 });
    }

    if (!body?.orderNumber || !body?.amount) {
      return NextResponse.json({ message: "missing_orderNumber_or_amount" }, { status: 400 });
    }

    // Convert rupees → paise safely
const amountRupees = Number(body.amount ?? 0);    // e.g. 250 (rupees)
const amount = Math.round(amountRupees * 100);    // → 25000 (paise)

const currency = body.currency ?? "INR";

const createBody = {
  amount,               // ✔ integer paise
  currency,
  receipt: body.orderNumber,
  payment_capture: 1,
  notes: {
    orderNumber: body.orderNumber,
  },
};


    const res = await fetch(`${RAZORPAY_BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(keyId, keySecret),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createBody),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("razorpay create order failed:", json);
      return NextResponse.json({ message: "razorpay_create_failed", details: json }, { status: 500 });
    }

    // Return the razorpay order id and your publishable key id so the client can open Checkout
    return NextResponse.json({
      ok: true,
      id: json.id,
      amount: json.amount,
      currency: json.currency,
      keyId: keyId,
    });
  } catch (err: any) {
    console.error("razorpay/create-order error:", err);
    return NextResponse.json({ message: err?.message || "server_error" }, { status: 500 });
  }
}
