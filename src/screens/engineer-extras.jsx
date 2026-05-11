import React from 'react';
import { Walt, Icon, MiniSpark, MiniBars } from '../lib/components.jsx';
import { NavRail, StepDot, hilite } from './shared.jsx';

// ─────────────────────────────────────────────────────────────
//  PIPELINE DAG
// ─────────────────────────────────────────────────────────────
export function PipelineDAGScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <NavRail active="pipelines"/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SubHeader title="revenue_daily" sub="dag · 24 tasks · runs at 06:00 UTC daily"
          actions={[
            { icon: 'play', label: 'Run now', primary: true },
            { icon: 'branch', label: 'Branch' },
            { icon: 'sparkle', label: 'Ask Walt' },
            { icon: 'dots' },
          ]}/>
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <DAGCanvas/>
          <DAGInspector/>
        </div>
      </div>
    </div>
  );
}

export function SubHeader({ title, sub, actions = [], left }) {
  return (
    <div style={{
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 20px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
      </div>
      {actions.map((a, i) => (
        <button key={i} className={`walt-btn sm ${a.primary ? 'primary' : a.icon === 'dots' ? 'ghost' : ''}`}>
          <Icon name={a.icon} size={12}/> {a.label}
        </button>
      ))}
    </div>
  );
}

function DAGCanvas() {
  const nodes = [
    { id: 'stripe',  x: 70,  y: 80,  label: 'stripe.webhooks',     kind: 'source',  state: 'ok' },
    { id: 'pg',      x: 70,  y: 180, label: 'pg.production',        kind: 'source',  state: 'ok' },
    { id: 'segment', x: 70,  y: 280, label: 'segment.events',       kind: 'source',  state: 'ok' },
    { id: 'salesf',  x: 70,  y: 380, label: 'salesforce.crm',       kind: 'source',  state: 'ok' },
    { id: 'b1', x: 270, y: 60,  label: 'stg_stripe__charges',          kind: 'bronze', state: 'ok' },
    { id: 'b2', x: 270, y: 130, label: 'stg_stripe__payment_method',   kind: 'bronze', state: 'run' },
    { id: 'b3', x: 270, y: 200, label: 'stg_pg__orders',               kind: 'bronze', state: 'ok' },
    { id: 'b4', x: 270, y: 280, label: 'stg_segment__page_views',      kind: 'bronze', state: 'ok' },
    { id: 'b5', x: 270, y: 360, label: 'stg_salesforce__opportunities',kind: 'bronze', state: 'ok' },
    { id: 's1', x: 520, y: 100, label: 'customers',           kind: 'silver', state: 'ok' },
    { id: 's2', x: 520, y: 180, label: 'payment_methods',      kind: 'silver', state: 'pend' },
    { id: 's3', x: 520, y: 260, label: 'charges_conformed',    kind: 'silver', state: 'ok' },
    { id: 's4', x: 520, y: 340, label: 'sessions_enriched',    kind: 'silver', state: 'warn' },
    { id: 'g1', x: 780, y: 150, label: 'fct_revenue',          kind: 'gold',   state: 'idle' },
    { id: 'g2', x: 780, y: 240, label: 'mart_subscriptions',   kind: 'gold',   state: 'ok' },
    { id: 'g3', x: 780, y: 330, label: 'mart_growth',          kind: 'gold',   state: 'ok' },
    { id: 'd1', x: 990, y: 180, label: 'Revenue dashboard',    kind: 'sink',   state: 'idle' },
    { id: 'd2', x: 990, y: 280, label: 'semantic/revenue.yml', kind: 'sink',   state: 'idle' },
  ];
  const edges = [
    ['stripe', 'b1'], ['stripe', 'b2'], ['pg', 'b3'], ['segment', 'b4'], ['salesf', 'b5'],
    ['b1', 's1'], ['b1', 's3'], ['b3', 's1'], ['b3', 's3'],
    ['b2', 's2'], ['b4', 's4'], ['b5', 's1'],
    ['s1', 'g1'], ['s2', 'g1'], ['s3', 'g1'], ['s1', 'g2'], ['s3', 'g2'], ['s4', 'g3'], ['s1', 'g3'],
    ['g1', 'd1'], ['g1', 'd2'], ['g2', 'd1'],
  ];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const W = 1100, H = 480;
  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', background: 'var(--bg-app)', overflow: 'hidden' }}>
      <div className="walt-grid-bg" style={{ position: 'absolute', inset: 0 }}/>
      <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', pointerEvents: 'none' }}>
        {['Sources', 'Bronze', 'Silver', 'Gold', 'Surfaces'].map((c, i) => (
          <div key={i} style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 0.08,
            padding: '4px 10px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)', borderRadius: 999,
          }}>{c}</div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--border-strong)"/>
          </marker>
        </defs>
        {edges.map(([a, b], i) => {
          const A = byId[a], B = byId[b];
          if (!A || !B) return null;
          const x1 = A.x + 130, y1 = A.y + 16;
          const x2 = B.x,        y2 = B.y + 16;
          const mx = (x1 + x2) / 2;
          const running = A.state === 'run' || B.state === 'run';
          return (
            <path key={i}
              d={`M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              stroke={running ? 'var(--status-run)' : 'var(--border-strong)'}
              strokeWidth={running ? 1.6 : 1.2}
              strokeDasharray={running ? '4 4' : '0'}
              fill="none"
              markerEnd="url(#arr)"
              opacity={running ? 1 : 0.7}>
              {running && <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.8s" repeatCount="indefinite"/>}
            </path>
          );
        })}
        {nodes.map(n => <DAGNode key={n.id} {...n} active={n.id === 'b2'}/>)}
      </svg>
    </div>
  );
}

function DAGNode({ x, y, label, kind, state, active }) {
  const kindColor = {
    source: 'var(--text-muted)',
    bronze: 'var(--bronze)',
    silver: 'var(--silver)',
    gold:   'var(--gold)',
    sink:   'var(--accent)',
  }[kind];
  const w = 130, h = 32;
  return (
    <g>
      {active && <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx="8" fill="none" stroke={kindColor} strokeWidth="1.5" strokeDasharray="3 3"/>}
      <rect x={x} y={y} width={w} height={h} rx="6"
        fill="var(--bg-surface)" stroke={kindColor}
        opacity={state === 'idle' ? 0.55 : 1}/>
      <rect x={x} y={y} width={4} height={h} rx="2" fill={kindColor}/>
      <text x={x + 12} y={y + 20} fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="500">
        {label.length > 22 ? label.slice(0, 20) + '…' : label}
      </text>
      {state === 'run' && <circle cx={x + w - 10} cy={y + 11} r="3" fill="var(--status-run)">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/>
      </circle>}
      {state === 'pend' && <circle cx={x + w - 10} cy={y + 11} r="3" fill="var(--status-warn)"/>}
      {state === 'warn' && <circle cx={x + w - 10} cy={y + 11} r="3" fill="var(--status-warn)"/>}
      {state === 'ok'   && <circle cx={x + w - 10} cy={y + 11} r="2.5" fill="var(--status-ok)"/>}
    </g>
  );
}

function DAGInspector() {
  return (
    <div style={{
      width: 320, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      padding: 20, gap: 14,
    }}>
      <div>
        <span className="walt-chip bronze" style={{ textTransform: 'uppercase' }}>bronze</span>
        <div className="walt-mono" style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 8 }}>stg_stripe__payment_method_updated</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Incremental · merge on payment_method_id</div>
      </div>
      <div style={{
        padding: '10px 12px',
        background: 'rgba(125,207,255,0.08)',
        border: '1px solid rgba(125,207,255,0.25)',
        borderRadius: 10,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <span className="walt-dot run"/>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Running · step 2 of 4</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>INSERT 4,812 rows · 11.6s elapsed</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Inputs</div>
        <Pill icon="db" label="stripe.webhooks.payment_method_updated"/>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Outputs</div>
        <Pill icon="table" label="bronze.stg_stripe__payment_method_updated"/>
        <Pill icon="layers" label="downstream: dim_payment_method (silver)"/>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Last 7 runs</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 36 }}>
          {[12, 14, 11, 13, 12, 12, 12].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v * 2}px`, background: i === 6 ? 'var(--status-run)' : 'var(--status-ok)', opacity: 0.7, borderRadius: 2 }}/>
          ))}
        </div>
        <div className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>p50 12.0s · p95 14.2s · 0 failures · 7d</div>
      </div>
      <div style={{ flex: 1 }}/>
      <button className="walt-btn"><Icon name="sparkle" size={12}/> Ask Walt about this node</button>
    </div>
  );
}

function Pill({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 10px', marginBottom: 4,
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8, color: 'var(--text-secondary)',
    }}>
      <Icon name={icon} size={12} color="var(--text-muted)"/>
      <span className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MEDALLION BROWSER
// ─────────────────────────────────────────────────────────────
export function MedallionScreen() {
  const [mode, setMode] = React.useState('models');
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <NavRail active="medallion"/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SubHeader title="Pipelines · medallion" sub="acme · prod · 4 domains · 81 models"
          left={<div style={{ display: 'flex', gap: 2, padding: 2, background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 8, marginRight: 12 }}>
            {['models', 'dag'].map(m => (
              <button key={m} onClick={() => setMode(m)} className="walt-mono" style={{
                height: 24, padding: '0 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: mode === m ? 'var(--bg-surface)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.04,
              }}>{m === 'models' ? 'Models' : 'DAG'}</button>
            ))}
          </div>}
          actions={[
            { icon: 'sparkle', label: 'Ask Walt' },
            { icon: 'plus', label: 'New model', primary: true },
          ]}/>
        {mode === 'dag' ? <div style={{ flex: 1, display: 'flex', minWidth: 0 }}><DAGCanvas/><DAGInspector/></div> : null}
        {mode === 'models' ? <MedallionGrid/> : null}
      </div>
    </div>
  );
}

