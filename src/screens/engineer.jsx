import React from 'react';
import { Walt, Icon, MiniSpark, MiniBars, ChatComposer } from '../lib/components.jsx';
import { NavRail, StepDot, TabBtn } from './shared.jsx';

export function EngineerApp() {
  const [tab, setTab] = React.useState('plan');
  const [artifactOpen, setArtifactOpen] = React.useState(true);
  const [sessionsOpen, setSessionsOpen] = React.useState(false);
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <NavRail active="sessions"/>
      {sessionsOpen && <SessionsSidebar onClose={() => setSessionsOpen(false)}/>}
      <ConversationPane
        artifactOpen={artifactOpen} setArtifactOpen={setArtifactOpen}
        sessionsOpen={sessionsOpen} setSessionsOpen={setSessionsOpen}
      />
      {artifactOpen && <ArtifactPanel tab={tab} setTab={setTab} onClose={() => setArtifactOpen(false)}/>}
    </div>
  );
}

function SessionsSidebar({ onClose }) {
  const groups = [
    {
      title: 'Active',
      items: [
        { id: 1, title: 'Onboard Stripe payment events', status: 'run', sub: 'Walt · 8 steps · just now', active: true },
        { id: 2, title: 'Backfill orders.gold for Q4', status: 'run', sub: 'Walt · running silver → gold' },
      ],
    },
    {
      title: 'Today',
      items: [
        { id: 3, title: 'Investigate row drift in dim_customer', status: 'warn', sub: 'You · 14:02' },
        { id: 4, title: 'Add freshness SLA to revenue dashboard', status: 'ok', sub: 'You · 11:48' },
        { id: 5, title: 'dbt model: marts.subscriptions_arr', status: 'ok', sub: 'Walt · 10:15' },
      ],
    },
    {
      title: 'This week',
      items: [
        { id: 6, title: 'Migrate Looker views → semantic layer', status: 'ok', sub: 'Walt · Tue' },
        { id: 7, title: 'PII review · marketing schema', status: 'warn', sub: 'You · Tue' },
        { id: 8, title: 'Snowflake warehouse rightsizing', status: 'ok', sub: 'Walt · Mon' },
      ],
    },
  ];
  return (
    <div style={{
      width: 280, flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      background: 'var(--bg-app)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{ padding: '14px 12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>Session history</div>
        <button className="walt-btn ghost sm" style={{ width: 24, padding: 0, justifyContent: 'center' }} onClick={onClose} title="Close history">
          <Icon name="close" size={12}/>
        </button>
        <button className="walt-btn primary sm" style={{ height: 24 }}>
          <Icon name="plus" size={11}/> New
        </button>
      </div>
      <div style={{ padding: '0 12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 30, padding: '0 10px',
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          color: 'var(--text-muted)',
          fontSize: 12,
        }}>
          <Icon name="search" size={13}/>
          <span style={{ flex: 1 }}>Search sessions, artifacts, runs…</span>
          <span className="walt-mono" style={{ fontSize: 11 }}>⌘K</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
        {groups.map(g => (
          <div key={g.title} style={{ marginBottom: 12 }}>
            <div style={{
              padding: '8px 8px 4px',
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: 0.06, color: 'var(--text-muted)',
            }}>{g.title}</div>
            {g.items.map(it => (
              <div key={it.id} style={{
                padding: '10px 10px', borderRadius: 8, cursor: 'pointer',
                background: it.active ? 'var(--bg-elevated)' : 'transparent',
                border: it.active ? '1px solid var(--border-default)' : '1px solid transparent',
                marginBottom: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`walt-dot ${it.status}`}/>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.title}
                  </div>
                </div>
                <div style={{ marginLeft: 14, marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>{it.sub}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConversationPane({ artifactOpen, setArtifactOpen, sessionsOpen, setSessionsOpen }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
    }}>
      <ConvHeader
        artifactOpen={artifactOpen} setArtifactOpen={setArtifactOpen}
        sessionsOpen={sessionsOpen} setSessionsOpen={setSessionsOpen}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 16px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <MsgUser>
            Stripe started sending us a new <code className="walt-mono" style={{ background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>payment_method.updated</code> webhook. Ingest it into bronze, conform it into silver, and surface it on the revenue gold model so the analyst dashboard reflects payment-method churn.
          </MsgUser>

          <MsgWalt>
            <div style={{ marginBottom: 10, color: 'var(--text-secondary)' }}>
              Got it. I drafted a plan and started on the bronze layer. I'll pause before silver so you can review the conformed schema — payment-method churn touches the revenue model, and I want a sign-off on the surrogate key strategy.
            </div>
            <PlanCard/>
          </MsgWalt>

          <ToolCall
            label="Profile webhook payload"
            tool="profile_source"
            args={{ source: 'stripe.webhooks.payment_method_updated', sample_size: 5000 }}
            duration="3.4s"
            status="ok"
            expanded={true}
          >
            <ProfileResult/>
          </ToolCall>

          <ToolCall
            label="Generate bronze model"
            tool="emit_dbt_model"
            args={{ layer: 'bronze', name: 'stg_stripe__payment_method_updated' }}
            duration="0.8s"
            status="ok"
          />

          <ToolCall
            label="Run dbt build"
            tool="dbt.build"
            args={{ select: 'bronze.stg_stripe__payment_method_updated' }}
            duration="12.1s"
            status="ok"
          >
            <RunOutput/>
          </ToolCall>

          <MsgWalt>
            <div style={{ color: 'var(--text-secondary)' }}>
              Bronze layer landed cleanly — <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>4,812</span> rows, 0 schema violations. The <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>payment_method_id</span> looks safe as the surrogate key, but I noticed Stripe also sends an <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>idempotency_key</span> on retries — should I treat that as part of the natural key, or de-dupe on <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>(payment_method_id, updated_at)</span>?
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <SuggestionChip>Use (payment_method_id, updated_at)</SuggestionChip>
              <SuggestionChip>Include idempotency_key</SuggestionChip>
              <SuggestionChip>Show me both, side by side</SuggestionChip>
            </div>
          </MsgWalt>
        </div>
      </div>
      <Composer/>
    </div>
  );
}

function ConvHeader({ artifactOpen, setArtifactOpen, sessionsOpen, setSessionsOpen }) {
  return (
    <div style={{
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 14px 0 12px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
    }}>
      <button
        className="walt-btn ghost sm"
        onClick={() => setSessionsOpen && setSessionsOpen(!sessionsOpen)}
        title="Show session history"
        style={{ width: 28, padding: 0, justifyContent: 'center', color: sessionsOpen ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        <Icon name="clock" size={13}/>
      </button>
      <span className="walt-dot run"/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          Onboard Stripe payment events
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center', marginTop: 1 }}>
          <span>8 steps · started 2 min ago</span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} title="Walt is writing to this git branch">
            <Icon name="branch" size={11}/> walt/stripe-pm
          </span>
        </div>
      </div>
      <button className="walt-btn ghost sm" title="Pause the agent — it will stop after the current tool call"><Icon name="pause" size={12}/> Pause</button>
      <button
        className={`walt-btn sm ${artifactOpen ? 'primary' : ''}`}
        onClick={() => setArtifactOpen && setArtifactOpen(!artifactOpen)}
        title="Show plan, workspace files, and context Walt is using"
      >
        <Icon name="sidePanel" size={13}/> Plan &amp; files
        <span className="walt-mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>⌘\</span>
      </button>
      <button className="walt-btn sm"><Icon name="dots" size={12}/></button>
    </div>
  );
}

function MsgUser({ children }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        width: 28, height: 28, flexShrink: 0, marginTop: 2,
        borderRadius: 999, background: 'linear-gradient(135deg, #5A87EA, #BB9AF7)',
        color: 'white', fontSize: 11, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>RJ</div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Riya Joshi</span> · Senior Data Engineer
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.55 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function MsgWalt({ children }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, marginTop: -2 }}>
        <Walt size={32}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Walt</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>thinking with sonnet-de · 12.3s</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.55 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function PlanCard() {
  const steps = [
    { state: 'ok',   label: 'Profile webhook payload + sample', detail: 'profile_source · 3.4s' },
    { state: 'ok',   label: 'Generate bronze model from contract', detail: 'emit_dbt_model · 0.8s' },
    { state: 'ok',   label: 'Run dbt build on bronze', detail: 'dbt.build · 12.1s' },
    { state: 'pend', label: 'Conform to silver: dim_payment_method', detail: 'awaiting decision on natural key' },
    { state: 'idle', label: 'Update gold.fct_revenue with churn dim', detail: 'semantic model update' },
    { state: 'idle', label: 'Refresh dashboard freshness contract', detail: 'analyst surface' },
  ];
  return (
    <div className="walt-card" style={{ marginTop: 10, overflow: 'hidden' }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-inset)',
      }}>
        <Icon name="sparkle" size={13} color="var(--semantic)"/>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Plan · 6 steps</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>3 done · 1 awaiting you · 2 queued</div>
        <div style={{ flex: 1 }}/>
        <button className="walt-btn ghost sm" style={{ height: 22 }}>
          <Icon name="arrowR" size={11}/> Open full plan
        </button>
      </div>
      <div style={{ padding: '4px 0' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
            <StepDot state={s.state}/>
            <div style={{ fontSize: 13, color: s.state === 'idle' ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1 }}>
              {s.label}
            </div>
            <div className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolCall({ label, tool, args, duration, status = 'ok', children, expanded: defaultExpanded = false }) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <div style={{ marginLeft: 46 }}>
      <div className="walt-card" style={{ overflow: 'hidden', background: 'var(--bg-surface)' }}>
        <button onClick={() => setOpen(o => !o)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'transparent', border: 0, cursor: 'pointer',
          textAlign: 'left',
        }}>
          <Icon name={open ? 'chevD' : 'chevR'} size={12} color="var(--text-muted)"/>
          <Icon name="bolt" size={13} color="var(--semantic)"/>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {tool}({Object.entries(args).map(([k, v]) => `${k}: ${typeof v === 'string' ? `"${v}"` : v}`).join(', ')})
          </span>
          <div style={{ flex: 1 }}/>
          <span className={`walt-chip ${status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : 'err'}`}>
            <Icon name={status === 'ok' ? 'check' : 'bell'} size={10}/>
            {status === 'ok' ? 'ok' : status}
          </span>
          <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{duration}</span>
        </button>
        {open && children && (
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>{children}</div>
        )}
      </div>
    </div>
  );
}

function ProfileResult() {
  const cols = [
    { name: 'id',                type: 'string',  nulls: '0%',    distinct: '4,812', sample: 'pm_1NxQ…', spark: [4,6,5,7,8,6,9,8,10,9,11,12] },
    { name: 'object',            type: 'string',  nulls: '0%',    distinct: '1',     sample: 'payment_method' },
    { name: 'card.brand',        type: 'enum',    nulls: '12%',   distinct: '8',     sample: 'visa, mastercard…', spark: [9,12,10,8,6,4,3,2,1,1] },
    { name: 'card.exp_month',    type: 'int',     nulls: '12%',   distinct: '12',    sample: '11', spark: [5,6,7,8,9,11,12,10,8,7,6,5] },
    { name: 'billing_details.email', type: 'pii', nulls: '4%',    distinct: '4,488', sample: '••••@stripe.com' },
    { name: 'created',           type: 'ts',      nulls: '0%',    distinct: '4,802', sample: '2026-05-09T14:02Z', spark: [3,4,5,6,7,8,9,11,12,10] },
    { name: 'idempotency_key',   type: 'string',  nulls: '24%',   distinct: '3,652', sample: 'idem_a8f…' },
  ];
  return (
    <div style={{ background: 'var(--bg-inset)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: 18, marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
        <span><span style={{ color: 'var(--text-primary)' }}>4,812</span> rows sampled</span>
        <span><span style={{ color: 'var(--text-primary)' }}>7</span> fields</span>
        <span style={{ color: 'var(--status-warn)' }}>1 PII flagged</span>
        <span style={{ color: 'var(--text-muted)' }}>schema inferred from JSON contract</span>
      </div>
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-surface)' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.6fr 0.7fr 1.2fr 0.9fr',
          padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 0.04,
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span>Field</span><span>Type</span><span>Nulls</span><span>Distinct</span><span>Sample</span><span>Distribution</span>
        </div>
        {cols.map((c, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.6fr 0.7fr 1.2fr 0.9fr',
            padding: '8px 12px', fontSize: 12, alignItems: 'center',
            borderBottom: i < cols.length - 1 ? '1px solid var(--border-subtle)' : 0,
          }}>
            <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
            <span className="walt-chip" style={{ width: 'fit-content' }}>{c.type}</span>
            <span style={{ color: c.nulls === '0%' ? 'var(--text-muted)' : 'var(--status-warn)' }}>{c.nulls}</span>
            <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{c.distinct}</span>
            <span className="walt-mono" style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.sample}</span>
            <span>{c.spark ? <MiniBars values={c.spark} width={70} height={16}/> : <span style={{ color: 'var(--text-dim)' }}>—</span>}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunOutput() {
  const lines = [
    { t: '14:02:11', c: 'Running with dbt=1.7.4' },
    { t: '14:02:11', c: 'Found 1 model, 0 tests, 0 snapshots…' },
    { t: '14:02:12', c: 'Concurrency: 4 threads (target=\'walt_dev\')' },
    { t: '14:02:12', c: '' },
    { t: '14:02:12', c: '1 of 1 START sql incremental model bronze.stg_stripe__payment_method_updated  [RUN]', emph: 'run' },
    { t: '14:02:24', c: '1 of 1 OK created incremental model bronze.stg_stripe__payment_method_updated  [INSERT 4812 in 11.6s]', emph: 'ok' },
    { t: '14:02:24', c: '' },
    { t: '14:02:24', c: 'Finished running 1 incremental model in 0:00:12.', emph: 'ok' },
  ];
  return (
    <div style={{
      background: 'var(--code-bg)', padding: '12px 14px',
      fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.55,
      color: 'var(--text-secondary)',
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: 'var(--text-dim)', width: 64, flexShrink: 0 }}>{l.t}</span>
          <span style={{ color: l.emph === 'ok' ? 'var(--status-ok)' : l.emph === 'run' ? 'var(--status-run)' : 'var(--text-secondary)' }}>{l.c || ' '}</span>
        </div>
      ))}
    </div>
  );
}

function SuggestionChip({ children }) {
  return (
    <button style={{
      height: 28, padding: '0 12px', borderRadius: 999,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      color: 'var(--text-primary)',
      fontSize: 12, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
    }}>{children}</button>
  );
}

function Composer() {
  return (
    <div style={{ padding: '14px 28px 18px', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <ChatComposer
          placeholder="Ask Walt to ingest, transform, profile, model, or explain…"
          pills={[
            { icon: 'sparkle', label: 'Agent · sonnet-de' },
            { icon: 'branch', label: 'walt/stripe-pm' },
          ]}
        />
      </div>
    </div>
  );
}

function ContextChip({ icon, label, muted }) {
  return (
    <div className="walt-chip" style={{
      color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
      background: muted ? 'transparent' : 'var(--bg-inset)',
      border: muted ? '1px dashed var(--border-default)' : '1px solid var(--border-subtle)',
      height: 24, padding: '0 8px',
    }}>
      <Icon name={icon} size={11}/> {label}
    </div>
  );
}

function ArtifactPanel({ tab, setTab }) {
  return (
    <div style={{
      width: 460, flexShrink: 0,
      background: 'var(--bg-surface)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        height: 52, flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 4,
      }}>
        <TabBtn active={tab === 'plan'} onClick={() => setTab('plan')} icon="sparkle" label="Plan" count="6"/>
        <TabBtn active={tab === 'workspace'} onClick={() => setTab('workspace')} icon="folder" label="Workspace"/>
        <TabBtn active={tab === 'context'} onClick={() => setTab('context')} icon="layers" label="Context" count="12"/>
        <div style={{ flex: 1 }}/>
        <button className="walt-btn ghost sm"><Icon name="eye" size={12}/></button>
        <button className="walt-btn ghost sm"><Icon name="dots" size={12}/></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'plan' && <PlanTab/>}
        {tab === 'workspace' && <WorkspaceTab/>}
        {tab === 'context' && <ContextTab/>}
      </div>
    </div>
  );
}

function PlanTab() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 6 }}>Outcome</div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5 }}>
          Payment-method churn surfaces on the <span style={{ color: 'var(--accent)', fontWeight: 600 }}>revenue</span> gold model, refreshing every <span className="walt-mono">15 min</span>, with PII scrubbed at bronze.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Medallion path</div>
        <MedallionMini/>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Lineage preview</div>
        <LineageMini/>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Semantic model · revenue.yml</div>
          <span className="walt-chip" style={{ marginLeft: 'auto' }}>+1 dimension</span>
        </div>
        <SemanticDiff/>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Checks Walt will run before merge</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Unique key on dim_payment_method',
            'Not-null on (id, customer_id, brand)',
            'Row-count drift < 5% vs prior run',
            'Freshness SLA: max(updated_at) ≥ now - 30m',
            'PII columns masked at bronze → silver',
          ].map((l, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, border: '1.5px solid var(--border-strong)', flexShrink: 0 }}/>
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MedallionMini() {
  const tiers = [
    { tier: 'bronze', name: 'stg_stripe__payment_method_updated', meta: '4,812 rows · just now', state: 'ok' },
    { tier: 'silver', name: 'dim_payment_method', meta: 'awaiting key decision', state: 'pend' },
    { tier: 'gold',   name: 'fct_revenue + churn dim', meta: 'queued', state: 'idle' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tiers.map((t, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: 12,
          padding: '10px 12px',
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          opacity: t.state === 'idle' ? 0.6 : 1,
        }}>
          <span className={`walt-chip ${t.tier}`} style={{ textTransform: 'uppercase', justifyContent: 'center' }}>{t.tier}</span>
          <div style={{ minWidth: 0 }}>
            <div className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.meta}</div>
          </div>
          <StepDot state={t.state}/>
        </div>
      ))}
    </div>
  );
}

function LineageMini() {
  return (
    <div style={{
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10,
      padding: 16, position: 'relative', height: 150,
    }}>
      <svg viewBox="0 0 420 120" width="100%" height="120" style={{ display: 'block' }}>
        <g stroke="var(--border-strong)" strokeWidth="1.4" fill="none">
          <path d="M65 30 C 130 30, 130 60, 195 60"/>
          <path d="M65 90 C 130 90, 130 60, 195 60"/>
          <path d="M245 60 C 290 60, 290 30, 355 30"/>
          <path d="M245 60 C 290 60, 290 90, 355 90"/>
        </g>
        <g fill="var(--border-strong)">
          <path d="M195 60 L 188 56 L 188 64 z"/>
          <path d="M355 30 L 348 26 L 348 34 z"/>
          <path d="M355 90 L 348 86 L 348 94 z"/>
        </g>
        <LineageNode x={10}  y={18} w={55} h={24} label="webhook" color="var(--text-muted)" filled={false}/>
        <LineageNode x={10}  y={78} w={55} h={24} label="contract" color="var(--text-muted)" filled={false}/>
        <LineageNode x={195} y={48} w={50} h={24} label="bronze" color="var(--bronze)"/>
        <LineageNode x={355} y={18} w={55} h={24} label="silver" color="var(--silver)" dashed/>
        <LineageNode x={355} y={78} w={55} h={24} label="gold"   color="var(--gold)"   dashed/>
      </svg>
      <div style={{ position:'absolute', bottom: 8, right: 12, fontSize: 11, color: 'var(--text-muted)' }}>
        2 upstream · 3 downstream
      </div>
    </div>
  );
}

function LineageNode({ x, y, w, h, label, color, filled = true, dashed = false }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5"
        fill={filled ? color : 'transparent'}
        stroke={color}
        strokeDasharray={dashed ? '3 3' : '0'}
        opacity={filled ? 0.18 : 1}
      />
      <rect x={x} y={y} width={w} height={h} rx="5" fill="none" stroke={color} opacity={filled ? 0.9 : 0}/>
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle"
        fontSize="11" fontWeight="600" fill={color} fontFamily="var(--font-mono)">{label}</text>
    </g>
  );
}

function SemanticDiff() {
  return (
    <div style={{
      background: 'var(--code-bg)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10, overflow: 'hidden',
      fontFamily: 'var(--font-mono)', fontSize: 12,
    }}>
      {[
        { n: 24, t: 'dim:' },
        { n: 25, t: '  - name: customer' },
        { n: 26, t: '    primary_key: customer_id' },
        { add: true, n: 27, t: '  - name: payment_method' },
        { add: true, n: 28, t: '    primary_key: payment_method_id' },
        { add: true, n: 29, t: '    relationships:' },
        { add: true, n: 30, t: '      - to: dim_customer.customer_id' },
        { n: 31, t: 'measures:' },
        { n: 32, t: '  - name: gross_revenue' },
      ].map((l, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center',
          background: l.add ? 'rgba(158,206,106,0.10)' : 'transparent',
          color: l.add ? 'var(--status-ok)' : 'var(--text-secondary)',
        }}>
          <span style={{ width: 26, textAlign: 'right', padding: '2px 8px 2px 0', color: 'var(--text-dim)', fontSize: 11 }}>{l.n}</span>
          <span style={{ width: 18, textAlign: 'center', color: l.add ? 'var(--status-ok)' : 'var(--text-dim)' }}>{l.add ? '+' : ' '}</span>
          <span style={{ flex: 1, padding: '2px 12px 2px 0', whiteSpace: 'pre' }}>{l.t}</span>
        </div>
      ))}
    </div>
  );
}

function WorkspaceTab() {
  return (
    <div style={{ padding: '14px 8px 20px' }}>
      <div style={{ padding: '0 12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="git" size={14} color="var(--text-muted)"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>acme/analytics-platform</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>walt/stripe-pm · 2 ahead of main · 3 unstaged</div>
        </div>
        <button className="walt-btn ghost sm"><Icon name="refresh" size={12}/></button>
      </div>
      <Tree/>
    </div>
  );
}

function Tree() {
  const items = [
    { d: 0, n: 'analytics-platform', kind: 'folder', open: true },
    { d: 1, n: 'models', kind: 'folder', open: true },
    { d: 2, n: 'bronze', kind: 'folder', open: true, badge: 'bronze' },
    { d: 3, n: 'stg_stripe__payment_method_updated.sql', kind: 'file', state: 'add' },
    { d: 3, n: 'stg_stripe__charges.sql', kind: 'file' },
    { d: 3, n: 'stg_stripe__invoices.sql', kind: 'file' },
    { d: 2, n: 'silver', kind: 'folder', open: true, badge: 'silver' },
    { d: 3, n: 'dim_customer.sql', kind: 'file' },
    { d: 3, n: 'dim_payment_method.sql', kind: 'file', state: 'mod' },
    { d: 3, n: 'fct_charges.sql', kind: 'file' },
    { d: 2, n: 'gold', kind: 'folder', badge: 'gold' },
    { d: 1, n: 'semantic', kind: 'folder', open: true },
    { d: 2, n: 'revenue.yml', kind: 'file', state: 'mod' },
    { d: 2, n: 'subscriptions.yml', kind: 'file' },
    { d: 1, n: 'tests', kind: 'folder' },
    { d: 1, n: 'dbt_project.yml', kind: 'file' },
    { d: 1, n: 'README.md', kind: 'file' },
  ];
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px',
          paddingLeft: 12 + it.d * 14,
          fontSize: 12,
          color: 'var(--text-secondary)',
          background: it.state === 'add' ? 'rgba(158,206,106,0.07)' : 'transparent',
        }}>
          {it.kind === 'folder' ? <Icon name={it.open ? 'chevD' : 'chevR'} size={10} color="var(--text-muted)"/> : <span style={{ width: 10 }}/>}
          <Icon name={it.kind === 'folder' ? 'folder' : 'file'} size={12} color={it.kind === 'folder' ? 'var(--text-muted)' : 'var(--text-dim)'}/>
          <span className="walt-mono" style={{ color: it.state ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {it.n}
          </span>
          {it.badge && <span className={`walt-chip ${it.badge}`} style={{ height: 16, padding: '0 5px', fontSize: 10 }}>{it.badge}</span>}
          {it.state === 'add' && <span style={{ color: 'var(--status-ok)', fontSize: 11, fontWeight: 600 }}>A</span>}
          {it.state === 'mod' && <span style={{ color: 'var(--status-warn)', fontSize: 11, fontWeight: 600 }}>M</span>}
        </div>
      ))}
    </div>
  );
}

