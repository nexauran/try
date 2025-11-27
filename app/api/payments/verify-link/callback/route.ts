// app/api/payments/verify-link/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { client as sanityClient } from "@/sanity/lib/client";

const RAZORPAY_SIG_PARAM = "razorpay_signature";

function verifySignature(expectedDataString: string, signature: string, keySecret: string) {
  const generated = crypto.createHmac("sha256", keySecret).update(expectedDataString).digest("hex");
  return generated === signature;
}

/**
 * Razorpay will redirect with query params such as:
 * - razorpay_payment_id
 * - razorpay_payment_link_id
 * - razorpay_payment_link_reference_id (if you set reference_id)
 * - razorpay_signature
 *
 * This route:
 * 1) verifies signature using HMAC SHA256 (secret)
 * 2) finds the order by reference_id or by notes/orderNumber in Sanity
 * 3) patches order (status: paid, razorpayPaymentId etc.)
 * 4) returns an HTTP redirect to /order/confirm?orderNumber=...&status=paid
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const razorpayPaymentId = params.get("razorpay_payment_id");
    const razorpayPaymentLinkId = params.get("razorpay_payment_link_id");
    const referenceId = params.get("razorpay_payment_link_reference_id") ?? params.get("reference_id") ?? null;
    const signature = params.get("razorpay_signature");

    if (!signature || !razorpayPaymentId || !razorpayPaymentLinkId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL ?? "/"}?error=missing_params`);
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    // Razorpay docs: signature verification for payment links uses razorpay_payment_id + '|' + razorpay_payment_link_id
    const dataToSign = `${razorpayPaymentId}|${razorpayPaymentLinkId}`;

    const valid = verifySignature(dataToSign, signature, keySecret);
    if (!valid) {
      console.warn("invalid razorpay signature on payment link callback");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL ?? "/"}?error=invalid_signature`);
    }

    // Find orderNumber: prefer referenceId (which we set to orderNumber when creating the link), else try to find by payment link id we saved
    let orderDoc = null;
    if (referenceId) {
      orderDoc = await sanityClient.fetch('*[_type=="order" && orderNumber == $ref][0]{_id,orderNumber}', { ref: referenceId });
    }
    if (!orderDoc && razorpayPaymentLinkId) {
      orderDoc = await sanityClient.fetch('*[_type=="order" && razorpayPaymentLinkId == $plink][0]{_id,orderNumber}', { plink: razorpayPaymentLinkId });
    }

    // If we still don't have an order, create a minimal one (optional)
    let orderNumber: string = referenceId || "";
    if (!orderDoc) {
      // create minimal order doc to avoid losing the payment record
      orderNumber = referenceId ?? `plink-${razorpayPaymentLinkId}-${Date.now()}`;
      const newDoc = {
        _id: `order_${orderNumber}`,
        _type: "order",
        orderNumber,
        customerName: "Unknown (payment-link)",
        email: "",
        products: [],
        totalPrice: 0,
        currency: "INR",
        amountDiscount: 0,
        address: {},
        status: "paid",
        orderDate: new Date().toISOString(),
        razorpayPaymentLinkId: razorpayPaymentLinkId,
        razorpayPaymentId: razorpayPaymentId,
      };
      await sanityClient.createIfNotExists(newDoc);
    } else {
      // Patch the existing order doc to mark it paid
      orderNumber = orderDoc.orderNumber;
      await sanityClient
        .patch(orderDoc._id)
        .set({
          status: "paid",
          razorpayPaymentLinkId: razorpayPaymentLinkId,
          razorpayPaymentId: razorpayPaymentId,
          paymentDate: new Date().toISOString(),
        })
        .commit({ autoGenerateArrayKeys: true });
    }

    // All good — redirect the payer to the public order confirm page
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const absoluteBase = base.startsWith("http") ? base : `https://${base}`;
    const redirectTo = `${absoluteBase}/order/confirm?orderNumber=${encodeURIComponent(orderNumber)}&status=paid`;

    return NextResponse.redirect(redirectTo);
  } catch (err: any) {
    console.error("verify-link callback error:", err);
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const absoluteBase = base.startsWith("http") ? base : `https://${base}`;
    return NextResponse.redirect(`${absoluteBase}/order/confirm?status=error`);
  }
}
