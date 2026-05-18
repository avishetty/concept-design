import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AgentBadge } from '../components/AgentBadge.jsx';
import { SUB_AGENTS } from '../agents.js';
import { PageHeader } from './CatalogPage.jsx';

// TransformationPage — the project-level home for the silver build.
//
// Mirrors the same state the chat narrates:
//   shell.silverStageStatus    — per-stage live status (idle | running | review | approved)
//   ctx.silverApproved         — sticky "user signed off this stage" flags
//   ctx.silverStage            — currently-active stage
//   ctx.gitConnected / prMerged — for the PR / commit card
//
// On each stage card the user can:
//   • View plan  → opens the PlanArtifact in the side panel (returns to chat)
//   • View code  → opens the CodeArtifact in the side panel with review buttons
//
// Both routes deep-link back into the chat surface so the conversation can keep
// orchestrating — this page is for *browsing*, the chat is for *deciding*.

const STAGES = [
  {
    key: 's1',
    title: 'S1 · Deduplication',
    intent: 'One authoritative record per natural key. CDC tombstones retained as _is_deleted records, late-arriving rows reconciled by source event time, null-key rows routed to _s1_quarantine.',
    inputs: ['bronze.ap.invoices', 'bronze.ar.invoices', 'bronze.gl.journal_entries'],
    outputs: [
      's1_dedup.finance_ap_invoices_valid',
      's1_dedup.finance_ap_invoices_s1_quarantine',
      's1_dedup.finance_ar_invoices_valid',
    ],
    checks: [
      'unique_on(natural_key) where _is_deleted = false',
      'null_natural_key → _s1_quarantine',
      'cdc tombstones preserved as _is_deleted records',
      'lineage_passthrough(_ingested_at, _source, _batch_id)',
    ],
  },
  {
    key: 's2',
    title: 'S2 · Type-cast',
    intent: 'Project every column to its declared contract type. Cast failures are schema contract violations — mandatory failures route to _s2_quarantine, optional failures NULL the cell + flag _cast_passed.',
    inputs: ['s1_dedup.finance_ap_invoices_valid', 's1_dedup.finance_ar_invoices_valid'],
    outputs: [
      's2_typecast.finance_ap_invoices_valid',
      's2_typecast.finance_ap_invoices_s2_quarantine',
      's2_typecast.finance_ar_invoices_valid',
    ],
    checks: [
      'money = NUMERIC(18, 4) (never FLOAT)',
      'boolean normalisation map applied · unrecognised → quarantine',
      'mandatory cast failure → _s2_quarantine',
      'optional cast failure → NULL + _cast_passed = FALSE',
      'idempotent re-run',
    ],
  },
  {
    key: 's3',
    title: 'S3 · Cleanse',
    intent: 'Normalise semantically inconsistent values — sentinels to NULL, INITCAP / UPPER / LOWER case rules, enum mapping via ref.enum_status, phones in E.164. Unmappable enums and invalid identifiers route to _s3_quarantine.',
    inputs: ['s2_typecast.finance_ap_invoices_valid', 's2_typecast.finance_ar_invoices_valid'],
    outputs: [
      's3_cleanse.finance_ap_invoices_valid',
      's3_cleanse.finance_ap_invoices_s3_quarantine',
      's3_cleanse.finance_ar_invoices_valid',
    ],
    checks: [
      "sentinel_to_null('', 'N/A', '-', placeholder dates)",
      'case rules per column (INITCAP names · UPPER codes · LOWER emails · TRIM all)',
      'enum coverage via ref.enum_status · unmapped → quarantine',
      'phones in E.164 · invalid lengths → quarantine',
      'reviewer attestation recorded in DDL header (promotion gate)',
    ],
  },
];

export function TransformationPage() {
  const { ctx, shell, openArtifact, openWizard, setShellTab, set } = usePhase();

  // Open an artifact in the side panel and switch back to chat so the
  // conversation stays the primary surface.
  const goToArtifact = (view, stageKey) => {
    if (stageKey) set({ silverStage: stageKey });
    setShellTab('chat');
    openArtifact(view);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg-app)' }}>
      <PageHeader
        title="Transformation"
        subtitle="Silver-layer build for the active project. Each stage is reviewable in the chat side panel."
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <SectionShell
            title="Silver layers"
            desc="S1 → S2 → S3. Walt won't move past a layer until you sign off on its code."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STAGES.map(stage => {
                const status = (shell.silverStageStatus || {})[stage.key] || 'idle';
                const approved = !!(ctx.silverApproved || {})[stage.key];
                return (
                  <StageCard
                    key={stage.key}
                    stage={stage}
                    status={approved ? 'approved' : status}
                    approved={approved}
                    onViewPlan={() => goToArtifact('silver-plan', stage.key)}
                    onViewCode={() => goToArtifact('silver-code', stage.key)}
                  />
                );
              })}
            </div>
          </SectionShell>

          <SectionShell
            title="Commit"
            desc="Once all three silver stages are approved, commit the project to your repo."
          >
            <CommitCard
              ctx={ctx}
              shell={shell}
              onOpenPr={() => goToArtifact('pr')}
              onConnectGit={() => openWizard('gitconnect')}
            />
          </SectionShell>
        </div>
      </div>
    </div>
  );
}

