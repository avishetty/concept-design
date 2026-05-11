import React from 'react';
import { Walt, Icon, MiniSpark } from '../lib/components.jsx';
import { TabBtn, hilite } from './shared.jsx';

export function AnalystApp() {
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <AnalystRail/>
      <AnalystAsk/>
      <AnalystArtifact/>
    </div>
  );
}

function AnalystRail() {
  const items = [
    { key: 'ask',     icon: 'sparkle', label: 'Ask Walt' },
    { key: 'metrics', icon: 'chart',   label: 'Metrics' },
    { key: 'dash',    icon: 'layers',  label: 'Dashboards' },
    { key: 'note',    icon: 'notebook',label: 'Notebooks' },
    { key: 'cat',     icon: 'db',      label: 'Catalog' },
  ];
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      padding: '16px 12px',
    }}>
      <div style={{ padding: '4px 8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Walt size={28} expression="happy"/>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Walt</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>your analyst pair</div>
        </div>
      </div>
      <button className="walt-btn primary" style={{ marginBottom: 14 }}>
        <Icon name="sparkle" size={13}/> Ask a new question
      </button>
      {items.map((it, i) => (
        <div key={it.key} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 32, padding: '0 10px', borderRadius: 7, cursor: 'pointer',
          color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: i === 0 ? 'var(--bg-inset)' : 'transparent',
          fontSize: 13, fontWeight: i === 0 ? 600 : 500,
        }}>
          <Icon name={it.icon} size={14}/> {it.label}
        </div>
      ))}
      <div style={{ flex: 1 }}/>
      <div style={{
        padding: 12, borderRadius: 10,
        background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>RECENT</div>
        {[
          'Why did MRR dip in week 18?',
          'Top 10 churning cohorts',
          'Payout reconciliation · April',
        ].map((q, i) => (
          <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0', cursor: 'pointer' }}>{q}</div>
        ))}
      </div>
    </div>
  );
}

