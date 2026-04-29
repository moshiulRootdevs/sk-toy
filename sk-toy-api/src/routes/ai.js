const router = require('express').Router();
const { adminAuth } = require('../middleware/auth');
const OpenAI = require('openai');

function getClient() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-replace')) {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const toSlug = (s) =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

router.post('/seo', adminAuth, async (req, res, next) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(503).json({ message: 'OpenAI API key not configured. Set OPENAI_API_KEY in .env.' });
    }

    const { name, description, category, ageGroup, gender } = req.body;
    if (!name) return res.status(400).json({ message: 'Product name is required' });

    const context = [
      `Product name: ${name}`,
      category  ? `Category: ${category}`   : '',
      ageGroup  ? `Age group: ${ageGroup}`  : '',
      gender    ? `Gender: ${gender}`       : '',
      description ? `Description (HTML): ${description.replace(/<[^>]+>/g, ' ').slice(0, 400)}` : '',
    ].filter(Boolean).join('\n');

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are an SEO expert for a Bangladeshi children's toy e-commerce store called "SK Toy".
Generate concise, keyword-rich SEO content. Respond ONLY with valid JSON — no markdown, no extra text.`,
        },
        {
          role: 'user',
          content: `Generate SEO fields for this product:\n${context}\n\nRespond with JSON:\n{"slug":"...","metaTitle":"...","metaDescription":"..."}
Rules:
- slug: lowercase, hyphens only, max 60 chars
- metaTitle: 50-60 chars, include key feature
- metaDescription: 140-160 chars, mention key benefits, include a soft CTA`,
        },
      ],
    });

    const raw = completion.choices[0].message.content.trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('GPT returned invalid JSON');
      parsed = JSON.parse(match[0]);
    }

    res.json({
      slug: toSlug(parsed.slug || name),
      metaTitle: parsed.metaTitle || name,
      metaDescription: parsed.metaDescription || '',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
