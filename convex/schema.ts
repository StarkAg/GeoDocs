import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Cache of resolved village-map PDF URLs, keyed by the selected options.
  villageMaps: defineTable({
    key: v.string(), // "state-district-taluk-hobli-village" — the lookup key
    state: v.string(), // e.g. "Karnataka"
    district: v.string(), // option value (code) as sent by the app
    taluk: v.string(),
    hobli: v.string(),
    village: v.string(), // village name/label
    pdfUrl: v.string(),
    hits: v.number(), // times served from this cache entry
  }).index('by_key', ['key']),
});
