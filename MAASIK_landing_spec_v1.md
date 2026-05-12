# MAASIK V1 — Landing Page Specification
## Deliverable C
**Domain:** maasik.neorishi.io
**Tech:** Next.js 14 (App Router, static export), Tailwind CSS, Vercel hosting
**Date:** 12 May 2026
**Purpose:** Hand directly to Claude Code with the instruction "build this entire spec as a Next.js project."

---

## SECTION 1: BRAND IDENTITY

### Aesthetic Direction

**Pick:** Editorial-luxury meets temple-modernism. Think *Monocle magazine* meets *a beautifully designed Ayurvedic almanac*. The aesthetic must feel like something you would pay for, not a free wellness blog.

**Tone words:** Considered. Rooted. Premium. Quiet. Deliberate. Not flashy, not generic, not gradient-purple-startup.

**The one thing visitors will remember:** The terracotta-on-cream colour story plus the elegant Sanskrit-English typographic pairing, plus the genuinely useful sample-PDF preview.

---

### Colour Palette (Locked)

These match the PDF, so report and landing feel like one product.

```css
:root {
  /* Primary */
  --maasik-terracotta: #C84B31;
  --maasik-terracotta-deep: #A6361F;
  --maasik-terracotta-darker: #7A2818;

  /* Surface */
  --maasik-cream: #FAF3E7;
  --maasik-cream-warm: #fdf8ee;
  --maasik-cream-deep: #f3e9d4;
  --maasik-sand: #e8dcc1;
  --maasik-sand-deep: #d9c9a7;

  /* Ink */
  --maasik-ink: #2D2A26;
  --maasik-ink-soft: #4a3f31;
  --maasik-ink-faded: #8a7d6a;

  /* Semantic */
  --maasik-favor: #7A8450;
  --maasik-favor-bg: #f4f6ec;
  --maasik-avoid: #6b2a1a;
  --maasik-avoid-bg: #fbf0ec;
}
```

**Rules of use:**
- Cream is the dominant background (95% of the page)
- Terracotta is the accent, used sparingly for CTAs, headings, dividers
- Ink for body text only, never for backgrounds
- Never use pure black (`#000`) or pure white (`#fff`). Use the ink and cream variables.

---

### Typography (Locked)

**Display font:** **Fraunces** (Google Fonts). A modern serif with strong personality. Use for all headings, the brand mark, and the Sanskrit verses. Weight 300 for hero, 400-500 for section headings.

**Body font:** **Inter Tight** (Google Fonts). Highly legible, modern sans-serif with personality. Use for all paragraph text, buttons, labels. Weight 400 for body, 500 for emphasis, 600 sparingly.

**Mono font for tiny tagging:** **JetBrains Mono** (Google Fonts). Use for labels like "SECTION 01" or "₹99 / FIRST MONTH" in uppercase with letter-spacing.

**Loading:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Type scale (mobile-first, fluid):**
- Hero display: `clamp(3.5rem, 12vw, 8rem)` — Fraunces 300
- Section heading: `clamp(2rem, 5vw, 3.5rem)` — Fraunces 400
- Sub-heading: `clamp(1.25rem, 2.5vw, 1.75rem)` — Fraunces 400 italic
- Body large: `1.125rem` (18px) — Inter Tight 400
- Body: `1rem` (16px) — Inter Tight 400
- Caption: `0.875rem` (14px) — Inter Tight 400
- Label/Mono: `0.75rem` (12px) — JetBrains Mono uppercase letter-spacing 0.2em

---

### Spacing System

Use Tailwind defaults but commit to these section spacing tokens:
- Section vertical padding: `py-24 md:py-32 lg:py-40` (generous)
- Container max width: `max-w-6xl mx-auto px-6 md:px-8 lg:px-12`
- Element spacing: rely on 4/8/16/24/48/64 px increments

---

## SECTION 2: PAGE STRUCTURE

Single-page scroll. 9 sections in this exact order:

1. Top nav bar (sticky, minimal)
2. Hero
3. "What is MAASIK"
4. How it works (3 steps)
5. Sample report preview (the static screenshot section)
6. What's inside (the four sections explained)
7. Pricing
8. FAQ
9. Footer with final CTA

Each section described in detail below.

---

## SECTION 3: SECTION-BY-SECTION SPEC

---

### 3.1 — TOP NAV BAR

**Behaviour:** Sticky at top. Cream background with slight blur and bottom border on scroll. Height 64px.

**Layout (left to right):**
- Left: "MAASIK" wordmark in Fraunces 500, 18px, terracotta, letter-spacing 0.3em uppercase. Next to it, a thin vertical divider (`1px × 16px sand`), then "by NeoRishi" in Inter Tight 400, 12px, ink-faded.
- Right: A single CTA button labeled "Get Your Blueprint" linking to `#pricing` anchor on click, in terracotta with cream text. Small, 36px tall.

