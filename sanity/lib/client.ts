import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,                         // must be false for writes
  token: process.env.SANITY_WRITE_TOKEN, // give API routes write access
});
