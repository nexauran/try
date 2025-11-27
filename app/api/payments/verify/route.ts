// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { client } from "@/sanity/lib/client";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function basicAuthHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderNumber } = body || {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderNumber) {
      return NextResponse.json({ message: "missing_required_fields" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    if (!keyId || !keySecret) {
      return NextResponse.json({ message: "razorpay_keys_not_set" }, { status: 500 });
    }

    // 1) Verify signature
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.warn("invalid signature", { expected, signature: razorpay_signature });
      return NextResponse.json({ message: "invalid_signature" }, { status: 400 });
    }

    // 2) Fetch payment details from Razorpay
    const res = await fetch(`${RAZORPAY_BASE}/payments/${encodeURIComponent(razorpay_payment_id)}`, {
      headers: {
        Authorization: basicAuthHeader(keyId, keySecret),
        Accept: "application/json",
      },
    });

    const paymentData = await res.json();
    if (!res.ok) {
      console.error("failed to fetch payment details", paymentData);
      return NextResponse.json({ message: "failed_fetch_payment", details: paymentData }, { status: 500 });
    }

    // Confirm payment captured
    if (String(paymentData.status).toLowerCase() !== "captured") {
      return NextResponse.json({ message: "payment_not_captured", status: paymentData.status }, { status: 400 });
    }

    // 3) Patch the Sanity order: find by orderNumber
    const orderDoc = await client.fetch('*[_type == "order" && orderNumber == $orderNumber][0]{_id}', { orderNumber });

    if (!orderDoc?._id) {
      console.warn("order not found to patch", orderNumber);
      // Still create an order if you prefer — falling back to create:
      const createDoc = {
        _id: `order_${orderNumber}`,
        _type: "order",
        orderNumber,
        customerName: paymentData?.contact || "Unknown",
        email: paymentData?.email || "",
        totalPrice: paymentData?.amount || 0,
        currency: paymentData?.currency || "INR",
        products: [],
        address: {},
        status: "paid",
        orderDate: new Date().toISOString(),
        razorpayPaymentId: paymentData?.id ?? razorpay_payment_id,
        razorpayCustomerId: paymentData?.customer_id ?? "",
      };
      await client.createIfNotExists(createDoc);
      return NextResponse.json({ ok: true });
    }

    // Patch existing document: set razorpay ids, status, orderDate (if you want)
    await client
      .patch(orderDoc._id)
      .set({
        razorpayPaymentId: paymentData.id ?? razorpay_payment_id,
        razorpayCustomerId: paymentData.customer_id ?? (paymentData.customer && paymentData.customer.id) ?? "",
        status: "paid",
        // Keep orderDate as created; you can also set paymentDate:
        paymentDate: new Date().toISOString(),
        // Optionally store the whole payment/notes object:
        // paymentInfo: paymentData
      })
      .commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("payments/verify error:", err);
    return NextResponse.json({ message: err?.message || "server_error" }, { status: 500 });
  }
}
