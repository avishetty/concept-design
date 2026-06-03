import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { ActionRow, ArtifactCard } from './BuilderActions.jsx';

// ─────────────────────────────────────────────────────────────────────────────
//  Mock data (verbatim from walt_builder_end_to_end.html). No backend.
// ─────────────────────────────────────────────────────────────────────────────

export const WORKSPACE = 'Global Sellout';

export const SETTINGS_TABS = [
  'Data Sources', 'Reason Base', 'Benchmark Suites', 'Users', 'Settings', 'Branding', 'Analytics',
];

export const SUITES = [
  {
    id: 'vf_validation_questions',
    name: 'vf_validation_questions',
    subtitle: 'answer 10 questions',
    questions: 10,
    lastRun: 'May 26, 2026',
    score: '0/1',
    status: 'Failed',
    cache: '—',
  },
  {
    id: 'vf_may26',
    name: 'vf_may26',
    subtitle: 'answer 1 question',
    questions: 2,
    lastRun: 'May 26, 2026',
    score: '2/2',
    status: 'Completed',
    cache: 'Bypassed',
  },
];

// Run-grid for the vf_validation_questions detail view. `cells` are most-recent →
// oldest, aligned to RUN_COLUMNS. A null cell renders as "—".
export const RUN_COLUMNS = [
  { id: 8, label: 'Run #8', score: '2/2' },
  { id: 7, label: 'Run #7', score: '0/2' },
  { id: 6, label: 'Run #6', score: '0/1' },
  { id: 5, label: 'Run #5', score: '0/1' },
];

export const DETAIL_QUESTIONS = [
  {
    n: 1,
    question: 'Whats the sales for timberland in FY2026',
    cells: ['success', 'error', 'error', 'error'],
  },
  {
    n: 2,
    question: 'Whats the units sold for vans in FY2026',
    cells: ['success', 'error', null, null],
  },
];

// Scene 3 SQL artifact mock.
export const MRR_SUMMARY = [
  { k: 'Metric', v: 'mrr_by_segment', strong: true },
  { k: 'Aggregation', v: 'SUM(mrr)' },
  { k: 'Filter', v: "status = 'active'" },
  { k: 'Group by', v: 'customers.segment' },
];

export const MRR_PREVIEW = {
  headers: ['segment', 'MRR', 'customers'],
  rows: [
    ['Enterprise', '$2,847,320', '312'],
    ['Mid-Market', '$1,203,480', '1,847'],
    ['SMB', '$428,910', '9,203'],
  ],
};

export const MRR_SQL = `SELECT c.segment,
  SUM(s.mrr) AS mrr,
  COUNT(DISTINCT s.customer_id) AS customers
FROM subscriptions s
JOIN customers c
  ON s.customer_id = c.customer_id
WHERE s.status = 'active'
GROUP BY c.segment
ORDER BY mrr DESC`;

// ─────────────────────────────────────────────────────────────────────────────
//  Rich card bodies (the structured turn content from the mockup)
// ─────────────────────────────────────────────────────────────────────────────

function Card({ title, badge, children }) {
  return (
    <div style={{ border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        background: 'var(--bg-inset)', padding: '7px 11px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-default)',
        fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{title}</span>
        {badge}
      </div>
      <div style={{ padding: '10px 11px' }}>{children}</div>
    </div>
  );
}

function NumBadge({ n }) {
  return (
    <span style={{
      background: 'var(--semantic)', color: '#fff', borderRadius: 999,
      width: 16, height: 16, fontSize: 9, flexShrink: 0, marginTop: 1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
    }}>{n}</span>
  );
}

const QUESTIONS = [
  'What is our monthly recurring revenue by customer segment?',
  'Which sales reps closed the most deals last quarter?',
  'What is the 90-day churn rate by acquisition cohort?',
];

function QuestionsCard() {
  return (
    <Card title="3 questions submitted">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUESTIONS.map((q, i) => (
          <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <NumBadge n={i + 1}/>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.5 }}>{q}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// The user's reply when Walt asks for the business questions — the three
// questions stacked as the user's own message (right-aligned bubble).
function QuestionsReply() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {QUESTIONS.map((q, i) => (
        <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 600, opacity: 0.7 }}>{i + 1}.</span>
          <span>{q}</span>
        </div>
      ))}
    </div>
  );
}

