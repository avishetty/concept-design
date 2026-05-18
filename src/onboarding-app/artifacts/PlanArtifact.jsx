import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AgentBadge } from '../components/AgentBadge.jsx';
import { SUB_AGENTS } from '../agents.js';

// PlanArtifact — narrow, focused view of *just* the plan for a silver sub-layer.
// Surfaced when a chat pill asks the user to review the plan before code is
// generated. Intentionally has no code preview, no reviewer rail, and no PR
// state — those live in their own artifact views (silver-code, pr).
//
// The plan it shows is whichever silver stage is currently active in ctx
// (s1 / s2 / s3). If silverStage is idle/done it falls back to s1 so the panel
// still has something meaningful to show.
const PLANS = {
  s1: {
    title: 'S1 · Deduplicate finance_ap_invoices',
    intent: 'Collapse duplicates to one authoritative record per natural key. CDC tombstones are preserved as records (never physically deleted), late-arriving rows are reconciled by source event time, and null-key rows are routed to _s1_quarantine for remediation.',
    grain: 'invoice_id (natural key)',
    inputs: ['bronze.ap.invoices'],
    output: 'silver.s1_dedup.finance_ap_invoices_valid + _s1_quarantine',
    steps: [
      { label: "Declare natural key (invoice_id) from the entity's metadata config — never hardcoded in the view." },
      { label: 'Partition by natural key, order by source event timestamp where present, else _ingested_at desc; deterministic tie-break on full row hash.' },
      { label: 'CDC DELETE events surfaced as _is_deleted = TRUE with _deleted_at; tombstone retained as the current record for that key.' },
      { label: 'Null-natural-key rows → _s1_quarantine with _dedup_failure_reason = "null_natural_key"; they do not flow forward.' },
      { label: 'Stamp _dedup_key, _dedup_key_type (natural | hash), _dedup_strategy (within_batch | across_batch | cdc); pass Bronze lineage through unchanged.' },
    ],
    checks: [
      { id: 'grain',      label: 'Natural-key uniqueness', desc: 'invoice_id is unique on _s1_valid; tombstones counted as current record per key.' },
      { id: 'late',       label: 'Late-arriving correctness', desc: 'A corrective record from the source with an older event ts supersedes the earlier-arriving version.' },
      { id: 'quarantine', label: 'Quarantine coverage',    desc: 'Every null-natural-key row appears in _s1_quarantine; reviewer counts reconcile to Bronze.' },
      { id: 'lineage',    label: 'Lineage passthrough',    desc: '_ingested_at, _source, _batch_id, _ingestion_date carried forward unchanged.' },
    ],
    risks: [
      'Within-batch, across-batch, and CDC dedup strategies are all in scope — strategy used per row is recorded in _dedup_strategy so the reviewer can sample each path.',
      'Promotion gate: this view is deployed to S2 only after the cleanse-reviewer-agent attestation lands in the DDL header.',
    ],
  },
  s2: {
    title: 'S2 · Type-cast finance_ap_invoices',
    intent: 'Cast every column from VARCHAR/VARIANT to its declared contract type. Cast failures are schema contract violations, not DQ issues — mandatory failures route to _s2_quarantine. S2 stays a view; G1 is the single materialisation downstream.',
    grain: 'invoice_id',
    inputs: ['silver.s1_dedup.finance_ap_invoices_valid'],
    output: 'silver.s2_typecast.finance_ap_invoices_valid + _s2_quarantine',
    steps: [
      { label: 'Read the silver contract; tag each column mandatory or optional. Mandatory failure → quarantine the row; optional failure → NULL the cell + flag.' },
      { label: 'amount → TRY_CAST(NUMERIC(18, 4)) (never FLOAT for money). issue_date → TRY_CAST(DATE) using the source-declared format (MM/DD/YYYY for ERP, no auto-detect).' },
      { label: "is_active → boolean normalisation map: 'true|1|y|yes|on' → TRUE, 'false|0|n|no|off' → FALSE (case-insensitive), else _s2_quarantine with reason='unrecognised_boolean'." },
      { label: 'Datetime: TRY_TO_TIMESTAMP for naive strings → TIMESTAMP_NTZ; TRY_TO_TIMESTAMP_TZ for tz-aware. UTC coercion is deferred to S3.' },
      { label: 'Stamp _cast_passed, _cast_failure_column, _cast_failure_reason; pass S1 dedup metadata + Bronze lineage through unchanged.' },
    ],
    checks: [
      { id: 'contract',   label: 'Cast contract',       desc: 'Every column on _s2_valid matches the declared target type; mandatory failures absent.' },
      { id: 'quarantine', label: 'Mandatory routing',   desc: 'Every mandatory cast failure appears in _s2_quarantine with a populated _cast_failure_reason.' },
      { id: 'optional',   label: 'Optional cell NULL-on-fail', desc: 'Optional column failures NULL the cell without quarantining the row.' },
      { id: 'idempotent', label: 'Idempotency',         desc: 'Re-running TRY_CAST on the same input yields identical _cast_passed and quarantine partitions.' },
    ],
    risks: [
      'amount is the highest-loss column historically — reviewer flagged 14 rows on the last run; quarantine route now in place.',
      "Ambiguous date format risk eliminated by source declaration — if a source ever changes its format, the entity config must change first.",
    ],
  },
  s3: {
    title: 'S3 · Cleanse finance_ap_invoices',
    intent: 'Normalise semantically inconsistent values to a single canonical form so Gold can apply business logic on clean data. Null cleansing, case + whitespace rules, enum mapping via a reference table, and phone/identifier formatting all happen here.',
    grain: 'invoice_id',
    inputs: ['silver.s2_typecast.finance_ap_invoices_valid'],
    output: 'silver.s3_cleanse.finance_ap_invoices_valid + _s3_quarantine',
    steps: [
      { label: "Null cleansing: empty strings, whitespace-only, sentinels ('N/A', 'NA', 'NULL', 'none', '-', '.'), and placeholder dates (1900-01-01, 9999-12-31) → NULL." },
      { label: 'Case rules per column: INITCAP for proper names · UPPER for codes (currency, country, status, SKU) · LOWER for email + URL · TRIM applied first, control chars stripped.' },
      { label: 'Enum cleansing: join ref.enum_status keyed by (source_system, field_name, raw_value). Mapped → set _cleanse_enum_mapped = TRUE. Unmappable → _s3_quarantine with reason="unmappable_enum".' },
      { label: 'Phone E.164: strip non-numeric, prepend +1 default from entity config, validate length; invalid lengths → _s3_quarantine with reason="invalid_phone_length".' },
      { label: 'Datetime UTC coercion: TIMESTAMP_NTZ values converted using declared source timezone; TIMESTAMP_TZ converted to UTC and stored as TIMESTAMP_NTZ.' },
      { label: 'Stamp _cleanse_applied_rules (pipe-delimited) + _cleanse_quarantine_reason; pass S2 cast metadata + S1 dedup metadata + Bronze lineage through unchanged.' },
    ],
    checks: [
      { id: 'enum',     label: 'Enum coverage',       desc: 'Every observed enum value either maps to canonical or appears in _s3_quarantine with reason="unmappable_enum".' },
      { id: 'case',     label: 'Case rule coverage',  desc: 'Every VARCHAR column has a declared case rule; TRIM + control-char stripping applied unconditionally.' },
      { id: 'no-bleed', label: 'No logic bleed',      desc: 'Cleanse does not change types or aggregate rows — only normalises values.' },
      { id: 'lineage',  label: 'Lineage passthrough', desc: 'S2 cast metadata, S1 dedup metadata, and Bronze lineage carried forward unchanged.' },
    ],
    risks: [
      'New enum values landing later will appear in _s3_quarantine with reason="unmappable_enum" — Operator agent alerts when unmapped > 0.5%.',
      'Promotion gate: this view is deployed to G1 only after the cleanse-reviewer-agent attestation lands in the DDL header.',
    ],
  },
};