function MedallionGrid() {
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--border-subtle)', overflow: 'hidden' }}>
      <MedallionCol tier="bronze" count="42" subtitle="staged · contract-typed"
        models={[
          { n: 'stg_stripe__charges', m: '2.1M rows · 4m ago · 12s', state: 'ok' },
          { n: 'stg_stripe__pm_updated', m: '4.8k rows · 1m ago · 12s', state: 'run' },
          { n: 'stg_pg__orders', m: '12M rows · 6m ago · 38s', state: 'ok' },
          { n: 'stg_pg__users', m: '1.4M rows · 6m ago · 9s', state: 'ok' },
          { n: 'stg_segment__pages', m: '88M rows · 12m ago · 2.4m', state: 'ok' },
          { n: 'stg_segment__tracks', m: '142M rows · 12m ago · 4.1m', state: 'ok' },
          { n: 'stg_salesforce__opp', m: '64k rows · 1h ago · 22s', state: 'ok' },
          { n: 'stg_zendesk__tickets', m: '212k rows · 2h ago · 18s', state: 'warn' },
        ]}/>
      <MedallionCol tier="silver" count="28" subtitle="conformed · de-duped · pii-handled · entity-level"
        models={[
          { n: 'customers', m: '880k rows · 8m ago · natural key: customer_id', state: 'ok' },
          { n: 'payment_methods', m: 'pending · awaiting key decision', state: 'pend' },
          { n: 'products', m: '142 rows · 1d ago', state: 'ok' },
          { n: 'charges_conformed', m: '2.1M rows · 4m ago', state: 'ok' },
          { n: 'subscriptions', m: '88k rows · 14m ago', state: 'ok' },
          { n: 'sessions_enriched', m: 'row-count drift 6.4%', state: 'warn' },
        ]}/>
      <MedallionCol tier="gold" count="11" subtitle="business-ready · facts + dimensions · semantic-modelled"
        models={[
          { n: 'fct_revenue', m: 'serves: revenue dash · semantic', state: 'ok' },
          { n: 'fct_engagement', m: 'serves: growth · marketing', state: 'ok' },
          { n: 'dim_customer', m: 'SCD2 · 880k members', state: 'ok' },
          { n: 'mart_subscriptions', m: 'serves: ARR + cohorts', state: 'ok' },
          { n: 'mart_growth', m: 'serves: marketing attribution', state: 'ok' },
          { n: 'mart_finance', m: 'serves: deferred revenue', state: 'ok' },
        ]}/>
    </div>
  );
}

