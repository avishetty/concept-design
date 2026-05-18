// Session model + first-run scripted chat for the Walt DE platform shell.
//
// Each turn is a JSON object the autoplayer pushes into chatTurns at scripted
// intervals. Beyond the basic { role, body } shape, turns can:
//
//   choices         — pill choices rendered under the message; clicking a choice
//                     advances the script (and may set ctx via choice.setCtx).
//                     A choice can also branch with `next: '<turn-id>'`.
//   chip            — { view, label, hint } — inline ArtifactChip; clicking opens the
//                     referenced artifact in the side panel.
//   action          — `{ type: 'openArtifact', view, tab }` — fired when the turn plays.
//   setCtx          — partial ctx merge applied when the turn plays.
//
//   composerSuggestionsByDomain — when truthy, the autoplayer reads ctx.domainKey and
//                     publishes the matching question bank to the composer as suggestion
//                     chips. Pauses the script until the user sends a free-form reply
//                     through the composer (see PlatformShell.ChatColumn).
//   startIngestion  — true: when this turn plays, ingestionStatus flips 'running'.
//   waitForIngestion — true: do not play this turn until ingestionStatus === 'complete'.
//   startSilverStage — 's1' | 's2' | 's3' — flips silverStageStatus.<stage> to 'running'
//                     and sets ctx.silverStage. The SilverBuildArtifact watches this.
//   waitForSilver   — 's1' | 's2' | 's3' — do not play until silverStageStatus.<stage>
//                     === 'review' (i.e. builder simulation done, awaiting human nod).
//
// Branching: choices can declare `next: '<turn-id>'`. The autoplayer jumps to that turn
// id rather than incrementing. Any turn the user can branch *away* from must have a
// distinct id so the script can be re-entered later.

export const DOMAINS = [
  { key: 'Finance',   label: 'Finance',           desc: 'GL, AP/AR, cash, close + forecast' },
  { key: 'Sales',     label: 'Sales',             desc: 'Pipeline, quota, deal velocity, ACV' },
  { key: 'Marketing', label: 'Marketing',         desc: 'Channel attribution, CAC, lifecycle' },
  { key: 'Product',   label: 'Product analytics', desc: 'Activation, retention, feature use' },
  { key: 'People',    label: 'HR · People',       desc: 'Headcount, attrition, comp, hiring' },
  { key: 'Ops',       label: 'Operations',        desc: 'SLAs, throughput, on-call, incidents' },
  { key: 'CX',        label: 'Customer Support',  desc: 'Ticket volume, CSAT, deflection, NPS' },
  { key: 'Supply',    label: 'Supply Chain',      desc: 'Inventory, lead time, OTIF, returns' },
];

