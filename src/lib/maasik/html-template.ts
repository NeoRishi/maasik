export const HTML_TEMPLATE = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MAASIK Blueprint, [[VEDIC_MONTH]] [[GREGORIAN_YEAR]]</title>
<style>
  @page { size: A4; margin: 12mm 13mm 14mm 13mm;
    @bottom-left { content: "MAASIK by NeoRishi"; font-family: 'Georgia', serif; font-size: 7.5pt; color: #8a7d6a; letter-spacing: 1px; }
    @bottom-right { content: "Page " counter(page) " of " counter(pages); font-family: 'Georgia', serif; font-size: 7.5pt; color: #8a7d6a; }
  }
  @page :first { margin: 0; @bottom-left { content: ""; } @bottom-right { content: ""; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 8.8pt; line-height: 1.4; color: #2D2A26; }
  .cover { page-break-after: always; height: 297mm; width: 210mm; background: linear-gradient(180deg, #C84B31 0%, #A6361F 60%, #7A2818 100%); color: #FAF3E7; position: relative; }
  .cover-inner { padding: 30mm 22mm 20mm 22mm; border: 1px solid rgba(250, 243, 231, 0.3); margin: 8mm; height: calc(100% - 16mm); display: flex; flex-direction: column; justify-content: space-between; }
  .cover-brand { font-family: 'Georgia', serif; font-size: 10pt; letter-spacing: 6px; text-transform: uppercase; opacity: 0.85; }
  .cover-divider { width: 60px; height: 1px; background: #FAF3E7; opacity: 0.6; margin: 6mm 0; }
  .cover-title { font-family: 'Georgia', serif; font-size: 60pt; line-height: 1; letter-spacing: -1px; margin-bottom: 5mm; font-weight: normal; }
  .cover-subtitle { font-family: 'Georgia', serif; font-size: 16pt; font-style: italic; opacity: 0.92; line-height: 1.3; margin-bottom: 6mm; font-weight: normal; }
  .cover-meta { font-size: 9.5pt; letter-spacing: 1.5px; line-height: 1.7; opacity: 0.9; }
  .cover-meta strong { display: block; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 3px; opacity: 0.7; margin-top: 4mm; margin-bottom: 0.5mm; font-weight: normal; }
  .cover-footer { font-size: 7.5pt; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7; border-top: 1px solid rgba(250, 243, 231, 0.3); padding-top: 4mm; margin-top: 8mm; }
  .cover-sanskrit { font-family: 'Georgia', serif; font-style: italic; font-size: 10pt; opacity: 0.85; margin-top: 4mm; text-align: right; }
  .profile-strip { display: table; width: 100%; background: #2D2A26; color: #FAF3E7; padding: 3mm 4mm; margin-bottom: 4mm; border-radius: 2px; }
  .profile-cell { display: table-cell; padding-right: 4mm; vertical-align: top; font-size: 8pt; line-height: 1.35; }
  .profile-cell .pl { font-size: 6.5pt; letter-spacing: 1.8px; text-transform: uppercase; opacity: 0.65; display: block; margin-bottom: 0.3mm; }
  .profile-cell strong { font-family: 'Georgia', serif; font-size: 9.5pt; color: #FAF3E7; font-weight: normal; }
  .section { margin-bottom: 4mm; }
  .section-label { font-size: 7pt; letter-spacing: 3.5px; text-transform: uppercase; color: #C84B31; font-weight: bold; margin-bottom: 1.5mm; }
  h1.section-title { font-family: 'Georgia', serif; font-size: 16pt; color: #2D2A26; font-weight: normal; margin-bottom: 3mm; line-height: 1.15; border-bottom: 1px solid #d9c9a7; padding-bottom: 2mm; }
  h2 { font-family: 'Georgia', serif; font-size: 11pt; color: #7A2818; font-weight: normal; margin-top: 3mm; margin-bottom: 1.5mm; }
  h3 { font-family: 'Helvetica', sans-serif; font-size: 8.5pt; color: #2D2A26; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5mm; font-weight: bold; }
  p { margin-bottom: 2mm; text-align: justify; }
  .lead { font-family: 'Georgia', serif; font-style: italic; font-size: 9.8pt; line-height: 1.5; color: #4a3f31; margin-bottom: 3mm; padding: 3mm 4mm; background: rgba(200, 75, 49, 0.06); border-left: 3px solid #C84B31; }
  .personal-callout { background: #f3e9d4; border: 1px solid #d9c9a7; padding: 3mm 4mm; margin: 2.5mm 0 3mm 0; border-radius: 2px; }
  .personal-callout .label { font-size: 6.8pt; letter-spacing: 3px; text-transform: uppercase; color: #7A8450; font-weight: bold; margin-bottom: 1.5mm; }
  .personal-callout p { margin-bottom: 1.5mm; }
  .personal-callout p:last-child { margin-bottom: 0; }
  .dosha-strip { display: table; width: 100%; margin: 2mm 0 3mm 0; border-collapse: collapse; border: 1px solid #d9c9a7; }
  .dosha-cell { display: table-cell; width: 33.33%; padding: 2.5mm; text-align: center; background: #fdf8ee; border-right: 1px solid #d9c9a7; }
  .dosha-cell:last-child { border-right: none; }
  .dosha-cell.dominant { background: #C84B31; color: #FAF3E7; }
  .dosha-cell.secondary { background: #e5c2a8; color: #5a3a25; }
  .dosha-name { font-family: 'Georgia', serif; font-size: 11pt; margin-bottom: 0.5mm; }
  .dosha-score { font-size: 7pt; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.85; }
  .food-table { width: 100%; border-collapse: collapse; margin: 2mm 0 3mm 0; font-size: 8.2pt; }
  .food-table th { background: #2D2A26; color: #FAF3E7; padding: 2mm 2.5mm; text-align: left; font-size: 7.5pt; letter-spacing: 1.8px; text-transform: uppercase; font-weight: normal; }
  .food-table td { padding: 2mm 2.5mm; border-bottom: 1px solid #e8dcc1; vertical-align: top; line-height: 1.35; }
  .food-table td.cat { background: #f3e9d4; width: 18%; font-weight: bold; color: #7A2818; font-size: 8pt; }
  .food-table td.favor { width: 41%; background: #f4f6ec; color: #3d4a1e; }
  .food-table td.avoid { width: 41%; background: #fbf0ec; color: #6b2a1a; }
  .meal-table { width: 100%; border-collapse: collapse; margin: 2mm 0 3mm 0; font-size: 8.3pt; }
  .meal-table td { padding: 2mm 2.5mm; border-bottom: 1px solid #e8dcc1; vertical-align: top; line-height: 1.4; }
  .meal-table td.time { width: 22%; background: #fdf8ee; color: #C84B31; font-family: 'Georgia', serif; font-weight: bold; font-size: 9pt; border-right: 1px solid #d9c9a7; }
  .meal-table td.time small { display: block; font-family: 'Helvetica', sans-serif; font-size: 6.5pt; color: #8a7d6a; text-transform: uppercase; letter-spacing: 1.5px; font-weight: normal; margin-top: 0.3mm; }
  .grocery-grid { display: table; width: 100%; border-collapse: collapse; margin: 2mm 0 3mm 0; }
  .grocery-col { display: table-cell; width: 33.33%; padding: 3mm; vertical-align: top; border: 1px solid #d9c9a7; background: #fdf8ee; }
  .grocery-col h4 { font-family: 'Georgia', serif; font-size: 9pt; color: #7A2818; margin-bottom: 1.5mm; border-bottom: 1px dotted #d9c9a7; padding-bottom: 1mm; font-weight: normal; }
  .grocery-col h4.subsequent { margin-top: 3mm; }
  .grocery-col ul { list-style: none; padding: 0; margin: 0; }
  .grocery-col li { padding: 0.5mm 0 0.5mm 3.5mm; position: relative; font-size: 7.8pt; line-height: 1.3; }
  .grocery-col li:before { content: "\25C7"; position: absolute; left: 0; color: #C84B31; font-size: 6.5pt; top: 1mm; }
  .dodont-grid { display: table; width: 100%; border-collapse: collapse; margin: 2mm 0 3mm 0; }
  .do-col, .dont-col { display: table-cell; width: 50%; padding: 3mm 4mm; vertical-align: top; }
  .do-col { background: #f4f6ec; border-right: 1px solid #d9c9a7; }
  .dont-col { background: #fbf0ec; }
  .do-col h3 { color: #3d4a1e; margin-bottom: 2mm; }
  .dont-col h3 { color: #6b2a1a; margin-bottom: 2mm; }
  .do-col ul, .dont-col ul { list-style: none; padding: 0; margin: 0; }
  .do-col li, .dont-col li { padding: 0.5mm 0 0.5mm 4mm; position: relative; font-size: 8pt; line-height: 1.4; }
  .do-col li:before { content: "\2713"; position: absolute; left: 0; color: #7A8450; font-weight: bold; }
  .dont-col li:before { content: "\2717"; position: absolute; left: 0; color: #C84B31; font-weight: bold; }
  .closing { margin-top: 3mm; padding: 3mm 4mm; border: 1px solid #d9c9a7; background: #fdf8ee; text-align: center; }
  .closing-mantra { font-family: 'Georgia', serif; font-style: italic; font-size: 10pt; color: #7A2818; }
  .closing-mantra small { display: block; font-style: normal; font-size: 7.5pt; color: #8a7d6a; letter-spacing: 1px; margin-top: 1mm; }
  .footer-note { font-size: 7.2pt; color: #8a7d6a; text-align: center; margin-top: 3mm; font-style: italic; line-height: 1.4; }
  .medical-disclaimer { font-size: 7pt; color: #8a7d6a; font-style: italic; margin-top: 3mm; text-align: center; padding-top: 2mm; border-top: 1px dotted #d9c9a7; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-inner">
    <div>
      <div class="cover-brand">MAASIK &nbsp;|&nbsp; NeoRishi</div>
      <div class="cover-divider"></div>
      <div style="font-size: 9.5pt; letter-spacing: 3px; text-transform: uppercase; opacity: 0.75;">Personalized Monthly Blueprint</div>
    </div>
    <div>
      <div class="cover-title">[[VEDIC_MONTH]]</div>
      <div class="cover-subtitle">[[COVER_SUBTITLE]]</div>
      <div class="cover-sanskrit">"[[COVER_SANSKRIT_VERSE]]"<br>
        <span style="font-size: 7.5pt; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;">[[COVER_SANSKRIT_TRANSLATION]]</span>
      </div>
    </div>
    <div class="cover-meta">
      <strong>Prepared for</strong>
      [[USER_FULL_NAME]] &nbsp;|&nbsp; [[USER_CITY]]
      <strong>Vedic Month</strong>
      [[VEDIC_MONTH]] [[PAKSHA_FULL]], Vikram Samvat [[VIKRAM_SAMVAT]]
      <strong>Gregorian Window</strong>
      [[GREGORIAN_START_FORMATTED]] to [[GREGORIAN_END_FORMATTED]]
      <strong>Ritu</strong>
      [[RITU]] ([[RITU_DESCRIPTOR]])
      <div class="cover-footer">
        Issue [[ISSUE_NUMBER]] &nbsp;&middot;&nbsp; [[GENERATION_DATE_FORMATTED]]
      </div>
    </div>
  </div>
</div>

<!-- PAGE 2: PROFILE STRIP + SECTION 1 + START SECTION 2 -->
<div class="profile-strip">
  <div class="profile-cell"><span class="pl">Constitution</span><strong>[[PRAKRITI_DISPLAY]]</strong></div>
  <div class="profile-cell"><span class="pl">BMI</span><strong>[[BMI]]</strong></div>
  <div class="profile-cell"><span class="pl">Primary Goal</span><strong>[[PRIMARY_GOAL_DISPLAY]]</strong></div>
  <div class="profile-cell"><span class="pl">Secondary</span><strong>[[SECONDARY_GOAL_DISPLAY]]</strong></div>
  <div class="profile-cell"><span class="pl">Active Concern</span><strong>[[ACTIVE_CONCERN_DISPLAY]]</strong></div>
</div>

<div class="section">
  <div class="section-label">Section 01</div>
  <h1 class="section-title">[[SECTION_1_TITLE]]</h1>
  <p class="lead">[[SECTION_1_LEAD_PARAGRAPH]]</p>
  <p>[[SECTION_1_BODY_PARAGRAPH]]</p>
  <div class="personal-callout">
    <div class="label">What this month means for you, [[USER_FIRST_NAME]]</div>
    <p>[[SECTION_1_CALLOUT_PARAGRAPH_1]]</p>
    <p>[[SECTION_1_CALLOUT_PARAGRAPH_2]]</p>
  </div>
  <div class="dosha-strip">
    <div class="dosha-cell [[VATA_CELL_CLASS]]"><div class="dosha-name">Vata</div><div class="dosha-score">[[VATA_LABEL]], [[VATA_SCORE]] pts</div></div>
    <div class="dosha-cell [[PITTA_CELL_CLASS]]"><div class="dosha-name">Pitta</div><div class="dosha-score">[[PITTA_LABEL]], [[PITTA_SCORE]] pts</div></div>
    <div class="dosha-cell [[KAPHA_CELL_CLASS]]"><div class="dosha-name">Kapha</div><div class="dosha-score">[[KAPHA_LABEL]], [[KAPHA_SCORE]] pts</div></div>
  </div>
</div>

<div class="section" style="margin-top: 5mm;">
  <div class="section-label">Section 02</div>
  <h1 class="section-title">[[SECTION_2_TITLE]]</h1>
  <p>[[SECTION_2_INTRO_PARAGRAPH]]</p>
  <table class="food-table">
    <tr><th>Category</th><th>Favour, eat freely</th><th>Avoid this month</th></tr>
    <tr><td class="cat">Grains</td><td class="favor">[[GRAINS_FAVOUR]]</td><td class="avoid">[[GRAINS_AVOID]]</td></tr>
    <tr><td class="cat">Pulses</td><td class="favor">[[PULSES_FAVOUR]]</td><td class="avoid">[[PULSES_AVOID]]</td></tr>
    <tr><td class="cat">Vegetables</td><td class="favor">[[VEGETABLES_FAVOUR]]</td><td class="avoid">[[VEGETABLES_AVOID]]</td></tr>
    <tr><td class="cat">Fruits</td><td class="favor">[[FRUITS_FAVOUR]]</td><td class="avoid">[[FRUITS_AVOID]]</td></tr>
    <tr><td class="cat">Dairy</td><td class="favor">[[DAIRY_FAVOUR]]</td><td class="avoid">[[DAIRY_AVOID]]</td></tr>
    <tr><td class="cat">Beverages</td><td class="favor">[[BEVERAGES_FAVOUR]]</td><td class="avoid">[[BEVERAGES_AVOID]]</td></tr>
    <tr><td class="cat">Spices</td><td class="favor">[[SPICES_FAVOUR]]</td><td class="avoid">[[SPICES_AVOID]]</td></tr>
    <tr><td class="cat">Snacks</td><td class="favor">[[SNACKS_FAVOUR]]</td><td class="avoid">[[SNACKS_AVOID]]</td></tr>
  </table>
  <h2>Your Ideal Day, [[VEDIC_MONTH]] Edition</h2>
  <table class="meal-table">
    <tr><td class="time">[[MEAL_1_TIME]]<small>On Waking</small></td><td>[[MEAL_1_CONTENT]]</td></tr>
    <tr><td class="time">[[MEAL_2_TIME]]<small>Breakfast</small></td><td>[[MEAL_2_CONTENT]]</td></tr>
    <tr><td class="time">[[MEAL_3_TIME]]<small>Mid-Morning</small></td><td>[[MEAL_3_CONTENT]]</td></tr>
    <tr><td class="time">[[MEAL_4_TIME]]<small>Lunch, Largest</small></td><td>[[MEAL_4_CONTENT]]</td></tr>
    <tr><td class="time">[[MEAL_5_TIME]]<small>Evening</small></td><td>[[MEAL_5_CONTENT]]</td></tr>
    <tr><td class="time">[[MEAL_6_TIME]]<small>Dinner, Light</small></td><td>[[MEAL_6_CONTENT]]</td></tr>
    <tr><td class="time">[[MEAL_7_TIME]]<small>Bedtime</small></td><td>[[MEAL_7_CONTENT]]</td></tr>
  </table>
</div>

<div class="section" style="margin-top: 5mm;">
  <div class="section-label">Section 03</div>
  <h1 class="section-title">[[SECTION_3_TITLE]]</h1>
  <p>[[SECTION_3_INTRO_LINE]]</p>
  <div class="grocery-grid">
    <div class="grocery-col">
      <h4>Grains &amp; Pulses</h4>
      <ul>[[GROCERY_GRAINS_PULSES_ITEMS]]</ul>
      <h4 class="subsequent">Dairy &amp; Fats</h4>
      <ul>[[GROCERY_DAIRY_FATS_ITEMS]]</ul>
    </div>
    <div class="grocery-col">
      <h4>Vegetables (weekly fresh)</h4>
      <ul>[[GROCERY_VEGETABLES_ITEMS]]</ul>
    </div>
    <div class="grocery-col">
      <h4>Fruits (weekly fresh)</h4>
      <ul>[[GROCERY_FRUITS_ITEMS]]</ul>
    </div>
  </div>
  <div class="grocery-grid">
    <div class="grocery-col">
      <h4>Spices &amp; Aromatics</h4>
      <ul>[[GROCERY_SPICES_ITEMS]]</ul>
    </div>
    <div class="grocery-col">
      <h4>[[GROCERY_SPECIALS_LABEL]]</h4>
      <ul>[[GROCERY_SPECIALS_ITEMS]]</ul>
    </div>
    <div class="grocery-col">
      <h4 style="color: #6b2a1a;">Skip from Pantry</h4>
      <ul style="opacity: 0.85;">[[GROCERY_SKIP_ITEMS]]</ul>
    </div>
  </div>
</div>

<div class="section" style="margin-top: 4mm;">
  <div class="section-label">Section 04</div>
  <h1 class="section-title">[[SECTION_4_TITLE]]</h1>
  <p>[[SECTION_4_INTRO_PARAGRAPH]]</p>
  <div class="dodont-grid">
    <div class="do-col">
      <h3>Do, this month</h3>
      <ul>[[DO_ITEMS]]</ul>
    </div>
    <div class="dont-col">
      <h3>Avoid, this month</h3>
      <ul>[[DONT_ITEMS]]</ul>
    </div>
  </div>
  <h2>Your Personal Anchor for [[VEDIC_MONTH]]</h2>
  <p>[[SECTION_4_PERSONAL_ANCHOR]]</p>
  <div class="closing">
    <div class="closing-mantra">"[[CLOSING_SANSKRIT_VERSE]]"<small>[[CLOSING_SANSKRIT_TRANSLATION]]</small></div>
  </div>
  <p class="footer-note">[[FOOTER_NOTE]]</p>
  [[MEDICAL_DISCLAIMER_BLOCK]]
</div>

</body>
</html>`;
