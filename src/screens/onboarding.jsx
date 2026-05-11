import React from 'react';
import { Walt, Icon } from '../lib/components.jsx';
import { NavRail, StepDot } from './shared.jsx';

export function OnboardingScenarioScreen() {
  const [openArtifact, setOpenArtifact] = React.useState('bronze');
  const [tab, setTab] = React.useState('plan');
  const [projectsOpen, setProjectsOpen] = React.useState(false);
  const openWith = (which) => { setTab(which === 'plan' ? 'plan' : 'workspace'); setOpenArtifact(which); };
  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0, position: 'relative' }}>
      <NavRail active="sessions"/>
      <OnboardingChat openArtifact={openArtifact} setOpenArtifact={openWith} onOpenProjects={() => setProjectsOpen(true)}/>
      {openArtifact && <OnboardingDisclosure which={openArtifact} tab={tab} setTab={setTab} onClose={() => setOpenArtifact(null)}/>}
      {projectsOpen && <ProjectsOverlay onClose={() => setProjectsOpen(false)}/>}
    </div>
  );
}

function ProjectsOverlay({ onClose }) {
  const projects = [
    {
      name: 'finance-platform', status: 'active',
      domain: 'Finance', stage: 'staging/dev',
      sources: ['SQL Server · ERP_PROD'], target: 'Snowflake · FINANCE_PROD',
      layers: { bronze: 220, silver: 18, gold: 3 }, semantic: 'finance.yml',
      owner: 'Riya J.', updated: '2 min ago',
    },
    {
      name: 'analytics-platform', status: 'active',
      domain: 'Product analytics', stage: 'prod',
      sources: ['Postgres · app_prod', 'Segment · events'], target: 'Snowflake · ANALYTICS',
      layers: { bronze: 42, silver: 28, gold: 14 }, semantic: 'product.yml',
      owner: 'Maya V.', updated: '14 min ago',
    },
    {
      name: 'growth-marts', status: 'paused',
      domain: 'Growth', stage: 'prod',
      sources: ['HubSpot', 'GA4', 'Stripe'], target: 'BigQuery · growth',
      layers: { bronze: 11, silver: 9, gold: 5 }, semantic: 'growth.yml',
      owner: 'Daniel K.', updated: '3 d ago',
    },
    {
      name: 'supply-chain', status: 'draft',
      domain: 'Operations', stage: 'staging/dev',
      sources: ['SAP HANA · ECC'], target: 'Databricks · ops',
      layers: { bronze: 0, silver: 0, gold: 0 }, semantic: null,
      owner: 'Riya J.', updated: 'yesterday',
    },
  ];
  const stColor = { active: 'var(--success)', paused: 'var(--warning)', draft: 'var(--text-muted)' };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: 56, flexShrink: 0, padding: '0 28px',
        display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
      }}>
        <Walt size={22}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Platforms</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>All data platforms in this workspace</div>
        </div>
        <button className="walt-btn ghost sm"><Icon name="plus" size={12}/> New platform</button>
        <button className="walt-btn ghost sm" onClick={onClose} title="Back to session"><Icon name="x" size={13}/></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {projects.map(p => (
            <button key={p.name} onClick={onClose} style={{
              textAlign: 'left',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 12, padding: 18,
              cursor: 'pointer', color: 'inherit', font: 'inherit',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="walt-dot" style={{ background: stColor[p.status] }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.domain} · {p.stage}</div>
                </div>
                <span className="walt-chip" style={{ height: 20, fontSize: 10.5, textTransform: 'uppercase' }}>{p.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Sources</div>
                  {p.sources.map(s => (
                    <div key={s} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="db" size={11} color="var(--text-muted)"/>{s}
                    </div>
                  ))}
                </div>
                <Icon name="arrowR" size={14} color="var(--text-muted)"/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Target</div>
                  <div style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="db" size={11} color="var(--text-muted)"/>{p.target}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MedTier color="var(--bronze)" label="Bronze" n={p.layers.bronze}/>
                <MedTier color="var(--silver)" label="Silver" n={p.layers.silver}/>
                <MedTier color="var(--gold)" label="Gold" n={p.layers.gold}/>
                {p.semantic && <span className="walt-chip semantic" style={{ height: 22, fontSize: 11 }}><Icon name="sparkle" size={10}/> {p.semantic}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                <span>Owner · {p.owner}</span>
                <span>Updated {p.updated}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedTier({ color, label, n }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px 4px 6px', borderRadius: 999,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      fontSize: 11.5, color: 'var(--text-primary)',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }}/>
      <span>{label}</span>
      <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
    </div>
  );
}

function OnboardingChat({ openArtifact, setOpenArtifact, onOpenProjects }) {
  const open = (k) => setOpenArtifact(openArtifact === k ? null : k);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-app)' }}>
      <div style={{
        height: 48, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
      }}>
        <button className="walt-btn ghost sm" style={{ width: 26, padding: 0, justifyContent: 'center' }} title="Session history">
          <Icon name="clock" size={13}/>
        </button>
        <button
          onClick={onOpenProjects}
          title="Switch platform"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 8px 4px 6px', borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Icon name="folder" size={11} color="var(--text-muted)"/>
          finance-platform
          <Icon name="chevD" size={10} color="var(--text-muted)"/>
        </button>
        <span className="walt-dot run"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>New session · finance analytics</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Walt is drafting your platform · 14 min in</div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }} title="Walt is writing to this git branch">
          <Icon name="branch" size={11}/> staging/dev
        </span>
        <button
          className="walt-btn ghost sm"
          onClick={() => open(openArtifact || 'plan')}
          title={openArtifact ? 'Close side panel' : 'Open side panel'}
          style={{ width: 28, padding: 0, justifyContent: 'center', color: openArtifact ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <Icon name="layers" size={13}/>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <WaltStack>
            <BotLine>Hi Riya — welcome. I'm Walt. Before we touch any data I want to understand the platform you're building. Three quick rounds: what you're building, where the data lives today, and where it should land.</BotLine>
            <BotLine>What is this platform for?</BotLine>
          </WaltStack>
          <UserBubble>Finance analytics — close, variance, cash forecasting.</UserBubble>

          <WaltStack silent>
            <BotLine>Who will ask questions of it?</BotLine>
          </WaltStack>
          <UserBubble>The CFO, 6 analysts in FP&amp;A, and 2 controllers.</UserBubble>

          <WaltStack silent>
            <BotLine>Tell me three questions the business must answer on day one.</BotLine>
          </WaltStack>
          <PillRow values={['Variance to plan, by cost center', 'Cash burn vs runway, weekly', 'Top 10 deferred-revenue accounts']}/>

          <WaltStack silent>
            <BotLine>Where does the data live today?</BotLine>
          </WaltStack>
          <SourcePills selected="sqlserver"/>

          <WaltStack working>
            <BotLine>SQL Server. I'll plan an ERP-style ingest. Confirm these so I can start:</BotLine>
            <KVInline pairs={[
              ['Database',  'ERP_PROD on sql-erp01.acme.internal'],
              ['Auth',      'Service account in your vault · read-only'],
              ['Schemas',   'GL · AP · AR · CASH · DEFREV'],
              ['Cadence',   'Incremental every 30 min · full reload nightly'],
            ]}/>
          </WaltStack>
          <UserBubble>Looks right. Mask vendor + employee names in bronze.</UserBubble>

          <WaltStack silent>
            <BotLine>Where should this land?</BotLine>
          </WaltStack>
          <TargetPills selected="snowflake"/>

          <WaltStack silent>
            <BotLine>Snowflake <Mono>FINANCE_PROD</Mono>. I'll create <Mono>bronze</Mono>, <Mono>silver</Mono>, <Mono>gold</Mono>, and a <Mono>semantic</Mono> schema. Models live in your dbt repo on <Mono>staging/dev</Mono> until you approve.</BotLine>
            <ArtifactRow kind="plan" title="Plan ready — 6 steps" sub="bronze → silver (review) → staging/git → gold → semantic" onOpen={() => open('plan')} active={openArtifact === 'plan'}/>
          </WaltStack>

          <UserBubble>Start with bronze. I'll wire GitHub after silver lands.</UserBubble>

          <WaltStack working>
            <BotLine>Building bronze.</BotLine>
            <StatusRow tier="bronze" label="Mirrored SQL Server → bronze (incremental)" meta="220 tables · 42 GB · 11m"/>
            <StatusRow tier="bronze" label="Type contracts + PII masking applied" meta="14 PII columns · 0 violations"/>
            <StatusRow tier="bronze" label="Freshness + great-expectations baseline" meta="all green"/>
            <ArtifactRow kind="bronze" title="Bronze layer · 220 tables" sub="Click to inspect models, tests, and run log" onOpen={() => open('bronze')} active={openArtifact === 'bronze'}/>
          </WaltStack>

          <WaltStack working>
            <BotLine>Conforming silver. Two automated steps done. One needs your call.</BotLine>
            <StatusRow tier="silver" label="Surrogate keys for GL accounts + cost centers" meta="1,842 keys"/>
            <StatusRow tier="silver" label="De-duped AP vendors (fuzzy on tax_id)" meta="caught 412 duplicates"/>
            <BotLine>On intercompany: I see 2,140 rows between US, EU and IN. Eliminate at silver, or carry both legs and tag them for gold to filter?</BotLine>
            <PillRow choice values={['Eliminate at silver', 'Carry both legs, tag intercompany', 'Show me the rows first']}/>
          </WaltStack>
          <UserBubble>Eliminate at silver. Keep raw rows in bronze for audit.</UserBubble>

          <WaltStack silent>
            <StatusRow tier="silver" label="Intercompany elimination applied" meta="2,140 rows · reviewed"/>
            <StatusRow tier="silver" label="SCD2 history on vendors + cost centers" meta="ready for audit"/>
            <ArtifactRow kind="silver" title="Silver ready · open PR or download" sub="Conformed entities · semantic-stable" onOpen={() => open('silver')} active={openArtifact === 'silver'}/>
          </WaltStack>

          <WaltStack silent>
            <BotLine>Silver is conformed. Gold should answer the three questions you gave me. I drafted marts and a semantic model — review and approve, then your analysts can ask Walt in plain English.</BotLine>
            <StatusRow tier="gold" label="fct_variance" meta="variance to plan, by cost center"/>
            <StatusRow tier="gold" label="fct_cash_flow" meta="cash burn vs runway, weekly"/>
            <StatusRow tier="gold" label="mart_deferred_revenue" meta="top accounts by deferred revenue"/>
            <ArtifactRow kind="semantic" title="Semantic model · finance.yml" sub="Measures, dimensions, relationships — ready for review" onOpen={() => open('semantic')} active={openArtifact === 'semantic'}/>
          </WaltStack>
        </div>
      </div>

      <div style={{ padding: '14px 28px 18px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', borderRadius: 14, padding: '10px 12px 8px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className="walt-chip" style={{ height: 22 }}><Icon name="folder" size={11}/> finance-platform</span>
              <span className="walt-chip" style={{ height: 22 }}><Icon name="db" size={11}/> sqlserver · ERP_PROD</span>
              <span className="walt-chip" style={{ height: 22, borderStyle: 'dashed' }}><Icon name="plus" size={11}/> Add context</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', minHeight: 38, padding: '4px 2px' }}>
              Reply to Walt, or paste a doc with the questions to answer…
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <button className="walt-btn ghost sm"><Icon name="plus" size={12}/></button>
              <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }}/>
              <span className="walt-chip semantic" style={{ height: 22 }}><Icon name="sparkle" size={10}/> Agent · sonnet-de</span>
              <span className="walt-chip" style={{ height: 22 }}><Icon name="branch" size={10}/> staging/dev</span>
              <div style={{ flex: 1 }}/>
              <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>⌘↵</span>
              <button className="walt-btn primary sm" style={{ height: 28 }}><Icon name="arrowUp" size={12}/> Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaltStack({ children, working, silent }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, marginTop: -2, width: 26, height: 26 }}>
        {silent && !working ? null : <Walt size={26} thinking={working}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function BotLine({ children, muted }) {
  return (
    <div style={{ fontSize: 14, color: muted ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1.6, fontStyle: muted ? 'italic' : 'normal' }}>
      {children}
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: 520, padding: '9px 14px', borderRadius: 16, background: 'var(--accent-soft)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

function PillRow({ values, choice }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: choice ? 'flex-start' : 'flex-end' }}>
      {values.map((v, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999,
          background: choice ? 'transparent' : 'var(--accent-soft)',
          border: choice ? '1px solid var(--border-default)' : '1px solid transparent',
          color: choice ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 12.5,
          cursor: choice ? 'pointer' : 'default',
        }}>
          {!choice && <Icon name="check" size={10} color="var(--accent)"/>}
          {v}
        </span>
      ))}
    </div>
  );
}

function SourcePills({ selected }) {
  const list = [
    { id: 'sqlserver', l: 'SQL Server' },
    { id: 'saphana', l: 'SAP HANA' },
    { id: 'oracle', l: 'Oracle' },
    { id: 'postgres', l: 'Postgres' },
    { id: 'salesforce', l: 'Salesforce' },
    { id: 'other', l: 'Something else' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
      {list.filter(s => s.id === selected).map(s => (
        <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--text-primary)', fontSize: 12.5 }}>
          <Icon name="check" size={10} color="var(--accent)"/>{s.l}
        </span>
      ))}
    </div>
  );
}

function TargetPills({ selected }) {
  const list = ['Snowflake', 'Databricks', 'BigQuery', 'Redshift'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
      {list.filter(l => l.toLowerCase() === selected).map(l => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--text-primary)', fontSize: 12.5 }}>
          <Icon name="check" size={10} color="var(--accent)"/>{l}
        </span>
      ))}
    </div>
  );
}

function KVInline({ pairs }) {
  return (
    <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 4, fontSize: 13, paddingLeft: 2 }}>
      {pairs.map(([k, v], i) => (
        <React.Fragment key={i}>
          <span style={{ color: 'var(--text-muted)' }}>{k}</span>
          <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{v}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function Mono({ children }) {
  return <span className="walt-mono" style={{ color: 'var(--text-primary)', background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4, fontSize: 12.5 }}>{children}</span>;
}

function StatusRow({ tier, label, meta }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 40, fontSize: 13 }}>
      <Icon name="check" size={11} color="var(--status-ok)"/>
      <span className={`walt-chip ${tier}`} style={{ height: 17, padding: '0 6px', fontSize: 10, textTransform: 'uppercase' }}>{tier}</span>
      <span style={{ color: 'var(--text-primary)', flex: 1 }}>{label}</span>
      <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meta}</span>
    </div>
  );
}

