import React from 'react';
import { Icon } from '../lib/components.jsx';

export function NavRail({ active = 'sessions' }) {
  const items = [
    { key: 'sessions',  icon: 'msg',     label: 'Agent sessions' },
    { key: 'medallion', icon: 'layers',  label: 'Pipelines · medallion' },
    { key: 'catalog',   icon: 'db',      label: 'Catalog' },
    { key: 'sql',       icon: 'code',    label: 'SQL Editor' },
    { key: 'runs',      icon: 'clock',   label: 'Runs' },
    { key: 'semantic',  icon: 'schema',  label: 'Semantic' },
  ];
  return (
    <div style={{
      width: 56, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 0', gap: 4,
    }}>
      {items.map(it => {
        const on = active === it.key;
        return (
          <div key={it.key} title={it.label} style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, cursor: 'pointer',
            background: on ? 'var(--accent-soft)' : 'transparent',
            color: on ? 'var(--accent)' : 'var(--text-muted)',
            position: 'relative',
          }}>
            <Icon name={it.icon} size={18}/>
            {on && <div style={{ position:'absolute', left:-12, top:8, bottom:8, width:2, borderRadius:2, background:'var(--accent)' }}/>}
          </div>
        );
      })}
      <div style={{ flex: 1 }}/>
      <div title="Switch persona · currently engineer" style={{
        width: 36, height: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, color: 'var(--text-muted)', gap: 2, cursor: 'pointer',
        border: '1px solid var(--border-subtle)', background: 'var(--bg-inset)',
      }}>
        <Icon name="terminal" size={13} color="var(--accent)"/>
        <span className="walt-mono" style={{ fontSize: 8, color: 'var(--accent)', fontWeight: 600 }}>ENG</span>
      </div>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--text-muted)' }}><Icon name="settings" size={18}/></div>
      <div style={{
        width: 28, height: 28, marginTop: 4, borderRadius: 999,
        background: 'linear-gradient(135deg, #5A87EA, #BB9AF7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 11, fontWeight: 600,
      }}>RJ</div>
    </div>
  );
}

export function StepDot({ state }) {
  if (state === 'ok') {
    return <div style={{ width: 16, height: 16, borderRadius: 999, background: 'rgba(158,206,106,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-ok)' }}><Icon name="check" size={10}/></div>;
  }
  if (state === 'pend') {
    return <div style={{ width: 16, height: 16, borderRadius: 999, border: '1.5px solid var(--status-warn)', background: 'rgba(224,175,104,0.12)' }}/>;
  }
  return <div style={{ width: 16, height: 16, borderRadius: 999, border: '1.5px solid var(--border-strong)' }}/>;
}

export function TabBtn({ active, onClick, icon, label, count }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 32, padding: '0 10px', border: 0, borderRadius: 7, cursor: 'pointer',
      background: active ? 'var(--bg-elevated)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
    }}>
      <Icon name={icon} size={13}/> {label}
      {count && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{count}</span>}
    </button>
  );
}

export function hilite(t) {
  return t
    .replace(/(--[^\n]*)/g, '<span style="color:var(--text-muted)">$1</span>')
    .replace(/\b(select|from|join|where|with|as|group by|order by|partition by|over|lag|sum|on|using|by|desc|asc|and|or)\b/gi,
      '<span style="color:var(--accent)">$1</span>')
    .replace(/\b(date_trunc|dateadd|abs|current_date)\b/g,
      '<span style="color:var(--semantic)">$1</span>')
    .replace(/('[^']*')/g, '<span style="color:var(--status-ok)">$1</span>')
    .replace(/(\{\{\s*ref\([^)]+\)\s*\}\})/g, '<span style="color:var(--gold)">$1</span>');
}