**Behaviour on mobile:** Hide "by NeoRishi". Keep the CTA on the right but shorten to "Subscribe".

---

### 3.2 — HERO

**Background:** Full-bleed cream with a very subtle radial gradient from cream-warm at top-left to cream at bottom-right. NO image. NO video.

**Decorative element:** A thin terracotta horizontal line at the very top of the hero, 60px wide, left-aligned with content margin. Above all text. This is a visual signature.

**Layout:** Asymmetric. Content left-aligned, generous right whitespace on desktop. On mobile, full-width left-aligned.

**Content (top to bottom):**

1. **Eyebrow label** in JetBrains Mono, 11px, terracotta, letter-spacing 0.3em uppercase: `PERSONALIZED · MONTHLY · VEDIC`

2. **Headline** in Fraunces 300, hero display size:
   *"Your nutrition,*
   *aligned with the moon."*
   (Two lines on desktop, line-break preserved. Italic the word "aligned".)

3. **Sub-headline** (Fraunces 400 italic, sub-heading size, ink-soft, max-width 540px, margin-top 32px):
   *"A premium monthly blueprint, built around your Ayurvedic constitution, your goals, and the season you are actually living in."*

4. **Body paragraph** (Inter Tight 400, body large, ink, max-width 540px, margin-top 24px):
   "Every Shukla Pratipada, a four-page nutrition guide arrives in your inbox. Calibrated to your Prakriti, your city, your goals, and this exact Vedic month. Not a generic diet plan. A new one each month, as the season changes."

5. **CTA block** (margin-top 48px):
   - Primary button: "Get Your Blueprint — ₹99" — terracotta background, cream text, Inter Tight 500, 16px, padding `16px 32px`, rounded `4px` (sharp, not pill), subtle shadow on hover
   - Secondary text-link below in Inter Tight 400, 14px, ink-faded, underlined: "See a sample report ↓" — scrolls to section 3.5 anchor

6. **Trust micro-line** (margin-top 32px, Inter Tight 400, 13px, ink-faded):
   "₹99 first month · ₹499/month or ₹4,999/year after · Cancel anytime"

7. **Decorative footer-of-hero element:** A horizontal divider that is itself a piece of metadata. Layout: thin sand-coloured line, with three small inline labels above:
   - `THIS MONTH: JYESHTHA · GREESHMA RITU · 02 MAY TO 16 MAY 2026`
   in JetBrains Mono 10px, ink-faded, letter-spacing 0.2em uppercase

**Hero height:** Approximately 90vh on desktop, fits within viewport. On mobile, content-driven height.

**Animation:** On page load, fade-in from below with 60ms stagger across the 7 elements. Total page load animation under 800ms. Use Motion library or pure CSS animation with `animation-delay`.

---

### 3.3 — "WHAT IS MAASIK"

**Background:** Cream-warm.

**Layout:** Two-column on desktop. Left column 5/12 width holds a section label and a quote. Right column 7/12 holds explanatory paragraphs.

**Left column:**

- Label (mono, terracotta, top-aligned): `01 — THE IDEA`
- Sanskrit verse below in Fraunces 400 italic, 22px, ink:
  *"ऋतुचर्या रसायनम्"*
- English translation below in Fraunces 400 italic, 13px, ink-faded, letter-spacing 0.05em:
  "Seasonal living is the true rejuvenation."

**Right column:**

Heading (Fraunces 400, section heading size, ink, margin-bottom 24px):
*"Ayurveda's oldest insight, in your inbox each month."*

Then three short paragraphs in Inter Tight 400, body large, ink, max-width 540px, separated by 24px:

Paragraph 1:
"Classical Ayurveda has always taught that what you eat in May should not match what you ate in November. Your digestive fire, your hydration needs, your dosha levels, all of these shift with the Vedic season. Most modern diets ignore this completely."

Paragraph 2:
"MAASIK fixes that. Once each Vedic month, you receive a four-page PDF that maps the next 14 to 30 days of eating to four variables we calculate for you: your Prakriti (Ayurvedic constitution), your goals, your active health concerns, and the current Ritu. The output is a grocery list, a meal map, and a routine that all fit on a single document you can stick on your refrigerator."

Paragraph 3:
"This is not a meal-kit subscription. There is no app to check daily. It is a quiet, monthly arrival of clarity, designed for people who want to eat well without thinking about it every day."

---

### 3.4 — HOW IT WORKS (3 STEPS)

**Background:** Cream (lighter).

**Layout:** Section heading top, then three large numbered cards arranged horizontally on desktop, stacked on mobile.