// Domain → day-one question bank. Surfaced as composer suggestion chips.
export const DOMAIN_BANK = {
  Finance: [
    { id: 'fin-1', label: 'Variance to plan, by cost center' },
    { id: 'fin-2', label: 'Cash burn vs runway, weekly' },
    { id: 'fin-3', label: 'Top 10 deferred-revenue accounts' },
    { id: 'fin-4', label: 'AR aging by customer cohort' },
    { id: 'fin-5', label: 'Gross margin by product line' },
    { id: 'fin-6', label: 'FX exposure by currency' },
  ],
  Sales: [
    { id: 'sal-1', label: 'Pipeline coverage by stage' },
    { id: 'sal-2', label: 'Win rate by rep + segment' },
    { id: 'sal-3', label: 'Deal velocity, last 90 days' },
    { id: 'sal-4', label: 'ACV by source + region' },
    { id: 'sal-5', label: 'At-risk renewals next quarter' },
    { id: 'sal-6', label: 'Quota attainment, team rollup' },
  ],
  Marketing: [
    { id: 'mkt-1', label: 'CAC by channel, last 60 days' },
    { id: 'mkt-2', label: 'Multi-touch attribution rollup' },
    { id: 'mkt-3', label: 'Lifecycle stage conversion' },
    { id: 'mkt-4', label: 'Campaign ROI by audience' },
    { id: 'mkt-5', label: 'MQL → SQL hand-off latency' },
    { id: 'mkt-6', label: 'Content engagement by persona' },
  ],
  Product: [
    { id: 'prd-1', label: 'D1 / D7 / D30 retention curves' },
    { id: 'prd-2', label: 'Activation rate by signup source' },
    { id: 'prd-3', label: 'Feature adoption funnel' },
    { id: 'prd-4', label: 'Power users vs at-risk cohorts' },
    { id: 'prd-5', label: 'Time-to-value by plan tier' },
    { id: 'prd-6', label: 'Cross-feature lift on monetisation' },
  ],
  People: [
    { id: 'hr-1', label: 'Headcount by org + level' },
    { id: 'hr-2', label: 'Attrition trend, last 4 quarters' },
    { id: 'hr-3', label: 'Time-to-hire by role + recruiter' },
    { id: 'hr-4', label: 'Compensation parity by band' },
    { id: 'hr-5', label: 'Engagement score by manager' },
    { id: 'hr-6', label: 'Offer acceptance by source' },
  ],
  Ops: [
    { id: 'ops-1', label: 'SLA breaches by service' },
    { id: 'ops-2', label: 'Throughput per shift' },
    { id: 'ops-3', label: 'On-call load by team' },
    { id: 'ops-4', label: 'Incident MTTR + MTTD' },
    { id: 'ops-5', label: 'Capacity utilisation by region' },
    { id: 'ops-6', label: 'Vendor SLA compliance' },
  ],
  CX: [
    { id: 'cx-1', label: 'Ticket volume by category' },
    { id: 'cx-2', label: 'First-response time by tier' },
    { id: 'cx-3', label: 'CSAT trend, weekly' },
    { id: 'cx-4', label: 'Deflection rate, self-serve KB' },
    { id: 'cx-5', label: 'NPS by segment + plan' },
    { id: 'cx-6', label: 'Reopen rate by issue type' },
  ],
  Supply: [
    { id: 'sup-1', label: 'Inventory turn by SKU' },
    { id: 'sup-2', label: 'OTIF % by carrier + lane' },
    { id: 'sup-3', label: 'Lead time variance by supplier' },
    { id: 'sup-4', label: 'Returns + RMA root causes' },
    { id: 'sup-5', label: 'DC fill rate vs forecast' },
    { id: 'sup-6', label: 'Working capital tied in inventory' },
  ],
};

// Domain → recommended source-system keys. The source picker pre-selects these and
// renders them with a "recommended" badge so the user can confirm with one click.
// Keys must match SOURCES in ConnectionsArtifact.jsx.
export const DOMAIN_SOURCE_RECOMMENDATIONS = {
  Finance:   ['sqlserver', 'netsuite', 'stripe'],
  Sales:     ['postgres', 'stripe', 'csv'],
  Marketing: ['postgres', 'kafka', 'csv'],
  Product:   ['postgres', 'kafka'],
  People:    ['postgres', 'csv'],
  Ops:       ['kafka', 'postgres', 'csv'],
  CX:        ['postgres', 'kafka', 'csv'],
  Supply:    ['sqlserver', 'postgres', 'csv'],
};

// Build the choices array for the domain pick step from DOMAINS.
const DOMAIN_CHOICES = DOMAINS.map(d => ({
  id: d.key,
  label: d.label,
  setCtx: { domain: d.label, domainKey: d.key },
}));

