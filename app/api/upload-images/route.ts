// app/api/upload-images/route.ts
import { NextResponse } from "next/server";
import sanityClient from "@/lib/sanity.server"; // server-only client (we'll create below)

export const runtime = "node"; // ensure node runtime so formData is available

export async function POST(request: Request) {
  try {
    const formData = await request.formData(); // works in Next 13+ node runtime
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    // sanitize and normalize incoming files
    const fileList = files.filter(Boolean) as any[];

    const created: Array<{ _id: string; url?: string; originalFilename?: string }> =
      [];

    for (const file of fileList) {
      // `file` is a File-like object with `stream()` and `name`
      // Convert to a readable stream or pass the file object to sanity client's upload if supported
      const filename = (file as any).name || `upload-${Date.now()}.jpg`;

      // sanityClient.assets.upload accepts a Blob/File-ish in modern environments.
      // If using node, you can pass file.stream()
      // We'll attempt to pass the File/Blob object directly (works on Next's Request.formData)
      const asset = await sanityClient.assets.upload("image", file as any, {
        filename,
      });

      // Create a document that references the asset (optional)
      // Example doc schema type: "galleryImage" with field image: { type: 'image' }
      try {
        const doc = await sanityClient.create({
          _type: "galleryImage",
          title: filename,
          image: {
            _type: "image",
            asset: {
              _ref: asset._id,
              _type: "reference",
            },
          },
          uploadedAt: new Date().toISOString(),
        });

        created.push({
          _id: asset._id,
          url: asset.url || (asset?.asset?.url ?? undefined),
          originalFilename: filename,
          docId: doc._id,
        });
      } catch (err) {
        // If creating document fails, still push asset info
        created.push({
          _id: asset._id,
          url: asset.url || (asset?.asset?.url ?? undefined),
          originalFilename: filename,
        });
      }
    }

    return NextResponse.json({ created });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
