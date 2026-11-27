export interface HeroRewriteVariant {
  title: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText: string;
  framework: string;
  whyItConverts: string;
}

export interface ProductDescriptionRewrite {
  hook: string;
  storyProblem: string;
  coreSolution: string;
  bulletBenefits: string[];
  riskReversalGuarantee: string;
  recommendedPricingOffer: string;
}

export interface AICopyAnalysis {
  heroRewrites: HeroRewriteVariant[];
  productRewrite: ProductDescriptionRewrite;
  croPsychologyNotes: string[];
}

/**
 * AI copy suggestions from the store's real headline and product. Returns null when AI isn't
 * configured or fails: the report then simply has no rewrite section. There is no template
 * fallback, because template copy with invented ratings, customer counts or guarantees is
 * exactly what a merchant must not paste onto their store.
 */
export async function generateAICopyRewrites(
  storeName: string,
  rawHeadline?: string,
  detectedNiche?: string,
  sampleProductTitle?: string
): Promise<AICopyAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a senior Shopify conversion copywriter.
Store name: ${storeName}
Current homepage headline: ${rawHeadline || '(none found)'}
Store category: ${detectedNiche || '(unknown)'}
Sample product: ${sampleProductTitle || '(none found)'}

Write 3 homepage hero rewrites and 1 product page rewrite, using frameworks such as PAS, outcome-led and authority.

Strict rules (the merchant may paste this onto a live store):
- Never invent numbers, ratings, review counts, customer counts, awards, certifications, materials, delivery times, discounts, refund periods or guarantees.
- Wherever such a fact would help, write a placeholder the merchant must fill in, like [ADD: your average rating and review count] or [ADD: your return window].
- No claims about health or results you can't know. Plain, specific language.

Return JSON only, matching:
{
  "heroRewrites": [{ "title": "Variant name", "headline": "", "subheadline": "", "ctaText": "", "badgeText": "", "framework": "", "whyItConverts": "" }],
  "productRewrite": { "hook": "", "storyProblem": "", "coreSolution": "", "bulletBenefits": ["", "", ""], "riskReversalGuarantee": "", "recommendedPricingOffer": "" },
  "croPsychologyNotes": ["", ""]
}`;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      console.warn('Gemini copy request failed', res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const json = await res.json();
    const text = (json.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || '').join('');
    const parsed = JSON.parse(text) as AICopyAnalysis;
    if (!Array.isArray(parsed.heroRewrites) || !parsed.productRewrite || !Array.isArray(parsed.productRewrite.bulletBenefits)) return null;
    parsed.croPsychologyNotes = Array.isArray(parsed.croPsychologyNotes) ? parsed.croPsychologyNotes : [];
    return parsed;
  } catch (e) {
    console.warn('Gemini copy generation failed:', (e as Error).message);
    return null;
  }
}
