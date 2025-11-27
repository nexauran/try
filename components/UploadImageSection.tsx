"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Trash2, UploadCloud } from "lucide-react";
import { sanity } from "@/lib/sanity"; // adjust if your export name is different

interface Props {
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  className?: string;
  onUpload?: (files: File[]) => Promise<void> | void;
}

const UploadImageSection = ({
  multiple = true,
  maxFiles = 5,
  accept = "image/*",
  className,
  onUpload,
}: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const makePreviews = useCallback((files: File[]) => {
    return Promise.all(
      files.map(
        (f) =>
          new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onload = () => res(String(reader.result));
            reader.readAsDataURL(f);
          })
      )
    );
  }, []);

  // Upload helper using Sanity client directly
  // This uses `sanity.assets.upload('image', file, { filename })` to upload assets
  // and returns an array of uploaded asset info: { _id, url, originalFilename }
  const uploadToSanity = async (filesToUpload: File[]) => {
    if (!sanity || typeof sanity.assets?.upload !== "function") {
      throw new Error("Sanity client not configured. Make sure you export 'sanity' from @/lib/sanity and it exposes assets.upload.");
    }

    const uploads = await Promise.all(
      filesToUpload.map(async (file) => {
        // upload the file as an image asset
        const asset = await sanity.assets.upload("image", file, {
          filename: file.name,
        });

        // asset usually contains _id and url (or you can build url from returned fields)
        // return a simplified object
        return {
          _id: asset._id,
          url: asset.url || (asset?.asset?.url ?? undefined),
          originalFilename: file.name,
        };
      })
    );

    return { created: uploads };
  };

  const handleFiles = useCallback(
    async (incoming: FileList | null) => {
      if (!incoming) return;

      const arr = Array.from(incoming);
      const allowed = multiple ? arr.slice(0, maxFiles) : arr.slice(0, 1);

      setFiles(allowed);

      const p = await makePreviews(allowed);
      setPreviews(p);
      setStatusMessage(null);
    },
    [makePreviews, maxFiles, multiple]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    await handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const clearAll = () => {
    setFiles([]);
    setPreviews([]);
    setStatusMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // default upload handler now uploads to Sanity
  const defaultUploadHandler = async (filesToUpload: File[]) => {
    // attempt direct Sanity upload
    const result = await uploadToSanity(filesToUpload);

    // result.created is an array of uploaded assets
    return result;
  };

  const handleUploadClick = async () => {
    if (!files.length) {
      setStatusMessage("Please select at least one file to upload.");
      return;
    }

    if (!onUpload) {
      // use built-in uploader (Sanity)
      setIsUploading(true);
      setStatusMessage(null);
      try {
        const data = await defaultUploadHandler(files);
        const count = Array.isArray(data.created) ? data.created.length : (data.created ? 1 : 0);
        setStatusMessage(`Uploaded ${count} image(s) successfully.`);

        // you might want to do something with the returned URLs/ids here
        // console.log('sanity upload result', data.created);

        // clear after success
        setFiles([]);
        setPreviews([]);
        if (inputRef.current) inputRef.current.value = "";
      } catch (err: any) {
        console.error("Upload error:", err);
        setStatusMessage(err?.message ?? "Upload failed");
      } finally {
        setIsUploading(false);
      }
    } else {
      // delegate to passed in handler
      setIsUploading(true);
      setStatusMessage(null);
      try {
        await onUpload(files);
        setStatusMessage("Uploaded successfully.");
        setFiles([]);
        setPreviews([]);
        if (inputRef.current) inputRef.current.value = "";
      } catch (err: any) {
        console.error("onUpload error:", err);
        setStatusMessage(err?.message ?? "Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePreview = (index: number) => {
    if (files.length) {
      const newFiles = files.filter((_, idx) => idx !== index);
      setFiles(newFiles);

      if (newFiles.length) makePreviews(newFiles).then(setPreviews);
      else setPreviews([]);
    } else {
      setPreviews((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <label className="text-sm font-medium text-gray-700">Upload images</label>

      {/* Upload box */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-md border-2 border-dashed p-4 flex flex-col items-start justify-start cursor-pointer transition-colors",
          "h-[260px] w-full overflow-hidden",
          "gap-4",
          dragActive
            ? "border-shop_dark_green/80 bg-shop_light_bg/50"
            : "border-gray-200 bg-white"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          className="hidden"
        />

        {/* Instructions */}
        <div className="flex flex-col items-center gap-2 w-full">
          <UploadCloud className="w-8 h-8 text-shop_dark_green" />
          <p className="text-sm text-gray-600">
            Drag & drop images here, or{" "}
            <button
              type="button"
              className="font-medium underline text-shop_dark_green"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF — up to {maxFiles} files</p>
        </div>

        {/* PREVIEW SECTION — vertical scroll */}
        <div className="w-full mt-2 px-1">
          {previews.length > 0 ? (
            <div className="w-full max-h-[150px] overflow-y-auto overflow-x-hidden grid grid-cols-2 md:grid-cols-3 gap-3 pr-1">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative rounded-md overflow-hidden border h-32 w-full"
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover"
                    draggable={false}
                    alt={`preview-${i}`}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(i);
                    }}
                    className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              No previews — add images to see thumbnails here.
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleUploadClick}
          disabled={isUploading || !files.length}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 font-semibold shadow-none hoverEffect",
            isUploading ? "opacity-70 pointer-events-none" : ""
          )}
        >
          {isUploading
            ? "Uploading..."
            : files.length
            ? `Upload ${files.length} Image(s)`
            : "Select images"}
        </Button>

        <Button
          variant="ghost"
          onClick={clearAll}
          disabled={!files.length && !previews.length}
          className="px-3 py-2 border border-gray-200"
        >
          Clear
        </Button>
      </div>

      {statusMessage && (
        <div className="text-sm text-gray-700 mt-2">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default UploadImageSection;
