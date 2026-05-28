#!/usr/bin/env node

import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_AAB = "android/app/build/outputs/bundle/release/app-release.aab";
const DEFAULT_PACKAGE = "co.ribil.app";
const DEFAULT_TRACK = "internal";
const DEFAULT_STATUS = "draft";
const SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://androidpublisher.googleapis.com";
const UPLOAD_BASE = "https://androidpublisher.googleapis.com/upload";

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage();
  process.exit(0);
}

const options = {
  aabPath: resolve(args.aab || process.env.PLAY_AAB_PATH || DEFAULT_AAB),
  packageName: args.package || process.env.PLAY_PACKAGE_NAME || DEFAULT_PACKAGE,
  track: args.track || process.env.PLAY_TRACK || DEFAULT_TRACK,
  status: args.status || process.env.PLAY_RELEASE_STATUS || DEFAULT_STATUS,
  releaseName: args.name || process.env.PLAY_RELEASE_NAME || "",
  commit: Boolean(args.commit || process.env.PLAY_COMMIT === "true"),
  build: Boolean(args.build),
  skipSignatureCheck: Boolean(args["skip-signature-check"]),
};

if (!["draft", "inProgress", "halted", "completed"].includes(options.status)) {
  fail(`Invalid release status "${options.status}". Use draft, inProgress, halted, or completed.`);
}

if (options.build) {
  run("npm", ["run", "cap:sync"]);
  run("./gradlew", ["bundleRelease"], { cwd: resolve("android") });
}

if (!existsSync(options.aabPath)) {
  fail(`AAB not found: ${options.aabPath}\nRun: npm run cap:sync && cd android && ./gradlew bundleRelease`);
}

if (!options.skipSignatureCheck) {
  verifySignedBundle(options.aabPath);
}

const credentials = loadServiceAccount();
const accessToken = await getAccessToken(credentials);

console.log(`Package: ${options.packageName}`);
console.log(`Track: ${options.track}`);
console.log(`Status: ${options.status}`);
console.log(`AAB: ${options.aabPath}`);
console.log(`Mode: ${options.commit ? "commit" : "validate only"}`);

const edit = await apiJson(
  "POST",
  `${API_BASE}/androidpublisher/v3/applications/${encodeURIComponent(options.packageName)}/edits`,
  accessToken,
);

const editId = edit.id;
if (!editId) {
  fail("Google Play did not return an edit id.");
}

console.log(`Created edit: ${editId}`);

const bundle = await apiBinary(
  "POST",
  `${UPLOAD_BASE}/androidpublisher/v3/applications/${encodeURIComponent(options.packageName)}/edits/${encodeURIComponent(editId)}/bundles?uploadType=media`,
  accessToken,
  readFileSync(options.aabPath),
);

const versionCode = String(bundle.versionCode || "");
if (!versionCode) {
  fail(`Bundle uploaded but no versionCode was returned: ${JSON.stringify(bundle)}`);
}

console.log(`Uploaded bundle versionCode: ${versionCode}`);

const release = {
  versionCodes: [versionCode],
  status: options.status,
};

if (options.releaseName) {
  release.name = options.releaseName;
} else {
  release.name = `${basename(options.aabPath)} (${versionCode})`;
}

await apiJson(
  "PUT",
  `${API_BASE}/androidpublisher/v3/applications/${encodeURIComponent(options.packageName)}/edits/${encodeURIComponent(editId)}/tracks/${encodeURIComponent(options.track)}`,
  accessToken,
  {
    track: options.track,
    releases: [release],
  },
);

console.log(`Assigned versionCode ${versionCode} to ${options.track}.`);

if (options.commit) {
  await apiJson(
    "POST",
    `${API_BASE}/androidpublisher/v3/applications/${encodeURIComponent(options.packageName)}/edits/${encodeURIComponent(editId)}:commit`,
    accessToken,
  );
  console.log("Committed edit to Google Play.");
} else {
  await apiJson(
    "POST",
    `${API_BASE}/androidpublisher/v3/applications/${encodeURIComponent(options.packageName)}/edits/${encodeURIComponent(editId)}:validate`,
    accessToken,
  );
  console.log("Validated edit. Nothing was published because --commit was not passed.");
}

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (!arg.startsWith("--")) {
      fail(`Unexpected argument: ${arg}`);
    }

    const withoutPrefix = arg.slice(2);
    const equalsIndex = withoutPrefix.indexOf("=");

    if (equalsIndex >= 0) {
      parsed[withoutPrefix.slice(0, equalsIndex)] = withoutPrefix.slice(equalsIndex + 1);
      continue;
    }

    const next = rawArgs[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[withoutPrefix] = true;
      continue;
    }

    parsed[withoutPrefix] = next;
    index += 1;
  }

  return parsed;
}

