#!/usr/bin/env node
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "play-assets");
const TMP_DIR = resolve(OUT_DIR, ".raw");
const BASE = "https://ribil.co";

const SHOT_W = 1080;
const SHOT_H = 1920;
const CARD_W = 1080;
const CARD_H = 1920;

const SCREENS = [
  { path: "/", file: "01-home.png", title: "Karnataka land records,\nin one tap", subtitle: "Village maps, RTC, survey docs" },
  { path: "/search", file: "02-search.png", title: "Find any village", subtitle: "District → Taluk → Hobli → Village" },
  { path: "/map", file: "03-map.png", title: "Browse on the map", subtitle: "Tap a district to drill in" },
  { path: "/saved", file: "04-saved.png", title: "Save what you need", subtitle: "Offline access to your documents" },
  { path: "/account", file: "05-account.png", title: "Your profile", subtitle: "History, saved locations & settings" },
];

const FEATURE_HTML = `<!doctype html>
<html><head><meta charset="utf-8"/><style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif}
  body{width:1024px;height:500px;display:flex;align-items:center;background:linear-gradient(135deg,#059669 0%,#0d9488 50%,#0891b2 100%);overflow:hidden;position:relative}
  .blob1{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.15) 0%,transparent 70%);top:-200px;left:-150px}
  .blob2{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,.4) 0%,transparent 70%);bottom:-150px;right:-100px}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:40px 40px;mask:linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent)}
  .content{position:relative;z-index:2;padding:0 80px;color:#fff;width:100%}
  .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.2);font-size:14px;font-weight:600;letter-spacing:.5px;margin-bottom:20px}
  .badge .dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 12px #4ade80}
  h1{font-size:88px;font-weight:800;letter-spacing:-2px;line-height:1;margin-bottom:20px}
  p{font-size:24px;font-weight:500;opacity:.92;max-width:600px;line-height:1.3}
  .icon{position:absolute;right:80px;top:50%;transform:translateY(-50%);width:240px;height:240px;border-radius:48px;background:rgba(255,255,255,.12);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;box-shadow:0 20px 60px rgba(0,0,0,.25)}
  .icon svg{width:140px;height:140px;color:#fff}
</style></head><body>
  <div class="blob1"></div><div class="blob2"></div><div class="grid"></div>
  <div class="content">
    <div class="badge"><span class="dot"></span>KARNATAKA LAND RECORDS</div>
    <h1>Ribil</h1>
    <p>Village maps, RTC, survey docs &amp; land records — free, fast, no signup.</p>
  </div>
  <div class="icon">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
    </svg>
  </div>
</body></html>`;

