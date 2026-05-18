import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { Modal } from './Modal.jsx';
import { AgentBadge } from './AgentBadge.jsx';
import { usePhase } from '../state.jsx';
import { DOMAIN_SOURCE_RECOMMENDATIONS } from '../sessions.js';

// SourceWizard — multi-step source configuration modal.
//
// Flow:
//   1. Source       — pick which systems to mirror (domain-aware recommendations).
//   2. Credentials  — host, db, auth, schemas, PII masking switches.
//   3. Validate     — simulated round-trip: tests connection, schema reads, perms.
//   4. Sample       — preview of rows the connector will pull on first ingest.
//   5. Schedule     — cadence + full-reload cadence.
//   6. Done         — confirmation + a primary CTA that closes the modal and
//                     advances the chat (if the wizard was opened from a
//                     "Set up sources" pill).
//
// On finish the wizard writes:
//   ctx.sources = picked
//   ctx.ingestSample, ctx.scheduleFullIngestion
// And clears shell.awaitingArtifactConfirm if it was set to 'sources' so the
// scripted chat can move on.

const SOURCES = [
  { key: 'sqlserver', name: 'SQL Server',      kind: 'Database',  icon: 'db',    desc: 'ERP, OLTP databases — incremental + full reload', badge: 'Connector' },
  { key: 'postgres',  name: 'Postgres',        kind: 'Database',  icon: 'db',    desc: 'App backends — logical decoding for CDC',         badge: 'Connector' },
  { key: 'snowflake', name: 'Snowflake',       kind: 'Warehouse', icon: 'cloud', desc: 'Cross-account share / replication',               badge: 'Connector' },
  { key: 'kafka',     name: 'Kafka',           kind: 'Stream',    icon: 'pipe',  desc: 'Event streams — exactly-once into bronze',        badge: 'Stream' },
  { key: 'netsuite',  name: 'NetSuite',        kind: 'SaaS',      icon: 'cloud', desc: 'ERP — managed connector with credentials',        badge: 'Connector' },
  { key: 'stripe',    name: 'Stripe',          kind: 'SaaS',      icon: 'cloud', desc: 'Payments, subscriptions, invoices',               badge: 'Connector' },
  { key: 'csv',       name: 'CSV / Parquet',   kind: 'Files',     icon: 'file',  desc: 'Drop files into a watched local folder or S3',    badge: 'Local' },
  { key: 'airflow',   name: 'Existing Airflow',kind: 'Adopt',     icon: 'flow',  desc: 'Walt reads your DAGs and learns landing tables',  badge: 'Adopt' },
];

const STEPS = [
  { key: 'source',      label: 'Source' },
  { key: 'credentials', label: 'Credentials' },
  { key: 'validate',    label: 'Validate' },
  { key: 'sample',      label: 'Sample' },
  { key: 'schedule',    label: 'Schedule' },
];

