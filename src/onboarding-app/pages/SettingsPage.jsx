import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AgentAvatar } from '../components/AgentBadge.jsx';
import { AGENT_ORDER, AGENTS } from '../agents.js';
import { PageHeader } from './CatalogPage.jsx';

export function SettingsPage() {
  const { ctx, set } = usePhase();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: 'var(--bg-app)',
    }}>
      <PageHeader title="Settings" subtitle="One scrollable page · everything Walt manages lives here."/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 48px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Project basics */}
          <Card title="Project basics" desc="Identity, owners, and lifecycle for finance-platform.">
            <Field label="Project name">
              <input style={input} value={ctx.projectName} onChange={(e) => set({ projectName: e.target.value })}/>
            </Field>
            <Grid2>
              <Field label="Owner">
                <input style={input} defaultValue="vincent@imageinc.com"/>
              </Field>
              <Field label="Visibility">
                <select style={input} defaultValue="workspace">
                  <option value="workspace">Workspace · ImageInc</option>
                  <option value="public">Public read</option>
                  <option value="private">Private (just me)</option>
                </select>
              </Field>
            </Grid2>
            <Field label="Local working copy">
              <input style={input} defaultValue={ctx.localPath}/>
            </Field>
          </Card>

          {/* Environments */}
          <Card title="Environments" desc="staging/dev → main. Promotion gated on reviewer attestation + CI.">
            <EnvRow name="staging/dev" status="healthy" warehouse="FINANCE_STG" promotesTo="main"/>
            <EnvRow name="main"         status="healthy" warehouse="FINANCE_PROD" promotesTo="—"/>
            <button className="walt-btn ghost sm" style={{ alignSelf: 'flex-start' }}>
              <Icon name="plus" size={11}/> Add environment
            </button>
          </Card>

          {/* Connections */}
          <Card title="Connections" desc="Sources Walt mirrors into bronze + destinations Walt writes silver/gold into.">
            <SubHead>Sources · 4 connected</SubHead>
            <ConnRow name="SQL Server · ERP_PROD"     kind="Database" host="sql-erp01.imageinc.internal"  fresh="3m"/>
            <ConnRow name="Postgres · app-backend"    kind="Database" host="pg-app01.imageinc.internal"   fresh="6m"/>
            <ConnRow name="Stripe"                    kind="SaaS"     host="api.stripe.com"               fresh="8m"/>
            <ConnRow name="NetSuite"                  kind="SaaS"     host="imageinc.netsuite.com"        fresh="11m"/>
            <button className="walt-btn ghost sm" style={{ alignSelf: 'flex-start' }}>
              <Icon name="plus" size={11}/> Add a source
            </button>
            <div style={{ height: 12 }}/>
            <SubHead>Destinations · 2 connected</SubHead>
            <ConnRow name="Snowflake · FINANCE_PROD" kind="Warehouse" host="imageinc.snowflakecomputing.com" fresh="live"/>
            <ConnRow name="Snowflake · ANALYTICS"    kind="Warehouse" host="imageinc.snowflakecomputing.com" fresh="live"/>
            <button className="walt-btn ghost sm" style={{ alignSelf: 'flex-start' }}>
              <Icon name="plus" size={11}/> Add a destination
            </button>
          </Card>

          {/* Agents */}
          <Card title="Agents" desc="Cadence and round-trip limits per agent. Walt enforces these.">
            {AGENT_ORDER.map(k => (
              <AgentRow key={k} agent={k}/>
            ))}
          </Card>

          {/* Policies */}
          <Card title="Policies" desc="PII masking, retention, and access controls.">
            <Field label="PII masking"
              hint="vendor_name + customer_legal_name + employee_name are sha256+salt'd in bronze.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={checkRow}><input type="checkbox" defaultChecked/> Mask vendor names</label>
                <label style={checkRow}><input type="checkbox" defaultChecked/> Mask customer legal names</label>
                <label style={checkRow}><input type="checkbox" defaultChecked/> Mask employee names</label>
                <label style={checkRow}><input type="checkbox"/> Tokenise bank account numbers</label>
              </div>
            </Field>
            <Field label="Retention" hint="Audit window for financial data.">
              <select style={input} defaultValue="7y">
                <option value="3y">3 years</option>
                <option value="7y">7 years</option>
                <option value="ever">No expiry</option>
              </select>
            </Field>
            <Field label="Access" hint="Default role for new teammates joining the workspace.">
              <select style={input} defaultValue="analyst-read">
                <option value="analyst-read">analyst-read</option>
                <option value="analyst-write">analyst-write</option>
                <option value="admin">admin</option>
              </select>
            </Field>
          </Card>

          {/* Schedules */}
          <Card title="Schedules" desc="Default cadences. Override per-source in the connection drawer.">
            <Grid2>
              <Field label="Bronze incremental">
                <select style={input} defaultValue="30m">
                  <option value="5m">Every 5 min</option>
                  <option value="30m">Every 30 min</option>
                  <option value="1h">Hourly</option>
                </select>
              </Field>
              <Field label="Bronze full reload">
                <select style={input} defaultValue="nightly">
                  <option value="nightly">Nightly</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Incremental only</option>
                </select>
              </Field>
            </Grid2>
            <Grid2>
              <Field label="Silver cadence">
                <select style={input} defaultValue="event">
                  <option value="event">On-event (recommended)</option>
                  <option value="15m">Every 15 min</option>
                </select>
              </Field>
              <Field label="Reasoner cadence">
                <select style={input} defaultValue="continuous">
                  <option value="continuous">Continuous</option>
                  <option value="hourly">Hourly</option>
                </select>
              </Field>
            </Grid2>
          </Card>

          {/* Git */}
          <Card title="Git" desc="The project is a real repo. Promotions are real PRs.">
            <Field label="Repository">
              <input style={input} defaultValue={ctx.repoUrl}/>
            </Field>
            <Grid2>
              <Field label="Default branch">
                <input style={input} defaultValue="main"/>
              </Field>
              <Field label="Promotion branch">
                <input style={input} defaultValue="staging/dev"/>
              </Field>
            </Grid2>
            <label style={checkRow}><input type="checkbox" defaultChecked/> Require reviewer attestation on every PR</label>
            <label style={checkRow}><input type="checkbox" defaultChecked/> Block commit if CI fails</label>
            <label style={checkRow}><input type="checkbox"/> Require human reviewer in addition to reviewer agent</label>
          </Card>

          {/* Danger zone */}
          <Card title="Danger zone" desc="Irreversible. Walt will confirm in chat before running any of these." danger>
            <DangerRow label="Reset all silver views" desc="Walt will tear down silver and rebuild from the latest bronze. Takes ~3 min."/>
            <DangerRow label="Disconnect all sources" desc="Stops ingestion; bronze stops refreshing but isn't deleted."/>
            <DangerRow label="Delete this project"    desc="Drops the warehouse schemas, the repo, and the agent history."/>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, desc, danger, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid ' + (danger ? 'color-mix(in srgb, var(--status-err) 25%, var(--border-subtle))' : 'var(--border-subtle)'),
      borderRadius: 12,
      padding: 18,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: danger ? 'var(--status-err)' : 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{hint}</span>}
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

