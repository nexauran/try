"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { client } from "@/sanity/lib/client";

type ProductHit = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  price?: number;
  images?: { asset?: { url?: string } }[];
};

export default function SearchBar({
  placeholder = "Search products...",
}: {
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const GROQ = `*[_type == "product" && (title match $term || description match $term)]{
    _id,
    title,
    "slug": slug,
    price,
    images[]{asset->{url}}
  }[0...20]`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await client.fetch(GROQ, { term: `${query}*` });
        setResults(res || []);
      } catch (err) {
        console.error("Sanity search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
        setOpen(true);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="relative"
      >
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 hover:text-shop_light_green cursor-pointer"
          onClick={() => setOpen(true)}
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-full border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-shop_light_green"
        />
      </form>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg bg-white shadow-lg">
          <div className="max-h-72 overflow-auto">
            {loading ? (
              <div className="p-4 text-sm">Loading…</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No results</div>
            ) : (
              results.map((hit) => {
                const img = hit.images?.[0]?.asset?.url;
                const slug = hit.slug?.current ?? "";

                return (
                  <Link
                    key={hit._id}
                    href={`/product/${slug}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={hit.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        img
                      </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium">
                        {hit.title}
                      </div>

                      {typeof hit.price !== "undefined" && (
                        <div className="text-xs text-gray-500">
                          ₹{Number(hit.price).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
