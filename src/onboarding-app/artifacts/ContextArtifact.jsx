import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase, envLabel } from '../state.jsx';

const DOCS = [
  { title: 'Finance data dictionary v3.2',   src: 'sharepoint',  added: '2 days ago' },
  { title: 'NetSuite chart of accounts',     src: 'pdf',         added: '2 days ago' },
  { title: 'Day-one questions for finance',  src: 'walt-thread', added: 'today'      },
];

export function ContextArtifact() {
  const { ctx } = usePhase();
  const branch = ctx?.branch || 'main';
  const summaries = [
    { label: 'Active project',     value: `${ctx?.projectName || 'project'} · ${envLabel(ctx)}` },
    { label: 'Workspace',          value: ctx?.localPath || '~/walt' },
    { label: 'Domain',             value: ctx?.domain || 'Finance' },
    { label: 'Connected sources',  value: 'SQL Server · NetSuite' },
    { label: 'Destination',        value: ctx?.warehouseTarget || 'Snowflake · FINANCE_PROD' },
    { label: 'Refresh cadence',    value: 'every 30 minutes' },
    { label: 'PII rules',          value: 'mask 3 columns · retain 7y' },
  ];
  const mcpServers = [
    { name: 'walt-warehouse', kind: 'Snowflake',     status: 'ok',
      detail: 'read+write · FINANCE_PROD' },
    { name: 'walt-git',       kind: ctx?.gitConnected ? 'GitHub' : 'Local git',
      status: ctx?.gitConnected ? 'ok' : 'idle',
      detail: ctx?.gitConnected
        ? `${ctx.gitRemote || 'remote'} · branch ${branch}`
        : `${ctx?.localPath || '~/walt'} · local-only · connect a remote anytime` },
    { name: 'walt-policy',    kind: 'Walt internal', status: 'ok',
      detail: 'masking + retention enforcement' },
    { name: 'datadog',        kind: 'Observability', status: 'idle',
      detail: 'optional · enable for alert routing' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Walt's context</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          What Walt can see right now — connections, attached docs, and live project summary.
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title="Project summary" icon="rocket">
          {summaries.map(s => (
            <Row key={s.label} label={s.label} value={s.value}/>
          ))}
        </Card>

        <Card title="MCP servers" icon="cloud" action="+ Connect a server">
          {mcpServers.map(m => (
            <div key={m.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: 999,
                background: m.status === 'ok' ? 'var(--status-ok)' : 'var(--text-muted)',
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.kind} · {m.detail}</div>
              </div>
              <button className="walt-btn ghost sm" style={{ fontSize: 11 }}>Manage</button>
            </div>
          ))}
        </Card>

        <Card title="Attached documents" icon="book" action="+ Attach">
          {DOCS.map(d => (
            <div key={d.title} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <Icon name="file" size={12} color="var(--text-muted)"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{d.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.src} · {d.added}</div>
              </div>
              <button className="walt-btn ghost sm" style={{ fontSize: 11 }}><Icon name="eye" size={10}/></button>
            </div>
          ))}
        </Card>

        <Card title="Active session" icon="msg">
          <Row label="Session id"    value={ctx ? 'first-run' : '—'}/>
          <Row label="Started"       value="14 minutes ago"/>
          <Row label="Agents involved" value="Walt · Ingestor · Transformer · Operator"/>
          <Row label="Artifacts opened" value="6"/>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon, action, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        background: 'var(--bg-inset)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon name={icon} size={12} color="var(--text-secondary)"/>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        <div style={{ flex: 1 }}/>
        {action && (
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 11.5, color: 'var(--accent)', fontWeight: 500,
            fontFamily: 'var(--font-sans)',
          }}>{action}</button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '9px 14px',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', minWidth: 130 }}>{label}</span>
      <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}