function MedallionCol({ tier, count, subtitle, models }) {
  return (
    <div style={{ background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '16px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span className={`walt-chip ${tier}`} style={{ height: 26, padding: '0 10px', fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{tier}</span>
          <span className="walt-mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{count} models</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{subtitle}</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
        {models.map((m, i) => (
          <div key={i} style={{
            padding: '11px 12px', marginBottom: 6,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            display: 'flex', flexDirection: 'column', gap: 4,
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="table" size={12} color={`var(--${tier})`}/>
              <span className="walt-mono" style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.n}</span>
              <StepDot state={m.state}/>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.m}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SQL EDITOR (with AI assist)
// ─────────────────────────────────────────────────────────────
export function SQLEditorScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <NavRail active="sql"/>
      <CatalogSidebar/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SubHeader title="cohort_decomp.sql" sub="snowflake · prod_warehouse · ran 23s ago"
          actions={[
            { icon: 'sparkle', label: 'Ask Walt to improve' },
            { icon: 'play', label: 'Run', primary: true },
          ]}/>
        <SQLEditor/>
        <SQLResults/>
      </div>
    </div>
  );
}

function CatalogSidebar() {
  return (
    <div style={{
      width: 240, flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      padding: '14px 0',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="db" size={14} color="var(--text-muted)"/>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>snowflake · prod</span>
        <span className="walt-chip ok" style={{ marginLeft: 'auto', height: 16, padding: '0 5px', fontSize: 9 }}>cloud</span>
      </div>
      <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }} title="Active git branch · 2 files with unsaved local edits">
        <Icon name="branch" size={11}/>
        <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>feat/cohort-decomp</span>
        <span style={{ color: 'var(--status-warn)' }}>2 unsaved</span>
        <span style={{ marginLeft: 'auto' }} className="walt-mono">~/repos/analytics</span>
      </div>
      <CatalogTree/>
    </div>
  );
}

function CatalogTree() {
  const items = [
    { d: 0, n: 'raw',        kind: 'schema' },
    { d: 0, n: 'bronze',     kind: 'schema', open: true, badge: 'bronze' },
    { d: 1, n: 'stg_stripe__charges',           kind: 'table' },
    { d: 1, n: 'stg_stripe__payment_method',    kind: 'table', state: 'run' },
    { d: 1, n: 'stg_pg__orders',                kind: 'table' },
    { d: 1, n: 'stg_segment__pages',            kind: 'table' },
    { d: 0, n: 'silver',     kind: 'schema', open: true, badge: 'silver' },
    { d: 1, n: 'customers',                     kind: 'table' },
    { d: 1, n: 'payment_methods',               kind: 'table', state: 'pend' },
    { d: 1, n: 'charges_conformed',             kind: 'table' },
    { d: 1, n: 'subscriptions',                 kind: 'table' },
    { d: 0, n: 'gold',       kind: 'schema', open: true, badge: 'gold' },
    { d: 1, n: 'fct_revenue',                   kind: 'table', active: true },
    { d: 2, n: 'date_id',           kind: 'col', t: 'date' },
    { d: 2, n: 'customer_id',       kind: 'col', t: 'string' },
    { d: 2, n: 'cohort_label',      kind: 'col', t: 'string' },
    { d: 2, n: 'mrr',               kind: 'col', t: 'numeric' },
    { d: 2, n: 'arr',               kind: 'col', t: 'numeric' },
    { d: 1, n: 'mart_subscriptions',            kind: 'table' },
    { d: 1, n: 'mart_growth',                   kind: 'table' },
  ];
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 16px', paddingLeft: 16 + it.d * 12,
          fontSize: 12, color: 'var(--text-secondary)',
          background: it.active ? 'var(--bg-inset)' : 'transparent',
        }}>
          {it.kind === 'schema'
            ? <Icon name={it.open ? 'chevD' : 'chevR'} size={10} color="var(--text-muted)"/>
            : <span style={{ width: 10 }}/>}
          <Icon
            name={it.kind === 'schema' ? 'db' : it.kind === 'table' ? 'table' : 'minus'}
            size={11}
            color={it.kind === 'col' ? 'var(--text-dim)' : 'var(--text-muted)'}
          />
          <span className="walt-mono" style={{ flex: 1, color: it.kind === 'col' ? 'var(--text-secondary)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: it.kind === 'col' ? 11 : 12 }}>{it.n}</span>
          {it.t && <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{it.t}</span>}
          {it.badge && <span className={`walt-chip ${it.badge}`} style={{ height: 14, padding: '0 4px', fontSize: 9 }}>{it.badge}</span>}
          {it.state && <StepDot state={it.state}/>}
        </div>
      ))}
    </div>
  );
}

function SQLEditor() {
  const lines = [
    { n: 1, t: '-- cohort decomposition for w18 mrr investigation' },
    { n: 2, t: 'with weekly as (' },
    { n: 3, t: "  select date_trunc('week', activity_date) as week," },
    { n: 4, t: "         cohort_label," },
    { n: 5, t: "         sum(mrr) as mrr" },
    { n: 6, t: "  from gold.fct_revenue" },
    { n: 7, t: "  join silver.dim_cohort using (customer_id)" },
    { n: 8, t: "  where activity_date >= dateadd(week, -14, current_date)" },
    { n: 9, t: "  group by 1, 2" },
    { n: 10, t: '),' },
    { n: 11, t: 'lagged as (' },
    { n: 12, t: '  select *,' },
    { n: 13, t: "    lag(mrr) over (partition by cohort_label order by week) as mrr_prev" },
    { n: 14, t: '  from weekly' },
    { n: 15, t: ')' },
    { n: 16, t: 'select week, cohort_label, mrr,' },
    { n: 17, t: '       mrr - mrr_prev as delta,', ghost: ' -- walt: add safe-divide for % change' },
    { n: 18, t: '       div0(mrr - mrr_prev, mrr_prev) as delta_pct', suggest: true },
    { n: 19, t: 'from lagged' },
    { n: 20, t: 'order by week desc, abs(delta) desc;' },
    { n: 21, t: '|', cursor: true },
  ];
  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', background: 'var(--code-bg)', overflow: 'auto' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.65, padding: '14px 0' }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'baseline',
            background: l.suggest ? 'rgba(187,154,247,0.10)' : i === 16 ? 'rgba(122,162,247,0.05)' : 'transparent',
          }}>
            <span style={{ width: 44, flexShrink: 0, textAlign: 'right', padding: '0 14px 0 0', color: 'var(--text-dim)' }}>{l.n}</span>
            <span style={{ flex: 1, color: l.suggest ? 'var(--semantic)' : 'var(--text-primary)', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: hilite(l.t) }}/>
            {l.ghost && <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '0 14px' }}>{l.ghost}</span>}
            {l.suggest && <span style={{ padding: '0 14px', fontSize: 11, color: 'var(--semantic)' }}><span className="walt-mono">tab</span> to accept</span>}
          </div>
        ))}
      </div>
      <div style={{
        position: 'absolute', right: 20, top: 14,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px 6px 8px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 999,
        boxShadow: 'var(--shadow-md)',
      }}>
        <Walt size={18}/>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Walt suggests <span style={{ color: 'var(--text-primary)' }}>safe % change</span></span>
        <button className="walt-btn primary sm" style={{ height: 22, padding: '0 8px' }}>Accept</button>
      </div>
    </div>
  );
}

