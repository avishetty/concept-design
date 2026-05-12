import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { AGENTS } from '../agents.js';

export function AgentRunLog({ agent, lines, title = 'Run log' }) {
  const a = AGENTS[agent];
  return (
    <div style={{
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-surface)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: a?.color || 'var(--text-muted)' }}/>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        {a && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {a.name}</span>}
        <div style={{ flex: 1 }}/>
        <span className="walt-mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>live</span>
        <span className="walt-dot run"/>
      </div>
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: '10px 14px',
        fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.7,
      }}>
        {lines.map((ln, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10,
            color: ln.kind === 'err' ? 'var(--status-err)' :
                   ln.kind === 'warn' ? 'var(--status-warn)' :
                   ln.kind === 'ok'   ? 'var(--status-ok)'   :
                   'var(--text-secondary)',
          }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0, width: 50 }}>{ln.t}</span>
            <span>{ln.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