**Section heading (Fraunces 400, centered):**
*"Three steps. Once."*

**Sub-heading (Fraunces 400 italic, ink-soft, centered, margin-top 8px, max-width 480px):**
"Tell us about yourself once. Get personalized blueprints forever."

**The three cards** (margin-top 64px, gap-8 between them):

Each card has:
- A large numeral in Fraunces 300, 96px, terracotta, top-left
- A short heading in Fraunces 500, 24px, ink, margin-top 16px
- A description in Inter Tight 400, 15px, ink-soft, margin-top 12px, max-width 280px

**Card 1:**
- Numeral: 01
- Heading: "Answer 25 questions"
- Description: "A three-minute onboarding. We learn your constitution, your goals, your city, your dietary preferences, and your active health concerns. No fluff."

**Card 2:**
- Numeral: 02
- Heading: "Pay ₹99 to start"
- Description: "A simple Razorpay checkout. ₹99 for your first month's blueprint. Then ₹499/month or ₹4,999/year. Cancel any time, no questions."

**Card 3:**
- Numeral: 03
- Heading: "Receive every Shukla Pratipada"
- Description: "Each new Vedic month, your fresh PDF arrives by email at 7:00 AM IST. Calibrated to that month's Ritu and your profile. Open, print, follow."

**Card styling:** No borders. No backgrounds. Just text. Let the large numerals do the visual work.

---

### 3.5 — SAMPLE REPORT PREVIEW

**This is the conversion-critical section.** The headline says "see what you'll get," and we deliver immediately with the static screenshot.

**Background:** Cream-deep (slightly darker than the rest, to make this section feel like a "moment").

**Section eyebrow label (mono, terracotta, centered):**
`02 — WHAT YOU RECEIVE`

**Section heading (Fraunces 400, centered, ink):**
*"A real blueprint, blurred for privacy."*

**Sub-heading (Fraunces 400 italic, ink-soft, centered, max-width 540px, margin-top 12px):**
"This is the actual May 2026 issue for a Pitta-Vata user in Pune. Specific personal details are blurred. The structure and design are real."

**The preview itself:**

Below the heading, a single large image. Show four pages of the sample PDF, side by side on desktop with subtle drop shadows.

**Image source:** A single composite PNG at `/public/sample-report-preview.png`, 2400×900px (or 4:1 ratio), containing the four PDF pages rendered side-by-side with Gaussian blur applied to user-specific text fields (name, BMI number, goals).

**Image styling:**
- Width: full container max-width (1200px on desktop)
- Subtle box-shadow: `0 24px 60px -20px rgba(45, 42, 38, 0.25)`
- Rounded corners: `4px`
- On mobile: scroll horizontally inside a contained slider, with a faint scroll hint icon

**Below the image, an annotation row** in 4 columns (matching the 4 PDF pages):

Each annotation cell has:
- A small numeral label (mono, 11px, terracotta) like `PAGE 01`
- A short caption (Inter Tight 400, 13px, ink) describing what that page contains

Captions:
- PAGE 01: "Cover with your Vedic month, ritu, and dates"
- PAGE 02: "Month overview plus your personalized analysis"
- PAGE 03: "Diet blueprint, food categories, your ideal day"
- PAGE 04: "Grocery list, do's and don'ts, your anchor"

---

### 3.6 — WHAT'S INSIDE (THE FOUR SECTIONS)

**Background:** Cream.

**Section eyebrow (mono, terracotta):**
`03 — THE FOUR SECTIONS, EXPLAINED`

**Section heading (Fraunces 400):**
*"Four sections. One coherent month."*

**Layout:** Four expandable cards stacked vertically on desktop, full-width. Each card has a left-side numeral, a title, a teaser, and an expandable "Read more" that reveals 2-3 detailed bullet points.

For V1, **do not** make them expandable — just show all the content. Easier to ship.

**Each card layout:**
- Left column 1/4 width: A large terracotta numeral (Fraunces 300, 64px) like `01.`
- Right column 3/4 width: title + body

**Card 1:**
- Title (Fraunces 400, 24px): "Your month overview"
- Body (Inter Tight 400, 15px): "Each month, the report opens with what this Vedic month means in classical Ayurveda — the climate, the dominant dosha, the typical health risks. Then we connect that directly to your profile in a personalized callout that explains exactly why this month matters for you."

**Card 2:**
- Title: "Your diet blueprint"
- Body: "A full categorized food table — grains, pulses, vegetables, fruits, dairy, beverages, spices, snacks — split into 'favour' and 'avoid' columns. Plus an ideal-day meal map from 6:30 AM to 9:30 PM, with specific timing, portions, and substitutions for your constitution."

