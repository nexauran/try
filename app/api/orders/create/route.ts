// app/api/orders/create/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import crypto from "crypto";

/**
 * Expected: POST body with:
 * {
 *   customerName, email, clerkUserId, products, address, totalPrice, currency, amountDiscount
 * }
 *
 * Optional header: idempotency-key
 *
 * Returns: { ok: true, orderNumber }
 */

function makeOrderNumber() {
  const t = Date.now();
  const rand = crypto.randomBytes(3).toString("hex");
  return `ORD_${t}_${rand}`;
}

export async function POST(req: Request) {
  try {
    const idempotencyKey = req.headers.get("idempotency-key") ?? undefined;
    const body = await req.json();

    if (!body?.customerName || !body?.email || !body?.totalPrice) {
      return NextResponse.json({ message: "missing_required_fields" }, { status: 400 });
    }

    // Use idempotency key to create deterministic _id when available
    const baseId = idempotencyKey ?? makeOrderNumber();
    const _id = `order_${baseId}`;

    // If order exists, return its orderNumber
    const existing = await client.fetch('*[_type == "order" && _id == $id][0]{orderNumber}', { id: _id });
    if (existing?.orderNumber) {
      return NextResponse.json({ ok: true, orderNumber: existing.orderNumber });
    }

    // Generate orderNumber (human-friendly)
    const orderNumber = makeOrderNumber();

    const doc = {
      _id,
      _type: "order",
      orderNumber,
      clerkUserId: body.clerkUserId ?? "unknown",
      customerName: body.customerName,
      email: body.email,
      products: Array.isArray(body.products) ? body.products : [],
      totalPrice: Number(body.totalPrice),
      currency: body.currency ?? "INR",
      amountDiscount: Number(body.amountDiscount ?? 0),
      address: body.address ?? {},
      razorpayPaymentLinkId: body.razorpayPaymentLinkId ?? "",
      razorpayCustomerId: body.razorpayCustomerId ?? "",
      razorpayPaymentId: body.razorpayPaymentId ?? "",
      status: "pending",
      orderDate: new Date().toISOString(),
    };

    await client.createIfNotExists(doc);

    return NextResponse.json({ ok: true, orderNumber });
  } catch (err: any) {
    console.error("orders/create error:", err);
    return NextResponse.json({ message: err?.message || "server_error" }, { status: 500 });
  }
}
