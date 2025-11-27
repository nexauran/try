// lib/sanityClient.ts
import SanityClient from "@sanity/client";

export const sanityClient = SanityClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN, // write enabled for webhooks
  useCdn: false,
});
