import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { AgentBadge } from '../components/AgentBadge.jsx';
import { usePhase } from '../state.jsx';

// IngestionStatusArtifact — compact, side-panel-friendly view of the *current*
// ingest run. Companion to (and lighter than) the full IngestionArtifact which
// now lives only on the Ingestion project page.
//
// What it shows:
//   • Run summary header (status pill, sources → target, ETA).
//   • Throughput / bytes / PII counters.
//   • A short list of tables currently landing with their profile chips.
//
// What it *doesn't* show: a separate full-screen log pane, dashboard, or
// promotion controls — those live on the Ingestion project page so the side
// panel stays focused on "what is the agent doing right now?".

const TABLES = [
  { schema: 'GL',     name: 'journal_entries',   rows: '2.1M',  cols: 18, nullPct: 0.4, pii: 0 },
  { schema: 'GL',     name: 'gl_accounts',       rows: '4.8k',  cols: 12, nullPct: 0.0, pii: 0 },
  { schema: 'AP',     name: 'invoices',          rows: '186k',  cols: 14, nullPct: 1.2, pii: 1 },
  { schema: 'AP',     name: 'vendors',           rows: '2.4k',  cols: 11, nullPct: 0.8, pii: 1 },
  { schema: 'AR',     name: 'invoices',          rows: '512k',  cols: 16, nullPct: 0.9, pii: 1 },
  { schema: 'AR',     name: 'customers',         rows: '18.9k', cols: 21, nullPct: 2.1, pii: 2 },
  { schema: 'CASH',   name: 'bank_transactions', rows: '1.3M',  cols: 12, nullPct: 0.1, pii: 1 },
  { schema: 'DEFREV', name: 'deferred_revenue',  rows: '88k',   cols: 13, nullPct: 0.6, pii: 0 },
];

const SOURCE_LABELS = {
  sqlserver: 'SQL Server',
  postgres:  'Postgres',
  snowflake: 'Snowflake',
  kafka:     'Kafka',
  netsuite:  'NetSuite',
  stripe:    'Stripe',
  csv:       'CSV / Parquet',
  airflow:   'Airflow DAGs',
};

function formatSources(keys) {
  if (!keys || !keys.length) return 'No sources configured';
  const labels = keys.map(k => SOURCE_LABELS[k] || k);
  if (labels.length <= 2) return labels.join(' · ');
  return labels.slice(0, 2).join(' · ') + ' +' + (labels.length - 2) + ' more';
}

export function IngestionStatusArtifact() {
  const { shell, ctx } = usePhase();
  const status = shell.ingestionStatus; // 'idle' | 'running' | 'complete'
  const sourcesLabel = formatSources(ctx.sources);
  const bronzeTarget = `bronze.${(ctx.domainKey || 'finance').toLowerCase()}.*`;

  const [progress, setProgress] = React.useState(status === 'complete' ? 100 : 18);
  const [tableIdx, setTableIdx] = React.useState(status === 'complete' ? TABLES.length : 2);

  React.useEffect(() => {
    if (status === 'complete') {
      setProgress(100);
      setTableIdx(TABLES.length);
    } else if (status === 'idle') {
      setProgress(18);
      setTableIdx(2);
    }
  }, [status]);

  React.useEffect(() => {
    if (status !== 'running') return;
    if (progress >= 95) return;
    const id = setInterval(() => {
      setProgress(p => Math.min(95, p + 9));
      setTableIdx(i => Math.min(TABLES.length, i + 1));
    }, 360);
    return () => clearInterval(id);
  }, [progress, status]);

  const isComplete = status === 'complete';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <AgentBadge agent="ingestor" size="sm" sub="raw-landing-agent"/>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 999,
            background: isComplete ? 'rgba(63,143,63,0.12)' : 'rgba(54,86,198,0.10)',
            color: isComplete ? 'var(--status-ok)' : 'var(--accent)',
            fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {isComplete
              ? <><Icon name="check" size={9} color="var(--status-ok)"/> Complete</>
              : <><span className="walt-dot run"/> Running</>}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {sourcesLabel} → <Mono>{bronzeTarget}</Mono> · sample window 30 days · profiling on
        </div>
      </div>

      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: '14px 22px 24px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Progress card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="walt-mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {progress}%
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              {tableIdx} / {TABLES.length} priority tables
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: 'var(--bg-inset)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: progress + '%',
              background: 'linear-gradient(90deg, var(--accent), var(--semantic))',
              transition: 'width .3s ease',
            }}/>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <Stat label="Throughput" value="48k rows/sec"/>
            <Stat label="Bytes pulled" value="2.4 GB"/>
            <Stat label="PII masked" value="14 cols"/>
            <Stat label="ETA" value={progress >= 100 ? 'done' : '~' + Math.max(1, Math.round((100 - progress) / 8)) + 'm'}/>
          </div>
        </div>

        {/* Tables card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-inset)',
          }}>
            <Icon name="table" size={11} color="var(--text-secondary)"/>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              Bronze landing · profile
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>showing 8 of 220</span>
          </div>
          {TABLES.map((t, i) => {
            const done = i < tableIdx;
            const live = i === tableIdx && progress < 100;
            const visible = done || live;
            return (
              <div key={t.schema + t.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                opacity: visible ? 1 : 0.45,
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
                <span className="walt-mono" style={{ fontSize: 11.5, color: 'var(--text-primary)', flexShrink: 0 }}>
                  bronze.{t.schema.toLowerCase()}.{t.name}
                </span>
                <div style={{ flex: 1 }}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--text-muted)' }}>
                  {visible ? (
                    <>
                      <Chip label={t.rows + ' rows'}/>
                      <Chip label={t.cols + ' cols'}/>
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
                    </>
                  ) : <span>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Mono({ children }) {
  return <span className="walt-mono" style={{ background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4, fontSize: 11.5 }}>{children}</span>;
}

function Chip({ label }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 6px', borderRadius: 999,
      background: 'var(--bg-inset)', color: 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)', fontWeight: 500, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{label}</span>
      <span className="walt-mono" style={{ fontSize: 11.5, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
