// lib/sanity.server.ts
import createSanityClient from "@sanity/client";

const sanityClient = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-06-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, // server-only write token
});

export default sanityClient;
