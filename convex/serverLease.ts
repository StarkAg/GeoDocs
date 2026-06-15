import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const KEY = 'active';

async function current(ctx: any) {
  return await ctx.db
    .query('serverLease')
    .withIndex('by_key', (q: any) => q.eq('key', KEY))
    .unique();
}

/** Who is the active server right now (for inspection). */
export const get = query({
  args: {},
  handler: async (ctx) => current(ctx),
});

/** Unconditionally take over as the active server ("latest wins"). */
export const claim = mutation({
  args: { holder: v.string(), at: v.number() },
  handler: async (ctx, { holder, at }) => {
    const e = await current(ctx);
    if (e) await ctx.db.patch(e._id, { holder, since: at, heartbeat: at });
    else await ctx.db.insert('serverLease', { key: KEY, holder, since: at, heartbeat: at });
    return holder;
  },
});

/**
 * Heartbeat + ownership check. Returns:
 *  - 'held'       : caller still owns the lease (heartbeat refreshed)
 *  - 'reclaimed'  : previous holder went stale; caller took over
 *  - 'superseded' : a newer, live machine owns it — caller should yield
 */
export const tick = mutation({
  args: { holder: v.string(), at: v.number(), staleMs: v.number() },
  handler: async (ctx, { holder, at, staleMs }) => {
    const e = await current(ctx);
    if (!e) {
      await ctx.db.insert('serverLease', { key: KEY, holder, since: at, heartbeat: at });
      return 'held';
    }
    if (e.holder === holder) {
      await ctx.db.patch(e._id, { heartbeat: at });
      return 'held';
    }
    if (at - e.heartbeat > staleMs) {
      await ctx.db.patch(e._id, { holder, since: at, heartbeat: at });
      return 'reclaimed';
    }
    return 'superseded';
  },
});
