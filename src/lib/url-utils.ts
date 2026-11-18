export function normalizeUrl(rawUrl: string): { url: string; canonical: string; hostname: string } {
  let cleaned = rawUrl.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }

    const canonical = `${parsed.protocol}//${hostname}`;
    // Normalized URL with trailing slash removed unless root
    const cleanUrl = parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, ''));

    return {
      url: cleanUrl,
      canonical,
      hostname,
    };
  } catch {
    throw new Error('Invalid URL format. Please provide a valid Shopify store URL.');
  }
}

export function extractStoreName(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length > 0) {
    const name = parts[0] === 'www' ? parts[1] : parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Shopify Store';
}
