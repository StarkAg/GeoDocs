---
name: publish-android-play
description: "Publish an Android app bundle (.aab) to Google Play via the Android Publisher API. Uses a service-account JSON for OAuth — no Play Console UI clicks needed at publish time. Handles cap:sync + bundleRelease build, signature verification, edit creation, bundle upload, track assignment (internal/alpha/beta/production), validate-only dry run by default, commit on explicit request. Triggers: publish to play store, push to play, release android, upload aab, play:publish, play deploy, internal track, production release."
---

# Publish Android App to Google Play

Push a signed `.aab` to a Google Play track using the Android Publisher REST API. Default behavior is **validate-only** — the upload + track edit is staged but never committed. Commit only when the user explicitly asks.

## When to Use

Trigger this skill when the user says any of:
- "publish to play store" / "release to play" / "push to internal track"
- "run play:publish" / "deploy android"
- "ship the android build"
- "upload aab to play"

## Prerequisites (check before running)

1. **Script exists** at `publish-android-to-play.mjs` in repo root (or a script with equivalent flags). If missing, the skill does not apply — tell the user.
2. **Service account JSON** must be reachable via one of:
   - `GOOGLE_APPLICATION_CREDENTIALS` env var → path to JSON
   - `PLAY_SERVICE_ACCOUNT_PATH` env var → path to JSON
   - `PLAY_SERVICE_ACCOUNT_JSON` env var → inline JSON
   - `PLAY_SERVICE_ACCOUNT_JSON_BASE64` env var → base64-encoded JSON
3. **Signed AAB** at `android/app/build/outputs/bundle/release/app-release.aab` (or `--aab <path>`). The script runs `jarsigner -verify` automatically.

**If the service account is missing**, stop and tell the user:
> The Play Developer API requires a service account JSON. One-time setup in Google Cloud Console:
> 1. Cloud Console → IAM & Admin → Service Accounts → create one
> 2. Create a JSON key, download it
> 3. Play Console → Setup → API access → link the project, grant "Release manager" role to the service account email
> 4. `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`
> After that, no Console visits needed for future releases.

There is **no fully Console-free path** for API-based publishing. The only Console-free option is manual upload via the Play Console web UI (not what this skill does).

## Workflow

### Step 1 — confirm intent

Ask which track and whether to build:

- **Track**: `internal` (default), `alpha`, `beta`, `production`
- **Status**: `draft` (default — safest), `inProgress`, `halted`, `completed`
- **Build first?**: if `app-release.aab` is missing or stale, offer `--build`

### Step 2 — run validate-only (always first)

```bash
node publish-android-to-play.mjs [--build] [--track <track>] [--status <status>] [--name "<release name>"]
```

This stages an edit, uploads the bundle, assigns the track, then calls `:validate`. **Nothing is published yet.** If validation fails, surface the error verbatim — Google's responses are usually self-explanatory (duplicate version code, missing release notes, signing mismatch, etc.).

### Step 3 — ask before committing

After a successful validate, show the user:

```
Validated OK. Bundle versionCode <N> staged for <track> as <status>.
Ready to commit (= actually publish)?
```

Only on explicit yes, re-run with `--commit`:

```bash
node publish-android-to-play.mjs --commit [same flags as before]
```

Re-running creates a new edit — the previous validate-only edit is discarded by Google after a short window, so this is safe.

## Flag Reference

| Flag | Default | Notes |
|---|---|---|
| `--aab <path>` | `android/app/build/outputs/bundle/release/app-release.aab` | |
| `--package <name>` | `co.ribil.app` (read from script) | Override for other projects |
| `--track <name>` | `internal` | `internal`, `alpha`, `beta`, `production` |
| `--status <status>` | `draft` | `draft`, `inProgress`, `halted`, `completed` |
| `--name "<text>"` | `<aab-basename> (<versionCode>)` | Shown in Play Console release list |
| `--build` | off | Runs `npm run cap:sync && ./gradlew bundleRelease` first |
| `--commit` | off | Actually publish. Without this, validate only. |
| `--skip-signature-check` | off | Bypass local `jarsigner -verify`. Debugging only. |

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `AAB is not release-signed` | Built with debug keystore or unsigned | Configure release signing in `android/app/build.gradle`, rebuild |
| `Version code N has already been used` | `versionCode` in `android/app/build.gradle` not bumped | Increment `versionCode`, rebuild bundle |
| `The Android App Bundle was not signed` | Play App Signing not enrolled OR upload key mismatch | Check Play Console → Setup → App integrity |
| `403 The caller does not have permission` | Service account lacks Play Console role | Play Console → API access → grant "Release manager" |
| `404 No application was found` | Wrong `--package` or app not yet in Play Console | First release must be uploaded manually via UI; API can only update existing apps |
| `400 Only releases with status draft may be created on track production` | Production needs staged rollout setup | Use `--status draft` or configure rollout in Console first |

## First-Time Release Caveat

Google Play **requires the very first release of a new package to be uploaded via the Play Console UI**. The API only manages updates to apps that already exist in the Console. If `404 No application was found` appears, that's the cause.

## What this skill will NOT do

- Create the service account (requires Cloud Console)
- Bump `versionCode` automatically (might do unintentionally; user owns this)
- Push to `production` without `--commit` confirmation
- Skip the validate step
