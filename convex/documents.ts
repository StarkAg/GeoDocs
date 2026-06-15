import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/** Look up a cached document by type + composite key. */
export const getByKey = query({
  args: { type: v.string(), key: v.string() },
  handler: async (ctx, { type, key }) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_type_key', (q) => q.eq('type', type).eq('key', key))
      .unique();
  },
});

/** Upsert a resolved document (URLs + the options that produced it). */
export const save = mutation({
  args: {
    type: v.string(),
    key: v.string(),
    state: v.string(),
    options: v.any(),
    urls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_type_key', (q) => q.eq('type', args.type).eq('key', args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { urls: args.urls, options: args.options });
      return existing._id;
    }
    return await ctx.db.insert('documents', { ...args, hits: 0 });
  },
});

export const recordHit = mutation({
  args: { id: v.id('documents') },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (doc) await ctx.db.patch(id, { hits: (doc.hits ?? 0) + 1 });
  },
});

export const list = query({
  args: { type: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { type, limit }) => {
    const q = type
      ? ctx.db.query('documents').withIndex('by_type_key', (ix) => ix.eq('type', type))
      : ctx.db.query('documents');
    return await q.order('desc').take(limit ?? 50);
  },
});