function ContextTab() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ContextGroup title="Connections" count="4">
        <ContextRow icon="db" name="snowflake · prod_warehouse" sub="Walt has read on raw.*, read/write on analytics.*" status="ok"/>
        <ContextRow icon="db" name="postgres · stripe_replica" sub="streaming replica · lag 1.2s" status="ok"/>
        <ContextRow icon="git" name="github · acme/analytics-platform" sub="branch walt/stripe-pm · push enabled" status="ok"/>
        <ContextRow icon="msg" name="slack · #data-platform" sub="run notifications · escalate on err" status="ok"/>
      </ContextGroup>

      <ContextGroup title="MCP tools" count="6">
        <ContextRow icon="bolt" name="dbt-core" sub="build · test · docs · run-operation" status="ok"/>
        <ContextRow icon="bolt" name="sqlmesh" sub="plan · apply · audit" status="ok"/>
        <ContextRow icon="bolt" name="great-expectations" sub="suite generation + run" status="ok"/>
        <ContextRow icon="bolt" name="airflow" sub="dag emit · trigger · backfill" status="ok"/>
        <ContextRow icon="bolt" name="stripe-api" sub="webhook contracts · scoped to read" status="warn"/>
        <ContextRow icon="bolt" name="linear" sub="issue create + link" status="ok"/>
      </ContextGroup>

      <ContextGroup title="Files in context" count="12">
        <ContextRow icon="file" name="models/silver/dim_customer.sql" sub="referenced by silver→gold join"/>
        <ContextRow icon="file" name="semantic/revenue.yml" sub="will be modified"/>
        <ContextRow icon="file" name="docs/medallion-conventions.md" sub="team standards"/>
        <ContextRow icon="notebook" name="notebooks/2025-12-pm-churn.ipynb" sub="prior analysis · Riya"/>
      </ContextGroup>
    </div>
  );
}

function ContextGroup({ title, count, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06 }}>{title}</div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{count}</span>
        <div style={{ flex: 1 }}/>
        <button className="walt-btn ghost sm" style={{ height: 22 }}><Icon name="plus" size={11}/></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  );
}

function ContextRow({ icon, name, sub, status }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 10px',
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8,
    }}>
      <div style={{
        width: 28, height: 28, flexShrink: 0,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)',
      }}>
        <Icon name={icon} size={13}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
      </div>
      {status && <span className={`walt-dot ${status}`}/>}
    </div>
  );
}
