import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { AgentBadge } from '../components/AgentBadge.jsx';
import { AgentRunLog } from '../components/AgentRunLog.jsx';
import { usePhase } from '../state.jsx';

// Per-table summary cards. Walt's "profile" pass picks up rows, columns, null %, and
// flags PII fields. This is a fixed sample list so the demo stays predictable; in a
// real run the agent would publish these incrementally as it lands each table.
const TABLES = [
  { schema: 'GL',     name: 'journal_entries',   rows: '2.1M',  cols: 18, nullPct: 0.4, pii: 0 },
  { schema: 'GL',     name: 'gl_accounts',       rows: '4.8k',  cols: 12, nullPct: 0.0, pii: 0 },
  { schema: 'GL',     name: 'gl_periods',        rows: '184',   cols: 9,  nullPct: 0.0, pii: 0 },
  { schema: 'AP',     name: 'invoices',          rows: '186k',  cols: 14, nullPct: 1.2, pii: 1 },
  { schema: 'AP',     name: 'vendors',           rows: '2.4k',  cols: 11, nullPct: 0.8, pii: 1 },
  { schema: 'AP',     name: 'payment_runs',      rows: '12.6k', cols: 10, nullPct: 0.5, pii: 0 },
  { schema: 'AR',     name: 'invoices',          rows: '512k',  cols: 16, nullPct: 0.9, pii: 1 },
  { schema: 'AR',     name: 'customers',         rows: '18.9k', cols: 21, nullPct: 2.1, pii: 2 },
  { schema: 'AR',     name: 'receipts',          rows: '402k',  cols: 9,  nullPct: 0.3, pii: 0 },
  { schema: 'CASH',   name: 'bank_transactions', rows: '1.3M',  cols: 12, nullPct: 0.1, pii: 1 },
  { schema: 'CASH',   name: 'cash_accounts',     rows: '46',    cols: 8,  nullPct: 0.0, pii: 0 },
  { schema: 'DEFREV', name: 'deferred_revenue',  rows: '88k',   cols: 13, nullPct: 0.6, pii: 0 },
];

const LOG_LINES = [
  { t: '0.4s',  msg: 'Connected to sources · read-only service account' },
  { t: '0.6s',  msg: 'Schemas resolved: GL, AP, AR, CASH, DEFREV (220 tables)' },
  { t: '0.9s',  msg: 'Building bronze contracts · adding _ingested_at, _source, _batch_id', kind: 'ok' },
  { t: '1.2s',  msg: 'Applying PII masking · vendor_name, employee_name (sha256+salt)' },
  { t: '1.4s',  msg: 'Starting batch · sample window last 30 days · 12 priority tables first' },
  { t: '2.0s',  msg: 'GL.journal_entries · streaming 2.1M rows · profiling 18 columns' },
  { t: '3.1s',  msg: 'AP.invoices · 186k rows · 14 columns · null % 1.2', kind: 'ok' },
  { t: '4.0s',  msg: 'AR.customers · 18.9k rows · masked: customer_legal_name, email_address', kind: 'ok' },
  { t: '5.2s',  msg: 'CASH.bank_transactions · 1.3M rows · 9 partitions' },
  { t: '6.4s',  msg: 'great_expectations · null_check, freshness, row_count_drift registered' },
];

// Display labels for the source keys persisted in ctx.sources. Falls back to the key
// if unknown — keeps the header sane even if the catalog adds new entries.
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