function loadServiceAccount() {
  const inlineJson = process.env.PLAY_SERVICE_ACCOUNT_JSON;
  const inlineBase64 = process.env.PLAY_SERVICE_ACCOUNT_JSON_BASE64;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.PLAY_SERVICE_ACCOUNT_PATH;

  let raw = "";

  if (inlineBase64) {
    raw = Buffer.from(inlineBase64, "base64").toString("utf8");
  } else if (inlineJson) {
    raw = inlineJson;
  } else if (credentialsPath) {
    const resolvedPath = resolve(credentialsPath);
    if (!existsSync(resolvedPath)) {
      fail(`Service account file not found: ${resolvedPath}`);
    }
    raw = readFileSync(resolvedPath, "utf8");
  } else {
    fail(
      [
        "Missing Google Play service account credentials.",
        "Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json",
        "or PLAY_SERVICE_ACCOUNT_JSON / PLAY_SERVICE_ACCOUNT_JSON_BASE64.",
      ].join("\n"),
    );
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.client_email || !parsed.private_key) {
      fail("Service account JSON must include client_email and private_key.");
    }
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    return parsed;
  } catch (error) {
    fail(`Could not parse service account JSON: ${error.message}`);
  }
}

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(credentials.private_key);
  const assertion = `${unsigned}.${base64url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const body = await readResponse(response);
  if (!response.ok) {
    fail(`OAuth token request failed (${response.status}): ${formatBody(body)}`);
  }

  if (!body.access_token) {
    fail(`OAuth token response did not include access_token: ${formatBody(body)}`);
  }

  return body.access_token;
}

async function apiJson(method, url, token, body) {
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseBody = await readResponse(response);
  if (!response.ok) {
    fail(`${method} ${url} failed (${response.status}): ${formatBody(responseBody)}`);
  }

  return responseBody;
}

async function apiBinary(method, url, token, body) {
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/octet-stream",
    },
    body,
  });

  const responseBody = await readResponse(response);
  if (!response.ok) {
    fail(`${method} ${url} failed (${response.status}): ${formatBody(responseBody)}`);
  }

  return responseBody;
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function verifySignedBundle(aabPath) {
  const result = spawnSync("jarsigner", ["-verify", "-certs", aabPath], {
    encoding: "utf8",
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;

  if (result.status !== 0 || output.includes("jar is unsigned") || output.includes("Not a signed jar file")) {
    fail(
      [
        `AAB is not release-signed: ${aabPath}`,
        "Configure Android release signing before publishing, or pass --skip-signature-check only for debugging.",
        output.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || process.cwd(),
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    fail(`${command} ${commandArgs.join(" ")} failed.`);
  }
}

function base64url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function formatBody(body) {
  return typeof body === "string" ? body : JSON.stringify(body, null, 2);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printUsage() {
  console.log(`
Usage:
  node publish-android-to-play.mjs [options]

Required environment:
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/play-service-account.json
  or PLAY_SERVICE_ACCOUNT_JSON / PLAY_SERVICE_ACCOUNT_JSON_BASE64

Options:
  --aab <path>                 AAB file to upload. Default: ${DEFAULT_AAB}
  --package <name>             Android package name. Default: ${DEFAULT_PACKAGE}
  --track <track>              Play track. Default: ${DEFAULT_TRACK}
  --status <status>            draft, inProgress, halted, completed. Default: ${DEFAULT_STATUS}
  --name <release name>        Release name shown in Play Console.
  --build                      Run Capacitor sync and Gradle bundleRelease first.
  --commit                     Commit the edit. Without this, the script only validates.
  --skip-signature-check       Skip local jarsigner verification.
  --help                       Show this help.

Examples:
  npm run play:publish
  npm run play:publish -- --commit
  npm run play:publish -- --track internal --status completed --commit
`);
}