export function SourceWizard({ open, onClose }) {
  const { ctx, set, shell, setAwaitingArtifactConfirm, closeWizard, addTurn } = usePhase();

  const recommended = DOMAIN_SOURCE_RECOMMENDATIONS[ctx.domainKey]
    || DOMAIN_SOURCE_RECOMMENDATIONS.Finance;

  // Recommended sources are flagged with a badge in the picker but never auto-
  // selected. The user explicitly chooses what to ingest — even when Walt knows
  // what most teams in this domain start with. (If they've configured sources
  // before, we restore that selection so re-opening the wizard isn't a reset.)
  const initialPicked = (ctx.sources && ctx.sources.length) ? ctx.sources : [];
  const [stepIdx, setStepIdx] = React.useState(0);
  const [picked, setPicked] = React.useState(initialPicked);
  // Per-source credentials. We keep the form state lightweight — just enough for
  // the simulation to feel real. primarySource is a fallback; toggle() flips it
  // to whatever the user actually picks first.
  const [primarySource, setPrimarySource] = React.useState(initialPicked[0] || 'sqlserver');
  const [host, setHost] = React.useState(defaultHost(primarySource));
  const [db, setDb] = React.useState(defaultDb(primarySource));
  const [auth, setAuth] = React.useState('vault');
  // Validation state for the validate step.
  const [validation, setValidation] = React.useState({ state: 'idle', checks: [] });
  // Schedule state.
  const [cadence, setCadence] = React.useState('30m');
  const [fullReload, setFullReload] = React.useState('nightly');
  // True once we've finished — used by the modal footer.
  const [done, setDone] = React.useState(false);

  // Reset wizard when opened — important if the user closes mid-flow and re-opens.
  // Selection stays empty unless the user has previously confirmed sources for
  // this project; we never pre-pick the recommended set on the user's behalf.
  React.useEffect(() => {
    if (!open) return;
    setStepIdx(0);
    setPicked((ctx.sources && ctx.sources.length) ? ctx.sources : []);
    setPrimarySource((ctx.sources && ctx.sources[0]) || 'sqlserver');
    setValidation({ state: 'idle', checks: [] });
    setDone(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Sync host/db defaults when the primary source changes.
  React.useEffect(() => {
    setHost(defaultHost(primarySource));
    setDb(defaultDb(primarySource));
  }, [primarySource]);

  const toggle = (k) => {
    setPicked(p => {
      const next = p.includes(k) ? p.filter(x => x !== k) : [...p, k];
      if (next.length > 0 && !next.includes(primarySource)) {
        setPrimarySource(next[0]);
      }
      return next;
    });
  };

  const step = STEPS[stepIdx];

  // Step navigation. `canNext` gates the Continue button per step.
  const canNext = (() => {
    if (step.key === 'source')      return picked.length > 0;
    if (step.key === 'credentials') return host.trim().length > 0 && db.trim().length > 0;
    if (step.key === 'validate')    return validation.state === 'ok';
    if (step.key === 'sample')      return true;
    if (step.key === 'schedule')    return true;
    return false;
  })();

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) {
      const nextIdx = stepIdx + 1;
      setStepIdx(nextIdx);
      // Auto-run validation when arriving on the validate step.
      if (STEPS[nextIdx].key === 'validate') runValidation();
    } else {
      finish();
    }
  };
  const goBack = () => { if (stepIdx > 0) setStepIdx(stepIdx - 1); };

  const runValidation = () => {
    setValidation({
      state: 'running',
      checks: [
        { id: 'connect',  label: 'Connecting to host',          status: 'running' },
        { id: 'auth',     label: 'Resolving credentials',       status: 'pending' },
        { id: 'schema',   label: 'Reading schemas',             status: 'pending' },
        { id: 'perms',    label: 'Checking read permissions',   status: 'pending' },
        { id: 'profile',  label: 'Profiling first 100 rows',    status: 'pending' },
      ],
    });
    let i = 0;
    const tick = () => {
      setValidation(v => {
        if (v.state !== 'running') return v;
        const checks = v.checks.map((c, idx) => {
          if (idx < i)  return { ...c, status: 'ok' };
          if (idx === i) return { ...c, status: 'running' };
          return c;
        });
        return { ...v, checks };
      });
      i += 1;
      if (i <= 5) {
        setTimeout(tick, 380);
      } else {
        setValidation(v => ({
          state: 'ok',
          checks: v.checks.map(c => ({ ...c, status: 'ok' })),
        }));
      }
    };
    setTimeout(tick, 240);
  };

  const finish = () => {
    set({
      sources: picked,
      ingestSample: 'last 30 days',
      scheduleFullIngestion: fullReload !== 'none',
    });
    setDone(true);
    // If the wizard was opened in response to a "Set up sources" chat pill,
    // clear the awaiting gate so the autoplay can continue past w-sources-pick.
    // Echo a user turn in the chat so the wizard's confirmation reads as an
    // explicit user action — keeps Walt's avatar from appearing twice in a row
    // (sources-pick walt → ingestion task walt) without a user bubble between.
    if (shell.awaitingArtifactConfirm === 'sources') {
      addTurn({
        id: 'u-wizard-sources-' + Date.now(),
        role: 'user',
        body: [picked.length === 1
          ? 'Set up 1 source'
          : `Set up ${picked.length} sources`],
      });
      setAwaitingArtifactConfirm('');
    }
    // Small delay so the user sees the "Sources configured" frame before the
    // modal disappears.
    setTimeout(() => {
      closeWizard();
      onClose?.();
    }, 700);
  };

  return (
    <Modal
      open={open}
      title="Set up sources"
      subtitle={
        <>Pick where Walt should mirror data from, give it the keys, and choose how often it should run.</>
      }
      icon="db"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <StepStrip stepIdx={stepIdx} done={done}/>
          <div style={{ flex: 1 }}/>
          {!done && (
            <>
              {stepIdx > 0 && (
                <button className="walt-btn ghost sm" onClick={goBack}>
                  <Icon name="chevL" size={11}/> Back
                </button>
              )}
              <button
                className="walt-btn primary"
                onClick={goNext}
                disabled={!canNext}
                style={{ opacity: canNext ? 1 : 0.55 }}
              >
                {stepIdx === STEPS.length - 1 ? 'Finish' : 'Continue'}
                {stepIdx < STEPS.length - 1 && <Icon name="arrowR" size={11}/>}
              </button>
            </>
          )}
          {done && (
            <span style={{
              fontSize: 12, color: 'var(--status-ok)', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="check" size={11} color="var(--status-ok)"/>
              Sources configured · starting ingestion
            </span>
          )}
        </>
      }
    >
      {!done && step.key === 'source' && (
        <SourceStep
          picked={picked}
          recommended={recommended}
          domainLabel={ctx.domain || 'this domain'}
          onToggle={toggle}
        />
      )}
      {!done && step.key === 'credentials' && (
        <CredentialsStep
          picked={picked}
          primarySource={primarySource}
          onPrimarySource={setPrimarySource}
          host={host} onHost={setHost}
          db={db} onDb={setDb}
          auth={auth} onAuth={setAuth}
        />
      )}
      {!done && step.key === 'validate' && (
        <ValidateStep
          validation={validation}
          host={host}
          primarySource={primarySource}
          onRetry={runValidation}
        />
      )}
      {!done && step.key === 'sample' && (
        <SampleStep primarySource={primarySource}/>
      )}
      {!done && step.key === 'schedule' && (
        <ScheduleStep
          cadence={cadence} onCadence={setCadence}
          fullReload={fullReload} onFullReload={setFullReload}
          pickedCount={picked.length}
        />
      )}
      {done && <DoneFrame count={picked.length}/>}
    </Modal>
  );
}

function StepStrip({ stepIdx, done }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {STEPS.map((s, i) => {
        const isDone = done || i < stepIdx;
        const isActive = !done && i === stepIdx;
        return (
          <span
            key={s.key}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--accent)' : isDone ? 'var(--status-ok)' : 'var(--text-muted)',
            }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: 999,
              background: isDone ? 'var(--status-ok)' : isActive ? 'var(--accent)' : 'var(--bg-inset)',
              color: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
            }}>
              {isDone ? <Icon name="check" size={8} color="white"/> : (i + 1)}
            </span>
            {s.label}
            {i < STEPS.length - 1 && (
              <span style={{ width: 6, height: 1, background: 'var(--border-default, var(--border-subtle))', marginLeft: 2 }}/>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ----- Step bodies -------------------------------------------------------- //

function SourceStep({ picked, recommended, domainLabel, onToggle }) {
  const recSet = new Set(recommended);
  const rec = SOURCES.filter(s => recSet.has(s.key));
  const others = SOURCES.filter(s => !recSet.has(s.key));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Section
        title={`Recommended for ${domainLabel}`}
        desc={<>The systems most {domainLabel} teams pull from. Pick the ones Walt should mirror into bronze — nothing is selected until you choose it.</>}
      >
        <Grid>
          {rec.map(s => (
            <SourceCard key={s.key} source={s} isOn={picked.includes(s.key)} isRecommended onToggle={() => onToggle(s.key)}/>
          ))}
        </Grid>
      </Section>
      <Section
        title="Other sources"
        desc="Anything else you want to land in bronze. Existing Airflow DAGs can be adopted instead of replaced."
      >
        <Grid>
          {others.map(s => (
            <SourceCard key={s.key} source={s} isOn={picked.includes(s.key)} isRecommended={false} onToggle={() => onToggle(s.key)}/>
          ))}
        </Grid>
      </Section>
    </div>
  );
}

function CredentialsStep({ picked, primarySource, onPrimarySource, host, onHost, db, onDb, auth, onAuth }) {
  const src = SOURCES.find(s => s.key === primarySource) || SOURCES[0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        padding: '10px 12px', background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)', borderRadius: 10,
        fontSize: 12, color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="shield" size={12} color="var(--text-muted)"/>
        Credentials live in your secrets store. Walt only fetches a short-lived token at run time — nothing is persisted in the project.
      </div>

      {picked.length > 1 && (
        <Section title="Source to configure" desc="Walt repeats this form for each source you picked; configure them one at a time.">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {picked.map(k => {
              const s = SOURCES.find(x => x.key === k);
              if (!s) return null;
              const on = primarySource === k;
              return (
                <button
                  key={k}
                  onClick={() => onPrimarySource(k)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 999,
                    border: on ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                    background: on ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    color: on ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 11.5, fontFamily: 'var(--font-sans)', cursor: 'pointer',
                  }}
                >
                  <Icon name={s.icon} size={10} color="currentColor"/>
                  {s.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}

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
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {src.name} · {src.kind}
          </span>
        </div>
        <Field label="Host">
          <input style={input} value={host} onChange={e => onHost(e.target.value)}/>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Database">
            <input style={input} value={db} onChange={e => onDb(e.target.value)}/>
          </Field>
          <Field label="Auth">
            <select style={input} value={auth} onChange={e => onAuth(e.target.value)}>
              <option value="vault">HashiCorp Vault · imageinc/{primarySource}</option>
              <option value="aws">AWS Secrets Manager</option>
              <option value="env">Environment variables</option>
              <option value="user">Username / password</option>
            </select>
          </Field>
        </div>
        <Field label="Schemas to ingest">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(SCHEMAS_BY_SOURCE[primarySource] || ['public']).map(s => (
              <span key={s} className="walt-chip" style={{ height: 24 }}>
                <Icon name="check" size={10} color="var(--status-ok)"/> {s}
              </span>
            ))}
            <button className="walt-btn ghost sm" style={{ height: 24, padding: '0 8px' }}>
              <Icon name="plus" size={10}/> Add
            </button>
          </div>
        </Field>
        <Field label="PII handling">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={checkRow}><input type="checkbox" defaultChecked/> Mask vendor / customer names in bronze</label>
            <label style={checkRow}><input type="checkbox" defaultChecked/> Mask emails + phone numbers</label>
            <label style={checkRow}><input type="checkbox"/> Tokenise account numbers</label>
          </div>
        </Field>
      </div>
    </div>
  );
}

function ValidateStep({ validation, host, primarySource, onRetry }) {
  const src = SOURCES.find(s => s.key === primarySource) || SOURCES[0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AgentBadge agent="ingestor" size="sm" sub="raw-landing-agent"/>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Validating <span className="walt-mono">{host}</span> · {src.name}
        </span>
      </div>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12, padding: 14,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {validation.checks.map(c => (
          <CheckRow key={c.id} label={c.label} status={c.status}/>
        ))}
        {validation.checks.length === 0 && (
          <div style={{ padding: '4px 4px', fontSize: 12, color: 'var(--text-muted)' }}>
            Run validation to verify connectivity, permissions, and schema visibility.
          </div>
        )}
      </div>
      {validation.state === 'ok' && (
        <div style={{
          background: 'rgba(63,143,63,0.08)',
          border: '1px solid color-mix(in srgb, var(--status-ok) 25%, transparent)',
          color: 'var(--status-ok)',
          borderRadius: 10, padding: '10px 12px',
          fontSize: 12, lineHeight: 1.55, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="check" size={11} color="var(--status-ok)"/>
          Looks good. Walt can reach this source, read the listed schemas, and sample data.
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="walt-btn ghost sm" onClick={onRetry}>
          <Icon name="refresh" size={11}/> Re-run validation
        </button>
      </div>
    </div>
  );
}

function SampleStep({ primarySource }) {
  const sample = SAMPLE_BY_SOURCE[primarySource] || SAMPLE_BY_SOURCE.sqlserver;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        padding: '10px 12px', background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)', borderRadius: 10,
        fontSize: 12, color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="eye" size={12} color="var(--text-muted)"/>
        Preview from <span className="walt-mono">{sample.table}</span> · sampled 100 rows · masking applied
      </div>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: sample.cols.map(() => 'minmax(110px, 1fr)').join(' '),
          background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-subtle)',
        }}>
          {sample.cols.map(c => (
            <div key={c} className="walt-mono" style={{
              padding: '8px 10px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600,
            }}>{c}</div>
          ))}
        </div>
        {sample.rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: sample.cols.map(() => 'minmax(110px, 1fr)').join(' '),
            borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
          }}>
            {r.map((cell, j) => (
              <div key={j} className="walt-mono" style={{
                padding: '7px 10px', fontSize: 11, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{cell}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleStep({ cadence, onCadence, fullReload, onFullReload, pickedCount }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Section
        title="How often should Walt pull?"
        desc="Walt's Ingestor agent runs each source on its own schedule. Incremental pulls happen at the cadence below; a full reload backfills history."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Incremental cadence">
            <select style={input} value={cadence} onChange={e => onCadence(e.target.value)}>
              <option value="5m">Every 5 minutes</option>
              <option value="15m">Every 15 minutes</option>
              <option value="30m">Every 30 minutes</option>
              <option value="1h">Hourly</option>
              <option value="6h">Every 6 hours</option>
              <option value="24h">Daily</option>
            </select>
          </Field>
          <Field label="Full reload">
            <select style={input} value={fullReload} onChange={e => onFullReload(e.target.value)}>
              <option value="nightly">Nightly</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="none">Incremental only</option>
            </select>
          </Field>
        </div>
      </Section>
      <div style={{
        padding: '10px 12px', background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)', borderRadius: 10,
        fontSize: 12, color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="clock" size={12} color="var(--text-muted)"/>
        On finish, Walt will mirror the first 30 days from {pickedCount} source{pickedCount === 1 ? '' : 's'} into bronze, then continue on this schedule.
      </div>
    </div>
  );
}

function DoneFrame({ count }) {
  return (
    <div style={{
      padding: '24px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      textAlign: 'center',
    }}>
      <span style={{
        width: 56, height: 56, borderRadius: 999,
        background: 'rgba(63,143,63,0.12)', color: 'var(--status-ok)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="check" size={24} color="var(--status-ok)"/>
      </span>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
        {count} source{count === 1 ? '' : 's'} configured
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 440, lineHeight: 1.55 }}>
        Walt's Ingestor is starting to mirror your data into bronze. You'll see the run status appear in the chat — open the Ingestion page anytime for the full live view.
      </div>
    </div>
  );
}

// ----- Tiny reusable pieces ---------------------------------------------- //

function Section({ title, desc, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
      {children}
    </div>
  );
}

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
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.kind}</div>
        </div>
        {isOn && <Icon name="check" size={12} color="var(--accent)"/>}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 999,
          background: 'var(--bg-inset)', color: 'var(--text-secondary)', fontWeight: 500,
        }}>{s.badge}</span>
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

function CheckRow({ label, status }) {
  const meta = {
    pending: { icon: null,    color: 'var(--text-muted)',     bg: 'var(--bg-inset)' },
    running: { icon: 'pulse', color: 'var(--accent)',         bg: 'rgba(54,86,198,0.10)' },
    ok:      { icon: 'check', color: 'var(--status-ok)',      bg: 'rgba(63,143,63,0.10)' },
    fail:    { icon: 'x',     color: 'var(--status-err)',     bg: 'rgba(192,57,79,0.10)' },
  }[status] || { icon: null, color: 'var(--text-muted)', bg: 'var(--bg-inset)' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: 20, height: 20, borderRadius: 999,
        background: meta.bg, color: meta.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {status === 'running'
          ? <span className="walt-dot run" style={{ width: 6, height: 6 }}/>
          : meta.icon
            ? <Icon name={meta.icon} size={10} color={meta.color}/>
            : <span style={{ width: 4, height: 4, borderRadius: 999, background: meta.color }}/>}
      </span>
      <span style={{
        fontSize: 12.5,
        color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
        fontWeight: status === 'ok' || status === 'running' ? 500 : 400,
      }}>
        {label}
      </span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      {children}
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

// ----- Defaults per source ----------------------------------------------- //

function defaultHost(k) {
  return {
    sqlserver: 'sql-erp01.imageinc.internal',
    postgres:  'pg-app01.imageinc.internal',
    snowflake: 'imageinc.snowflakecomputing.com',
    kafka:     'kafka-events.imageinc.internal:9092',
    netsuite:  'api.netsuite.com',
    stripe:    'api.stripe.com',
    csv:       's3://imageinc-landing/',
    airflow:   'airflow-prod.imageinc.internal',
  }[k] || '';
}

function defaultDb(k) {
  return {
    sqlserver: 'ERP_PROD',
    postgres:  'app_prod',
    snowflake: 'RAW',
    kafka:     'topic: erp.events',
    netsuite:  'sandbox',
    stripe:    'live',
    csv:       'finance/',
    airflow:   'erp_warehouse',
  }[k] || '';
}

const SCHEMAS_BY_SOURCE = {
  sqlserver: ['GL', 'AP', 'AR', 'CASH', 'DEFREV'],
  postgres:  ['public', 'finance', 'billing'],
  snowflake: ['RAW', 'STAGING'],
  kafka:     ['erp.events', 'finance.events'],
  netsuite:  ['transactions', 'customers', 'vendors'],
  stripe:    ['charges', 'subscriptions', 'invoices'],
  csv:       ['finance/', 'monthly/'],
  airflow:   ['erp_warehouse', 'finance_marts'],
};

const SAMPLE_BY_SOURCE = {
  sqlserver: {
    table: 'AP.invoices',
    cols: ['invoice_id', 'vendor_name', 'amount', 'currency', 'issue_date'],
    rows: [
      ['INV-2026-04-00012', '***masked***', '12,480.00', 'USD', '2026-04-12'],
      ['INV-2026-04-00013', '***masked***', '8,990.50',  'EUR', '2026-04-12'],
      ['INV-2026-04-00014', '***masked***', '460.00',    'USD', '2026-04-12'],
      ['INV-2026-04-00015', '***masked***', '34,000.00', 'JPY', '2026-04-12'],
      ['INV-2026-04-00016', '***masked***', '1,275.42',  'USD', '2026-04-13'],
    ],
  },
  postgres: {
    table: 'public.events',
    cols: ['event_id', 'user_id', 'event_name', 'ts'],
    rows: [
      ['e_98abc12', '***masked***', 'page_view',   '2026-05-10T18:22:01Z'],
      ['e_98abc13', '***masked***', 'add_to_cart', '2026-05-10T18:22:11Z'],
      ['e_98abc14', '***masked***', 'checkout',    '2026-05-10T18:23:04Z'],
      ['e_98abc15', '***masked***', 'purchase',    '2026-05-10T18:23:42Z'],
      ['e_98abc16', '***masked***', 'view_item',   '2026-05-10T18:24:00Z'],
    ],
  },
  snowflake: {
    table: 'RAW.shared_events',
    cols: ['event_id', 'tenant', 'value', 'received_at'],
    rows: [
      ['98abc12', 'tenant_a', '0.92', '2026-05-10T18:22:01Z'],
      ['98abc13', 'tenant_b', '1.04', '2026-05-10T18:22:11Z'],
      ['98abc14', 'tenant_a', '0.88', '2026-05-10T18:23:04Z'],
    ],
  },
  netsuite: {
    table: 'transactions',
    cols: ['internal_id', 'doc_number', 'amount', 'currency', 'tran_date'],
    rows: [
      ['1001', 'INV-9001', '12,480.00', 'USD', '2026-04-12'],
      ['1002', 'INV-9002', '8,990.50',  'EUR', '2026-04-12'],
      ['1003', 'INV-9003', '460.00',    'USD', '2026-04-12'],
    ],
  },
  stripe: {
    table: 'charges',
    cols: ['id', 'customer', 'amount', 'currency', 'created'],
    rows: [
      ['ch_2x10', '***masked***', '4900',  'usd', '2026-05-10T18:22Z'],
      ['ch_2x11', '***masked***', '12000', 'usd', '2026-05-10T18:22Z'],
      ['ch_2x12', '***masked***', '800',   'usd', '2026-05-10T18:23Z'],
    ],
  },
};
