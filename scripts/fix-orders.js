// scripts/fix-orders.js
const sanityClient = require("@sanity/client");

const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

function parseMapString(str) {
  if (!str || typeof str !== "string") return null;
  if (!str.startsWith("map[")) return null;
  const inner = str.slice(4, -1);
  const tokens = inner.split(/\s+/);
  const out = {};
  let currentKey = null;
  for (let token of tokens) {
    const idx = token.indexOf(":");
    if (idx > 0) {
      const key = token.slice(0, idx);
      let val = token.slice(idx + 1);
      currentKey = key;
      out[currentKey] = val;
    } else {
      if (currentKey) {
        out[currentKey] = (out[currentKey] || "") + " " + token;
      }
    }
  }
  Object.keys(out).forEach(k => out[k] = String(out[k]).trim());
  return out;
}

async function run() {
  try {
    // find orders where meta appears to be a map-string or address missing
    const query = `*[_type == "order" && defined(meta) && (meta match "map[*" || !defined(address))]{ _id, meta }`;
    const docs = await client.fetch(query);
    console.log("Found docs:", docs.length);

    for (const doc of docs) {
      let meta = doc.meta;
      if (typeof meta === "string" && meta.startsWith("map[")) {
        const parsed = parseMapString(meta);
        meta = parsed;
      } else if (meta && meta.address && typeof meta.address === "string" && meta.address.startsWith("map[")) {
        meta.address = parseMapString(meta.address);
      }
      // convert parsed address into address field patch
      const address = meta?.address ? {
        state: meta.address.state ?? "",
        zip: meta.address.zip ?? meta.address.postalCode ?? "",
        city: meta.address.city ?? "",
        address: meta.address.address ?? meta.address.line1 ?? "",
        name: meta.address.name ?? "",
      } : undefined;

      const patch = client.patch(doc._id);
      if (address) patch.set({ address });
      // also set meta to parsed object
      patch.set({ meta });
      const result = await patch.commit({ autoGenerateArrayKeys: true });
      console.log("Patched", doc._id, result._id);
    }
    console.log("Migration done.");
  } catch (e) {
    console.error(e);
  }
}

run();
