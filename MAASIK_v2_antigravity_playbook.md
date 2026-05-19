# MAASIK v1 → v2 Migration Playbook for Antigravity

This is the execution plan for upgrading the codebase to match `MAASIK_claude_api_prompt_v2.md`. Each phase is a self-contained Antigravity prompt. Run them **in order**. Do not run multiple in parallel.

---

## Before you start

1. **Upload the spec into Antigravity's project context:**
   - `MAASIK_claude_api_prompt_v2.md` (the v2 prompt doc, this is the source of truth)
   - `MAASIK_Jyeshtha_v4_sample.html` (the validated visual reference)
   - This playbook itself

2. **Create a Git branch first:**
   ```bash
   git checkout -b feat/maasik-v2-prompt
   ```

3. **Have these tools ready in Antigravity:**
   - File reading, editing
   - Supabase MCP if you have it wired (else you'll run SQL manually in the Supabase dashboard)
   - Terminal for running typescript/build checks

4. **After each phase, do this gate:**
   - Review the diff
   - Run `npm run build` or `npm run typecheck`
   - Commit with the phase number in the message
   - Only then start the next phase

---

## Phase Map

| Phase | What changes | Files touched | Risk |
|---|---|---|---|
| 1 | DB migration: new columns on `maasik_reports` | SQL only | Low |
| 2 | New helpers (Ritu color, word origin rotation, archetype helpers) | `lib/maasik/helpers.ts` | Low |
| 3 | System prompt replacement | `lib/maasik/system-prompt.ts` | Medium |
| 4 | HTML template replacement (the v4 design with placeholders) | `lib/maasik/html-template.ts` | High |
| 5 | User message builder update | `lib/maasik/user-message.ts` (new file) | Low |
| 6 | Route handler update (caching, validation, save archetype/origins) | `app/api/generate-report/route.ts` | Medium |
| 7 | Post-generation validation utility | `lib/maasik/validate-html.ts` (new file) | Low |
| 8 | Smoke test endpoint | `app/api/generate-report-test/route.ts` (new file) | Low |

---

## PHASE 1 — Database migration

### Copy this into Antigravity:

```
We are upgrading the MAASIK report system from v1 to v2. The full spec is in `MAASIK_claude_api_prompt_v2.md` (already in project context). For this phase, only do the database changes.

Goal: extend `maasik_reports` to track the new v2 fields without breaking v1 records.

Required changes:
1. Add column `archetype_name` text (nullable). This stores the archetype Claude assigned in this edition.
2. Add column `word_origins_used` text[] (nullable, default empty array). Stores the Sanskrit terms used in word-origin cards for this edition.
3. Add column `edition_number` integer (nullable). Mirrors v1's `issue_number` but with the new naming. Keep `issue_number` as the existing column; do NOT drop it. New code reads from `edition_number`. We will backfill `edition_number = issue_number` for existing rows.
4. Bump the default of `generation_prompt_version` to `'v2.0'`.

Deliverable: a single SQL migration file at `supabase/migrations/<timestamp>_maasik_v2_columns.sql`. After writing it, show me the SQL. Do NOT apply it yet. I will run it through the Supabase dashboard myself.

Constraints:
- Do not modify any other tables.
- Do not modify any existing columns' types.
- Use `IF NOT EXISTS` clauses so the migration is idempotent.
```

### Verification before Phase 2:
- The SQL file exists and reads cleanly
- You ran the migration in Supabase, confirmed the 3 new columns exist on `maasik_reports`
- A test query `SELECT id, edition_number, archetype_name, word_origins_used FROM maasik_reports LIMIT 1;` succeeds

---

## PHASE 2 — Helpers

### Copy this into Antigravity:

```
Refer to `MAASIK_claude_api_prompt_v2.md` for the full spec. For this phase, only update `lib/maasik/helpers.ts`.

Goal: add the helper functions v2 needs.

Required additions to `lib/maasik/helpers.ts`:

1. `getRituColors(ritu: string)` — returns `{ primary: string; accent: string }` for each Ritu. Values from the spec's Part E (E1-E6) and Part F7.

2. `getRituActivityZones(ritu: string)` — returns the activity zone definitions for Section 4's day chart, including label, start hour, end hour, color. From spec's Part E.

3. `getRituLeverTemplate(ritu: string)` — returns the default lever-line template for Section 7. From spec's Part E.

4. `getRituSection2Title(ritu: string)` — returns the Section 2 title for the Ritu (e.g., Greeshma returns "The fire turns inward"). From spec's Part E.

5. `getRituLegendLabels(ritu: string)` — returns `{ leanIn: string; easeOff: string }` for the Section 3 legend. From spec's Part E.

6. `getRituGrocerySpecialsTitle(ritu: string)` — returns the Section 6 specials card title (e.g., "Greeshma cooling specials"). From spec's Part E.

7. `getNextDeliveryDate(currentMonth: VedicMonth)` — returns the next month's Shukla Pratipada Gregorian date. Implementation: query the next sequential month from `maasik_vedic_calendar`. Add this as an async function that takes a Supabase client.

8. KEEP the existing `getBmiCategory` and `getMonthDescriptor` functions untouched.

Deliverable: the updated `lib/maasik/helpers.ts`, plus a one-paragraph summary of what changed at the top of your response.

Constraints:
- Strict TypeScript, no `any` in function signatures.
- All Ritu lookups use a typed `Ritu` union: `'Shishira' | 'Vasanta' | 'Greeshma' | 'Varsha' | 'Sharad' | 'Hemanta'`.
- Each function has a JSDoc comment explaining its purpose in one line.
- No external dependencies beyond what's already imported in the file.

After writing, run `npm run typecheck` (or `tsc --noEmit`) and report any errors. If there are errors, fix them and re-report.
```

### Verification before Phase 3:
- File compiles cleanly
- The 6 new lookup functions return correct values for at least Greeshma and Varsha (spot-check)

---

## PHASE 3 — System prompt replacement

### Copy this into Antigravity:

```
Refer to `MAASIK_claude_api_prompt_v2.md` for the source of truth. For this phase, only update `lib/maasik/system-prompt.ts`.

Goal: replace the v1 system prompt with the v2 system prompt. The v2 prompt is in Part 2 of `MAASIK_claude_api_prompt_v2.md`, starting at the line `You are MAASIK, NeoRishi's monthly Vedic blueprint generator.` and ending right before the closing triple backticks of that code block.

Required changes:
1. Open `lib/maasik/system-prompt.ts`.
2. Replace the export const SYSTEM_PROMPT with the full v2 system prompt text from Part 2.
3. Preserve the file structure: a single `export const SYSTEM_PROMPT = \`...\``. Use template literals so the multi-line content works.
4. Escape backticks inside the prompt content (there should not be any, but check).
5. Do NOT include the markdown code fences from the spec file.
6. Do NOT include Part 0 (changelog) or Part 1 (architecture decisions) or Part 3 onwards. ONLY Part 2's content.

Deliverable: the updated file. After writing, run `npm run typecheck`. Report any errors.

Constraints:
- The file should be standalone, no imports required.
- No string concatenation; use a single template literal.
- Preserve every character including double-line-breaks; do not collapse whitespace.

Before applying, show me the first 30 lines and the last 30 lines of the new content so I can verify the boundaries are correct.
```

### Verification before Phase 4:
- File compiles
- A character count comparison with the original Part 2 block matches (within ~50 chars for whitespace tolerance)
- Search the file for any em-dash `—` and confirm count is zero in the prompt content (the v2 prompt bans em-dashes in output, but should also not contain them itself)

---

## PHASE 4 — HTML template replacement (the highest-risk phase)

### Copy this into Antigravity:

```
This is the highest-risk phase. Refer to BOTH:
- `MAASIK_claude_api_prompt_v2.md` (Part J for the placeholder list, Part F for visual specs)
- `MAASIK_Jyeshtha_v4_sample.html` (the validated visual reference)

Goal: replace `lib/maasik/html-template.ts` with a parameterized version of the v4 sample HTML, where every dynamic content slot becomes a `[[PLACEHOLDER]]` token.

Steps:
1. Open `MAASIK_Jyeshtha_v4_sample.html`. This is the validated design.
2. Identify every place where content is specific to Hrishikesh/Jyeshtha/the example, vs. content that is structural (CSS, layout markup, ornaments, fixed labels).
3. Replace the user-specific content with placeholder tokens from the list in v2 spec's Part J.
4. Keep ALL CSS unchanged, including the `:root` variables, the paper-grain SVG noise, and the media queries.
5. Keep the SVG structures intact (ornaments, day chart, heat-flow icons), but make the dynamic SVG values into placeholders. Specifically:
   - The day chart anchor positions become placeholders so per-user wake/sleep times can shift them.
   - The day chart heat curve path becomes a placeholder so it changes per Ritu.
   - The activity zone rectangles' x and width become placeholders.
6. CRITICAL FIX from feedback: the previous day chart had label overlap. In the v4 sample at line 700-720ish, "YOUR ANCHORS" header sits at x=25 and "BREAKFAST" is anchored at x=86. Verify they do not overlap; if they do, fix by either moving YOUR ANCHORS up (to y=10) or making it smaller (font-size 9). Test by reading the SVG output and confirming.
7. CRITICAL FIX from feedback: the Section 2 fire-flow diagram had text "FIRE" overlapping the filled circle. In the v4 sample, replace those two icons with the spec from v2 Part F3: an outline body silhouette with a glowing dot at the gut for left state, an outline body silhouette with a soft radial gradient at the skin perimeter for right state. NO text inside filled shapes. Labels go beneath the icons.

Output the file as `export const HTML_TEMPLATE = \`...\``.

Deliverable: the updated `lib/maasik/html-template.ts` file. Before writing, list all the placeholders you will insert and where (which section). I will review the placeholder list FIRST, then approve before you write the file.

Constraints:
- The placeholder list must exactly match v2 spec Part J's 70+ slot names. No fewer, no extra.
- The HTML must remain valid; placeholders only appear in attribute values or as text node content, never breaking tag structure.
- The CSS block is copied verbatim from the v4 sample. Do not "clean up" or refactor it.
- Use exactly `[[SLOT_NAME]]` format with double square brackets.
```

### Verification before Phase 5:
- The placeholder count matches Part J's list (count both in the file with `grep -o '\[\[[A-Z_0-9]\+\]\]' | sort -u | wc -l`)
- Opening the file in a browser (replace placeholders with dummy strings temporarily) renders without visual regressions vs. the v4 sample
- The day chart YOUR ANCHORS/BREAKFAST overlap is fixed
- The fire-flow diagram uses outline body icons, not text-in-circle

---

## PHASE 5 — User message builder

### Copy this into Antigravity:

```
Refer to `MAASIK_claude_api_prompt_v2.md` Section 3 (The User Message Template). For this phase, extract the user message builder from the route handler into its own file.

Goal: create `lib/maasik/user-message.ts` with a single exported function `buildUserMessage(user, month, editionNumber, previousWordOrigins)`.

The function:
1. Takes the user record (from `maasik_users`), the month record (from `maasik_vedic_calendar`), the edition number (computed by the route), and an array of previously-used word origins (queried by the route).
2. Returns a single string formatted exactly as v2 spec Section 3 shows.
3. Includes the new `<previous_word_origins_used>` tag at the bottom.
4. Includes the new `<next_vedic_month>`, `<next_ritu>`, `<next_delivery_date>` tags inside `<vedic_month_context>`. These come from `getNextDeliveryDate` helper (added in Phase 2).
5. The internal-only field `<prakriti_internal_only>` keeps the prakriti_label data so Claude can reason but should not output it. Replaces v1's visible `<prakriti_label>`.
6. Imports `HTML_TEMPLATE` from `./html-template` and includes it in the `<output_template>` block.

Deliverable: the new file. Run typecheck after writing.

Constraints:
- Use proper TypeScript types for `user` and `month` parameters. If types do not exist yet, infer from the existing route.ts shape and add them inline OR in a `types.ts` file.
- Backwards compatibility: the v1 caller in `route.ts` (Phase 6) will be updated to use this. Do NOT modify `route.ts` in this phase.
```

### Verification before Phase 6:
- File compiles
- Imports resolve

---

## PHASE 6 — Route handler update

### Copy this into Antigravity:

```
Refer to `MAASIK_claude_api_prompt_v2.md` Sections 6 (integration code) and 7 (quality gates). For this phase, update `app/api/generate-report/route.ts`.

Goal: upgrade the route to v2 behavior. This is medium risk because the route orchestrates everything.

Required changes:
1. Bump `generation_prompt_version` constant from `'v1.0'` to `'v2.0'`.
2. Bump `max_tokens` from 16000 to 18000.
3. Enable prompt caching on the system prompt: change the system arg from a string to an array with `{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }`.
4. Replace the inline `buildUserMessage` call with import from `lib/maasik/user-message.ts` (Phase 5).
5. Before calling Claude, query the user's last 3 reports to extract `word_origins_used`, flatten into a deduplicated array, pass as the 4th argument to `buildUserMessage`.
6. After Claude responds, before saving, run the new validation utility from `lib/maasik/validate-html.ts` (Phase 7 will create it; for now, import it as if it exists, mark with `// TODO Phase 7`).
7. On save, populate:
   - `edition_number` with the computed edition number (parallel to existing `issue_number`)
   - `archetype_name` extracted from the HTML using a regex `/<h3 class="archetype-name">([^<]+)<\/h3>/`
   - `word_origins_used` extracted from the HTML using regex `/<div class="wo-term">([^<]+)<\/div>/g`
8. Rename internal variable `issueNumber` to `editionNumber` for clarity, but write BOTH `issue_number` and `edition_number` columns on save for backwards compatibility.
9. Add a `console.log` at the start with `[generate-report v2.0] user_id=X month=Y` for debugging.

Do NOT change:
- The Supabase queries' shape
- The error handling pattern
- The cost calculation
- The model name (stays `claude-sonnet-4-6`)
- The temperature (stays 0.4)

Deliverable: the updated `route.ts`. Run typecheck and `npm run build` after writing.

Constraints:
- The diff should be small and reviewable. If a change feels too large, split it into smaller PRs and tell me.
- All new imports go at the top.
- All error paths still write to `maasik_reports.delivery_status = 'failed'` with `delivery_error` populated.
```

### Verification before Phase 7:
- File compiles
- `npm run build` succeeds
- A dry run of the route locally (with a stub user) does not crash, though it will fail validation since Phase 7 isn't done

---

## PHASE 7 — Validation utility

### Copy this into Antigravity:

```
Refer to `MAASIK_claude_api_prompt_v2.md` Section 7 (Quality Gates). For this phase, create `lib/maasik/validate-html.ts`.

Goal: a pure function that validates Claude's HTML output and returns a structured result.

Required:
```typescript
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGeneratedHtml(html: string, user: User): ValidationResult
```

Checks (in order, fail-fast):
1. HTML starts with `<!DOCTYPE html>` and ends with `</html>`
2. No `[[SLOT_NAME]]` placeholders remain (regex `/\[\[[A-Z_0-9]+\]\]/`)
3. User's first name appears at least twice
4. HTML length is between 12000 and 50000 characters
5. Zero em-dash characters (`—`, U+2014) anywhere in body. Note: this is a hard constraint, NOT just a regex on plain text — check the full HTML including SVG text elements.
6. Archetype name regex `/<h3 class="archetype-name">([^<]+)<\/h3>/` matches exactly once, and the captured group starts with "The " and has 2-3 words total.
7. The forbidden dosha-declaration phrases do NOT appear:
   - "Pitta-dominant"
   - "Kapha-dominant"
   - "Vata-dominant"
   - "your dosha"
   - "your constitution"
   (Use case-insensitive match.)
8. Word-origin cards: count of `<div class="word-origin">` is between 3 and 4.
9. Exactly 5 anchor `<li>` elements in the `<ol class="anchor-numbered">` block.
10. Exactly 6 grocery cards inside the `.grocery-grid`.
11. User's `allergies` list (split by comma) do NOT appear as substrings anywhere in the food sections.
12. User's `disliked_foods` list do NOT appear in the food sections.

Each failed check appends a clear error message to `errors`. The function returns `{ valid: errors.length === 0, errors }`.

Deliverable: the new file + a small accompanying unit test file `lib/maasik/validate-html.test.ts` with at least 4 cases: (a) valid sample passes, (b) em-dash present fails, (c) leftover placeholder fails, (d) forbidden phrase fails.

Run the tests. Report results.

Constraints:
- Pure function, no I/O, no Supabase calls.
- TypeScript strict mode compatible.
- The User type can be imported from a shared types file OR defined locally if no shared file exists.
```

### Verification before Phase 8:
- All 4 test cases pass
- The function is imported and used in `route.ts` (remove the TODO marker from Phase 6)

---

## PHASE 8 — Smoke test endpoint

### Copy this into Antigravity:

```
Final phase. Create a development-only smoke test endpoint to verify the v2 pipeline end-to-end.

Goal: a new route at `app/api/generate-report-test/route.ts` that generates a report for the Hrishikesh test profile without writing to the database, and returns the HTML directly for browser viewing.

Required:
1. Accept GET requests (so it's easy to hit from a browser).
2. Gate access: check `request.headers.get('x-test-key') === process.env.MAASIK_TEST_KEY`. Else return 403. (Add `MAASIK_TEST_KEY` to `.env.local`.)
3. Use a hard-coded Hrishikesh profile:
   ```typescript
   const testUser = {
     full_name: 'Hrishikesh Test',
     age: 35, gender: 'male', city: 'Pune', region: 'West India',
     height_cm: 175, weight_kg: 89, bmi: 29.1,
     prakriti_label: 'Pitta-Kapha', vata_score: 1, pitta_score: 7, kapha_score: 6,
     primary_goals: ['general wellness'], goal_specifics: 'gradual weight loss',
     diet_type: 'vegetarian',
     favorite_foods: 'pani puri, pizza, burger',
     disliked_foods: 'okra',
     allergies: 'none',
     medical_conditions: 'none',
     sleep_time: '11:30 PM', wake_time: '07:30 AM',
     work_type: 'sedentary tech', stress_level: 'moderate',
     meal_timing_pattern: 'regular',
     expectations: 'general wellness'
   };
   ```
4. Use a hard-coded current Vedic month (Jyeshtha 2026):
   ```typescript
   const testMonth = {
     vedic_month: 'Jyeshtha', paksha: 'shukla', vikram_samvat: 2083, ritu: 'Greeshma',
     gregorian_start: '2026-05-17', gregorian_end: '2026-06-15',
     is_adhik_maas: false,
     next_vedic_month: 'Ashadha', next_ritu: 'Greeshma', next_delivery_date: '2026-06-16'
   };
   ```
5. Call the full v2 pipeline: buildUserMessage → Claude API call → validateGeneratedHtml → return.
6. If validation fails, return JSON with errors.
7. If validation passes, return the HTML directly with `Content-Type: text/html` so the browser renders it.

Add a `console.log` line counting elapsed ms.

Deliverable: the new route file. After writing, give me a curl command to test it.

Constraints:
- Do NOT save to the database in this test route.
- Do NOT modify any other routes.
- Use the same imports as the production route.
```

### Verification before merging:
- Hit the test endpoint with the test key
- Browser renders a v4-style report for the Hrishikesh test profile
- Validation report (if any errors) prints to console
- Compare visually to `MAASIK_Jyeshtha_v4_sample.html` — should be nearly identical, with minor wording variations from generation

---

## Final Merge Checklist

Before merging the branch to main:

- [ ] All 8 phases committed separately
- [ ] `npm run build` succeeds on the branch
- [ ] `npm run typecheck` clean
- [ ] Smoke test endpoint renders correctly on at least 2 browsers (Chrome desktop + mobile Safari)
- [ ] One real test report generated (delete from DB after) for a non-Hrishikesh profile to confirm personalisation actually varies
- [ ] The 4 Ritu color signatures (Greeshma, Varsha, Hemanta, Shishira) all render distinctly when you force the month context
- [ ] No em-dashes anywhere in the rendered output (search the HTML)
- [ ] Existing v1 reports in `maasik_reports` still display correctly when fetched via your existing report-view page (the old HTML in old rows is untouched)
- [ ] Roll the prompt version env var (if you have one) from `v1.0` to `v2.0`
- [ ] Update README / docs with the v2 changes summary

After merge:
- Monitor the first 10 production generations for cost (~₹0.50-₹1.00 per report expected)
- Monitor for validation failures in the first week
- If validation failure rate is >5%, do not silently fail — alert and refine the prompt

---

## How to handle issues mid-execution

If Antigravity makes a change that breaks something:

1. **Stop immediately.** Do not run the next phase.
2. Run `git diff` to see what changed.
3. If the diff is salvageable, ask Antigravity in a follow-up: "The previous change introduced issue X (paste the error). Revert just that part and try again."
4. If unsalvageable, `git checkout -- <file>` to revert that file, then retry the prompt with sharper constraints.
5. If a phase is truly stuck, fall back to: open the file yourself, paste the relevant section of `MAASIK_claude_api_prompt_v2.md`, do it manually. Antigravity is a productivity tool, not a magic wand.

---

## Why this staged approach

- **One file per phase**: a broken phase only breaks one file
- **Verification gates**: you catch problems before they cascade
- **Spec as reference, not directive**: Antigravity reads the spec when it needs context, instead of trying to "execute" 1000 lines of prose
- **Database first**: schema is cheapest to fix early, most painful to fix late
- **Validation late**: builds confidence the changes hold together end-to-end
- **Reversible**: each phase is its own commit, easy to bisect and revert

This is the same pattern Anthropic and senior engineers use when shipping non-trivial migrations with AI tools. Trust the process, do not skip phases.
