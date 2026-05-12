import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AgentBadge } from '../components/AgentBadge.jsx';
import { DOMAIN_SOURCE_RECOMMENDATIONS } from '../sessions.js';

// "Configure your sources" artifact. Surfaced when the chat asks the user to pick
// where their domain data lives. Behaves in two modes:
//
//   pickerMode  (shell.awaitingArtifactConfirm === 'sources')
//     Domain-aware catalog with recommended sources pre-selected. Sticky bottom CTA
//     "Confirm sources" — clicking it writes ctx.sources and clears the awaiting-
//     confirm gate so the chat can advance to ingestion.
//
//   manageMode  (default)
//     Full sources + destinations + credentials view for browsing the catalog after
//     setup is done.

const SOURCES = [
  { key: 'sqlserver', name: 'SQL Server',     kind: 'Database',  icon: 'db',    desc: 'ERP, OLTP databases — incremental + full reload', badge: 'Connector', health: 'ok',  last: '3m ago' },
  { key: 'postgres',  name: 'Postgres',       kind: 'Database',  icon: 'db',    desc: 'App backends — logical decoding for CDC',         badge: 'Connector', health: 'ok',  last: '6m ago' },
  { key: 'snowflake', name: 'Snowflake',      kind: 'Warehouse', icon: 'cloud', desc: 'Cross-account share / replication',               badge: 'Connector', health: '—',   last: 'never'  },
  { key: 'kafka',     name: 'Kafka',          kind: 'Stream',    icon: 'pipe',  desc: 'Event streams — exactly-once into bronze',        badge: 'Stream',    health: '—',   last: 'never'  },
  { key: 'netsuite',  name: 'NetSuite',       kind: 'SaaS',      icon: 'cloud', desc: 'ERP — managed connector with credentials',        badge: 'Connector', health: 'ok',  last: '11m ago' },
  { key: 'stripe',    name: 'Stripe',         kind: 'SaaS',      icon: 'cloud', desc: 'Payments, subscriptions, invoices',               badge: 'Connector', health: 'ok',  last: '8m ago' },
  { key: 'csv',       name: 'CSV / Parquet',  kind: 'Files',     icon: 'file',  desc: 'Drop files into a watched local folder or S3',    badge: 'Local',     health: '—',   last: 'never'  },
  { key: 'airflow',   name: 'Existing Airflow', kind: 'Adopt',   icon: 'flow',  desc: 'Walt reads your DAGs and learns landing tables',  badge: 'Adopt',     health: '—',   last: 'never'  },
];

const DESTINATIONS = [
  { key: 'snowflake-prod', name: 'Snowflake', kind: 'Warehouse', icon: 'cloud', dbName: 'FINANCE_PROD',  envs: ['staging', 'prod'], note: 'Primary destination · staging + prod schemas' },
  { key: 'snowflake-analytics', name: 'Snowflake', kind: 'Warehouse', icon: 'cloud', dbName: 'ANALYTICS',  envs: ['analytics'], note: 'Read-only mirror for analyst access' },
];

