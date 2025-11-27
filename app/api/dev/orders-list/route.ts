// app/api/dev/orders-list/route.ts
import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanityClient";

export async function GET() {
  try {
    const list = await sanityClient.fetch('*[_type=="order"]{orderNumber, _id} | order(orderNumber asc)');
    return NextResponse.json({ count: list.length, list });
  } catch (err: any) {
    console.error("orders-list error", err);
    return NextResponse.json({ error: "server_error", detail: err?.message ?? String(err) }, { status: 500 });
  }
}