**Card 3:**
- Title: "Your grocery list"
- Body: "A complete shopping list organized by category, calibrated to your meal map and dosha. Stick it on your fridge. Hand it to your house help. You will not need to think about what to buy for two weeks."

**Card 4:**
- Title: "Your routine and anchor"
- Body: "The non-food half of the report: a side-by-side do's and don'ts for the month, a Sanskrit verse to anchor your practice, and a personal closing paragraph that connects your specific symptoms to one root cause and one concrete action for this month."

---

### 3.7 — PRICING

**This is the conversion section.** Make it confident, no apologies for the price.

**Background:** Terracotta-darker (`#7A2818`) for full visual contrast. Cream text. This is the only dark section on the page.

**Section eyebrow (mono, cream, opacity 0.6, centered):**
`04 — PRICING`

**Section heading (Fraunces 400, cream, centered):**
*"Less than a single dinner. Every month."*

**Sub-heading (Fraunces 400 italic, cream opacity 0.85, centered, max-width 540px):**
"Try MAASIK for ₹99. If the first blueprint changes how you eat, continue. If it does not, cancel in one click."

**Pricing card layout:** Two cards side by side on desktop. Stacked on mobile.

Each card on cream background (`#FAF3E7`), ink text, generous padding, 1px sand border, rounded 4px, subtle shadow.

**Card 1: Monthly**
- Label (mono, terracotta, top): `MONTHLY`
- Price (Fraunces 400, 56px, ink): "₹499"
- Slash (Inter Tight 400, 15px, ink-faded): "per Vedic month"
- Horizontal sand divider
- Bullet list (Inter Tight 400, 14px, ink, with terracotta diamond bullets):
  - First month: ₹99 (instead of ₹499)
  - New 4-page PDF every Shukla Pratipada
  - Personalized to your Prakriti + city + goals
  - Cancel any time, one click
- Button (Inter Tight 500, full-width, terracotta bg, cream text, margin-top 32px): "Start Monthly — ₹99 first month"

**Card 2: Annual (with subtle "Recommended" badge top-right of card)**
- Badge top-right corner (mono, 10px, cream on terracotta, padding 4px 8px): `BEST VALUE`
- Label (mono, terracotta, top): `ANNUAL`
- Price (Fraunces 400, 56px, ink): "₹4,999"
- Slash: "for 12 months · save ₹1,000"
- Horizontal sand divider
- Bullets:
  - All 12 Vedic months delivered
  - Includes Adhik Maas issues when they occur
  - Priority email support
  - First month still ₹99, then ₹4,999 covers months 2 to 13
- Button (terracotta bg, cream text, margin-top 32px): "Start Annual — ₹99 first month"

**Below the cards, a small caveat line** (Inter Tight 400, 13px, cream opacity 0.7, centered):
"Payments handled by Razorpay. UPI, cards, and net banking accepted. No auto-debit without consent. We will email you before each renewal."

---

### 3.8 — FAQ

**Background:** Back to cream.

**Section eyebrow (mono, terracotta):**
`05 — QUESTIONS`

**Section heading (Fraunces 400):**
*"What people ask before signing up."*

**Layout:** Single column, max-width 720px, centered. Each FAQ is a row with a question (Fraunces 500, 18px, ink) and an answer below (Inter Tight 400, 15px, ink-soft), separated by sand dividers.

**Do not** use the typical accordion expand. Show all answers by default. Easier to ship, better for SEO, looks more confident.

**Eight FAQ entries:**

**Q: Is this Ayurvedic medicine? Will it replace my doctor?**
A: No. MAASIK is a nutrition and lifestyle blueprint based on classical Ayurvedic seasonal wisdom (Ritucharya). It complements, never replaces, medical care. If you have an active medical condition, talk to your doctor before making changes.

**Q: I don't know my Prakriti. Can I still subscribe?**
A: Yes. The onboarding asks seven questions about your body, sleep, digestion, energy, and emotional patterns. We compute your Prakriti tendency from those. It is directional, not clinical, but accurate enough to personalize your blueprint with high confidence.

**Q: What if I have allergies or a medical condition?**
A: Tell us in the onboarding. Your blueprint accounts for allergies, intolerances, and conditions like acidity, diabetes, hypertension, thyroid issues, IBS, and so on. Foods that aggravate your condition are explicitly avoided.

**Q: Is this vegetarian only?**
A: We support vegetarian, eggetarian, non-vegetarian, and vegan diets. Your onboarding answer locks the diet type. The blueprint adapts.

**Q: When does the first report arrive?**
A: Within 30 minutes of payment, you receive your first issue calibrated to the current Vedic month. From then on, a fresh blueprint arrives every Shukla Pratipada (the first day of each new Vedic lunar month) by 7:00 AM IST.

