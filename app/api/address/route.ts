import { NextResponse } from "next/server";
import { sanity } from "@/lib/sanity";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      address,
      city,
      state,
      zip,
      default: isDefault,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // create address document
    const created = await sanity.create({
      _type: "address",
      name,
      email,
      address,
      city,
      state,
      zip,
      default: !!isDefault,
      createdAt: new Date().toISOString(),
    });

    // if default = true, unset others
    if (isDefault) {
      await sanity
        .patch()
        .query(
          '*[_type == "address" && email == $email && _id != $id && default == true]',
          { email, id: created._id }
        )
        .set({ default: false })
        .commit({ autoGenerateArrayKeys: true })
        .catch(() => {});
    }

    return NextResponse.json({ success: true, address: created });
  } catch (err) {
    console.error("Address create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
