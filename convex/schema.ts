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

  // Generic cache for any scraped document type (rtc, village-map, ec, ...).
  // `urls` holds one or more resolved file/image URLs (multi-page docs).
  documents: defineTable({
    type: v.string(), // 'rtc', 'village-map', ...
    key: v.string(), // composite lookup key (includes type + options)
    state: v.string(), // e.g. 'Karnataka'
    options: v.any(), // the selected options that produced this result
    urls: v.array(v.string()),
    hits: v.number(),
  }).index('by_type_key', ['type', 'key']),

  // Single-holder lease so only the most-recently-started machine serves.
  // "Latest wins": a new `ribil-serve` claims it; older instances yield.
  serverLease: defineTable({
    key: v.string(), // singleton: 'active'
    holder: v.string(), // machine instance id
    since: v.number(), // when it claimed
    heartbeat: v.number(), // last heartbeat (ms epoch, supplied by client)
  }).index('by_key', ['key']),
});