function SQLResults() {
  const rows = [
    ['2026-05-04', '24-Q3 SMB · annual', '312k', '−42k', '−12%'],
    ['2026-05-04', '24-Q2 SMB · annual', '298k', '−6k',  '−2%'],
    ['2026-05-04', '24-Q1 + older',      '612k', '+2k',  '+0.3%'],
    ['2026-05-04', 'New 25',             '98k',  '+18k', '+22%'],
    ['2026-04-27', '24-Q3 SMB · annual', '354k', '−4k',  '−1.1%'],
    ['2026-04-27', '24-Q2 SMB · annual', '304k', '+1k',  '+0.3%'],
  ];
  return (
    <div style={{
      height: 220, flexShrink: 0,
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '0 18px',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: 12, color: 'var(--text-secondary)',
      }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Results</span>
        <span className="walt-mono" style={{ color: 'var(--text-muted)' }}>56 rows · 1.4s · 2.3MB scanned</span>
        <div style={{ flex: 1 }}/>
        <button className="walt-btn ghost sm"><Icon name="chart" size={11}/> Visualize</button>
        <button className="walt-btn ghost sm"><Icon name="download" size={11}/> Export</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
          padding: '8px 18px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 0.04, borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky', top: 0, background: 'var(--bg-surface)',
        }}>
          <span>week</span><span>cohort_label</span><span>mrr</span><span>delta</span><span>delta_pct</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
            padding: '6px 18px', fontSize: 12, fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)',
          }}>
            {r.map((c, j) => (
              <span key={j} style={{
                color: j >= 3 ? (c.startsWith('−') ? 'var(--status-err)' : c.startsWith('+') ? 'var(--status-ok)' : 'var(--text-primary)') : 'var(--text-primary)',
              }}>{c}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DATA CATALOG (table detail)
// ─────────────────────────────────────────────────────────────
export function CatalogScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <NavRail active="catalog"/>
      <CatalogSidebar/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SubHeader title="gold.fct_revenue" sub="serves 8 dashboards · refreshed every 15 min"
          actions={[
            { icon: 'sparkle', label: 'Explain this table' },
            { icon: 'eye', label: 'Open lineage' },
          ]}/>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 0 }}>
          <CatalogTableDetail/>
          <CatalogSidePanel/>
        </div>
      </div>
    </div>
  );
}