**Q: Can I cancel?**
A: Yes, any time, one click. You will keep access to issues you have already paid for. We do not send a cancellation survey or ask why.

**Q: Why is the first month ₹99?**
A: So you can read a full blueprint before committing. If the first issue does not feel like ₹499 of value, do not continue. Most users continue.

**Q: Who is behind MAASIK?**
A: MAASIK is built by NeoRishi, founded by Hrishikesh, who holds a Master's in Yoga Shastra. The blueprints are generated with AI calibrated to classical Ayurvedic texts (Charaka Samhita, Ashtanga Hridayam) and reviewed against a curated Ritucharya knowledge base. We aim to grow with a panel of Ayurvedic vaidyas advising us.

---

### 3.9 — FOOTER WITH FINAL CTA

**Background:** Cream-deep, with a top border in sand.

**Layout:** Three parts, top to bottom.

**Part 1: Final CTA banner** (centered, 80px padding top and bottom):
- Heading (Fraunces 400, section heading size, ink, centered, max-width 600px):
  *"Your next Shukla Pratipada is in five days."*
- Sub (Fraunces 400 italic, ink-soft, centered, margin-top 12px):
  "Subscribe today and your first blueprint arrives on the day."
- Big CTA button (margin-top 32px, terracotta, cream text, padding `20px 48px`, Fraunces 500, 18px): "Get Your Blueprint — ₹99"

Note: the date "in five days" is **dynamic**. Calculate it at build/render time. If today is May 12 and next Shukla Pratipada is May 17, show "in five days". If today is the Shukla Pratipada itself, show "is today". If less than 24 hours away, "is tomorrow." Use server-side rendering or static-generation-at-build-time.

**Part 2: A thin row of useful links** (margin-top 48px, padding 24px 0, with top and bottom sand borders):
- Left: "MAASIK · A NeoRishi product" (mono, 11px, ink-faded)
- Center: Three text links (Inter Tight 400, 13px, ink, hover terracotta): "Terms" · "Privacy" · "Contact: hello@neorishi.io"
- Right: "© 2026 NeoRishi" (mono, 11px, ink-faded)

**Part 3: Final visual signature** (padding-top 24px, height 80px, centered text):
- A single Sanskrit verse in Fraunces 400 italic, 16px, ink-faded:
  *"सर्वे भवन्तु सुखिनः"*
- Below it, in mono 10px ink-faded, letter-spacing 0.2em: `MAY ALL BE HEALTHY`

---

## SECTION 4: TECHNICAL IMPLEMENTATION

### Project setup

```bash
npx create-next-app@latest maasik-landing --typescript --tailwind --app --src-dir --import-alias "@/*"
cd maasik-landing
npm install motion lucide-react
```

### File structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with font loading
│   ├── page.tsx            # The single landing page
│   ├── globals.css         # Tailwind imports + custom CSS variables
│   ├── icon.tsx            # Favicon
│   └── opengraph-image.tsx # OG image for sharing
├── components/
│   ├── NavBar.tsx
│   ├── Hero.tsx
│   ├── WhatIsMaasik.tsx
│   ├── HowItWorks.tsx
│   ├── SamplePreview.tsx
│   ├── FourSections.tsx
│   ├── Pricing.tsx
│   ├── Faq.tsx
│   └── Footer.tsx
├── lib/
│   ├── vedic-date.ts       # Compute next Shukla Pratipada
│   └── constants.ts        # All copy strings, prices, URLs
public/
├── sample-report-preview.png    # Static screenshot of PDF
├── og-image.png                 # Social share image
└── favicon.ico
```

### Static export config

```js
// next.config.js
module.exports = {
  output: 'export',
  images: { unoptimized: true },
};
```

This matches your NeoRishi V1 static-export setup. No SSR, no API routes on the landing page itself.

### Environment variables

```env
# .env.local
NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK=<paste from Razorpay dashboard>
NEXT_PUBLIC_TALLY_FORM_URL=<paste from Tally>
NEXT_PUBLIC_POSTHOG_KEY=<existing NeoRishi key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### CTA button behaviour

All "Get Your Blueprint" buttons across the page do the same thing:
1. Fire a PostHog event: `cta_clicked` with `{ location: 'hero' | 'footer' | 'pricing_monthly' | 'pricing_annual' }`
2. Redirect to `process.env.NEXT_PUBLIC_TALLY_FORM_URL` (the Tally form)
3. Tally form handles the rest of the funnel (questions → submit → redirects to Razorpay payment link)

So the landing page itself is just a marketing page. The funnel handoff happens at the Tally URL.

### Performance budget

- Total page weight (excluding sample image): under 200KB
- Lighthouse score: 95+ on performance, 100 on accessibility, 100 on best practices, 100 on SEO
- LCP under 1.8s, CLS under 0.05

