/**
 * RTC / Pahani API client. Talks to the local extraction server (api/server.js),
 * which drives service2/RTC.aspx and caches results in Convex.
 */

export interface RtcOption {
  value: string;
  label: string;
}

export type RtcLevel =
  | 'district'
  | 'taluk'
  | 'hobli'
  | 'village'
  | 'surnoc'
  | 'hissa'
  | 'period'
  | 'year';

export interface RtcSelection {
  district?: string;
  taluk?: string;
  hobli?: string;
  village?: string;
  surveyNo?: string;
  surnoc?: string;
  hissa?: string;
  period?: string;
  year?: string;
}

const PI =
  process.env.NEXT_PUBLIC_PI_URL || 'https://ribil-pi.staragroup.in';

/** Fetch the option list for a cascade level, given the upstream selections. */
export async function fetchRtcOptions(
  level: RtcLevel,
  sel: RtcSelection,
): Promise<RtcOption[]> {
  const params = new URLSearchParams({ level });
  for (const [k, v] of Object.entries(sel)) {
    if (v) params.set(k, String(v));
  }
  const res = await fetch(`${PI}/api/rtc/options?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || `Failed to load ${level}`);
  return data.options as RtcOption[];
}

/** Resolve the RTC image URL(s) for a complete selection. */
export async function fetchRtcImages(sel: Required<RtcSelection>): Promise<string[]> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sel)) params.set(k, String(v));
  const res = await fetch(`${PI}/api/rtc?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch RTC');
  return data.imageUrls as string[];
}

/** Build a same-origin-proxied URL for displaying a remote RTC image. */
export function rtcProxyUrl(imageUrl: string): string {
  return `${PI}/api/pdf?url=${encodeURIComponent(imageUrl)}`;
}
