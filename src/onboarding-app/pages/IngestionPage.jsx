import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AgentBadge, AgentAvatar } from '../components/AgentBadge.jsx';
import { PageHeader } from './CatalogPage.jsx';

// IngestionPage — the project-level home for everything to do with bronze ingestion.
//
// The chat scripts the *first* ingestion run (with a SourceWizard modal pop-up); this
// page is where the user comes back to:
//
//   • see, edit, or add sources (each "Add source" reopens the SourceWizard)
//   • watch the live ingest run for whichever source is currently active
//   • sample landed bronze tables
//   • monitor the long-term production dashboard (24h success, freshness, lag)
//
// Importantly, the page mirrors `shell.ingestionStatus` so coming here from the
// chat shows the same in-flight run the chat is narrating.

const SOURCE_META = {
  sqlserver: { label: 'SQL Server · ERP_PROD', icon: 'db',    host: 'sql-erp01.imageinc.internal',  tables: 220, badge: 'Database'  },
  postgres:  { label: 'Postgres · app_prod',   icon: 'db',    host: 'pg-app01.imageinc.internal',   tables: 42,  badge: 'Database'  },
  snowflake: { label: 'Snowflake · RAW',       icon: 'cloud', host: 'imageinc.snowflakecomputing.com', tables: 18, badge: 'Warehouse' },
  kafka:     { label: 'Kafka · erp.events',    icon: 'pipe',  host: 'kafka-events.imageinc.internal',  tables: 7,  badge: 'Stream' },
  netsuite:  { label: 'NetSuite · sandbox',    icon: 'cloud', host: 'api.netsuite.com',             tables: 36,  badge: 'SaaS' },
  stripe:    { label: 'Stripe · live',         icon: 'cloud', host: 'api.stripe.com',               tables: 12,  badge: 'SaaS' },
  csv:       { label: 'CSV / Parquet drops',   icon: 'file',  host: 's3://imageinc-landing/',       tables: 0,   badge: 'Files' },
  airflow:   { label: 'Adopted Airflow DAGs',  icon: 'flow',  host: 'airflow-prod.imageinc.internal', tables: 16, badge: 'Adopt' },
};

const SAMPLE_TABLES = [
  { name: 'bronze.gl.journal_entries',   rows: '2.1M',  fresh: '3m',  cols: 18, pii: 0 },
  { name: 'bronze.gl.gl_accounts',       rows: '4.8k',  fresh: '3m',  cols: 12, pii: 0 },
  { name: 'bronze.ap.invoices',          rows: '186k',  fresh: '3m',  cols: 14, pii: 1 },
  { name: 'bronze.ap.vendors',           rows: '2.4k',  fresh: '3m',  cols: 11, pii: 1 },
  { name: 'bronze.ar.invoices',          rows: '512k',  fresh: '3m',  cols: 16, pii: 1 },
  { name: 'bronze.ar.customers',         rows: '18.9k', fresh: '3m',  cols: 21, pii: 2 },
  { name: 'bronze.cash.bank_transactions',rows: '1.3M', fresh: '3m',  cols: 12, pii: 1 },
  { name: 'bronze.defrev.deferred_revenue',rows: '88k', fresh: '3m',  cols: 13, pii: 0 },
];

const PRODUCTION_RUNS = [
  { source: 'sqlserver', cadence: '30m',  lag: '1m 12s',  success: '99.8%', lastRun: '2 min ago', next: 'in 27m' },
  { source: 'kafka',     cadence: 'live', lag: '320ms',   success: '100%',  lastRun: 'streaming', next: 'streaming' },
  { source: 'netsuite',  cadence: '1h',   lag: '8m 04s',  success: '99.1%', lastRun: '32 min ago', next: 'in 28m' },
  { source: 'csv',       cadence: 'watch',lag: '— ',       success: '100%',  lastRun: '2 hr ago',   next: 'on drop' },
];