function ContextOfferChips() {
  const chip = (label, dashed) => (
    <span style={{
      border: dashed ? '1px dashed var(--border-strong)' : '1px solid var(--border-default)',
      borderRadius: 8, padding: '5px 10px', fontSize: 11.5, color: 'var(--text-secondary)',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      {dashed && <Icon name="upload" size={11} color="var(--text-secondary)"/>}
      {label}
    </span>
  );
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {chip('Attach files', true)}
      {chip('Skip for now', false)}
    </div>
  );
}

function FileChip({ icon, color, name }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '5px 9px', background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)', borderRadius: 8,
      fontSize: 11.5,
    }}>
      <Icon name={icon} size={13} color={color}/>
      {name}
    </div>
  );
}

function SelectedColumnsCard() {
  const star = (label) => (
    <span style={{
      background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999,
      padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>{label} ★</span>
  );
  const plain = (label) => (
    <span style={{
      background: 'var(--bg-inset)', color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)', borderRadius: 999,
      padding: '2px 8px', fontSize: 11,
    }}>{label}</span>
  );
  return (
    <Card
      title={<><Icon name="table" size={12} color="var(--text-secondary)"/> Selected columns</>}
      badge={<span style={{
        background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999,
        padding: '2px 8px', fontSize: 10.5, fontWeight: 600,
      }}>Basic Analysis</span>}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {star('mrr')}
        {star('segment')}
        {plain('status')}
        {plain('customer_id')}
        {plain('subscription_id')}
      </div>
    </Card>
  );
}

function LinterMeta({ extra }) {
  return (
    <span>
      {extra} Walt linter <span style={{ color: 'var(--status-ok)' }}>✓ passed</span>
    </span>
  );
}

function DiagnosisCard() {
  const row = (strong, rest) => (
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--status-err)', fontSize: 14, lineHeight: 1 }}>✗</span>
      <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>
        <b>{strong}</b> {rest}
      </div>
    </div>
  );
  return (
    <div style={{
      background: 'var(--bg-inset)', borderRadius: 8, padding: '10px 11px',
      display: 'flex', flexDirection: 'column', gap: 7,
    }}>
      {row('brand', 'column not in semantic model — queries referencing "Timberland" or "Vans" can\u2019t resolve to rows')}
      {row('fiscal_year', 'dimension undefined — "FY2026" has no date mapping in the current model')}
    </div>
  );
}

