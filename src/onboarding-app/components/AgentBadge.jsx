import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { AGENTS } from '../agents.js';

export function AgentBadge({ agent, size = 'md', sub }) {
  const a = AGENTS[agent];
  if (!a) return null;
  const s = size === 'sm' ? { dot: 18, icon: 10, font: 11.5, pad: '2px 8px 2px 4px' } :
            size === 'lg' ? { dot: 28, icon: 14, font: 13.5, pad: '4px 12px 4px 4px' } :
                            { dot: 22, icon: 12, font: 12.5, pad: '3px 10px 3px 4px' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: s.pad,
      borderRadius: 999,
      background: a.soft,
      color: a.color,
      fontSize: s.font,
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: s.dot, height: s.dot, borderRadius: 999,
        background: a.color, color: 'white',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={a.icon} size={s.icon} color="white"/>
      </span>
      <span style={{ color: a.color }}>{a.name}</span>
      {sub && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>· {sub}</span>}
    </span>
  );
}

export function AgentAvatar({ agent, size = 32 }) {
  const a = AGENTS[agent];
  if (!a) return null;
  return (
    <span style={{
      width: size, height: size, borderRadius: 999,
      background: a.color, color: 'white',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={a.icon} size={size * 0.45} color="white"/>
    </span>
  );
}
