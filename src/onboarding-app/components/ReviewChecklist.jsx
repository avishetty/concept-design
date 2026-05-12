import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { REVIEWER_CHECKLIST } from '../agents.js';

// states: pass | fail | pending | n/a
export function ReviewChecklist({ states = {}, roundTrips = 1, maxRoundTrips = 3, version = 'v1.2.0' }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-inset)',
      }}>
        <Icon name="check" size={12} color="var(--text-secondary)"/>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Reviewer checklist</span>
        <div style={{ flex: 1 }}/>
        <span className="walt-mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{version}</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 999,
          background: roundTrips >= maxRoundTrips ? 'rgba(192,57,79,0.10)' : 'var(--bg-elevated)',
          color: roundTrips >= maxRoundTrips ? 'var(--status-err)' : 'var(--text-secondary)',
          fontWeight: 500,
        }}>
          round {roundTrips}/{maxRoundTrips}
        </span>
      </div>
      <div>
        {REVIEWER_CHECKLIST.map(item => (
          <CheckRow key={item.id} item={item} state={states[item.id] || 'pending'}/>
        ))}
      </div>
    </div>
  );
}

function CheckRow({ item, state }) {
  const map = {
    pass:    { icon: 'check',  color: 'var(--status-ok)',   bg: 'rgba(63,143,63,0.10)',  text: 'Pass' },
    fail:    { icon: 'x',      color: 'var(--status-err)',  bg: 'rgba(192,57,79,0.10)',  text: 'Fail' },
    pending: { icon: 'clock',  color: 'var(--text-muted)',  bg: 'var(--bg-inset)',       text: 'Pending' },
    na:      { icon: 'minus',  color: 'var(--text-muted)',  bg: 'var(--bg-inset)',       text: 'N/A' },
  };
  const s = map[state];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 14px',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: 999, flexShrink: 0,
        background: s.bg, color: s.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={s.icon} size={10} color={s.color}/>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
      </div>
      <span style={{ fontSize: 11, color: s.color, fontWeight: 500, flexShrink: 0 }}>{s.text}</span>
    </div>
  );
}
