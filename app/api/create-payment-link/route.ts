// app/api/create-payment-link/route.ts
import { NextResponse } from "next/server";
import { client as sanityClient } from "@/sanity/lib/client";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function basicAuthHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber } = body;
    if (!orderNumber) return NextResponse.json({ message: "missing_orderNumber" }, { status: 400 });

    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    if (!keyId || !keySecret) return NextResponse.json({ message: "razorpay_keys_not_set" }, { status: 500 });

    // Decide amount (paise). You should derive amount server-side based on the Sanity order,
    // here we try to lookup the order's totalPrice just as a safety check.
    const orderDoc = await sanityClient.fetch('*[_type=="order" && orderNumber == $orderNumber][0]', { orderNumber });
    if (!orderDoc) return NextResponse.json({ message: "order_not_found" }, { status: 404 });

    // Ensure totalPrice is in paise (integer). If your Sanity stores rupees, multiply by 100 here.
    const amountPaise = Math.round(Number(orderDoc.totalPrice)); // <-- ensure your Sanity totalPrice is already in paise
    if (!amountPaise || amountPaise <= 0) return NextResponse.json({ message: "invalid_amount" }, { status: 400 });

    // set the callback_url to our verify-and-redirect endpoint (absolute URL)
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000";
    // Ensure absolute URL includes https:// when using Vercel env var pattern or NEXT_PUBLIC_BASE_URL
    const absoluteBase = base.startsWith("http") ? base : `https://${base}`;
    const callbackUrl = `${absoluteBase}/api/payments/verify-link/callback`;

    const createBody = {
      amount: amountPaise,
      currency: orderDoc.currency ?? "INR",
      description: `Payment for order ${orderNumber}`,
      reference_id: orderNumber,
      callback_url: callbackUrl,
      callback_method: "get", // required when callback_url is passed for payment links
      notes: {
        orderNumber,
      },
    };

    const res = await fetch(`${RAZORPAY_BASE}/payment_links`, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(keyId, keySecret),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createBody),
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("razorpay create payment link failed:", json);
      return NextResponse.json({ message: "razorpay_create_link_failed", details: json }, { status: 500 });
    }

    // Save the payment link id to the order (optional)
    try {
      if (orderDoc._id) {
        await sanityClient.patch(orderDoc._id).set({ razorpayPaymentLinkId: json.id }).commit();
      }
    } catch (err) {
      console.warn("failed to patch order with payment link id", err);
    }

    // Return short_url and id back to client (your CartPage expects short_url & paymentLinkId)
    return NextResponse.json({
      ok: true,
      paymentLinkId: json.id,
      short_url: json.short_url,
      raw: json,
    });
  } catch (err: any) {
    console.error("create-payment-link error:", err);
    return NextResponse.json({ message: err?.message || "server_error" }, { status: 500 });
  }
}