function ArtifactRow({ kind, title, sub, onOpen, active }) {
  const iconByKind = { plan: 'sparkle', bronze: 'layers', silver: 'layers', gold: 'layers', semantic: 'schema' };
  const tintByKind = { plan: 'var(--accent)', bronze: 'var(--bronze)', silver: 'var(--silver)', gold: 'var(--gold)', semantic: 'var(--semantic)' };
  return (
    <button onClick={onOpen} style={{
      marginLeft: 40, display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', cursor: 'pointer',
      background: active ? 'var(--bg-elevated)' : 'var(--bg-surface)',
      border: `1px solid ${active ? 'var(--border-default)' : 'var(--border-subtle)'}`,
      borderRadius: 10, textAlign: 'left', fontFamily: 'var(--font-sans)',
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${tintByKind[kind]}1A`, color: tintByKind[kind],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={iconByKind[kind]} size={14}/>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{sub}</div>
      </div>
      <Icon name={active ? 'chevD' : 'chevR'} size={12} color="var(--text-muted)"/>
    </button>
  );
}

function OnboardingDisclosure({ which, tab, setTab, onClose }) {
  const tabs = [
    { k: 'plan',      icon: 'sparkle', label: 'Plan' },
    { k: 'code',      icon: 'code',    label: 'Code' },
    { k: 'workspace', icon: 'folder',  label: 'Workspace' },
    { k: 'context',   icon: 'layers',  label: 'Context' },
  ];
  return (
    <div style={{ width: 480, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 10px 0 14px', borderBottom: '1px solid var(--border-subtle)', gap: 2 }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 30, padding: '0 10px', border: 0, borderRadius: 7,
            background: tab === t.k ? 'var(--bg-elevated)' : 'transparent',
            color: tab === t.k ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}><Icon name={t.icon} size={12}/>{t.label}</button>
        ))}
        <div style={{ flex: 1 }}/>
        <button className="walt-btn ghost sm" style={{ width: 24, padding: 0, justifyContent: 'center' }} onClick={onClose} title="Close"><Icon name="close" size={12}/></button>
      </div>

      {tab !== 'plan' && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`walt-chip ${which}`} style={{ height: 18, padding: '0 7px', fontSize: 10, textTransform: 'uppercase' }}>{which}</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600 }}>
            {{bronze: 'Bronze · stripe-style ingest', silver: 'Silver · conformed', gold: 'Gold · finance marts', semantic: 'Semantic · finance.yml', plan: 'Plan'}[which]}
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'plan' && <DisclosurePlan/>}
        {tab === 'workspace' && (
          which === 'bronze' ? <DisclosureBronze/>
          : which === 'silver' ? <DisclosureSilver/>
          : which === 'semantic' ? <DisclosureSemantic/>
          : <DisclosureBronze/>
        )}
        {tab === 'context' && <DisclosureContext/>}
      </div>
    </div>
  );
}

function DisclosureContext() {
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Connections</div>
      {[
        { i: 'db', n: 'sqlserver · ERP_PROD', s: 'read-only · service account from vault' },
        { i: 'db', n: 'snowflake · FINANCE_PROD', s: 'read/write on bronze, silver, gold' },
        { i: 'git', n: 'github · acme/finance-platform', s: 'branch staging/dev · PR enabled' },
      ].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
          <Icon name={r.i} size={13} color="var(--text-muted)"/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="walt-mono" style={{ color: 'var(--text-primary)' }}>{r.n}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.s}</div>
          </div>
          <span className="walt-dot ok"/>
        </div>
      ))}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginTop: 6 }}>Tools Walt is using</div>
      {['dbt-core','great-expectations','sqlmesh','airflow','stripe-style replicator'].map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
          <Icon name="bolt" size={12} color="var(--semantic)"/>
          <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

function DisclosurePlan() {
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FlowDiagram/>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Steps</div>
      {[
        { s: 'ok',   tier: 'bronze', l: 'Mirror SQL Server → bronze' },
        { s: 'ok',   tier: 'bronze', l: 'Type contracts + PII masking' },
        { s: 'pend', tier: 'silver', l: 'Conform · intercompany decision' },
        { s: 'idle', tier: 'silver', l: 'SCD2 history' },
        { s: 'idle', tier: 'gold',   l: 'Marts · variance, cash, deferred-rev' },
        { s: 'idle', tier: 'gold',   l: 'Semantic model · finance.yml' },
      ].map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13 }}>
          <StepDot state={step.s}/>
          <span className={`walt-chip ${step.tier}`} style={{ height: 17, padding: '0 6px', fontSize: 10, textTransform: 'uppercase' }}>{step.tier}</span>
          <span style={{ color: step.s === 'idle' ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1 }}>{step.l}</span>
        </div>
      ))}
    </div>
  );
}

function DisclosureBronze() {
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[['Tables','220'],['Rows','312M'],['Size','42 GB'],['Build','11:08']].map(([k,v],i) => (
          <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k}</div>
            <div className="walt-mono" style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Models created</div>
      {['bronze.erp__gl_journal_lines','bronze.erp__ap_invoices','bronze.erp__ap_vendors','bronze.erp__ar_invoices','bronze.erp__cash_ledger','bronze.erp__defrev_schedule'].map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12.5 }}>
          <Icon name="file" size={11} color="var(--text-muted)"/>
          <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>{n}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Run log</div>
      <div style={{ background: 'var(--code-bg)', borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <div><span style={{ color: 'var(--text-dim)' }}>02:13:04</span>  dbt build --select bronze.erp</div>
        <div><span style={{ color: 'var(--text-dim)' }}>02:13:04</span>  Concurrency: 8 threads</div>
        <div><span style={{ color: 'var(--text-dim)' }}>02:24:12</span>  <span style={{ color: 'var(--status-ok)' }}>Finished 220 models · 0 errors · 0 warnings</span></div>
      </div>
    </div>
  );
}

function DisclosureSilver() {
  const lines = [
    '-- silver/conformed/vendors.sql · Walt generated',
    'with deduped as (',
    '  select vendor_id, vendor_name, tax_id, country,',
    '    row_number() over (',
    '      partition by tax_id order by updated_at desc',
    '    ) as rn',
    '  from bronze.erp__ap_vendors',
    '),',
    'intercompany_flag as (',
    '  select v.*, case when ic.tax_id is not null',
    '    then true else false end as is_intercompany',
    '  from deduped v',
    '  left join ref.intercompany_entities ic using (tax_id)',
    ')',
    'select * from intercompany_flag where rn = 1;',
  ];
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="walt-btn primary sm"><Icon name="branch" size={11}/> Open PR</button>
        <button className="walt-btn sm"><Icon name="download" size={11}/> Download zip</button>
        <button className="walt-btn ghost sm" style={{ marginLeft: 'auto' }}><Icon name="eye" size={11}/> Preview rows</button>
      </div>
      <div style={{ background: 'var(--code-bg)', borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06 }}>Checks</div>
      {['unique key on vendor_id','not-null (vendor_id, tax_id)','row drift < 5% vs prior','intercompany rows tagged'].map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
          <Icon name="check" size={11} color="var(--status-ok)"/>
          <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function DisclosureSemantic() {
  const lines = [
    '# semantic/finance.yml',
    'name: finance',
    'measures:',
    '  - name: variance_to_plan',
    '    expr: actual - planned',
    '  - name: cash_runway_weeks',
    '    expr: cash_balance / weekly_burn',
    '  - name: deferred_revenue',
    '    expr: sum(defrev_balance)',
    'dimensions:',
    '  - cost_center',
    '  - entity',
    '  - period',
    'relationships:',
    '  - to: dim_cost_center using cost_center_id',
  ];
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'var(--code-bg)', borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="walt-btn primary sm"><Icon name="check" size={11}/> Approve</button>
        <button className="walt-btn sm"><Icon name="branch" size={11}/> Open PR</button>
      </div>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 10px', background: 'var(--bg-inset)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
      <FlowNode icon="db" label="SQL Server"/>
      <FlowArrow/>
      <FlowNode tier="bronze" label="bronze"/>
      <FlowArrow/>
      <FlowNode tier="silver" label="silver"/>
      <FlowArrow/>
      <FlowNode tier="gold" label="gold"/>
      <FlowArrow/>
      <FlowNode icon="schema" label="semantic"/>
    </div>
  );
}

function FlowNode({ tier, icon, label }) {
  const c = tier ? `var(--${tier})` : 'var(--accent)';
  return (
    <div style={{ flex: 1, padding: '6px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {tier ? <span style={{ width: 10, height: 10, borderRadius: 2, background: c }}/> : <Icon name={icon} size={12} color={c}/>}
      <span style={{ fontSize: 10.5, color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function FlowArrow() {
  return <Icon name="arrowR" size={10} color="var(--text-muted)"/>;
}