export function IngestionArtifact() {
  const { shell, ctx } = usePhase();
  const status = shell.ingestionStatus; // 'idle' | 'running' | 'complete'

  const sourcesLabel = formatSources(ctx.sources);
  const bronzeTarget = `bronze.${(ctx.domainKey || 'finance').toLowerCase()}.*`;

  // When complete, show full progress / all logs / all tables. While running, tick a
  // local timer for visual feedback. The shell-level timer is the source of truth for
  // when "complete" is reached and the chat advances.
  const [progress, setProgress] = React.useState(status === 'complete' ? 100 : 12);
  const [logs, setLogs] = React.useState(status === 'complete' ? LOG_LINES : LOG_LINES.slice(0, 2));
  const [tableIdx, setTableIdx] = React.useState(status === 'complete' ? TABLES.length : 1);

  // Sync to status changes — when the shell flips to 'complete', snap to 100%.
  React.useEffect(() => {
    if (status === 'complete') {
      setProgress(100);
      setLogs(LOG_LINES);
      setTableIdx(TABLES.length);
    } else if (status === 'idle') {
      setProgress(12);
      setLogs(LOG_LINES.slice(0, 2));
      setTableIdx(1);
    }
  }, [status]);

  React.useEffect(() => {
    if (status !== 'running') return;
    if (progress >= 95) return; // hold at 95 until shell flips to 'complete'
    const id = setInterval(() => {
      setProgress(p => Math.min(95, p + 8));
      setLogs(ls => (ls.length < LOG_LINES.length ? LOG_LINES.slice(0, ls.length + 1) : ls));
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
        display: 'flex', alignItems: 'flex-end', gap: 10,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AgentBadge agent="ingestor" size="sm" sub="raw-landing-agent"/>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 999,
              background: isComplete ? 'rgba(63,143,63,0.12)' : 'rgba(54,86,198,0.10)',
              color: isComplete ? 'var(--status-ok)' : 'var(--accent)',
              fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              {isComplete
                ? <><Icon name="check" size={9} color="var(--status-ok)"/> Complete</>
                : <><span className="walt-dot run"/> Running</>
              }
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {sourcesLabel} → <Mono>{bronzeTarget}</Mono> · sample window 30 days · profiling on
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Progress card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="walt-mono" style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {progress}%
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {tableIdx} / {TABLES.length} priority tables
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-inset)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: progress + '%',
              background: 'linear-gradient(90deg, var(--accent), var(--semantic))',
              transition: 'width .3s ease',
            }}/>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text-muted)' }}>
            <Stat label="Throughput" value="48k rows/sec"/>
            <Stat label="Bytes pulled" value="2.4 GB"/>
            <Stat label="PII masked" value="14 cols"/>
            <Stat label="ETA" value={progress >= 100 ? 'done' : '~' + Math.max(1, Math.round((100 - progress) / 8)) + 'm'}/>
          </div>
        </div>

        {/* Tables coming in + per-table profile */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-inset)',
          }}>
            <Icon name="table" size={12} color="var(--text-secondary)"/>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              Bronze tables · landing + profile
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>showing first 12 of 220</span>
          </div>
          <div>
            {TABLES.map((t, i) => {
              const done = i < tableIdx;
              const live = i === tableIdx && progress < 100;
              const visible = done || live;
              return (
                <div key={t.schema + t.name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px',
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
                  <span className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)', flexShrink: 0 }}>
                    bronze.{t.schema.toLowerCase()}.{t.name}
                  </span>
                  <div style={{ flex: 1 }}/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {visible ? (
                      <>
                        <ProfileChip label={t.rows + ' rows'}/>
                        <ProfileChip label={t.cols + ' cols'}/>
                        <ProfileChip label={'nulls ' + t.nullPct.toFixed(1) + '%'}/>
                        {t.pii > 0 && (
                          <span style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 999,
                            background: 'rgba(206,93,42,0.10)', color: 'var(--status-warn)',
                            fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            <Icon name="shield" size={9} color="var(--status-warn)"/>
                            {t.pii} PII
                          </span>
                        )}
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Run log */}
        <AgentRunLog agent="ingestor" title="Ingestor · raw-landing-agent" lines={logs}/>
      </div>
    </div>
  );
}

function Mono({ children }) {
  return <span className="walt-mono" style={{ background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4, fontSize: 11.5 }}>{children}</span>;
}

function ProfileChip({ label }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 7px', borderRadius: 999,
      background: 'var(--bg-inset)', color: 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)', fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{label}</span>
      <span className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
