/**
 * src/lib/maasik/content-json-prompt.ts
 *
 * Builds the SECOND, isolated Claude call that transcribes a finished MAASIK
 * HTML report into the structured content_json (schema "maasik.content.v1").
 *
 * This call NEVER authors new report copy. It restructures the shipped HTML
 * verbatim, so the JSON is parity-guaranteed against the paid PDF. The only
 * net-new content it produces is the additive time_views block (month/week/
 * paksha notes + a small daily-themes pool), which has no HTML counterpart.
 *
 * Failure here is non-fatal: the PDF is already delivered. See extract-content-json.ts.
 */

export const CONTENT_JSON_PROMPT_VERSION = 'v1.0';
export const CONTENT_JSON_SCHEMA_VERSION = 'maasik.content.v1';

export const CONTENT_JSON_SYSTEM_PROMPT = `You are MAASIK's report structurer. You are given a finished, already-published HTML monthly blueprint and the user context it was built from. Your job is to transcribe that HTML into a single structured JSON object, NOT to write a new report.

ABSOLUTE RULES
1. Output ONLY the JSON object. No prose, no commentary, no markdown, no code fences. Start with { and end with }.
2. Transcribe verbatim. Every lede, body paragraph, verse, tagline, food item, grocery item, and anchor row must carry the EXACT text from the HTML. Do not paraphrase, summarise, shorten, or "improve" anything that exists in the HTML.
3. Capture the three AI-generated visuals LITERALLY from the HTML:
   - cover gradient: copy the two literal rgba(...) values into visuals.cover_gradient.primary_rgba / .accent_rgba.
   - heat-flow icons: copy each <svg>...</svg> for the left and right icon into visuals.heat_flow_left.icon_svg / visuals.heat_flow_right.icon_svg.
   - day chart: copy the dynamic day-chart markup into visuals.day_chart.svg.
4. Typed fields: times are "HH:MM" 24h; foods/grocery are arrays; tastes carry name + sanskrit. Bilingual verses stay split into { sanskrit, english }.
5. The ONLY net-new content you generate is the time_views block, because it has no HTML source:
   - month_overview: a tight executive summary of THIS report (summary string + highlights/opportunities/risks/recommended_actions arrays), drawn only from what the report already says.
   - week_note: one short pattern line for the week tab.
   - paksha: shukla_note, krishna_note, transition_note (short).
   - daily_themes: a small pool of 3 to 5 short rotating themes consistent with the report.
   Keep time_views faithful to the report's guidance; introduce no new recommendations that contradict it.
6. schema_version MUST be exactly "${CONTENT_JSON_SCHEMA_VERSION}".

If a slot is genuinely absent from the HTML, use an empty string or empty array rather than inventing content. Never drop a key.`;

/**
 * The schema skeleton is handed to the model as the target shape. Kept terse on
 * purpose: the authoritative annotated schema lives in MAASIK_CONTENT_SCHEMA.md.
 */
const SCHEMA_SKELETON = `{
  "schema_version": "${CONTENT_JSON_SCHEMA_VERSION}",
  "meta": { "edition_number": 0, "generation_date": "YYYY-MM-DD", "first_name": "", "city": "",
    "next_edition": { "vedic_month": "", "ritu": "", "delivery_date": "YYYY-MM-DD" } },
  "vedic_context": { "vedic_month": "", "vedic_month_full_description": "",
    "window": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
    "ritu": { "name": "", "descriptor": "" }, "paksha": "shukla" },
  "cover": { "subtitle": "", "verse": { "sanskrit": "", "english": "" } },
  "archetype": { "lede": "", "month_word_origin": { "term": "", "meaning": "" }, "name": "", "tagline": "",
    "tendencies": { "body": "", "mind": "", "season_asks": "" }, "identity_verse": "",
    "readout": { "city": "", "bmi": 0, "work_type": "" }, "body_para": "", "closing_line": "" },
  "whats_happening": { "title": "", "lede": "", "agni_meaning": "",
    "heat_flow": { "left": { "label": "", "state": "", "icon": "" }, "right": { "label": "", "state": "", "icon": "" } },
    "intersection_para": "", "fronts": [ { "title": "", "body": "" } ] },
  "taste_map": { "lede": "", "caption": "", "legend": { "lean": "", "ease": "" },
    "favor": [ { "name": "", "sanskrit": "" } ], "avoid": [ { "name": "", "sanskrit": "" } ],
    "foods_favor": [ { "category": "", "items": [] } ], "foods_avoid": [ { "category": "", "items": [] } ] },
  "day_plan": { "title": "", "lede": "", "dinacharya_meaning": "",
    "anchors": [ { "key": "", "time": "HH:MM", "name": "", "detail": "", "major": false } ] },
  "five_anchors": { "lede": "", "rules": [ { "title": "", "detail": "" } ], "avoid": [] },
  "grocery": { "lede": "", "specials_title": "", "cards": [ { "title": "", "items": [ { "name": "", "qty": "" } ] } ] },
  "commitment": { "opening": "", "thread_para": "", "lever_line": "", "closing_para": "",
    "verse": { "sanskrit": "", "english": "" } },
  "visuals": {
    "cover_gradient": { "primary_rgba": "", "accent_rgba": "", "derivable": true },
    "heat_flow_left": { "icon_svg": "", "derivable": true },
    "heat_flow_right": { "icon_svg": "", "derivable": true },
    "day_chart": { "svg": "", "derivable": true } },
  "time_views": {
    "month_overview": { "summary": "", "highlights": [], "opportunities": [], "risks": [], "recommended_actions": [] },
    "week_note": "",
    "paksha": { "shukla_note": "", "krishna_note": "", "transition_note": "" },
    "daily_themes": [] }
}`;

export function buildContentJsonUserMessage(
  generatedHtml: string,
  reportUserMessage: string,
): string {
  return `Transcribe the published HTML report below into content_json.

<original_user_context>
${reportUserMessage}
</original_user_context>

<published_html>
${generatedHtml}
</published_html>

<target_schema>
${SCHEMA_SKELETON}
</target_schema>

Return ONLY the JSON object, populated from the published HTML (verbatim for all existing copy and the three visuals) plus the additive time_views block. Start with { and end with }.`;
}