function AnalystAsk() {
  return (
    <div style={{
      flex: 1, minWidth: 0, maxWidth: 600,
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border-subtle)',
    }}>
      <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="walt-chip semantic"><Icon name="sparkle" size={10}/> Question</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>asked 8:42am · revenue domain</span>
        </div>
        <div className="walt-serif" style={{ fontSize: 26, lineHeight: 1.2, color: 'var(--text-primary)', letterSpacing: -0.01, marginTop: 6 }}>
          Why did monthly recurring revenue dip in week 18 — and which cohort caused it?
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 16px' }}>
        <AnalystAnswer/>
      </div>

      <div style={{ padding: '14px 24px 18px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{
          border: '1px solid var(--border-default)',
          background: 'var(--bg-elevated)',
          borderRadius: 12,
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', minHeight: 36 }}>
            Ask a follow-up · Walt remembers this thread…
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="walt-chip"><Icon name="schema" size={10}/> revenue.yml</div>
            <div className="walt-chip"><Icon name="clock" size={10}/> last 90 days</div>
            <div style={{ flex: 1 }}/>
            <button className="walt-btn primary sm" style={{ height: 28 }}>
              <Icon name="arrowUp" size={12}/> Ask
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {['Break down by acquisition channel', 'Show me retention curves', 'Forecast week 19'].map((q, i) => (
            <button key={i} className="walt-btn ghost sm" style={{ borderRadius: 999, border: '1px solid var(--border-default)' }}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalystAnswer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Walt size={28}/>
        <div style={{ paddingTop: 2, fontSize: 13, color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Walt</span> · queried <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>gold.fct_revenue</span> + <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>dim_cohort</span> · 1.2s
        </div>
      </div>

      <div style={{
        padding: 18, borderRadius: 12,
        background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Short answer</div>
        <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text-primary)' }}>
          MRR fell <span style={{ color: 'var(--status-err)', fontWeight: 600 }}>−$48.2k (−3.1%)</span> in week 18. <span style={{ fontWeight: 600 }}>87%</span> of the dip is concentrated in the <span style={{ color: 'var(--accent)', fontWeight: 600 }}>SMB · self-serve · 2024-Q3 acquisition cohort</span> — their net retention collapsed from <span className="walt-mono">96%</span> to <span className="walt-mono" style={{ color: 'var(--status-err)' }}>82%</span> as their annual plans came up for renewal.
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Stat label="MRR change"      value="−$48.2k" tone="err"/>
          <Stat label="Cohort"           value="SMB · 24-Q3"/>
          <Stat label="Renewal contribution" value="87%"/>
          <Stat label="Confidence"       value="High"  tone="ok"/>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>How Walt got there</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { i: 'sparkle', t: 'Parsed metric: monthly_recurring_revenue from semantic layer · revenue.yml' },
            { i: 'code',    t: 'Generated 1 SQL — windowed week-over-week delta, materialized as artifact' },
            { i: 'flow',    t: 'Decomposed delta by 3 dimensions; isolated cohort × plan_term as ≥80% of variance' },
            { i: 'check',   t: 'Cross-checked against last 12 weeks: this pattern is not seasonal' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              fontSize: 13, color: 'var(--text-secondary)',
            }}>
              <div style={{
                width: 22, height: 22, flexShrink: 0,
                background: 'var(--semantic-soft)', color: 'var(--semantic)',
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name={s.i} size={12}/></div>
              {s.t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === 'err' ? 'var(--status-err)' : tone === 'ok' ? 'var(--status-ok)' : 'var(--text-primary)';
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div className="walt-mono" style={{ fontSize: 18, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

function AnalystArtifact() {
  const [tab, setTab] = React.useState('dash');
  return (
    <div style={{ flex: 1, minWidth: 0, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: 52, flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 4,
      }}>
        <TabBtn active={tab === 'dash'} onClick={() => setTab('dash')} icon="chart" label="Dashboard"/>
        <TabBtn active={tab === 'sql'} onClick={() => setTab('sql')} icon="code" label="SQL"/>
        <TabBtn active={tab === 'note'} onClick={() => setTab('note')} icon="notebook" label="Notebook"/>
        <TabBtn active={tab === 'deck'} onClick={() => setTab('deck')} icon="layers" label="Slides"/>
        <div style={{ flex: 1 }}/>
        <button className="walt-btn ghost sm"><Icon name="download" size={12}/></button>
        <button className="walt-btn sm"><Icon name="user" size={12}/> Share</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {tab === 'dash' && <AnalystDashboard/>}
        {tab === 'sql' && <AnalystSQL/>}
        {tab === 'note' && <AnalystNotebook/>}
        {tab === 'deck' && <AnalystDeck/>}
      </div>
    </div>
  );
}

function AnalystDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="walt-serif" style={{ fontSize: 24, color: 'var(--text-primary)' }}>Week-18 MRR dip · cohort decomposition</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Live · refreshed 2 min ago from <span className="walt-mono">gold.fct_revenue</span></div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="walt-chip"><Icon name="clock" size={10}/> 90d</span>
          <span className="walt-chip"><Icon name="schema" size={10}/> by cohort</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { l: 'MRR · current',      v: '$1.49M', d: '−3.1%', t: 'err', spark: [12,12.2,12.1,12.4,12.3,12.5,12.6,12.4,12.3,12.5,12.1,12.0,11.7] },
          { l: 'Net new ARR',        v: '$92k',   d: '−18%',  t: 'err', spark: [7,8,9,7,10,11,9,12,11,10,8,7,6] },
          { l: 'Logo churn',         v: '1.8%',   d: '+0.4pt',t: 'warn',spark: [2,2,3,2,3,3,4,3,4,3,4,4,5] },
          { l: 'Renewal rate · SMB', v: '82%',    d: '−14pt', t: 'err', spark: [10,11,10,12,11,12,11,12,10,11,8,9,8] },
        ].map((k, i) => (
          <div key={i} className="walt-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{k.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'space-between' }}>
              <div className="walt-mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>{k.v}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: k.t === 'err' ? 'var(--status-err)' : k.t === 'warn' ? 'var(--status-warn)' : 'var(--status-ok)' }}>{k.d}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <MiniSpark values={k.spark} width={200} height={28} color={k.t === 'err' ? 'var(--status-err)' : k.t === 'warn' ? 'var(--status-warn)' : 'var(--accent)'}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
        <div className="walt-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>MRR by week · stacked by cohort</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
              <LegDot c="var(--gold)" l="24-Q3 SMB"/>
              <LegDot c="var(--silver)" l="24-Q2"/>
              <LegDot c="var(--bronze)" l="24-Q1 + older"/>
              <LegDot c="var(--accent)" l="New 25"/>
            </div>
          </div>
          <MRRChart/>
        </div>
        <div className="walt-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Variance contribution</div>
          <Waterfall/>
        </div>
      </div>

      <div className="walt-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Cohort detail</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <span className="walt-chip">grouped by acquisition · plan_term</span>
          </div>
        </div>
        <CohortTable/>
      </div>
    </div>
  );
}

function LegDot({ c, l }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: c }}/>{l}
    </span>
  );
}

function MRRChart() {
  const weeks = 14;
  const data = Array.from({ length: weeks }, (_, i) => {
    const old   = 600 + Math.sin(i * 0.4) * 10;
    const q1    = 280 + Math.sin(i * 0.3 + 1) * 8;
    const q2    = 320 + i * 2;
    const q3    = i < 11 ? 260 + i * 4 : i === 11 ? 290 : i === 12 ? 268 : 220;
    const new25 = i < 8 ? 0 : (i - 7) * 14;
    return { old, q1, q2, q3, new25 };
  });
  const W = 560, H = 200, pad = { l: 36, r: 12, t: 10, b: 28 };
  const totals = data.map(d => d.old + d.q1 + d.q2 + d.q3 + d.new25);
  const maxY = Math.max(...totals) * 1.05;
  const bw = (W - pad.l - pad.r) / weeks * 0.7;
  const gap = (W - pad.l - pad.r) / weeks * 0.3;
  const x = i => pad.l + i * (bw + gap) + gap / 2;
  const y = v => pad.t + (H - pad.t - pad.b) * (1 - v / maxY);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const yy = pad.t + (H - pad.t - pad.b) * (1 - t);
        return <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={yy} y2={yy} stroke="var(--border-subtle)" strokeWidth="1"/>
          <text x={pad.l - 8} y={yy + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">
            ${Math.round(maxY * t / 1000)}k
          </text>
        </g>;
      })}
      {data.map((d, i) => {
        const vals = [
          { v: d.old,   c: 'var(--bronze)' },
          { v: d.q1,    c: 'var(--silver)' },
          { v: d.q2,    c: 'var(--gold)',  alt: true },
          { v: d.q3,    c: 'var(--gold)' },
          { v: d.new25, c: 'var(--accent)' },
        ];
        let acc = 0;
        return (
          <g key={i}>
            {vals.map((s, j) => {
              const y1 = y(acc + s.v), y2 = y(acc);
              acc += s.v;
              return <rect key={j} x={x(i)} y={y1} width={bw} height={Math.max(0, y2 - y1)} fill={s.c} opacity={i === weeks - 1 && j === 3 ? 1 : 0.85}/>;
            })}
            <text x={x(i) + bw / 2} y={H - pad.b + 14} textAnchor="middle" fontSize="10"
              fill={i === weeks - 1 ? 'var(--status-err)' : 'var(--text-muted)'}
              fontFamily="var(--font-mono)" fontWeight={i === weeks - 1 ? 600 : 400}>
              W{18 - (weeks - 1 - i)}
            </text>
          </g>
        );
      })}
      <g>
        <line x1={x(weeks - 1) + bw / 2} x2={x(weeks - 1) + bw / 2} y1={y(totals[weeks - 1]) - 14} y2={y(totals[weeks - 1]) - 4}
          stroke="var(--status-err)" strokeWidth="1.5"/>
        <text x={x(weeks - 1) + bw / 2} y={y(totals[weeks - 1]) - 18} textAnchor="middle" fontSize="10" fill="var(--status-err)" fontFamily="var(--font-mono)" fontWeight="600">
          dip
        </text>
      </g>
    </svg>
  );
}

function Waterfall() {
  const W = 320, H = 200, pad = { l: 12, r: 12, t: 10, b: 30 };
  const items = [
    { l: 'W17',         v: 1538, kind: 'base' },
    { l: 'New 25',      v: +18,  kind: 'pos' },
    { l: '24-Q1+',      v: +2,   kind: 'pos' },
    { l: '24-Q2',       v: -6,   kind: 'neg' },
    { l: '24-Q3 SMB',   v: -42,  kind: 'neg' },
    { l: 'Misc',        v: -20,  kind: 'neg' },
    { l: 'W18',         v: 1490, kind: 'base' },
  ];
  const max = 1560, min = 1480;
  const span = max - min;
  const bw = (W - pad.l - pad.r) / items.length * 0.7;
  const gap = (W - pad.l - pad.r) / items.length * 0.3;
  const xFor = i => pad.l + i * (bw + gap) + gap / 2;
  const yFor = v => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / span);
  let running = 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {items.map((it, i) => {
        let bar;
        if (it.kind === 'base') {
          running = it.v;
          bar = <rect x={xFor(i)} y={yFor(it.v)} width={bw} height={H - pad.b - yFor(it.v)} fill="var(--text-muted)" opacity="0.5"/>;
        } else {
          const start = running;
          running += it.v;
          const top = Math.max(start, running);
          const bot = Math.min(start, running);
          bar = <rect x={xFor(i)} y={yFor(top)} width={bw} height={yFor(bot) - yFor(top)}
            fill={it.kind === 'pos' ? 'var(--status-ok)' : 'var(--status-err)'} opacity="0.85"/>;
        }
        return (
          <g key={i}>
            {bar}
            <text x={xFor(i) + bw / 2} y={H - pad.b + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">
              {it.l}
            </text>
            <text x={xFor(i) + bw / 2} y={H - pad.b + 24} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
              fill={it.kind === 'pos' ? 'var(--status-ok)' : it.kind === 'neg' ? 'var(--status-err)' : 'var(--text-primary)'} fontWeight="600">
              {it.kind === 'base' ? `$${it.v}k` : `${it.v > 0 ? '+' : ''}${it.v}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CohortTable() {
  const rows = [
    { c: '24-Q3 SMB · annual',  mrr: '$312k', d: '−$42k', dp: '−12%', net: '82%', logos: '24', t: 'err' },
    { c: '24-Q2 SMB · annual',  mrr: '$298k', d: '−$6k',  dp: '−2%',  net: '94%', logos: '8',  t: 'warn' },
    { c: '24-Q1 + older',       mrr: '$612k', d: '+$2k',  dp: '+0.3%',net: '98%', logos: '2',  t: 'ok' },
    { c: 'New 25',              mrr: '$98k',  d: '+$18k', dp: '+22%', net: 'n/a', logos: '0',  t: 'ok' },
    { c: 'Mid-market · all',    mrr: '$170k', d: '−$20k', dp: '−10%', net: '88%', logos: '6',  t: 'warn' },
  ];
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.7fr 0.7fr 0.6fr',
        padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: 0.04, borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span>Cohort</span><span>MRR</span><span>Δ vs W17</span><span>%</span><span>Net retention</span><span>Logos churned</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.7fr 0.7fr 0.6fr',
          padding: '12px 16px', fontSize: 13, alignItems: 'center',
          borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 0,
        }}>
          <span style={{ color: 'var(--text-primary)' }}>{r.c}</span>
          <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>{r.mrr}</span>
          <span className="walt-mono" style={{ color: r.t === 'err' ? 'var(--status-err)' : r.t === 'warn' ? 'var(--status-warn)' : 'var(--status-ok)', fontWeight: 600 }}>{r.d}</span>
          <span className="walt-mono" style={{ color: r.t === 'err' ? 'var(--status-err)' : r.t === 'warn' ? 'var(--status-warn)' : 'var(--status-ok)' }}>{r.dp}</span>
          <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{r.net}</span>
          <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{r.logos}</span>
        </div>
      ))}
    </div>
  );
}

function AnalystSQL() {
  const sql = [
    { n: 1,  t: '-- Generated by Walt · MRR week-over-week with cohort decomposition' },
    { n: 2,  t: 'with weekly as (' },
    { n: 3,  t: "  select" },
    { n: 4,  t: "    date_trunc('week', activity_date) as week," },
    { n: 5,  t: "    cohort_label," },
    { n: 6,  t: "    sum(mrr) as mrr" },
    { n: 7,  t: "  from {{ ref('fct_revenue') }}  -- gold" },
    { n: 8,  t: "  join {{ ref('dim_cohort') }} using (customer_id)" },
    { n: 9,  t: "  where activity_date >= dateadd(week, -14, current_date)" },
    { n: 10, t: "  group by 1, 2" },
    { n: 11, t: '),' },
    { n: 12, t: 'lagged as (' },
    { n: 13, t: '  select *,' },
    { n: 14, t: '    lag(mrr) over (partition by cohort_label order by week) as mrr_prev' },
    { n: 15, t: '  from weekly' },
    { n: 16, t: ')' },
    { n: 17, t: 'select week, cohort_label, mrr, mrr - mrr_prev as delta' },
    { n: 18, t: 'from lagged' },
    { n: 19, t: 'order by week desc, abs(delta) desc;' },
  ];
  return (
    <div className="walt-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="code" size={13} color="var(--text-muted)"/>
        <span className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>walt_analysis · w18_mrr_decomp.sql</span>
        <span className="walt-chip semantic"><Icon name="sparkle" size={10}/> generated</span>
        <div style={{ flex: 1 }}/>
        <button className="walt-btn ghost sm"><Icon name="play" size={11}/> Re-run</button>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.6, padding: '12px 0', background: 'var(--code-bg)' }}>
        {sql.map(l => (
          <div key={l.n} style={{ display: 'flex' }}>
            <span style={{ width: 38, textAlign: 'right', padding: '0 12px 0 0', color: 'var(--text-dim)' }}>{l.n}</span>
            <span style={{ flex: 1, color: 'var(--text-primary)', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: hilite(l.t) }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalystNotebook() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <NotebookCell type="md">
        <div className="walt-serif" style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 6 }}>Week-18 MRR investigation</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
          Walt opened this notebook in response to a question on the analyst surface. Cells are live — re-run any cell to reflect fresh data from the semantic layer.
        </p>
      </NotebookCell>
      <NotebookCell type="sql" label="walt.sql.1">
        <span style={{ color: 'var(--text-muted)' }}>-- delta by cohort, last 14 weeks</span>
      </NotebookCell>
      <NotebookCell type="out">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
          <Icon name="check" size={12} color="var(--status-ok)"/> 84 rows · 1.2s · cached
        </div>
      </NotebookCell>
      <NotebookCell type="md">
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
          The 24-Q3 SMB cohort drives <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>87%</span> of the dip — they entered renewal this week.
        </p>
      </NotebookCell>
      <NotebookCell type="chart"/>
    </div>
  );
}

function NotebookCell({ type, label, children }) {
  const meta = {
    md:    { tag: 'md',  color: 'var(--text-muted)' },
    sql:   { tag: label || 'sql', color: 'var(--accent)' },
    out:   { tag: 'out', color: 'var(--status-ok)' },
    chart: { tag: 'chart', color: 'var(--semantic)' },
  }[type];
  return (
    <div className="walt-card" style={{ overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-subtle)',
        fontSize: 11, color: 'var(--text-muted)',
      }}>
        <span className="walt-mono" style={{ color: meta.color, fontWeight: 600 }}>[{meta.tag}]</span>
        <div style={{ flex: 1 }}/>
        <Icon name="play" size={11}/> <span className="walt-mono">⌥⏎</span>
      </div>
      <div style={{ padding: type === 'chart' ? 0 : '14px 16px', fontFamily: type === 'sql' ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>
        {type === 'chart' ? <div style={{ padding: 16 }}><MRRChart/></div> : children}
      </div>
    </div>
  );
}

export function AnalystDeck() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {['W18 MRR · what happened', 'The 24-Q3 SMB cohort', 'What to do next', 'Appendix · SQL + sources'].map((t, i) => (
        <div key={i} className="walt-card" style={{
          aspectRatio: '16/9', padding: 20, display: 'flex', flexDirection: 'column',
          background: i === 1 ? 'var(--bg-inset)' : 'var(--bg-surface)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>0{i + 1}</div>
          <div className="walt-serif" style={{ fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.2, marginTop: 6, flex: 1 }}>{t}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Walt size={18}/>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Generated by Walt · slide {i + 1} of 4</span>
          </div>
        </div>
      ))}
    </div>
  );
}