export function PlanArtifact() {
  const { ctx, shell } = usePhase();
  const stageKey = (ctx?.silverStage && PLANS[ctx.silverStage]) ? ctx.silverStage : 's1';
  const plan = PLANS[stageKey];
  const sub = SUB_AGENTS[stageKey];
  const status = (shell.silverStageStatus || {})[stageKey] || 'idle';
  const approved = !!(ctx.silverApproved || {})[stageKey];

  // Show a passive "Reviewing plan" banner only while the *plan* is the active
  // step (build hasn't started — silverStageStatus is still 'idle'). The user
  // approves the plan in the chat; this panel is information-only.
  const planReviewActive = ctx?.silverStage && ['s1','s2','s3'].includes(ctx.silverStage)
    && status === 'idle'
    && !approved
    && ctx.silverStage === stageKey;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AgentBadge agent="transformer" size="sm" sub={sub.builder}/>
            <StatusPill status={approved ? 'approved' : status}/>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {plan.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.55 }}>
            {plan.intent}
          </div>
        </div>
      </div>

      {planReviewActive && <PlanReviewStatusBanner stage={stageKey}/>}

      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: '16px 22px 24px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* Inputs → Output */}
        <Card>
          <KvRow label="Grain" mono>{plan.grain}</KvRow>
          <KvRow label="Inputs" mono>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {plan.inputs.map(i => <span key={i}>{i}</span>)}
            </div>
          </KvRow>
          <KvRow label="Output" mono>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{plan.output}</span>
          </KvRow>
        </Card>

        {/* Steps */}
        <Section title="Steps" icon="layers">
          <ol style={{ margin: 0, padding: '0 0 0 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.steps.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 999, flexShrink: 0,
                  background: 'var(--bg-inset)',
                  color: 'var(--text-secondary)',
                  fontSize: 10.5, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1,
                }}>{i + 1}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Checks */}
        <Section title="Checks the reviewer will run" icon="check">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {plan.checks.map(c => (
              <div key={c.id} style={{
                display: 'flex', gap: 10, padding: '8px 10px',
                background: 'var(--bg-inset)', borderRadius: 8,
                border: '1px solid var(--border-subtle)',
              }}>
                <Icon name="check" size={11} color="var(--text-muted)"/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>
                    {c.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Risks / notes */}
        {plan.risks && plan.risks.length > 0 && (
          <Section title="Notes" icon="bolt">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plan.risks.map((r, i) => (
                <div key={i} style={{
                  fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55,
                  padding: '8px 10px',
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                }}>
                  {r}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// Passive status strip — shown while the user is reviewing the plan but
// approval hasn't happened yet. Information-only: this surface never accepts
// approvals. The user signs off in the chat using the Approve plan /
// Request-changes choices on the plan task.
const STAGE_LABEL = { s1: 'S1', s2: 'S2', s3: 'S3' };
function PlanReviewStatusBanner({ stage }) {
  return (
    <div style={{
      padding: '8px 14px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--accent-soft)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 12, color: 'var(--text-primary)',
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 20, borderRadius: 6,
        background: 'var(--accent)', color: 'var(--accent-on)',
        flexShrink: 0,
      }}>
        <Icon name="eye" size={10} color="currentColor"/>
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.35 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          Reviewing {STAGE_LABEL[stage]} plan
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          Read the plan here, then approve or request changes in the chat.
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: '4px 14px',
    }}>
      {children}
    </div>
  );
}

function KvRow({ label, mono, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '10px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
        color: 'var(--text-muted)', minWidth: 64, paddingTop: 2,
      }}>{label}</span>
      <span
        className={mono ? 'walt-mono' : undefined}
        style={{
          flex: 1, minWidth: 0, fontSize: 12.5,
          color: 'var(--text-secondary)',
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: 0.6,
      }}>
        <Icon name={icon} size={11} color="var(--text-muted)"/>
        {title}
      </div>
      {children}
    </div>
  );
}

function StatusPill({ status }) {
  const META = {
    idle:     { label: 'Planned',   bg: 'var(--bg-inset)', fg: 'var(--text-muted)' },
    running:  { label: 'Building',  bg: 'rgba(54,86,198,0.10)', fg: 'var(--accent)' },
    review:   { label: 'In review', bg: 'rgba(54,86,198,0.12)', fg: 'var(--accent)' },
    approved: { label: 'Approved',  bg: 'rgba(63,143,63,0.12)', fg: 'var(--status-ok)' },
  };
  const m = META[status] || META.idle;
  return (
    <span style={{
      fontSize: 10.5, padding: '2px 8px', borderRadius: 999,
      background: m.bg, color: m.fg, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {status === 'running' && <span className="walt-dot run" style={{ width: 6, height: 6 }}/>}
      {status === 'approved' && <Icon name="check" size={9} color={m.fg}/>}
      {m.label}
    </span>
  );
}