function cardHtml({ title, subtitle, dataUrl }) {
  // Phone frame: 720x1280 inset inside the 1080x1920 card
  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif}
    body{width:${CARD_W}px;height:${CARD_H}px;background:linear-gradient(160deg,#ecfdf5 0%,#d1fae5 40%,#a7f3d0 100%);overflow:hidden;position:relative;display:flex;flex-direction:column;align-items:center;padding:60px 32px 0}
    .blob{position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,.18) 0%,transparent 70%);top:-200px;right:-300px;z-index:0}
    .blob2{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(13,148,136,.15) 0%,transparent 70%);bottom:-100px;left:-200px;z-index:0}
    .title{position:relative;z-index:2;text-align:center;color:#064e3b;font-size:64px;font-weight:800;letter-spacing:-1.5px;line-height:1.05;white-space:pre-line;margin-bottom:14px;max-width:920px}
    .subtitle{position:relative;z-index:2;text-align:center;color:#047857;font-size:28px;font-weight:500;line-height:1.3;margin-bottom:36px;opacity:.85}
    .phone{position:relative;z-index:2;width:880px;height:1620px;border-radius:72px;background:#0f172a;padding:20px;box-shadow:0 40px 100px rgba(6,78,59,.3),0 12px 32px rgba(6,78,59,.18);overflow:hidden}
    .phone::before{content:"";position:absolute;top:28px;left:50%;transform:translateX(-50%);width:200px;height:38px;background:#0f172a;border-radius:999px;z-index:2}
    .screen{width:100%;height:100%;border-radius:56px;overflow:hidden;background-color:#ecfdf5;background-image:url('${dataUrl}');background-size:100% auto;background-position:top center;background-repeat:no-repeat}
    .brand{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:3;display:flex;align-items:center;gap:12px;color:#064e3b;opacity:.55}
    .brand .dot{width:10px;height:10px;border-radius:50%;background:#059669}
    .brand span{font-size:24px;font-weight:700;letter-spacing:.5px}
  </style></head><body>
    <div class="blob"></div><div class="blob2"></div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="phone"><div class="screen"></div></div>
    <div class="brand"><div class="dot"></div><span>ribil.co</span></div>
  </body></html>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // Feature graphic
    console.log("Generating feature graphic 1024x500...");
    const fg = await browser.newPage();
    await fg.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
    await fg.setContent(FEATURE_HTML, { waitUntil: "networkidle0" });
    await fg.screenshot({
      path: resolve(OUT_DIR, "feature-graphic.png"),
      type: "png",
      clip: { x: 0, y: 0, width: 1024, height: 500 },
    });
    await fg.close();
    console.log("  ✓ feature-graphic.png");

    // Phone marketing cards
    for (const { path, file, title, subtitle } of SCREENS) {
      console.log(`\n→ ${path}`);

      // Step 1: capture the page at a phone-narrow width and high DPR so
      // it scales up sharp inside the 840-wide phone frame screen.
      const raw = await browser.newPage();
      await raw.setViewport({
        width: 360,
        height: 800,
        deviceScaleFactor: 2.5,
        isMobile: true,
        hasTouch: true,
      });
      await raw.setUserAgent(
        "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
      );
      try {
        await raw.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 45000 });
      } catch {
        console.log("  ⚠ networkidle timeout; continuing");
      }
      await new Promise((r) => setTimeout(r, 1800));
      // Bump the root font-size so all rem-based Tailwind classes (text,
      // padding, gaps) scale up. Makes the captured UI feel app-native, not
      // small web-app-y.
      await raw.addStyleTag({
        content: "html{font-size:18px !important}body{font-size:18px !important}",
      });
      await raw.evaluate(() => window.scrollTo(0, 0));
      // Find the bottom Y of the last "real" element so we crop only the
      // meaningful content. Cap at 1440 CSS px so very long pages still fit
      // a phone-aspect frame.
      const contentBottom = await raw.evaluate(() => {
        const candidates = Array.from(document.body.querySelectorAll("*"));
        let maxBottom = 0;
        for (const el of candidates) {
          const r = el.getBoundingClientRect();
          if (r.height < 1 || r.width < 1) continue;
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") continue;
          if (r.bottom > maxBottom) maxBottom = r.bottom;
        }
        return Math.max(560, Math.min(1440, Math.ceil(maxBottom + 32)));
      });
      await raw.setViewport({
        width: 360,
        height: contentBottom,
        deviceScaleFactor: 2.5,
        isMobile: true,
        hasTouch: true,
      });
      await new Promise((r) => setTimeout(r, 400));
      const rawBuf = await raw.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 360 * 2.5, height: contentBottom * 2.5 },
      });
      await raw.close();
      const rawDataUrl = `data:image/png;base64,${rawBuf.toString("base64")}`;
      console.log(`  ✓ raw captured`);

      // Step 2: compose marketing card with the screenshot inside a phone frame
      const card = await browser.newPage();
      await card.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
      await card.setContent(cardHtml({ title, subtitle, dataUrl: rawDataUrl }), { waitUntil: "networkidle0" });
      await card.screenshot({
        path: resolve(OUT_DIR, file),
        type: "png",
        clip: { x: 0, y: 0, width: CARD_W, height: CARD_H },
      });
      await card.close();
      console.log(`  ✓ ${file} (${CARD_W}x${CARD_H})`);
    }
  } finally {
    await browser.close();
  }

  console.log("\nDone. Files in: play-assets/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