function SubHead({ children }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: 0.6,
      paddingBottom: 4,
    }}>{children}</div>
  );
}

function EnvRow({ name, status, warehouse, promotesTo }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      border: '1px solid var(--border-subtle)',
      background: 'var(--bg-inset)',
      borderRadius: 9,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 999,
        background: status === 'healthy' ? 'var(--status-ok)' : 'var(--status-warn)',
      }}/>
      <span className="walt-mono" style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {warehouse}</span>
      <div style={{ flex: 1 }}/>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>promotes to <span className="walt-mono" style={{ color: 'var(--text-secondary)' }}>{promotesTo}</span></span>
      <button className="walt-btn ghost sm" style={{ fontSize: 11 }}>Manage</button>
    </div>
  );
}

function ConnRow({ name, kind, host, fresh }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 10px',
    }}>
      <Icon name={kind === 'Warehouse' ? 'cloud' : kind === 'SaaS' ? 'cloud' : 'db'} size={12} color="var(--text-muted)"/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{kind} · {host}</div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>last sync · {fresh}</span>
      <button className="walt-btn ghost sm" style={{ fontSize: 11 }}>Edit</button>
    </div>
  );
}

function AgentRow({ agent }) {
  const a = AGENTS[agent];
  const defaults = {
    ingestor:    { cadence: '30m',  rt: '3' },
    transformer: { cadence: 'event', rt: '3' },
    reasoner:    { cadence: 'continuous', rt: '2' },
    operator:    { cadence: 'continuous', rt: '3' },
    governer:    { cadence: 'continuous', rt: '1' },
  }[agent];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      borderRadius: 9,
      background: 'var(--bg-inset)',
    }}>
      <AgentAvatar agent={agent} size={26}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600 }}>{a.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.role}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cadence</span>
        <select style={{ ...input, height: 28, fontSize: 12, width: 140 }} defaultValue={defaults.cadence}>
          <option value="5m">Every 5 min</option>
          <option value="30m">Every 30 min</option>
          <option value="1h">Hourly</option>
          <option value="event">On-event</option>
          <option value="continuous">Continuous</option>
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max round-trips</span>
        <select style={{ ...input, height: 28, fontSize: 12, width: 60 }} defaultValue={defaults.rt}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="5">5</option>
        </select>
      </div>
    </div>
  );
}

function DangerRow({ label, desc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      border: '1px solid color-mix(in srgb, var(--status-err) 18%, var(--border-subtle))',
      borderRadius: 9,
      background: 'rgba(192,57,79,0.04)',
    }}>
      <Icon name="shield" size={13} color="var(--status-err)"/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
      </div>
      <button style={{
        padding: '5px 11px', borderRadius: 7,
        background: 'transparent',
        border: '1px solid color-mix(in srgb, var(--status-err) 40%, var(--border-default))',
        color: 'var(--status-err)',
        fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
      }}>Run via chat</button>
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

const checkRow = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' };