// First-run scripted thread. Linear by default; choices can `next: '<id>'` to branch.
//
// Authoring rule (turn-clarity): every Walt-led bubble must be followed by a user
// action before the next Walt bubble. A user "action" is any of:
//   - a choice pill click (echoed by onChoice in PlatformShell),
//   - a composer send (echoed by onSendUserText),
//   - an artifact action that echoes a user turn (wizard finish, git connect,
//     PR commit). See SourceWizard / GitConnectWizard / PullRequestArtifact.
// Walt's avatar should appear exactly once per turn — *never* twice in a row
// without a user bubble in between. When in doubt, fold the second message into
// the first turn's body / outro instead of adding a new walt turn.
export const FIRST_RUN_SCRIPT = [
  {
    id: 'w-domain',
    role: 'walt',
    body: [
      "Welcome to your new project. To get the right pipelines in place, what business domain is this project serving?",
      "Pick the closest one — I'll tailor the day-one questions and which source systems to mirror.",
    ],
    choices: DOMAIN_CHOICES,
  },

  // ---- Day-one questions: suggestions land in the composer, not the chat ----
  {
    id: 'w-dayone',
    role: 'walt',
    body: [
      "Got it — {{domain}}. What top-of-mind questions does the business need this project to answer in the first week?",
      "I've pre-loaded the most common day-one questions for {{domain}} as suggestions in the input below. Pick the ones that fit, edit them, or type your own — then send.",
    ],
    composerSuggestionsByDomain: true,
  },

  // ---- Source picker: chip opens the in-chat SourceWizard modal. Chat pauses
  //      until the wizard's "Finish" step clears the awaitConfirm gate; the
  //      wizard's finish also echoes a user turn so the alternation holds. ----
  //      (Used to be split across w-scope-locked + w-sources-pick — merged into
  //       a single Walt bubble so we don't show the avatar twice in a row.)
  {
    id: 'w-sources-pick',
    role: 'walt',
    body: [
      "Scope is locked. Before I can answer any of that, I need to know where your {{domain}} data actually lives — which source systems Walt should mirror into bronze.",
      "I've pre-selected the sources {{domain}} teams usually pull from. Open the wizard, adjust the list, give Walt credentials, sample, and pick a schedule — I'll start mirroring as soon as you finish.",
    ],
    chip: { wizard: 'sources', label: 'Set up sources', hint: 'Open the source wizard' },
    awaitConfirm: 'sources',
  },

  // ---- Ingestion: one consolidated task bubble. Walt's avatar, the Ingestor
  //      progress strip, the "bronze is ready" close-out, AND the "what next"
  //      choices all live in this single bubble. Used to be task-ingest +
  //      w-ingest-done — merged so we don't double-up the avatar. The next
  //      walt avatar fires only after the user clicks a choice. ----
  //      Step timing is tuned so progress finishes ~ when the simulated
  //      ingestion complete timer fires (6 × 1000ms ≈ 6000ms in PlatformShell).
  {
    id: 'task-ingest',
    role: 'task',
    agent: 'ingestor',
    subLabel: 'raw-landing-agent',
    title: 'Mirroring sources into bronze',
    body: [
      "On it — mirroring your sources into bronze now. Bronze is append-only: every record lands with full lineage and the raw payload preserved so we can replay anything downstream.",
    ],
    stepMs: 1000,
    steps: [
      { id: 'plan',    icon: 'wand',   label: 'Plan ingestion strategy for {{domain}}',  result: '8 source tables · 2 PII candidates' },
      { id: 'connect', icon: 'db',     label: 'Connect to ERP + GL systems',             result: 'sql-erp01.imageinc.internal · ok' },
      { id: 'profile', icon: 'eye',    label: 'Profile schemas + nullability',           result: '220 columns · 18 nullable · 3 date' },
      { id: 'sample',  icon: 'table',  label: 'Sample 10,000 rows per table',            result: 'previews cached' },
      { id: 'pii',     icon: 'shield', label: 'Detect + mask PII columns',               result: 'vendors.email, customers.phone masked' },
      { id: 'land',    icon: 'layers', label: 'Land to bronze · append-only + lineage',  result: '_ingested_at · _source · _batch_id · partitioned by _ingestion_date · raw_payload VARIANT' },
    ],
    outro: [
      "Ingestion + profile complete. 220 tables landed in bronze as the system of record — zero transformation, every record preserved, clustered by (_ingestion_date, _source) for replay.",
      "Bronze is ready. When you're ready I'll bring Transformer in to build the silver layer — or take a moment to review what landed first.",
    ],
    chip: { view: 'ingestion-status', label: 'View ingestion run', hint: 'Live progress + table profile' },
    choices: [
      { id: 'start-silver', label: 'Build the silver layer' },
      { id: 'review-first', label: 'Let me review ingestion first', next: null },
    ],
    startIngestion: true,
  },
  // "Let me review" halts autoplay (`next: null`); the user re-engages via the
  // composer or by reopening the silver flow. "Build silver" flows on to S1.

  // ---- Silver build: S1 → S2 → S3. Each stage runs as two task bubbles:
  //      (1) task-sX-plan  — Transformer plans the work. User reviews the plan
  //                          and explicitly approves before code is written.
  //      (2) task-sX-build — Transformer writes + tests the code. User reviews
  //                          the code and explicitly approves before moving on.
  //      Each task is its own walt-avatar turn with its own user choice at the
  //      end, so the avatar/user alternation holds. The Transformer's identity
  //      lives in the task's agent strip (no "Transformer joined the session."
  //      system row). ----
  //      Build-phase step timings line up with the simulated build duration
  //      in PlatformShell.startSilverStage (s1/s3 = 3500ms, s2 = 4500ms) so
  //      the in-bubble close-out and the CodeArtifact review bar reveal at
  //      the same time. Plan phases run on their own clock — no real-world
  //      gate to sync with.
  {
    id: 'task-s1-plan',
    role: 'task',
    agent: 'transformer',
    subLabel: 's1-dedup-planner',
    title: 'Planning S1 · deduplication',
    body: [
      "Drafting the S1 dedup plan. Each entity needs a declared natural key — I'll pick the key per table, decide how to order survivors (event time vs ingest time), and route null-key rows to _s1_quarantine before any SQL is written.",
    ],
    stepMs: 750,
    steps: [
      { id: 'survey', icon: 'eye',   label: 'Survey bronze for duplicate signatures',      result: '2 entities · ~1,485 dupes · 7 null-key candidates' },
      { id: 'key',    icon: 'wand',  label: 'Declare natural key per entity',              result: 'invoice_id (ap) · invoice_no + source (ar)' },
      { id: 'cdc',    icon: 'bolt',  label: 'Plan CDC tombstones + late-arriving rows',    result: 'order by source event ts · _is_deleted preserved' },
      { id: 'q',      icon: 'shield',label: 'Define _s1_quarantine route',                 result: 'null natural key → quarantine, not dropped' },
      { id: 'checks', icon: 'check', label: 'Define reviewer assertions',                  result: 'grain unique · lineage · quarantine coverage · idempotent' },
    ],
    outro: [
      "S1 plan is ready — natural key per entity, CDC tombstones preserved as _is_deleted records, late-arriving rows reconciled by event time, null keys quarantined. Open the plan, then approve so I can write the code.",
    ],
    chip: { view: 'silver-plan', label: 'View S1 plan', hint: 'Plan-only view · no code yet' },
    choices: [
      { id: 'approve-s1-plan', label: 'Approve plan',     next: 'task-s1-build' },
      { id: 'changes-s1-plan', label: 'Request changes', next: null },
    ],
    setCtx: { silverStage: 's1' },
  },
  {
    id: 'task-s1-build',
    role: 'task',
    agent: 'transformer',
    subLabel: 's1-dedup-agent',
    title: 'Building S1 · deduplication',
    body: [
      "Plan approved — writing the S1 dedup SQL with CDC awareness, then running it through the reviewer on the Walt sandbox.",
    ],
    stepMs: 700,
    steps: [
      { id: 'sql',    icon: 'code',   label: 'Generate dedup SQL · partition by natural key',  result: 'finance_ap_invoices · finance_ar_invoices' },
      { id: 'cdc',    icon: 'bolt',   label: 'Wire CDC tombstones (_is_deleted, _deleted_at)', result: '23 DELETE events surfaced as tombstones, not dropped' },
      { id: 'run',    icon: 'flow',   label: 'Run on Walt sandbox',                            result: '693,127 → 691,642 · 1,485 dupes · 7 null keys → _s1_quarantine' },
      { id: 'review', icon: 'check',  label: 'Reviewer: grain · lineage · quarantine cover',   result: 'parity 99.78% · attested in DDL header' },
      { id: 'land',   icon: 'layers', label: 'Stage _s1_valid + _s1_quarantine views',         result: '4 views ready · valid + quarantine pair per entity' },
    ],
    outro: [
      "1,485 dupes removed, 7 null-key rows routed to _s1_quarantine, 23 CDC tombstones preserved as _is_deleted records. Reviewer attestation is in the view DDL header — the promotion gate's clear. Code's ready — open it, then approve when you're happy.",
    ],
    chip: { view: 'silver-code', label: 'Review S1 code', hint: 'Open code + approve in chat' },
    choices: [
      { id: 'approve-s1', label: 'Approve S1', setCtx: { silverApproved: { s1: true, s2: false, s3: false } } },
      { id: 'changes-s1', label: 'Request changes', next: null },
    ],
    startSilverStage: 's1',
  },

  {
    id: 'task-s2-plan',
    role: 'task',
    agent: 'transformer',
    subLabel: 's2-typecast-planner',
    title: 'Planning S2 · type-cast',
    body: [
      "Drafting the S2 type-cast plan. I'll mark each column mandatory or optional from the contract, define the boolean normalisation map, and route mandatory-cast failures to _s2_quarantine. Cast failures are schema contract violations, not DQ issues — they get their own remediation path.",
    ],
    stepMs: 750,
    steps: [
      { id: 'contracts', icon: 'eye',   label: 'Read declared types from silver contract',    result: '18 cols · 3 dates · 4 NUMERIC(18,4) · 2 boolean' },
      { id: 'mandatory', icon: 'shield',label: 'Mark mandatory vs optional columns',          result: 'mandatory failure → quarantine · optional → NULL + flag' },
      { id: 'boolean',   icon: 'wand',  label: 'Define boolean normalisation map',            result: "true/1/y/yes/on  ·  false/0/n/no/off  ·  else quarantine" },
      { id: 'dates',     icon: 'bolt',  label: 'Resolve ambiguous date formats per source',   result: 'MM/DD/YYYY declared in entity config · no auto-detect' },
      { id: 'checks',    icon: 'check', label: 'Define reviewer assertions',                  result: 'cast contract · quarantine cover · idempotency' },
    ],
    outro: [
      "S2 plan is ready — money lands as NUMERIC(18,4) (never FLOAT), booleans normalised before TRY_CAST, and every mandatory cast routes to _s2_quarantine on failure. S2 stays a view so G1 is the single materialisation point downstream. Approve the plan to write the code.",
    ],
    chip: { view: 'silver-plan', label: 'View S2 plan', hint: 'Plan-only view · no code yet' },
    choices: [
      { id: 'approve-s2-plan', label: 'Approve plan',     next: 'task-s2-build' },
      { id: 'changes-s2-plan', label: 'Request changes', next: null },
    ],
    setCtx: { silverStage: 's2' },
  },
  {
    id: 'task-s2-build',
    role: 'task',
    agent: 'transformer',
    subLabel: 's2-typecast-agent',
    title: 'Building S2 · type-cast',
    body: [
      "Plan approved — writing TRY_CAST SQL with quarantine routes for mandatory failures, then running it through the reviewer.",
    ],
    stepMs: 750,
    steps: [
      { id: 'sql-1',  icon: 'code',   label: 'Generate TRY_CAST + mandatory routing',           result: 'round 1 · _cast_passed + _cast_failure_reason' },
      { id: 'run-1',  icon: 'flow',   label: 'Run on sandbox',                                  result: '14 amount TRY_CAST failures · 2 unrecognised boolean values' },
      { id: 'replan', icon: 'wand',   label: 'Wire _s2_quarantine for mandatory failures',      result: "round 2 · 'Y/N' added to boolean map" },
      { id: 'review', icon: 'check',  label: 'Reviewer: cast contract reconciles',              result: '0 mandatory failures · attested in DDL header' },
      { id: 'land',   icon: 'layers', label: 'Stage _s2_valid + _s2_quarantine views',          result: '4 views ready · cast contract enforced' },
    ],
    outro: [
      "Two rounds — reviewer caught 14 amount TRY_CAST failures and 2 unrecognised boolean values, builder routed mandatory ones to _s2_quarantine on round 2 and extended the boolean map to cover 'Y/N'. Cast contract reconciles. Approve when you're satisfied.",
    ],
    chip: { view: 'silver-code', label: 'Review S2 code', hint: 'Open code + approve in chat' },
    choices: [
      { id: 'approve-s2', label: 'Approve S2', setCtx: { silverApproved: { s1: true, s2: true, s3: false } } },
      { id: 'changes-s2', label: 'Request changes', next: null },
    ],
    startSilverStage: 's2',
  },

  {
    id: 'task-s3-plan',
    role: 'task',
    agent: 'transformer',
    subLabel: 's3-cleanse-planner',
    title: 'Planning S3 · cleanse',
    body: [
      "Drafting the S3 cleanse plan. After dedup and type-cast, values can still be semantically inconsistent — mixed case, empty strings, sentinel placeholders, non-canonical enums. I'll define rules to normalise each one before Gold applies business logic.",
    ],
    stepMs: 750,
    steps: [
      { id: 'nulls',   icon: 'eye',    label: 'Inventory sentinels + placeholders to NULL',     result: "'', 'N/A', '-', 1900-01-01, 9999-12-31 → NULL" },
      { id: 'case',    icon: 'wand',   label: 'Set case rules per column',                      result: 'INITCAP names · UPPER codes · LOWER emails · TRIM everywhere' },
      { id: 'enums',   icon: 'schema', label: 'Map enums to canonical via ref.enum_status',     result: '7 status variants → open / paid / void · unmapped → quarantine' },
      { id: 'phones',  icon: 'bolt',   label: 'Plan phone + identifier formatting',             result: 'E.164 with +1 default · invalid lengths → _s3_quarantine' },
      { id: 'checks',  icon: 'check',  label: 'Define reviewer assertions',                     result: 'cleanse rules · enum coverage · lineage passthrough' },
    ],
    outro: [
      "S3 plan is ready — sentinel values → NULL, names INITCAP'd, codes UPPER'd, status mapped to canonical enum via a reference table, phones in E.164. Unmappable enums and invalid identifiers route to _s3_quarantine. Approve to write the code.",
    ],
    chip: { view: 'silver-plan', label: 'View S3 plan', hint: 'Plan-only view · no code yet' },
    choices: [
      { id: 'approve-s3-plan', label: 'Approve plan',     next: 'task-s3-build' },
      { id: 'changes-s3-plan', label: 'Request changes', next: null },
    ],
    setCtx: { silverStage: 's3' },
  },
  {
    id: 'task-s3-build',
    role: 'task',
    agent: 'transformer',
    subLabel: 's3-cleanse-agent',
    title: 'Building S3 · cleanse',
    body: [
      "Plan approved — writing the cleanse SQL across ~60 silver views, joining the enum reference table for canonical mapping.",
    ],
    stepMs: 700,
    steps: [
      { id: 'ref',    icon: 'cloud',  label: 'Load reference tables · enums + FX',                  result: 'ref.enum_status · ref.fx_rate · 2026-05-12' },
      { id: 'sql',    icon: 'code',   label: 'Apply case · TRIM · sentinel → NULL · enum mapping',  result: 'round 1 · _cleanse_applied_rules tracked per row' },
      { id: 'phones', icon: 'bolt',   label: 'Normalise phones + identifiers to E.164',             result: '12 invalid lengths → _s3_quarantine' },
      { id: 'run',    icon: 'flow',   label: 'Run cleanse on sandbox',                              result: '~60 views built · 12 quarantined · 4 unmappable enums' },
      { id: 'review', icon: 'check',  label: 'Reviewer: cleanse rules + enum coverage',             result: 'attested in DDL header · cleared round 1' },
      { id: 'land',   icon: 'layers', label: 'Stage _s3_valid + _s3_quarantine views',              result: 'silver/finance · ready' },
    ],
    outro: [
      "Cleared on round 1. ~60 silver views ready — names INITCAP'd, codes UPPER'd, status mapped to canonical enum, 12 invalid phone numbers and 4 unmappable enum values routed to _s3_quarantine. Reviewer attestation is in the DDL header. That's the full silver layer for {{domain}}. Approve when you're happy and we'll move to commit.",
    ],
    chip: { view: 'silver-code', label: 'Review S3 code', hint: 'Open code + approve in chat' },
    choices: [
      { id: 'approve-s3', label: 'Approve S3', setCtx: { silverApproved: { s1: true, s2: true, s3: true } } },
      { id: 'changes-s3', label: 'Request changes', next: null },
    ],
    startSilverStage: 's3',
  },

  // ---- Commit choice: git or local ----
  {
    id: 'w-commit-choice',
    role: 'walt',
    body: [
      "All three silver stages approved. Where should the project code live?",
      "Push everything to a git repo to track changes and review PRs, or keep it in your local workspace for now — you can wire up git later.",
    ],
    choices: [
      { id: 'commit-git',   label: 'Push to git repo',  setCtx: { commitTarget: 'git' },   next: 'w-git-setup' },
      { id: 'commit-local', label: 'Keep local for now', setCtx: { commitTarget: 'local' }, next: 'w-local-saved' },
    ],
  },

  // ---- Git branch ----
  // Setup is a modal wizard (same shape as the source wizard) — never a side-panel
  // artifact. The side panel is reserved for consuming information; configuration
  // overlays the chat so the user stays in the conversation.
  {
    id: 'w-git-setup',
    role: 'walt',
    body: [
      "Got it. Connect a git remote — paste a repo URL or pick from your configured providers. I'll commit the silver views, agent config, and policies, then open a PR with CI attached.",
    ],
    chip: { wizard: 'gitconnect', label: 'Connect git remote', hint: 'Opens setup wizard' },
    awaitConfirm: 'gitconnect',
  },
  {
    id: 'w-pr-opened',
    role: 'walt',
    body: [
      "Pushed. PR #{{prNumber}} opened with CI green. Reviewer attestations are attached as PR checks.",
      "Review the diff and commit in the panel when you're ready. Promotion to production is a separate step — I'll ask after the commit lands.",
    ],
    chip: { view: 'pr', label: 'PR #{{prNumber}} · ready to commit', hint: 'Open the PR' },
  },
  {
    id: 'w-pr-merged',
    role: 'walt',
    waitForMerge: true,
    body: [
      "Committed. The {{branch}} branch is up to date — nothing is running in production yet.",
      "Want me to promote this build to production now? Five agents will spin up: Ingestor, Transformer, Reasoner, Operator, Governer.",
    ],
    chip: { view: 'pr', label: 'PR #{{prNumber}} · committed', hint: 'View the committed PR' },
    choices: [
      { id: 'promote',      label: 'Promote to production', setCtx: { prPromoted: true } },
      { id: 'hold-promote', label: 'Hold off — I\u2019ll promote later', next: null },
    ],
    next: 'w-production',
  },

  // ---- Local branch ----
  {
    id: 'w-local-saved',
    role: 'walt',
    body: [
      "Committed to your local workspace at {{localPath}}. No remote configured — every change is tracked in your local git history.",
      "You can push to a remote anytime from Settings → Git. Ready to bring the project online?",
    ],
    choices: [
      { id: 'go-live',    label: 'Bring it online',  setCtx: { prPromoted: true } },
      { id: 'hold-local', label: 'Hold off for now', next: null },
    ],
    next: 'w-production',
  },

  // ---- Production (both branches converge here) ----
  {
    id: 'w-production',
    role: 'walt',
    body: [
      "Project's live. Five agents are running: Ingestor on cadence, Transformer on-event, Reasoner streaming, Operator watching DQ + drift, Governer enforcing policy.",
      "What would you like to do next?",
    ],
    chip: { view: 'ingestion-status', label: 'View production status', hint: 'Live run + table profile' },
    choices: [
      { id: 'ask-dayone',  label: 'Answer the day-one questions' },
      { id: 'add-source',  label: 'Add another source' },
      { id: 'build-gold',  label: 'Build the gold layer' },
      { id: 'invite',      label: 'Invite a teammate' },
    ],
  },
];