### SEO and OG

```tsx
// In app/layout.tsx metadata
export const metadata = {
  title: 'MAASIK — Personalized Monthly Vedic Nutrition Blueprints | NeoRishi',
  description: 'A premium monthly nutrition guide aligned to the Vedic calendar. Personalized to your Ayurvedic constitution, city, and goals. ₹99 first month.',
  openGraph: {
    title: 'MAASIK — Your Nutrition, Aligned with the Moon',
    description: 'Premium monthly Vedic nutrition blueprints. Calibrated to your Prakriti, your city, your goals.',
    images: ['/og-image.png'],
  },
};
```

OG image to be a 1200×630 PNG showing the MAASIK wordmark over the cover-page terracotta gradient with a tagline.

### Analytics

PostHog snippet in root layout, fires `page_view` on mount. Plus the per-CTA events listed above. Plus:
- `scroll_depth_25`, `scroll_depth_50`, `scroll_depth_75`, `scroll_depth_100` events
- `pricing_card_hover` with `{ tier: 'monthly' | 'annual' }`
- `faq_question_view` when an FAQ enters the viewport

### Accessibility

- All buttons have visible focus rings (`focus:ring-2 focus:ring-terracotta focus:ring-offset-2 focus:ring-offset-cream`)
- All sections have semantic landmark elements (`<section>`, `<nav>`, `<footer>`, `<main>`)
- Heading hierarchy: only one `<h1>` (in hero), `<h2>` for section headings, `<h3>` for card titles
- Color contrast verified: all ink-on-cream combinations pass WCAG AA at minimum
- Images have alt text
- Page works without JavaScript (Motion animations are progressive enhancement)

### Mobile considerations

- Hero text scales fluidly via `clamp()`
- Pricing cards stack vertically with full width
- Sample preview becomes a horizontal scroll slider on mobile, with a tiny "swipe →" hint
- Nav bar collapses to logo + "Subscribe" button
- All padding scales down to `px-6` on small screens

---

## SECTION 5: COPY DECK (CONSOLIDATED)

For Claude Code to pull from a single place, here is every piece of copy on the page in order:

