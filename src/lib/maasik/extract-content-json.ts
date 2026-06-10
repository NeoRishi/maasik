/**
 * src/lib/maasik/extract-content-json.ts
 *
 * Orchestrates the second, isolated Claude call that transcribes a finished
 * MAASIK HTML report into structured content_json (schema "maasik.content.v1").
 *
 * Design: this is a SHADOW step. It runs after the paid PDF is already sent,
 * so any failure here is non-fatal and is reported as a typed result for the
 * caller to log. It never throws into the delivery path.
 */

import { getAnthropic } from './anthropic-client';
import {
  CONTENT_JSON_SCHEMA_VERSION,
  CONTENT_JSON_SYSTEM_PROMPT,
  buildContentJsonUserMessage,
} from './content-json-prompt';

// The transcription call gets its OWN full budget so it never competes with the
// HTML generation for output tokens. content_json runs ~8-12K tokens.
const CONTENT_JSON_MAX_TOKENS = 32000;

// Near-deterministic: this is transcription, not authoring. A little headroom
// for the additive time_views prose only.
const CONTENT_JSON_TEMPERATURE = 0.2;

const REQUIRED_TOP_LEVEL_KEYS = [
  'schema_version', 'meta', 'vedic_context', 'cover', 'archetype',
  'whats_happening', 'taste_map', 'day_plan', 'five_anchors', 'grocery',
  'commitment', 'visuals', 'time_views',
] as const;

export type ContentJsonResult =
  | {
      ok: true;
      contentJson: Record<string, unknown>;
      schemaVersion: string;
      usage: { input_tokens: number; output_tokens: number };
    }
  | { ok: false; error: string };

/** Pull the first complete JSON object out of a model response. */
function sliceJson(raw: string): string | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  return raw.slice(start, end + 1);
}

export async function extractContentJson(
  generatedHtml: string,
  reportUserMessage: string,
): Promise<ContentJsonResult> {
  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages
      .stream({
        model: 'claude-sonnet-4-6',
        max_tokens: CONTENT_JSON_MAX_TOKENS,
        temperature: CONTENT_JSON_TEMPERATURE,
        system: [
          {
            type: 'text',
            text: CONTENT_JSON_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: buildContentJsonUserMessage(generatedHtml, reportUserMessage),
          },
        ],
      })
      .finalMessage();

    if (response.stop_reason === 'max_tokens') {
      return { ok: false, error: 'content_json truncated (stop_reason=max_tokens)' };
    }

    const rawText = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim();

    const jsonStr = sliceJson(rawText);
    if (!jsonStr) {
      return { ok: false, error: 'no JSON object found in content_json response' };
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e: any) {
      return { ok: false, error: `content_json JSON.parse failed: ${e.message}` };
    }

    const missing = REQUIRED_TOP_LEVEL_KEYS.filter((k) => !(k in parsed));
    if (missing.length > 0) {
      return { ok: false, error: `content_json missing keys: ${missing.join(', ')}` };
    }

    if (parsed.schema_version !== CONTENT_JSON_SCHEMA_VERSION) {
      // Stamp the canonical version rather than trust the model's echo.
      parsed.schema_version = CONTENT_JSON_SCHEMA_VERSION;
    }

    return {
      ok: true,
      contentJson: parsed,
      schemaVersion: CONTENT_JSON_SCHEMA_VERSION,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  } catch (err: any) {
    return { ok: false, error: `content_json call threw: ${err?.message || String(err)}` };
  }
}
