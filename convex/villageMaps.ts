import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/** Look up a cached village-map PDF URL by its option key. */
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db
      .query('villageMaps')
      .withIndex('by_key', (q) => q.eq('key', key))
      .unique();
  },
});

/** Upsert a resolved PDF URL together with the options that produced it. */
export const save = mutation({
  args: {
    key: v.string(),
    state: v.string(),
    district: v.string(),
    taluk: v.string(),
    hobli: v.string(),
    village: v.string(),
    pdfUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('villageMaps')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { pdfUrl: args.pdfUrl });
      return existing._id;
    }
    return await ctx.db.insert('villageMaps', { ...args, hits: 0 });
  },
});

/** Increment the hit counter when an entry is served from cache. */
export const recordHit = mutation({
  args: { id: v.id('villageMaps') },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (doc) await ctx.db.patch(id, { hits: (doc.hits ?? 0) + 1 });
  },
});

/** Recently cached entries (for inspection / a future admin view). */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db.query('villageMaps').order('desc').take(limit ?? 50);
  },
});