// Helper: find the script index for a turn id.
export function scriptIndexById(id) {
  return FIRST_RUN_SCRIPT.findIndex(t => t.id === id);
}

// Render a turn's body with {{ctx-key}} interpolation.
export function renderBody(body, ctx) {
  return (body || []).map(line =>
    line.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] != null ? String(ctx[k]) : ''),
  );
}

// Mocked past sessions — read-only previews used when the user opens them from the
// session picker.
export const SESSIONS = [
  {
    id: 'first-run',
    label: 'First run',
    when: 'today',
    subtitle: 'today',
    summary: 'Configure the project: domain → questions → ingestion → silver → commit.',
    turns: [], // injected at runtime — the platform autoplays this one
  },
  {
    id: 'adopt-airflow',
    label: 'Adopt existing Airflow DAGs',
    when: 'May 8',
    subtitle: '3 days ago',
    summary: 'Walt + Operator imported 14 DAGs as bronze sources and mapped their landing tables.',
    turns: [
      { id: 'a1', role: 'user', body: ['We have 14 Airflow DAGs landing ERP tables — can you adopt them instead of replacing?'] },
      { id: 'a2', role: 'walt', body: [
        'Yes — Operator can read the DAGs and treat their output tables as bronze contracts. Here\'s the mapping for the 14 DAGs.',
      ] },
      { id: 'a3', role: 'walt', body: [
        'Adopted. All 14 are now showing as bronze sources with lineage stamped. The next ingest pass picks them up on cadence.',
      ] },
    ],
  },
  {
    id: 'drift-triage',
    label: 'Schema drift triage · bronze.ap.invoices',
    when: 'May 10',
    subtitle: 'yesterday',
    summary: 'Operator caught a new `tax_jurisdiction` column. Proposed a contract update with reviewer attestation.',
    turns: [
      { id: 'd1', role: 'system', agent: 'operator', body: ['Operator flagged: bronze.ap.invoices has a new column `tax_jurisdiction`.'] },
      { id: 'd2', role: 'walt', body: [
        'Upstream added `tax_jurisdiction varchar(8)`. It\'s nullable and isn\'t in the s2 contract — the column drops silently in silver right now.',
        'I can: (1) extend the contract and re-run S2/S3 reviewers, or (2) quarantine the column with a stub for review.',
      ] },
      { id: 'd3', role: 'user', body: ['Extend the contract — it\'s a real tax field, we want it.'] },
      { id: 'd4', role: 'walt', body: [
        'Contract updated. Builder re-generated s2_typecast.finance_ap_invoices on round 1. Reviewer attested. PR #143 opened.',
      ] },
    ],
  },
];

export function getSessionMeta(id) {
  const s = SESSIONS.find(x => x.id === id);
  if (s) return s;
  return { id, label: 'New session', when: 'now', subtitle: 'just started', summary: '' };
}

export function getSession(id) {
  return SESSIONS.find(s => s.id === id);
}
