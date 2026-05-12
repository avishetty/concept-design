import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { AGENTS, AGENT_ORDER } from '../agents.js';
import { AgentAvatar } from '../components/AgentBadge.jsx';
import { PageHeader } from './CatalogPage.jsx';

const RUNS = [
  { id: 'r-2026-05-11-1812', agent: 'ingestor',    when: '2 min ago',  duration: '34s',  state: 'ok',   summary: 'GL.journal_entries · +14,290 rows · cdc batch 9182' },
  { id: 'r-2026-05-11-1809', agent: 'transformer', when: '6 min ago',  duration: '12s',  state: 'ok',   summary: 's2_typecast.finance_ar_invoices · 0 quarantined' },
  { id: 'r-2026-05-11-1807', agent: 'reasoner',    when: '8 min ago',  duration: '4m',   state: 'run',  summary: 'entity_graph · customer_id ↔ erp.customer_no — resolving 18.9k → 16.2k' },
  { id: 'r-2026-05-11-1805', agent: 'operator',    when: '10 min ago', duration: '2s',   state: 'warn', summary: 'drift · bronze.ap.invoices added column tax_jurisdiction' },
  { id: 'r-2026-05-11-1802', agent: 'governer',    when: '12 min ago', duration: '1s',   state: 'ok',   summary: 'policy · masking applied to bronze.ap.vendors.vendor_name' },
  { id: 'r-2026-05-11-1758', agent: 'transformer', when: '16 min ago', duration: '52s',  state: 'ok',   summary: 'PR #142 · CI green · 312 expectations evaluated' },
  { id: 'r-2026-05-11-1742', agent: 'ingestor',    when: '32 min ago', duration: '1m12s',state: 'ok',   summary: 'sample → full ingest · stripe.charges · 1.2M rows' },
];

export function RunsPage() {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? RUNS : RUNS.filter(r => r.agent === filter);
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: 'var(--bg-app)',
    }}>
      <PageHeader title="Agent Runs" subtitle="Live agent activity across finance-platform. Streaming from Walt."/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 32px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Now strip */}
          <NowStrip/>

          {/* Filter chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All agents · {RUNS.length}</FilterChip>
            {AGENT_ORDER.map(k => {
              const a = AGENTS[k];
              const count = RUNS.filter(r => r.agent === k).length;
              return (
                <FilterChip
                  key={k}
                  active={filter === k}
                  color={a.color}
                  onClick={() => setFilter(k)}
                >
                  <AgentAvatar agent={k} size={16}/>
                  {a.name}
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>· {count}</span>
                </FilterChip>
              );
            })}
          </div>

          {/* Run log */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {filtered.map((r, i) => (
              <Row key={r.id} run={r} first={i === 0}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NowStrip() {
  const running = RUNS.filter(r => r.state === 'run').length;
  const warns   = RUNS.filter(r => r.state === 'warn').length;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 14, alignItems: 'center',
    }}>
      <Kpi label="Running now"     value={String(running)} accent="run"/>
      <Kpi label="Needs attention" value={String(warns)}   accent="warn"/>
      <Kpi label="Successful · 24h" value="412"            accent="ok"/>
      <Kpi label="Avg cost · run"  value="$0.08"/>
      <Kpi label="MTTR · 7d"       value="3m 22s"/>
    </div>
  );
}

function Kpi({ label, value, accent }) {
  const colors = { ok: 'var(--status-ok)', warn: 'var(--status-warn)', run: 'var(--status-run)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span className="walt-mono" style={{
        fontSize: 18, fontVariantNumeric: 'tabular-nums', fontWeight: 600,
        color: accent ? colors[accent] : 'var(--text-primary)',
      }}>{value}</span>
    </div>
  );
}

function FilterChip({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px',
        borderRadius: 999,
        border: active ? '1px solid ' + (color || 'var(--accent)') : '1px solid var(--border-subtle)',
        background: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
        color: active ? (color || 'var(--accent)') : 'var(--text-secondary)',
        fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Row({ run, first }) {
  const a = AGENTS[run.agent];
  const stateColor = run.state === 'ok'   ? 'var(--status-ok)' :
                     run.state === 'warn' ? 'var(--status-warn)' :
                                            'var(--status-run)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 16px',
      borderTop: first ? 'none' : '1px solid var(--border-subtle)',
    }}>
      <AgentAvatar agent={run.agent} size={22}/>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{a.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {a.role}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{run.summary}</span>
      </div>
      <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{run.id}</span>
      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', minWidth: 64, textAlign: 'right' }}>{run.duration}</span>
      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', minWidth: 80, textAlign: 'right' }}>{run.when}</span>
      <span style={{
        width: 8, height: 8, borderRadius: 999,
        background: stateColor,
        boxShadow: run.state === 'run' ? '0 0 0 3px color-mix(in srgb, ' + stateColor + ' 25%, transparent)' : 'none',
      }}/>
    </div>
  );
}