export function ConnectionsArtifact() {
  const { ctx, set, shell, setAwaitingArtifactConfirm } = usePhase();

  // "Picker mode" — the chat is gating progress on a confirmation here. We focus
  // the UI on sources only (no destinations/credentials noise) and offer a sticky
  // bottom CTA.
  const pickerMode = shell.awaitingArtifactConfirm === 'sources';

  // What the source picker shows as "recommended" right now. Falls back to a sane
  // default if the user hasn't picked a domain yet (shouldn't happen in first-run,
  // but the catalog tab is usable later too).
  const recommended = DOMAIN_SOURCE_RECOMMENDATIONS[ctx.domainKey]
    || DOMAIN_SOURCE_RECOMMENDATIONS.Finance;

  // Picked sources. Seed from ctx.sources if already chosen; otherwise pre-select
  // the domain's recommended set so the user can confirm with one click.
  const initialPicked = ctx.sources.length ? ctx.sources : recommended;
  const [picked, setPicked] = React.useState(initialPicked);
  // Track when the picker mode confirmation has been registered so we can swap to
  // a "saved" state without immediately collapsing the panel.
  const [savedAt, setSavedAt] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  // Used in manage mode for the inline credentials drawer.
  const [drawerKey, setDrawerKey] = React.useState(initialPicked[0] || 'sqlserver');

  const toggle = (k) => {
    setPicked(p => {
      const next = p.includes(k) ? p.filter(x => x !== k) : [...p, k];
      // In manage mode we persist on every toggle (no explicit confirm step).
      if (!pickerMode) set({ sources: next });
      return next;
    });
    setDrawerKey(k);
  };

  const canConfirm = picked.length > 0 && !busy;

  const onConfirmSources = () => {
    if (!canConfirm) return;
    setBusy(true);
    // Small artificial delay — feels like a "saving" round-trip.
    setTimeout(() => {
      set({ sources: picked });
      setAwaitingArtifactConfirm('');
      setSavedAt(Date.now());
      setBusy(false);
    }, 600);
  };

  const confirmed = pickerMode && savedAt > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <ArtifactHeader
        title={pickerMode ? 'Configure your sources' : 'Sources & destinations'}
        subtitle={pickerMode
          ? <>Pick what Walt should mirror into <Mono>bronze.{(ctx.domainKey || 'finance').toLowerCase()}.*</Mono>. Recommended ones are pre-selected for the {ctx.domain || 'Finance'} domain.</>
          : 'Walt mirrors sources into bronze and writes silver/gold into destinations.'
        }
        meta={pickerMode
          ? `${picked.length} selected · ${recommended.length} recommended`
          : `${picked.length} source${picked.length === 1 ? '' : 's'} selected · ${DESTINATIONS.length} destinations`
        }
        confirmed={confirmed}
      />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 22px 24px' }}>
        <Section
          title={pickerMode ? `Recommended for ${ctx.domain || 'this domain'}` : 'Sources'}
          desc={pickerMode
            ? <>The fastest way to a useful silver layer is to start with the systems most {ctx.domain || 'Finance'} teams pull from. Toggle anything off you don't need, or add others below.</>
            : <>Pick what Walt's <AgentBadge agent="ingestor" size="sm"/> should mirror. Existing Airflow DAGs can be adopted instead of replaced.</>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {(pickerMode
              ? SOURCES.filter(s => recommended.includes(s.key))
              : SOURCES).map(s => (
              <SourceCard
                key={s.key}
                source={s}
                isOn={picked.includes(s.key)}
                isRecommended={recommended.includes(s.key)}
                onToggle={() => toggle(s.key)}
              />
            ))}
          </div>
        </Section>

        {pickerMode && (
          <Section
            title="More sources"
            desc={<>Anything else you want to land in bronze. Existing Airflow DAGs can be adopted instead of replaced.</>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              {SOURCES.filter(s => !recommended.includes(s.key)).map(s => (
                <SourceCard
                  key={s.key}
                  source={s}
                  isOn={picked.includes(s.key)}
                  isRecommended={false}
                  onToggle={() => toggle(s.key)}
                />
              ))}
            </div>

            <div style={{
              marginTop: 12,
              padding: '10px 12px', background: 'var(--bg-inset)',
              border: '1px solid var(--border-subtle)', borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-secondary)',
            }}>
              <Icon name="sparkle" size={11} color="var(--text-muted)"/>
              <span>Don't see what you need? Walt can write a custom Python connector and run it as a managed job.</span>
              <div style={{ flex: 1 }}/>
              <button className="walt-btn ghost sm"><Icon name="plus" size={11}/> Custom source</button>
            </div>
          </Section>
        )}

        {/* Manage mode keeps the catalog complete — sources, destinations, credentials. */}
        {!pickerMode && (
          <>
            <Section
              title="Destinations"
              desc={<>Where Walt writes silver, gold, and the semantic layer. <AgentBadge agent="governer" size="sm"/> applies masking and retention here.</>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DESTINATIONS.map(d => (
                  <div key={d.key} style={{
                    padding: 13,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    background: 'var(--bg-surface)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: 'var(--semantic-soft)', color: 'var(--semantic)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={d.icon} size={14} color="currentColor"/>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {d.name} · <span className="walt-mono">{d.dbName}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{d.note}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {d.envs.map(e => (
                        <span key={e} style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 999,
                          background: 'var(--bg-inset)', color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                        }}>{e}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title={`Credentials · ${SOURCES.find(s => s.key === drawerKey)?.name || ''}`}
              desc="Walt supports service accounts, AWS Secrets Manager, and HashiCorp Vault. Nothing leaves your network."
            >
              <CredentialsForm sourceKey={drawerKey}/>
            </Section>
          </>
        )}
      </div>

      {/* Sticky CTA — only rendered in picker mode. */}
      {pickerMode && (
        <div style={{
          flexShrink: 0,
          padding: '14px 22px',
          borderTop: '1px solid var(--border-subtle)',
          background: confirmed ? 'var(--bg-surface)' : 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              {confirmed
                ? 'Sources confirmed.'
                : picked.length === 0
                  ? 'Pick at least one source'
                  : `${picked.length} source${picked.length === 1 ? '' : 's'} ready to mirror`}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              {confirmed
                ? <>Walt's mirroring + profiling them now. The chat will pick back up.</>
                : <>On confirm, Walt's Ingestor starts mirroring + profiling these tables into bronze.</>
              }
            </div>
          </div>
          <button
            className="walt-btn primary"
            onClick={onConfirmSources}
            disabled={!canConfirm || confirmed}
            style={{ opacity: (!canConfirm || confirmed) ? 0.55 : 1 }}
          >
            {confirmed ? <><Icon name="check" size={11}/> Confirmed</>
              : busy ? 'Saving…'
              : <>Confirm {picked.length} source{picked.length === 1 ? '' : 's'} <Icon name="arrowR" size={11}/></>}
          </button>
        </div>
      )}
    </div>
  );
}

// Renders a single picker card for one source.
function SourceCard({ source: s, isOn, isRecommended, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: 13,
        borderRadius: 12,
        border: isOn ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
        background: isOn ? 'var(--accent-soft)' : 'var(--bg-surface)',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'border-color .12s, background .12s',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: isOn ? 'var(--accent)' : 'var(--bg-inset)',
          color: isOn ? 'white' : 'var(--text-secondary)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name={s.icon} size={14} color={isOn ? 'white' : 'currentColor'}/>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.kind} · {s.last}</div>
        </div>
        {isOn && <Icon name="check" size={12} color="var(--accent)"/>}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 999,
          background: 'var(--bg-inset)', color: 'var(--text-secondary)',
          fontWeight: 500,
        }}>{s.badge}</span>
        {s.health === 'ok' && (
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 999,
            background: 'rgba(63,143,63,0.10)', color: 'var(--status-ok)', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--status-ok)' }}/>
            healthy
          </span>
        )}
        {isRecommended && (
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 999,
            background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <Icon name="sparkle" size={9} color="var(--accent)"/>
            recommended
          </span>
        )}
      </div>
    </button>
  );
}

function ArtifactHeader({ title, subtitle, meta, confirmed }) {
  return (
    <div style={{
      padding: '14px 22px 12px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            {confirmed && (
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 999,
                background: 'rgba(63,143,63,0.10)', color: 'var(--status-ok)',
                fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <Icon name="check" size={9} color="var(--status-ok)"/> Confirmed
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
        {meta && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{meta}</span>}
      </div>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
      {children}
    </div>
  );
}

function CredentialsForm({ sourceKey }) {
  const src = SOURCES.find(s => s.key === sourceKey) || SOURCES[0];
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={src.icon} size={13}/>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{src.name} · {src.kind}</span>
      </div>
      <Field label="Host">
        <input style={input} defaultValue="sql-erp01.imageinc.internal"/>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Database">
          <input style={input} defaultValue="ERP_PROD"/>
        </Field>
        <Field label="Auth">
          <select style={input} defaultValue="vault">
            <option value="vault">HashiCorp Vault · imageinc/finance/erp</option>
            <option value="aws">AWS Secrets Manager</option>
            <option value="env">Environment variables</option>
            <option value="user">Username / password</option>
          </select>
        </Field>
      </div>
      <Field label="Schemas to ingest">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['GL', 'AP', 'AR', 'CASH', 'DEFREV'].map(s => (
            <span key={s} className="walt-chip" style={{ height: 24 }}>
              <Icon name="check" size={10} color="var(--status-ok)"/> {s}
            </span>
          ))}
          <button className="walt-btn ghost sm" style={{ height: 24, padding: '0 8px' }}>
            <Icon name="plus" size={10}/> Add
          </button>
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Cadence">
          <select style={input} defaultValue="30m">
            <option value="5m">Every 5 min</option>
            <option value="30m">Every 30 min</option>
            <option value="1h">Hourly</option>
            <option value="6h">Every 6 hours</option>
          </select>
        </Field>
        <Field label="Full reload">
          <select style={input} defaultValue="nightly">
            <option value="nightly">Nightly</option>
            <option value="weekly">Weekly</option>
            <option value="none">Incremental only</option>
          </select>
        </Field>
      </div>
      <Field label="PII handling">
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={checkRow}><input type="checkbox" defaultChecked/> Mask vendor names in bronze</label>
          <label style={checkRow}><input type="checkbox" defaultChecked/> Mask employee names in bronze</label>
          <label style={checkRow}><input type="checkbox"/> Tokenise account numbers</label>
        </div>
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="walt-btn ghost sm">
          <Icon name="play" size={11}/> Test connection
        </button>
        <button className="walt-btn primary" style={{ height: 32, fontSize: 12.5 }}>
          Save credentials
        </button>
      </div>
    </div>
  );
}

const input = {
  width: '100%', boxSizing: 'border-box',
  height: 32, padding: '0 10px',
  border: '1px solid var(--border-default)',
  borderRadius: 7,
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  fontSize: 12.5,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

const checkRow = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' };

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{hint}</span>}
    </div>
  );
}

function Mono({ children }) {
  return <span className="walt-mono" style={{ background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4, fontSize: 11.5 }}>{children}</span>;
}