// ---- pieces ----

function StageCard({ stage, status, approved, onViewPlan, onViewCode }) {
  const sub = SUB_AGENTS[stage.key];
  const meta = STATUS_META[status] || STATUS_META.idle;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderLeft: '3px solid ' + meta.bar,
      borderRadius: 12,
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <AgentBadge agent="transformer" size="sm" sub={sub?.builder}/>
        <StatusPill status={status}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{stage.title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{stage.intent}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <KvBlock label="Inputs" items={stage.inputs}/>
        <KvBlock label="Outputs" items={stage.outputs} highlight/>
        <KvBlock label="Checks" items={stage.checks}/>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="walt-btn ghost sm" onClick={onViewPlan}>
          <Icon name="layers" size={11}/> View plan
        </button>
        <button
          className={approved ? 'walt-btn ghost sm' : 'walt-btn primary sm'}
          onClick={onViewCode}
        >
          <Icon name="code" size={11}/>
          {approved ? 'View code' : status === 'review' ? 'Review code' : 'View code'}
        </button>
        <div style={{ flex: 1 }}/>
        {approved && (
          <span style={{
            fontSize: 11, color: 'var(--status-ok)', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="check" size={11} color="var(--status-ok)"/>
            Approved
          </span>
        )}
      </div>
    </div>
  );
}

function CommitCard({ ctx, shell, onOpenPr, onConnectGit }) {
  const allApproved = ['s1', 's2', 's3'].every(k => (ctx.silverApproved || {})[k]);
  const merged = !!ctx.prMerged;

  let state, body, action;
  if (merged) {
    state = { color: 'var(--status-ok)', bg: 'rgba(63,143,63,0.10)', label: 'Committed' };
    body = ctx.gitConnected
      ? `Latest silver build is committed to ${ctx.repoUrl || 'your remote repo'}.`
      : 'Latest silver build is committed to your local workspace.';
    action = null;
  } else if (!allApproved) {
    state = { color: 'var(--text-muted)', bg: 'var(--bg-inset)', label: 'Awaiting approvals' };
    body = 'Approve S1, S2, and S3 before committing. The chat will walk you through any pending reviews.';
    action = null;
  } else if (!ctx.gitConnected) {
    state = { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Ready to commit' };
    body = 'Silver build is ready. Commit locally for now, or connect a remote git repo first.';
    action = (
      <>
        <button className="walt-btn primary sm" onClick={onOpenPr}>
          <Icon name="git" size={11}/> Commit locally
        </button>
        <button className="walt-btn ghost sm" onClick={onConnectGit}>
          <Icon name="cloud" size={11}/> Connect git
        </button>
      </>
    );
  } else {
    state = { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Ready to commit' };
    body = `Silver build is ready. Walt will open a PR against ${ctx.repoUrl || 'your remote'}.`;
    action = (
      <button className="walt-btn primary sm" onClick={onOpenPr}>
        <Icon name="git" size={11}/> Open PR
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AgentBadge agent="governer" size="sm"/>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 999,
          background: state.bg, color: state.color, fontWeight: 600,
        }}>{state.label}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {ctx.gitConnected ? <><Icon name="cloud" size={11}/> {ctx.repoUrl || 'remote configured'}</> : <><Icon name="folder" size={11}/> local workspace</>}
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{body}</div>
      {action && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{action}</div>}
    </div>
  );
}

function KvBlock({ label, items, highlight }) {
  return (
    <div style={{
      background: highlight ? 'var(--accent-soft)' : 'var(--bg-inset)',
      border: '1px solid ' + (highlight ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-subtle)'),
      borderRadius: 10,
      padding: 10,
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <span style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
        color: highlight ? 'var(--accent)' : 'var(--text-muted)',
        fontWeight: 700,
      }}>{label}</span>
      <ul style={{
        margin: 0, padding: 0, listStyle: 'none',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        {items.map(it => (
          <li key={it} className="walt-mono" style={{
            fontSize: 11.5,
            color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
            wordBreak: 'break-word', fontWeight: highlight ? 500 : 400,
          }}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

const STATUS_META = {
  idle:     { label: 'Queued',     color: 'var(--text-muted)',   bg: 'var(--bg-inset)',              bar: 'var(--border-subtle)' },
  running:  { label: 'Running',    color: 'var(--accent)',       bg: 'rgba(54,86,198,0.10)',         bar: 'var(--accent)' },
  review:   { label: 'Needs review', color: 'var(--status-warn)',bg: 'rgba(206,93,42,0.10)',         bar: 'var(--status-warn)' },
  approved: { label: 'Approved',   color: 'var(--status-ok)',    bg: 'rgba(63,143,63,0.10)',         bar: 'var(--status-ok)' },
};

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.idle;
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 999,
      background: m.bg, color: m.color, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {status === 'running' && <span className="walt-dot run"/>}
      {status === 'approved' && <Icon name="check" size={9} color={m.color}/>}
      {m.label}
    </span>
  );
}

function SectionShell({ title, desc, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      {children}
    </section>
  );
}
