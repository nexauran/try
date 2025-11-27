// scripts/fixVariants.js
import sanityClient from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID, // e.g. "abcd1234"
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-11-19',
  token: process.env.SANITY_TOKEN, // needs write permissions
  useCdn: false,
});

async function run() {
  // list docs with invalid variants
  const invalid = await client.fetch(
    '*[_type=="product" && !(variant in ["frames","polaroids","specializedframes","carframes"])]{_id, name, variant}'
  );
  console.log('Found', invalid.length, 'invalid docs');

  for (const doc of invalid) {
    // choose mapping (here we set everything to "frames"; change as needed)
    const newVariant = 'frames';
    console.log('Patching', doc._id, doc.name, '->', newVariant);
    await client
      .patch(doc._id)
      .set({ variant: newVariant })
      .commit({ autoGenerateArrayKeys: true });
    console.log('Patched', doc._id);
  }
  console.log('Done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
