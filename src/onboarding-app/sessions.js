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
  // After the user sends from the composer, autoplay adds their text as a user turn
  // and continues from here:
  {
    id: 'w-scope-locked',
    role: 'walt',
    body: [
      "Scope is locked. Before I can answer any of that, I need to know where your {{domain}} data actually lives — which source systems Walt should mirror into bronze.",
    ],
  },

  // ---- Source picker: pill opens the catalog in the panel, chat pauses until the
  //      user confirms a selection. Pre-selects recommended sources for the domain. ----
  {
    id: 'w-sources-pick',
    role: 'walt',
    body: [
      "I've pre-selected the sources {{domain}} teams usually pull from. Open the catalog, adjust the list, then confirm — Walt will mirror them into bronze, mask PII, and profile the tables as data lands.",
    ],
    chip: { view: 'connections', label: 'Configure your source', hint: 'Pick what to ingest' },
    action: { type: 'openArtifact', view: 'connections', tab: 'ingestion' },
    awaitConfirm: 'sources',
  },

  // ---- Ingestion: pill appears, chat pauses until ingestion completes ----
  {
    id: 'w-ingest-start',
    role: 'walt',
    body: [
      "Mirroring your sources into bronze now. Walt's profiling each table — sampling rows, detecting types, masking PII, stamping lineage. I'll let you know when it's safe to look at the data.",
    ],
    chip: { view: 'ingestion', label: 'Ingestion started', hint: 'View live progress + profile' },
    action: { type: 'openArtifact', view: 'ingestion', tab: 'ingestion' },
    startIngestion: true,
  },
  // Streaming-style progress trace: each row reveals as the Ingestor builder
  // walks through tool calls. Step durations are tuned so the trace finishes
  // roughly when the simulated ingestion timer flips ingestionStatus='complete'
  // (6000ms in PlatformShell), keeping the panel + chat in sync.
  {
    id: 'prg-ingest',
    role: 'progress',
    agent: 'ingestor',
    title: 'Mirroring sources into bronze',
    stepMs: 950,
    steps: [
      { id: 'plan',    icon: 'wand',   label: 'Plan ingestion strategy for {{domain}}', result: '8 source tables · 2 PII candidates' },
      { id: 'connect', icon: 'db',     label: 'Connect to ERP + GL systems',            result: 'sql-erp01.imageinc.internal · ok' },
      { id: 'profile', icon: 'eye',    label: 'Profile schemas + nullability',          result: '220 columns · 18 nullable · 3 date' },
      { id: 'sample',  icon: 'table',  label: 'Sample 10,000 rows per table',           result: 'previews cached' },
      { id: 'pii',     icon: 'shield', label: 'Detect + mask PII columns',              result: 'vendors.email, customers.phone masked' },
      { id: 'land',    icon: 'layers', label: 'Materialise to bronze + stamp lineage',  result: '8 tables · _ingested_at, _batch_id' },
    ],
  },
  {
    id: 'w-ingest-done',
    role: 'walt',
    waitForIngestion: true,
    body: [
      "Ingestion + profile complete. 220 tables landed in bronze, schemas profiled, PII masked, lineage stamped. Review the profile whenever — when you're ready I'll bring Transformer in to build the silver layer.",
    ],
    chip: { view: 'sample', label: 'Sample preview', hint: '5 example tables' },
    choices: [
      { id: 'start-silver', label: 'Build the silver layer' },
      { id: 'review-first', label: 'Let me review ingestion first' },
    ],
  },
  // "Let me review" doesn't actually branch in the script — it just yields control;
  // the next user click on the same row continues. The autoplay treats `noAdvance` as
  // "stay paused on this turn until a fresh click".
  // For simplicity we model it as both choices flowing to the same next turn — they
  // both produce a user turn, only "start-silver" sets the approval flag.

  // ---- Silver build: S1 → review/approve → S2 → review/approve → S3 → review/approve ----
  {
    id: 'sys-transformer',
    role: 'system',
    agent: 'transformer',
    body: ['Transformer joined the session.'],
  },
  {
    id: 'w-s1-plan',
    role: 'walt',
    body: [
      "Starting S1 · dedup. Deduplicating each bronze source on its declared grain and stamping dedup metadata. Reviewer will check contract, lineage, quarantine, no-bleed, naming, metadata, idempotency.",
    ],
    chip: { view: 'silver', label: 'S1 plan', hint: 'View S1 details' },
    action: { type: 'openArtifact', view: 'silver', tab: 'transformation' },
    startSilverStage: 's1',
  },
  // Builder + reviewer trace for S1. Tuned to ~3500ms (matches the simulated
  // S1 build duration set in PlatformShell).
  {
    id: 'prg-s1',
    role: 'progress',
    agent: 'transformer',
    title: 'Building S1 · dedup',
    stepMs: 650,
    steps: [
      { id: 'keys',    icon: 'wand',   label: 'Pick dedup keys per table',          result: 'invoice_id, customer_id × 2 grains' },
      { id: 'sql',     icon: 'code',   label: 'Generate dedup SQL',                 result: 'finance_ap_invoices, finance_ar_invoices' },
      { id: 'run',     icon: 'flow',   label: 'Run on Walt sandbox',                result: '693,127 → 691,642 rows · 1,485 dupes' },
      { id: 'review',  icon: 'check',  label: 'Reviewer: contract + lineage + idempotency', result: 'parity 99.78% · attested' },
      { id: 'land',    icon: 'layers', label: 'Stage s1_dedup views',               result: '2 views ready' },
    ],
  },
  {
    id: 'w-s1-review',
    role: 'walt',
    waitForSilver: 's1',
    body: [
      "S1's ready for review. 1,485 dupes removed across the bronze tables, parity check inside the expected window. Code + checklist in the panel — approve when you're satisfied.",
    ],
    chip: { view: 'silver', label: 'S1 ready for review', hint: 'View code + checks' },
    choices: [
      { id: 'approve-s1', label: 'Approve S1', setCtx: { silverApproved: { s1: true, s2: false, s3: false } } },
      { id: 'changes-s1', label: 'Request changes' },
    ],
  },
  {
    id: 'w-s2-plan',
    role: 'walt',
    body: [
      "Starting S2 · type-cast. Casting each column to its declared type. Any rows that fail cast get routed to a quarantine table so silver stays clean.",
    ],
    chip: { view: 'silver', label: 'S2 plan', hint: 'View S2 details' },
    startSilverStage: 's2',
  },
  // Builder + reviewer trace for S2 — narrative includes the "needed two
  // rounds" reviewer push-back. Tuned to ~4500ms.
  {
    id: 'prg-s2',
    role: 'progress',
    agent: 'transformer',
    title: 'Building S2 · type-cast',
    stepMs: 700,
    steps: [
      { id: 'infer',   icon: 'wand',   label: 'Infer target types (Reasoner)',            result: '18 columns typed · 3 dates · 4 numerics' },
      { id: 'sql-1',   icon: 'code',   label: 'Generate CAST + quarantine routes',        result: 'round 1' },
      { id: 'run-1',   icon: 'flow',   label: 'Run typecast on sandbox',                  result: '14 rows failed amount cast' },
      { id: 'replan',  icon: 'wand',   label: 'Add quarantine.s2 route for failures',     result: 'round 2 · 0 failures' },
      { id: 'review',  icon: 'check',  label: 'Reviewer: numbers reconcile',              result: 'attested' },
      { id: 'land',    icon: 'layers', label: 'Stage s2_typecast views',                  result: '2 views ready' },
    ],
  },
  {
    id: 'w-s2-review',
    role: 'walt',
    waitForSilver: 's2',
    body: [
      "S2's ready — needed two rounds. Reviewer caught 14 rows failing the amount cast, builder added quarantine.s2 route on round 2. Numbers reconcile.",
    ],
    chip: { view: 'silver', label: 'S2 ready for review', hint: 'View code + checks' },
    choices: [
      { id: 'approve-s2', label: 'Approve S2', setCtx: { silverApproved: { s1: true, s2: true, s3: false } } },
      { id: 'changes-s2', label: 'Request changes' },
    ],
  },
  {
    id: 'w-s3-plan',
    role: 'walt',
    body: [
      "Starting S3 · standardise. Standardising currencies, IDs, and units. ~60 silver views will be staged on a feature branch when reviewer attests.",
    ],
    chip: { view: 'silver', label: 'S3 plan', hint: 'View S3 details' },
    startSilverStage: 's3',
  },
  // Builder + reviewer trace for S3. Tuned to ~3500ms.
  {
    id: 'prg-s3',
    role: 'progress',
    agent: 'transformer',
    title: 'Building S3 · standardise',
    stepMs: 650,
    steps: [
      { id: 'fx',      icon: 'cloud',  label: 'Load FX rates + unit standards',           result: 'USD / EUR / JPY · 2026-05-12' },
      { id: 'sql',     icon: 'code',   label: 'Add amount_usd, is_overdue, normalise IDs', result: 'round 1' },
      { id: 'run',     icon: 'flow',   label: 'Run standardise on sandbox',               result: '~60 views built' },
      { id: 'review',  icon: 'check',  label: 'Reviewer: standardisation passes',         result: 'attested · cleared round 1' },
      { id: 'land',    icon: 'layers', label: 'Stage on feature branch',                  result: 'silver/finance · ready' },
    ],
  },
  {
    id: 'w-s3-review',
    role: 'walt',
    waitForSilver: 's3',
    body: [
      "S3 cleared on round 1. ~60 silver views ready. That's the full silver layer for {{domain}}.",
    ],
    chip: { view: 'silver', label: 'S3 ready for review', hint: 'View code + checks' },
    choices: [
      { id: 'approve-s3', label: 'Approve S3', setCtx: { silverApproved: { s1: true, s2: true, s3: true } } },
      { id: 'changes-s3', label: 'Request changes' },
    ],
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
  {
    id: 'w-git-setup',
    role: 'walt',
    body: [
      "Got it. Connect a git remote in the panel — paste a repo URL or pick from your configured providers. I'll commit the silver views, agent config, and policies, then open a PR with CI attached.",
    ],
    chip: { view: 'gitconnect', label: 'Connect git remote', hint: 'Configure remote' },
    action: { type: 'openArtifact', view: 'gitconnect', tab: 'context' },
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
    action: { type: 'openArtifact', view: 'pr', tab: 'transformation' },
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
    chip: { view: 'production', label: 'Production dashboard', hint: 'Live status' },
    action: { type: 'openArtifact', view: 'production', tab: 'ingestion' },
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