export function IngestionPage() {
  const { ctx, shell, openWizard, openArtifact, setShellTab } = usePhase();
  const sources = (ctx.sources && ctx.sources.length)
    ? ctx.sources
    : ['sqlserver', 'kafka', 'netsuite'];
  const [activeSource, setActiveSource] = React.useState(sources[0]);
  React.useEffect(() => {
    if (!sources.includes(activeSource)) setActiveSource(sources[0]);
  }, [sources, activeSource]);

  const status = shell.ingestionStatus; // 'idle' | 'running' | 'complete'
  const isRunning = status === 'running';
  const isComplete = status === 'complete';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg-app)' }}>
      <PageHeader
        title="Ingestion"
        subtitle={
          isRunning ? 'Walt is mirroring data into bronze right now — see the live run below.' :
          isComplete ? 'Bronze landing complete. Manage sources, sample data, or watch the production dashboard.' :
          'Bring data into bronze. Add a source to kick off a connector with Walt.'
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Sources strip */}
          <SectionShell
            title="Sources"
            desc="Connectors Walt watches. Each one runs on its own cadence and lands in bronze."
            right={
              <button className="walt-btn primary sm" onClick={() => openWizard('sources')}>
                <Icon name="plus" size={11}/> Add source
              </button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              {sources.map(key => {
                const meta = SOURCE_META[key] || { label: key, icon: 'db', host: '—', tables: 0, badge: 'Source' };
                const active = key === activeSource;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSource(key)}
                    style={{
                      textAlign: 'left',
                      padding: 14, borderRadius: 12,
                      background: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      border: active ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      display: 'flex', flexDirection: 'column', gap: 10,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: active ? 'var(--accent)' : 'var(--bg-inset)',
                        color: active ? 'white' : 'var(--text-secondary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name={meta.icon} size={14} color={active ? 'white' : 'currentColor'}/>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</div>
                        <div className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meta.host}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Pill>{meta.badge}</Pill>
                      <Pill>{meta.tables} tables</Pill>
                      {active && <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--accent)' }}>· viewing</span>}
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => openWizard('sources')}
                style={{
                  textAlign: 'left',
                  padding: 14, borderRadius: 12,
                  background: 'transparent',
                  border: '1px dashed var(--border-default)',
                  color: 'var(--text-secondary)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  minHeight: 92,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'var(--bg-inset)', color: 'var(--text-secondary)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="plus" size={14}/>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Add a source</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Open the source wizard</div>
                  </div>
                </div>
              </button>
            </div>
          </SectionShell>

          {/* Live ingestion */}
          <SectionShell
            title="Live ingestion"
            desc={
              isRunning ? 'A run is in progress. Watch tables land in real time.' :
              isComplete ? 'No active run. The last run finished cleanly — review the run log or open the side panel.' :
              'Walt will start the first run as soon as you finish the source wizard.'
            }
            right={
              <button
                className="walt-btn ghost sm"
                onClick={() => { setShellTab('chat'); openArtifact('ingestion-status'); }}
              >
                <Icon name="eye" size={11}/> Side panel
              </button>
            }
          >
            <LiveRunCard isRunning={isRunning} isComplete={isComplete} activeSource={activeSource}/>
          </SectionShell>

          {/* Sample */}
          <SectionShell
            title="Sample"
            desc="Peek at landed bronze tables. Walt masks PII before profiling."
          >
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              <div style={{
                padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-inset)',
              }}>
                <Icon name="table" size={11} color="var(--text-secondary)"/>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Bronze landing · profile</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>showing 8 of 220</span>
              </div>
              {SAMPLE_TABLES.map((t, i) => (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                }}>
                  <Icon name="table" size={11} color="var(--text-muted)"/>
                  <span className="walt-mono" style={{ fontSize: 11.5, color: 'var(--text-primary)' }}>{t.name}</span>
                  <div style={{ flex: 1 }}/>
                  <Pill>{t.rows} rows</Pill>
                  <Pill>{t.cols} cols</Pill>
                  <Pill>fresh {t.fresh}</Pill>
                  {t.pii > 0 && (
                    <span style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 999,
                      background: 'rgba(206,93,42,0.10)', color: 'var(--status-warn)',
                      fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}>
                      <Icon name="shield" size={8} color="var(--status-warn)"/>
                      {t.pii}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </SectionShell>

          {/* Production dashboard */}
          <SectionShell
            title="Production"
            desc="Ongoing ingest runs across all configured sources."
          >
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 14,
              padding: 14, marginBottom: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
            }}>
              <Kpi label="Success · 24h" value="99.7%" accent="ok"/>
              <Kpi label="Rows landed · 24h" value="184M"/>
              <Kpi label="Bytes pulled · 24h" value="62 GB"/>
              <Kpi label="PII columns masked" value="48"/>
              <Kpi label="Schema drifts" value="1" accent="warn"/>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              <div style={{
                padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
                display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 1fr 0.8fr',
                gap: 10, alignItems: 'center', background: 'var(--bg-inset)',
                fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5,
                color: 'var(--text-muted)', fontWeight: 700,
              }}>
                <span>Source</span>
                <span>Cadence</span>
                <span>Lag</span>
                <span>Success</span>
                <span>Last run</span>
                <span>Next</span>
              </div>
              {PRODUCTION_RUNS.map((r, i) => {
                const meta = SOURCE_META[r.source] || { label: r.source, icon: 'db' };
                return (
                  <div key={r.source} style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 1fr 0.8fr',
                    gap: 10, alignItems: 'center',
                    padding: '10px 14px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    fontSize: 12, color: 'var(--text-primary)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AgentAvatar agent="ingestor" size={18}/>
                      <span style={{ fontWeight: 500 }}>{meta.label}</span>
                    </div>
                    <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{r.cadence}</span>
                    <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{r.lag}</span>
                    <span style={{ color: 'var(--status-ok)', fontWeight: 600 }}>{r.success}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{r.lastRun}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{r.next}</span>
                  </div>
                );
              })}
            </div>
          </SectionShell>
        </div>
      </div>
    </div>
  );
}

// ---- helpers ----

function SectionShell({ title, desc, right, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return (
    <span style={{
      fontSize: 10.5, padding: '2px 7px', borderRadius: 999,
      background: 'var(--bg-inset)', color: 'var(--text-secondary)', fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>{children}</span>
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

function LiveRunCard({ isRunning, isComplete, activeSource }) {
  const meta = SOURCE_META[activeSource] || { label: activeSource, icon: 'db' };
  const [progress, setProgress] = React.useState(isComplete ? 100 : isRunning ? 24 : 0);
  const [tableIdx, setTableIdx] = React.useState(isComplete ? SAMPLE_TABLES.length : isRunning ? 3 : 0);

  React.useEffect(() => {
    if (isComplete) {
      setProgress(100);
      setTableIdx(SAMPLE_TABLES.length);
    } else if (isRunning) {
      setProgress(p => (p < 24 ? 24 : p));
      setTableIdx(i => (i < 3 ? 3 : i));
    } else {
      setProgress(0);
      setTableIdx(0);
    }
  }, [isRunning, isComplete]);

  React.useEffect(() => {
    if (!isRunning) return;
    if (progress >= 95) return;
    const id = setInterval(() => {
      setProgress(p => Math.min(95, p + 7));
      setTableIdx(i => Math.min(SAMPLE_TABLES.length, i + 1));
    }, 420);
    return () => clearInterval(id);
  }, [progress, isRunning]);

  const statusLabel = isComplete ? 'Complete' : isRunning ? 'Running' : 'Idle';
  const statusColor = isComplete ? 'var(--status-ok)' : isRunning ? 'var(--accent)' : 'var(--text-muted)';
  const statusBg    = isComplete ? 'rgba(63,143,63,0.12)' : isRunning ? 'rgba(54,86,198,0.10)' : 'var(--bg-inset)';

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AgentBadge agent="ingestor" size="sm" sub="raw-landing-agent"/>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 999,
          background: statusBg, color: statusColor, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          {isRunning ? <span className="walt-dot run"/> : isComplete ? <Icon name="check" size={9} color={statusColor}/> : null}
          {statusLabel}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <Icon name={meta.icon} size={11} color="var(--text-muted)"/> {meta.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="walt-mono" style={{
          fontSize: 24, fontWeight: 600, color: 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}>{progress}%</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {tableIdx} / {SAMPLE_TABLES.length} priority tables
        </span>
        <div style={{ flex: 1 }}/>
        <Pill>Throughput · 48k rows/sec</Pill>
        <Pill>Bytes · 2.4 GB</Pill>
        <Pill>ETA · {progress >= 100 ? 'done' : '~' + Math.max(1, Math.round((100 - progress) / 8)) + 'm'}</Pill>
      </div>

      <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-inset)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: progress + '%',
          background: 'linear-gradient(90deg, var(--accent), var(--semantic))',
          transition: 'width .3s ease',
        }}/>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SAMPLE_TABLES.map((t, i) => {
          const done = i < tableIdx;
          const live = i === tableIdx && progress < 100;
          return (
            <div key={t.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px',
              borderRadius: 8,
              background: live ? 'var(--accent-soft)' : 'transparent',
              border: '1px solid ' + (live ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'transparent'),
              opacity: done || live ? 1 : 0.45,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 999, flexShrink: 0,
                background: done ? 'rgba(63,143,63,0.10)' : live ? 'rgba(54,86,198,0.10)' : 'var(--bg-inset)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done ? <Icon name="check" size={8} color="var(--status-ok)"/> :
                 live ? <span className="walt-dot run" style={{ width: 4, height: 4 }}/> :
                        <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-muted)' }}/>}
              </span>
              <span className="walt-mono" style={{ fontSize: 11.5, color: 'var(--text-primary)' }}>{t.name}</span>
              <div style={{ flex: 1 }}/>
              {(done || live) && <Pill>{t.rows} rows</Pill>}
              {(done || live) && <Pill>{t.cols} cols</Pill>}
              {(done || live) && t.pii > 0 && (
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 999,
                  background: 'rgba(206,93,42,0.10)', color: 'var(--status-warn)',
                  fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  <Icon name="shield" size={8} color="var(--status-warn)"/>{t.pii}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
