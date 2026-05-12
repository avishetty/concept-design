import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { AGENTS } from '../agents.js';
import { AgentAvatar } from './AgentBadge.jsx';

export function AgentCard({ agent, status = 'idle', lastRun, nextRun, activity = [], note }) {
  const a = AGENTS[agent];
  if (!a) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 14,
      padding: 18,
      display: 'flex', flexDirection: 'column', gap: 14,
      minHeight: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <AgentAvatar agent={agent} size={36}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</span>
            <StatusDot status={status}/>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.role}</div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.summary}</div>
      {note && (
        <div style={{
          fontSize: 12, color: a.color, background: a.soft,
          padding: '8px 10px', borderRadius: 8, lineHeight: 1.5,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <Icon name="sparkle" size={11} color={a.color}/>
          <span>{note}</span>
        </div>
      )}
      {(lastRun || nextRun) && (
        <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text-muted)' }}>
          {lastRun && <span><Icon name="check" size={10}/> Last · {lastRun}</span>}
          {nextRun && <span><Icon name="clock" size={10}/> Next · {nextRun}</span>}
        </div>
      )}
      {activity.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activity.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--text-muted)' }}/>
              <span style={{ color: 'var(--text-secondary)' }}>{ev.t}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10.5, marginLeft: 'auto' }}>{ev.at}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  const map = {
    running:  { color: 'var(--status-info)', label: 'Running', pulse: true },
    idle:     { color: 'var(--text-muted)',  label: 'Idle' },
    healthy:  { color: 'var(--status-ok)',   label: 'Healthy' },
    attn:     { color: 'var(--status-warn)', label: 'Needs attention' },
    blocked:  { color: 'var(--status-err)',  label: 'Blocked' },
  };
  const m = map[status] || map.idle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, color: m.color, fontWeight: 500,
      padding: '2px 8px', borderRadius: 999,
      background: 'color-mix(in srgb, ' + m.color + ' 10%, transparent)',
    }}>
      <span className={m.pulse ? 'walt-dot run' : ''} style={{ width: 6, height: 6, borderRadius: 999, background: m.color, display: 'inline-block' }}/>
      {m.label}
    </span>
  );
}