```ts
// src/lib/constants.ts

export const COPY = {
  brand: {
    name: 'MAASIK',
    parent: 'by NeoRishi',
    tagline: 'Your nutrition, aligned with the moon.',
  },

  hero: {
    eyebrow: 'PERSONALIZED · MONTHLY · VEDIC',
    headlineLineOne: 'Your nutrition,',
    headlineLineTwo: 'aligned with the moon.',
    subheadline: 'A premium monthly blueprint, built around your Ayurvedic constitution, your goals, and the season you are actually living in.',
    body: 'Every Shukla Pratipada, a four-page nutrition guide arrives in your inbox. Calibrated to your Prakriti, your city, your goals, and this exact Vedic month. Not a generic diet plan. A new one each month, as the season changes.',
    primaryCta: 'Get Your Blueprint — ₹99',
    secondaryCta: 'See a sample report ↓',
    trustLine: '₹99 first month · ₹499/month or ₹4,999/year after · Cancel anytime',
    monthMetaLabel: 'THIS MONTH: JYESHTHA · GREESHMA RITU · 02 MAY TO 16 MAY 2026',
  },

  whatIsMaasik: {
    label: '01 — THE IDEA',
    sanskritVerse: 'ऋतुचर्या रसायनम्',
    sanskritTranslation: 'Seasonal living is the true rejuvenation.',
    heading: "Ayurveda's oldest insight, in your inbox each month.",
    body: [
      "Classical Ayurveda has always taught that what you eat in May should not match what you ate in November. Your digestive fire, your hydration needs, your dosha levels, all of these shift with the Vedic season. Most modern diets ignore this completely.",
      "MAASIK fixes that. Once each Vedic month, you receive a four-page PDF that maps the next 14 to 30 days of eating to four variables we calculate for you: your Prakriti (Ayurvedic constitution), your goals, your active health concerns, and the current Ritu. The output is a grocery list, a meal map, and a routine that all fit on a single document you can stick on your refrigerator.",
      "This is not a meal-kit subscription. There is no app to check daily. It is a quiet, monthly arrival of clarity, designed for people who want to eat well without thinking about it every day.",
    ],
  },

  howItWorks: {
    heading: 'Three steps. Once.',
    subheading: 'Tell us about yourself once. Get personalized blueprints forever.',
    steps: [
      {
        number: '01',
        title: 'Answer 25 questions',
        description: 'A three-minute onboarding. We learn your constitution, your goals, your city, your dietary preferences, and your active health concerns. No fluff.',
      },
      {
        number: '02',
        title: 'Pay ₹99 to start',
        description: 'A simple Razorpay checkout. ₹99 for your first month\'s blueprint. Then ₹499/month or ₹4,999/year. Cancel any time, no questions.',
      },
      {
        number: '03',
        title: 'Receive every Shukla Pratipada',
        description: 'Each new Vedic month, your fresh PDF arrives by email at 7:00 AM IST. Calibrated to that month\'s Ritu and your profile. Open, print, follow.',
      },
    ],
  },

  samplePreview: {
    label: '02 — WHAT YOU RECEIVE',
    heading: 'A real blueprint, blurred for privacy.',
    subheading: 'This is the actual May 2026 issue for a Pitta-Vata user in Pune. Specific personal details are blurred. The structure and design are real.',
    pageAnnotations: [
      { label: 'PAGE 01', caption: 'Cover with your Vedic month, ritu, and dates' },
      { label: 'PAGE 02', caption: 'Month overview plus your personalized analysis' },
      { label: 'PAGE 03', caption: 'Diet blueprint, food categories, your ideal day' },
      { label: 'PAGE 04', caption: 'Grocery list, do\'s and don\'ts, your anchor' },
    ],
  },

  fourSections: {
    label: '03 — THE FOUR SECTIONS, EXPLAINED',
    heading: 'Four sections. One coherent month.',
    cards: [
      {
        number: '01.',
        title: 'Your month overview',
        body: 'Each month, the report opens with what this Vedic month means in classical Ayurveda, the climate, the dominant dosha, the typical health risks. Then we connect that directly to your profile in a personalized callout that explains exactly why this month matters for you.',
      },
      {
        number: '02.',
        title: 'Your diet blueprint',
        body: "A full categorized food table, grains, pulses, vegetables, fruits, dairy, beverages, spices, snacks, split into 'favour' and 'avoid' columns. Plus an ideal-day meal map from 6:30 AM to 9:30 PM, with specific timing, portions, and substitutions for your constitution.",
      },
      {
        number: '03.',
        title: 'Your grocery list',
        body: 'A complete shopping list organized by category, calibrated to your meal map and dosha. Stick it on your fridge. Hand it to your house help. You will not need to think about what to buy for two weeks.',
      },
      {
        number: '04.',
        title: 'Your routine and anchor',
        body: "The non-food half of the report: a side-by-side do's and don'ts for the month, a Sanskrit verse to anchor your practice, and a personal closing paragraph that connects your specific symptoms to one root cause and one concrete action for this month.",
      },
    ],
  },

  pricing: {
    label: '04 — PRICING',
    heading: 'Less than a single dinner. Every month.',
    subheading: 'Try MAASIK for ₹99. If the first blueprint changes how you eat, continue. If it does not, cancel in one click.',
    tiers: [
      {
        label: 'MONTHLY',
        price: '₹499',
        slash: 'per Vedic month',
        bullets: [
          'First month: ₹99 (instead of ₹499)',
          'New 4-page PDF every Shukla Pratipada',
          'Personalized to your Prakriti + city + goals',
          'Cancel any time, one click',
        ],
        cta: 'Start Monthly — ₹99 first month',
        badge: null,
      },
      {
        label: 'ANNUAL',
        price: '₹4,999',
        slash: 'for 12 months · save ₹1,000',
        bullets: [
          'All 12 Vedic months delivered',
          'Includes Adhik Maas issues when they occur',
          'Priority email support',
          'First month still ₹99, then ₹4,999 covers months 2 to 13',
        ],
        cta: 'Start Annual — ₹99 first month',
        badge: 'BEST VALUE',
      },
    ],
    caveat: 'Payments handled by Razorpay. UPI, cards, and net banking accepted. No auto-debit without consent. We will email you before each renewal.',
  },

  faq: {
    label: '05 — QUESTIONS',
    heading: 'What people ask before signing up.',
    items: [
      {
        q: 'Is this Ayurvedic medicine? Will it replace my doctor?',
        a: 'No. MAASIK is a nutrition and lifestyle blueprint based on classical Ayurvedic seasonal wisdom (Ritucharya). It complements, never replaces, medical care. If you have an active medical condition, talk to your doctor before making changes.',
      },
      {
        q: "I don't know my Prakriti. Can I still subscribe?",
        a: 'Yes. The onboarding asks seven questions about your body, sleep, digestion, energy, and emotional patterns. We compute your Prakriti tendency from those. It is directional, not clinical, but accurate enough to personalize your blueprint with high confidence.',
      },
      {
        q: 'What if I have allergies or a medical condition?',
        a: 'Tell us in the onboarding. Your blueprint accounts for allergies, intolerances, and conditions like acidity, diabetes, hypertension, thyroid issues, IBS, and so on. Foods that aggravate your condition are explicitly avoided.',
      },
      {
        q: 'Is this vegetarian only?',
        a: 'We support vegetarian, eggetarian, non-vegetarian, and vegan diets. Your onboarding answer locks the diet type. The blueprint adapts.',
      },
      {
        q: 'When does the first report arrive?',
        a: 'Within 30 minutes of payment, you receive your first issue calibrated to the current Vedic month. From then on, a fresh blueprint arrives every Shukla Pratipada (the first day of each new Vedic lunar month) by 7:00 AM IST.',
      },
      {
        q: 'Can I cancel?',
        a: 'Yes, any time, one click. You will keep access to issues you have already paid for. We do not send a cancellation survey or ask why.',
      },
      {
        q: 'Why is the first month ₹99?',
        a: 'So you can read a full blueprint before committing. If the first issue does not feel like ₹499 of value, do not continue. Most users continue.',
      },
      {
        q: 'Who is behind MAASIK?',
        a: "MAASIK is built by NeoRishi, founded by Hrishikesh, who holds a Master's in Yoga Shastra. The blueprints are generated with AI calibrated to classical Ayurvedic texts (Charaka Samhita, Ashtanga Hridayam) and reviewed against a curated Ritucharya knowledge base. We aim to grow with a panel of Ayurvedic vaidyas advising us.",
      },
    ],
  },

  footer: {
    finalHeadingDynamic: (daysToNext: number) => {
      if (daysToNext === 0) return 'Your next Shukla Pratipada is today.';
      if (daysToNext === 1) return 'Your next Shukla Pratipada is tomorrow.';
      return `Your next Shukla Pratipada is in ${daysToNext} days.`;
    },
    finalSub: 'Subscribe today and your first blueprint arrives on the day.',
    finalCta: 'Get Your Blueprint — ₹99',
    legalLeft: 'MAASIK · A NeoRishi product',
    legalCenter: ['Terms', 'Privacy', 'Contact: hello@neorishi.io'],
    legalRight: '© 2026 NeoRishi',
    closingSanskrit: 'सर्वे भवन्तु सुखिनः',
    closingTranslation: 'MAY ALL BE HEALTHY',
  },
};

// Vedic date helper
export const NEXT_SHUKLA_PRATIPADA = '2026-05-17';  // Adhik Jyeshtha Shukla Pratipada
```

