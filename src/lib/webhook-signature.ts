import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Standard Webhooks verification (what Dodo uses):
 * HMAC-SHA256 over `${webhook-id}.${webhook-timestamp}.${rawBody}`, keyed with the
 * base64-decoded secret (after stripping "whsec_"), base64-encoded, sent as one or
 * more space-separated "v1,<sig>" values in `webhook-signature`.
 */
export function verifyWebhook(rawBody: string, headers: Headers, secret: string, toleranceSec = 300) {
  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sigHeader = headers.get("webhook-signature");
  if (!id || !ts || !sigHeader) return false;
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > toleranceSec) return false;
  const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
  const expected = Buffer.from(createHmac("sha256", key).update(`${id}.${ts}.${rawBody}`).digest("base64"));
  return sigHeader.split(" ").some((part) => {
    const [version, sig] = part.split(",", 2);
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
