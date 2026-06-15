#!/usr/bin/env node
/**
 * "Latest-wins" server lease.
 *
 * Claims the single active-server slot in Convex, then heartbeats. If a newer
 * machine claims it, this process exits with code 7 so ribil-serve shuts down
 * this machine's API + tunnel. If the active machine dies, the next heartbeat
 * after STALE_MS lets another instance reclaim it automatically.
 *
 * If Convex isn't configured, it blocks forever (lease disabled) so the server
 * keeps running normally.
 */
try { require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); } catch (_) {}
try { require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') }); } catch (_) {}

const os = require('os');

const URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || '';
const INTERVAL = Number(process.env.RIBIL_LEASE_INTERVAL_MS || 8000);
const STALE = Number(process.env.RIBIL_LEASE_STALE_MS || 30000);
const HOLDER = `${os.hostname()}#${process.pid}#${Math.random().toString(36).slice(2, 8)}`;

const log = (m) => console.log(`[lease] ${m}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (!URL) {
    log('CONVEX_URL not set — latest-wins lease disabled; serving without takeover coordination.');
    await new Promise(() => {}); // block forever; keep the server up
    return;
  }
  const { ConvexHttpClient } = require('convex/browser');
  const { makeFunctionReference } = require('convex/server');
  const client = new ConvexHttpClient(URL);
  const CLAIM = makeFunctionReference('serverLease:claim');
  const TICK = makeFunctionReference('serverLease:tick');

  await client.mutation(CLAIM, { holder: HOLDER, at: Date.now() });
  log(`claimed active-server lease as ${HOLDER} — this machine is now THE server.`);

  let misses = 0;
  for (;;) {
    await sleep(INTERVAL);
    let res;
    try {
      res = await client.mutation(TICK, { holder: HOLDER, at: Date.now(), staleMs: STALE });
      misses = 0;
    } catch (e) {
      // Network blip: don't yield on transient errors; keep serving.
      if (++misses <= 5) { log(`heartbeat error (${misses}/5): ${e.message}`); continue; }
      log('repeated heartbeat failures — keeping server up, will retry.');
      misses = 0;
      continue;
    }
    if (res === 'superseded') {
      log('A newer machine took over. Yielding — this machine will stop serving.');
      process.exit(7);
    }
    if (res === 'reclaimed') log('Previous active server went stale — reclaimed the lease.');
  }
})().catch((e) => {
  log(`fatal: ${e.message} — keeping server up.`);
  // Don't bring the server down on lease bugs; block.
  setInterval(() => {}, 1 << 30);
});