function CatalogTableDetail() {
  return (
    <div style={{ overflowY: 'auto', padding: 24 }}>
      <div style={{
        padding: 16, marginBottom: 18,
        background: 'rgba(187,154,247,0.08)',
        border: '1px solid rgba(187,154,247,0.20)',
        borderRadius: 10,
        display: 'flex', gap: 12,
      }}>
        <Walt size={28}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--semantic)', marginBottom: 2 }}>WALT'S TABLE NOTE</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>
            <span style={{ fontWeight: 600 }}>fct_revenue</span> is the gold-tier source of truth for MRR/ARR. Joined to <span className="walt-mono">dim_customer</span> and <span className="walt-mono">dim_cohort</span>. Treats negative MRR (refunds) as separate ledger entries — sum to net. Backs 8 dashboards and the <span className="walt-mono">revenue.yml</span> semantic model.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
        {[
          { l: 'Rows',         v: '12.4M' },
          { l: 'Size',         v: '2.1 GB' },
          { l: 'Refresh',      v: 'every 15m' },
          { l: 'Freshness',    v: '4m ago' },
        ].map((k, i) => (
          <div key={i} className="walt-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{k.l}</div>
            <div className="walt-mono" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Columns</div>
      <div className="walt-card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.7fr 0.7fr 1fr 1fr',
          padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 0.04, borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span>Column</span><span>Type</span><span title="% of rows where this column is empty/NULL">Empty %</span><span title="Number of unique values in this column">Unique</span><span>Tags</span><span>Distribution</span>
        </div>
        {[
          { n: 'date_id',        t: 'date',    nu: '0%',  dx: '824',     tag: ['pk part'], d: [5,6,7,8,9,11,12,10,8,7] },
          { n: 'customer_id',    t: 'string',  nu: '0%',  dx: '880k',    tag: ['pk part', 'fk'], d: [3,5,7,8,10,12,11,9,8,6] },
          { n: 'cohort_label',   t: 'string',  nu: '0%',  dx: '24',      tag: ['semantic dim'], d: [12,8,6,9,11,7,4,5,3,2] },
          { n: 'plan_term',      t: 'enum',    nu: '0%',  dx: '3',       tag: ['semantic dim'], d: [12,8,3] },
          { n: 'mrr',            t: 'numeric', nu: '0%',  dx: '—',       tag: ['measure'], d: [4,6,8,10,11,12,11,9,7,5] },
          { n: 'arr',            t: 'numeric', nu: '0%',  dx: '—',       tag: ['measure'], d: [4,6,8,10,11,12,11,9,7,5] },
          { n: 'is_refund',      t: 'bool',    nu: '0%',  dx: '2',       tag: [], d: [11,1] },
          { n: 'updated_at',     t: 'ts',      nu: '0%',  dx: '12.3M',   tag: ['freshness'], d: [5,6,7,8,9,10,11,12] },
        ].map((c, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.7fr 0.7fr 1fr 1fr',
            padding: '10px 16px', fontSize: 12, alignItems: 'center',
            borderBottom: i < 7 ? '1px solid var(--border-subtle)' : 0,
          }}>
            <span className="walt-mono" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.n}</span>
            <span className="walt-chip" style={{ width: 'fit-content' }}>{c.t}</span>
            <span style={{ color: 'var(--text-muted)' }}>{c.nu}</span>
            <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{c.dx}</span>
            <span style={{ display: 'flex', gap: 4 }}>
              {c.tag.map((tg, j) => (
                <span key={j} className={`walt-chip ${tg.includes('semantic') ? 'semantic' : tg.includes('measure') ? 'accent' : ''}`} style={{ fontSize: 10, height: 18 }}>{tg}</span>
              ))}
            </span>
            <span>{c.d ? <MiniBars values={c.d} width={70} height={16}/> : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogSidePanel() {
  return (
    <div style={{
      borderLeft: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      padding: 20, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Owners</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Avatar initials="RJ" color="linear-gradient(135deg, #5A87EA, #BB9AF7)"/>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>Riya Joshi</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Data platform · primary</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
          <Walt size={28}/>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>Walt</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>maintains schema · monitors freshness</div>
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Used by</div>
        <Pill icon="chart" label="Revenue dashboard"/>
        <Pill icon="chart" label="CFO weekly"/>
        <Pill icon="schema" label="semantic/revenue.yml"/>
        <Pill icon="notebook" label="w18-mrr-investigation"/>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Recent activity</div>
        {[
          { icon: 'check', t: 'Refreshed · 4m ago · 12.4M rows', c: 'var(--status-ok)' },
          { icon: 'sparkle', t: 'Walt added cohort_label · 2h ago', c: 'var(--semantic)' },
          { icon: 'msg', t: 'Riya commented on column mrr · 1d', c: 'var(--text-muted)' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            <Icon name={a.icon} size={12} color={a.c}/>{a.t}
          </div>
        ))}
      </div>
    </div>
  );
}

function Avatar({ initials, color }) {
  return (
    <div style={{
      width: 28, height: 28, flexShrink: 0,
      borderRadius: 999, background: color,
      color: 'white', fontSize: 11, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{initials}</div>
  );
}

// ─────────────────────────────────────────────────────────────
//  OBSERVABILITY · job runs
// ─────────────────────────────────────────────────────────────
export function ObservabilityScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <NavRail active="runs"/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <SubHeader title="Job runs · across the stack" sub="airflow · dbt · sqlmesh · warehouse · last 24h"
          actions={[
            { icon: 'sparkle', label: 'Ask Walt in new session' },
          ]}/>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <RunStats/>
          <RunsTable/>
        </div>
      </div>
    </div>
  );
}

function RunStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
      {[
        { l: 'Success rate · 7d', v: '99.2%', d: '+0.1pt', t: 'ok',  spark: [97,98,99,99,99,99,99] },
        { l: 'p50 run · 7d',      v: '38s',   d: '−4s',    t: 'ok',  spark: [44,42,40,41,39,38,38] },
        { l: 'Active now',        v: '4',     d: '',       t: 'info', spark: [3,4,5,2,3,4,4] },
        { l: 'Open incidents',    v: '2',     d: '+1',     t: 'warn', spark: [1,1,0,2,1,2,2] },
      ].map((k, i) => (
        <div key={i} className="walt-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{k.l}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div className="walt-mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>{k.v}</div>
            <div style={{ fontSize: 12, color: k.t === 'ok' ? 'var(--status-ok)' : k.t === 'warn' ? 'var(--status-warn)' : 'var(--accent)', fontWeight: 600 }}>{k.d}</div>
          </div>
          <div style={{ marginTop: 8 }}>
            <MiniSpark values={k.spark} width={220} height={26} color={k.t === 'ok' ? 'var(--status-ok)' : k.t === 'warn' ? 'var(--status-warn)' : 'var(--accent)'}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function RunsTable() {
  const runs = [
    { pipe: 'stripe_pm_onboarding', state: 'run',  t: 'just now',    dur: '0:11', who: 'Walt', layer: 'bronze' },
    { pipe: 'revenue_daily',        state: 'ok',   t: '4m ago',      dur: '4:12', who: 'cron', layer: 'gold' },
    { pipe: 'fct_engagement',       state: 'warn', t: '18m ago',     dur: '2:08', who: 'cron', layer: 'silver', note: 'row drift 6.4%' },
    { pipe: 'mart_growth',          state: 'ok',   t: '1h ago',      dur: '1:42', who: 'cron', layer: 'gold' },
    { pipe: 'mart_finance',         state: 'err',  t: '2h ago',      dur: '0:08', who: 'cron', layer: 'gold', note: 'permission denied · raw.payouts' },
    { pipe: 'salesforce_backfill',  state: 'ok',   t: '4h ago',      dur: '38:14',who: 'Riya', layer: 'bronze' },
    { pipe: 'stg_segment__tracks',  state: 'ok',   t: '6h ago',      dur: '4:01', who: 'cron', layer: 'bronze' },
    { pipe: 'customers',            state: 'ok',   t: '6h ago',      dur: '0:22', who: 'cron', layer: 'silver' },
  ];
  return (
    <div className="walt-card" style={{ overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '0.6fr 2fr 1fr 0.8fr 0.8fr 1.4fr',
        padding: '10px 18px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: 0.04, borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span>State</span><span>Pipeline</span><span>Started</span><span>Duration</span><span>Triggered</span><span>Note</span>
      </div>
      {runs.map((r, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '0.6fr 2fr 1fr 0.8fr 0.8fr 1.4fr',
          padding: '12px 18px', fontSize: 13, alignItems: 'center',
          borderBottom: i < runs.length - 1 ? '1px solid var(--border-subtle)' : 0,
        }}>
          <span><RunBadge state={r.state}/></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`walt-chip ${r.layer}`} style={{ height: 18, padding: '0 6px', fontSize: 10, textTransform: 'uppercase' }}>{r.layer}</span>
            <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>{r.pipe}</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{r.t}</span>
          <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{r.dur}</span>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {r.who === 'Walt' ? <Walt size={16}/> : <Icon name={r.who === 'cron' ? 'clock' : 'user'} size={12} color="var(--text-muted)"/>}
            {r.who}
          </span>
          <span style={{ color: r.state === 'err' ? 'var(--status-err)' : r.state === 'warn' ? 'var(--status-warn)' : 'var(--text-muted)' }}>
            {r.note || '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

function RunBadge({ state }) {
  const label = { ok: 'ok', run: 'running', warn: 'warn', err: 'failed' }[state];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 8px 2px 7px', borderRadius: 999,
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)',
    }}>
      <span className={`walt-dot ${state}`}/>
      {label}
    </span>
  );
}
