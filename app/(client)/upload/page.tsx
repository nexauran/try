// app/upload/page.tsx
import React, { useState } from "react";
import UploadImageSection from "@/components/UploadImageSection";

export default function UploadPage() {
  const [uploaded, setUploaded] = useState<
    { _id: string; url?: string; originalFilename?: string }[]
  >([]);

  // optional: pass a custom onUpload so you can control UI and results
  const handleOnUpload = async (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    const res = await fetch("/api/upload-images", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Upload failed");
    }

    const data = await res.json();
    // expected shape: { created: [ { _id, url, originalFilename, ... } ] }
    setUploaded((prev) => [...data.created, ...prev]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload images</h1>

      <UploadImageSection maxFiles={6} onUpload={handleOnUpload} />

      {uploaded.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-medium mb-2">Uploaded</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {uploaded.map((it) => (
              <div key={it._id} className="border rounded overflow-hidden">
                {it.url ? (
                  // Sanity URLs are usually safe to show directly
                  // if you are using image transformations, use Sanity image URL builder
                  // or the raw url returned by the asset
                  // alt text uses original filename where available
                  // avoid dangerouslySetInnerHTML — use <img/>
                  <img src={it.url} alt={it.originalFilename || it._id} className="w-full h-32 object-cover"/>
                ) : (
                  <div className="p-4 text-sm">{it.originalFilename ?? it._id}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