function InlineCode({ children }) {
  return (
    <code style={{
      background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4,
      fontSize: 11.5, fontFamily: 'var(--font-mono)',
    }}>{children}</code>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Scripts
// ─────────────────────────────────────────────────────────────────────────────

// Scene 2 + Scene 3 — the build conversation.
export const BUILDER_BUILD_SCRIPT = [
  {
    id: 'b-u1', role: 'user',
    body: ['I want to build out the semantic model for our workspace.'],
  },
  {
    id: 'b-w1', role: 'walt',
    body: [
      <strong key="t">Let's build your semantic model.</strong>,
      <span key="s" style={{ color: 'var(--text-secondary)' }}>What business questions do you need to answer? Share them and I'll use them to select exactly which tables, columns, and metrics to build.</span>,
    ],
  },
  {
    id: 'b-uQ', role: 'user',
    body: [<QuestionsReply key="qr"/>],
  },
  {
    id: 'b-wEcho', role: 'walt',
    body: [
      <span key="g">Got it — locking these in:</span>,
      <QuestionsCard key="q"/>,
    ],
  },
  {
    id: 'b-w2', role: 'walt',
    body: [
      'Any context files to help me understand your business logic? (PDF, DAX, Excel — these will be stored workspace-wide)',
      <ContextOfferChips key="c"/>,
    ],
  },
  {
    id: 'b-u2', role: 'user',
    body: [
      'Here are our context docs:',
      <FileChip key="pdf" icon="file" color="var(--status-err)" name="Revenue_Data_Dictionary_v3.pdf"/>,
      <FileChip key="dax" icon="code" color="var(--accent)" name="Existing_Metrics.dax"/>,
    ],
  },
  {
    id: 'b-task', role: 'task', agent: 'reasoner',
    title: 'MRR by customer segment',
    body: [<span key="g" style={{ color: 'var(--status-ok)', fontWeight: 600 }}>Context parsed. Starting with Question 1: MRR by customer segment.</span>],
    stepMs: 900,
    steps: [
      { id: 's1', icon: 'schema', label: 'Analyzing schema', result: 'subscriptions + customers selected' },
      { id: 's2', icon: 'branch', label: 'Identifying join path', result: 'subscriptions.customer_id → customers.customer_id (1:N)' },
      { id: 's3', icon: 'wand', label: 'Reasoning over metric definition', result: "SUM(mrr) WHERE status='active' GROUP BY segment" },
      { id: 's4', icon: 'code', label: 'SQL tool · drafting candidate query…', result: 'draft compiled · 3 columns returned' },
      { id: 's5', icon: 'search', label: 'Inspecting draft against sample rows', result: 'segment values look right, mrr not yet aggregated by metric' },
      { id: 's6', icon: 'layers', label: 'Creating ephemeral metric', result: 'mrr_by_segment · session-scoped' },
      { id: 's7', icon: 'sparkle', label: 'SLM tool · regenerating SQL with metric…', result: 'resolved via metric mrr_by_segment' },
      { id: 's8', icon: 'play', label: 'Running eval against sample rows…', result: '3/3 expected rows matched · Walt linter ✓' },
      { id: 's9', icon: 'table', label: 'Compiling results', result: '3 segments · $4.48M total MRR' },
    ],
    outro: [<SelectedColumnsCard key="sc"/>],
  },
  {
    id: 'b-sql', role: 'walt', openSqlPanel: true,
    body: [
      'SQL generated and validated against the Walt linter. Review it in the panel and let me know:',
      <ArtifactCard
        key="art"
        openable
        tone="info"
        title="monthly_recurring_revenue_by_segment"
        meta={<LinterMeta extra={<>SQL · </>}/>}
      />,
      <ActionRow key="act" action="commit"/>,
    ],
  },
];

// Scene 6 — Builder launched from a benchmark run.
export const BUILDER_FIX_SCRIPT = [
  {
    id: 'f-w1', role: 'walt',
    body: [
      "I\u2019ve reviewed runs #1–7 for both questions. Here\u2019s what\u2019s missing from your semantic model:",
      <DiagnosisCard key="d"/>,
      "I\u2019ll add both and regenerate SQL for your benchmark questions. What date range does FY2026 cover?",
    ],
  },
  {
    id: 'f-u1', role: 'user',
    body: ['FY2026 = Aug 2025 through Jul 2026. Add brand from the products table.'],
  },
  {
    id: 'f-w2', role: 'walt',
    body: [
      <span key="l">
        Got it. Adding <InlineCode>products.brand</InlineCode> and defining{' '}
        <InlineCode>fiscal_year</InlineCode> as Aug 2025 – Jul 2026. SQL regenerated:
      </span>,
      <ArtifactCard
        key="art"
        tone="ok"
        title="brand_sales_by_fiscal_year"
        meta={<LinterMeta extra={<>2 new columns added · </>}/>}
      />,
      <ActionRow key="act" action="rerun"/>,
    ],
  },
];

// Builder-local helpers (mirrors sessions.js but scoped to Builder scripts).
export function scriptIndexById(script, id) {
  return script.findIndex(t => t.id === id);
}

// Builder turn bodies hold React nodes as well as strings; there is no {{ctx}}
// interpolation here, so rendering is just an identity passthrough that keeps
// nodes intact.
export function renderBody(body) {
  return body || [];
}

export function getScript(activeScript) {
  return activeScript === 'fix' ? BUILDER_FIX_SCRIPT : BUILDER_BUILD_SCRIPT;
}
