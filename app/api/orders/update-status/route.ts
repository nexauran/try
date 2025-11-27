// app/api/orders/update-status/route.ts
import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanityClient";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || ""; // set this in env

export async function POST(req: Request) {
  // simple secret header check
  const secret = req.headers.get("x-admin-secret") || "";
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { orderNumber, status, trackingKey, dateIso } = body;

  if (!orderNumber || !status) {
    return NextResponse.json({ error: "orderNumber_and_status_required" }, { status: 400 });
  }

  try {
    // fetch the doc _id
    const doc = await sanityClient.fetch(
      '*[_type == "order" && orderNumber == $orderNumber][0]{_id}',
      { orderNumber }
    );

    if (!doc?._id) {
      return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    }

    const patch = sanityClient.patch(doc._id).set({ status });

    // ensure trackingDates exists
    patch.setIfMissing({ trackingDates: {} });

    // optionally set a tracking date key (placed, packed, in_transit, out_for_delivery, delivered)
    if (trackingKey) {
      const setObj: Record<string, any> = {};
      setObj[`trackingDates.${trackingKey}`] = dateIso ?? new Date().toISOString();
      patch.set(setObj);
    }

    await patch.commit();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update-status error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