---

## SECTION 6: CLAUDE CODE BUILD PROMPT (READY TO PASTE)

When you open Claude Code in the project directory, paste this:

```
Build a Next.js 14 landing page for maasik.neorishi.io based on the attached spec file (`MAASIK_landing_spec_v1.md`). Use App Router, TypeScript, Tailwind CSS, and Motion for animations.

CRITICAL REQUIREMENTS:
1. Read the spec file completely before writing any code.
2. Use the exact colour variables, fonts, and copy from the spec.
3. Implement all 9 sections in the order specified.
4. Use static export (`output: 'export'`).
5. Mobile-first responsive design.
6. Match the spec's aesthetic direction: editorial-luxury meets temple-modernism. NO purple gradients, NO generic SaaS hero patterns, NO Inter for headings.
7. The "Get Your Blueprint" CTAs should all redirect to the URL in `NEXT_PUBLIC_TALLY_FORM_URL`.
8. PostHog analytics should fire the events listed in the spec.
9. The "days to next Shukla Pratipada" must be dynamic, computed from the NEXT_SHUKLA_PRATIPADA constant.
10. After building, run `npm run build` to verify it exports cleanly, and report any errors.

Place a placeholder image at `/public/sample-report-preview.png` (1px transparent PNG is fine for now, I will replace it later).

Start by reading the spec, then propose a build plan, then I will say "go" and you build.
```

---

## SECTION 7: WHAT I OWE YOU AFTER THIS

To make the landing actually go live, you will need:

1. **The blurred sample PDF screenshot** — I will generate this for you next. It's a composite image of the 4 PDF pages with user-specific details Gaussian-blurred.
2. **An OG image (1200×630)** — also from me, terracotta gradient with MAASIK wordmark.
3. **The Tally form URL** — you build this in Tally (Deliverable B I'll produce after C is approved).
4. **The Razorpay Payment Link URL** — you create in your Razorpay dashboard, share with me, I include in env vars.
5. **DNS setup** — you point `maasik.neorishi.io` CNAME to Vercel's deployment.

---

## DONE.

This spec is everything Claude Code needs to build the landing page in one focused session, estimated 4-6 hours of build time. Hand the spec + the Claude Code prompt to your IDE, and you have a deployable landing page by tomorrow afternoon.

Next deliverable in sequence: **B (Tally form spec)** or **D (Claude API report-generation prompt)**?
