import React from 'react';
import { Walt, Icon } from '../../lib/components.jsx';

export function ChatStage({ children, footer }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 28px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 26 }}>
          {children}
        </div>
      </div>
      {footer && (
        <div style={{ padding: '12px 28px 22px', background: 'var(--bg-surface)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}

export function WaltSays({ working, silent, children }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, marginTop: -2, width: 28, height: 28 }}>
        {silent && !working ? null : <Walt size={28} thinking={working}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

export function BotLine({ children, muted, mono }) {
  return (
    <div style={{
      fontSize: 14,
      color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
      lineHeight: 1.65,
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontStyle: muted ? 'italic' : 'normal',
    }}>
      {children}
    </div>
  );
}

export function UserBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: 540,
        padding: '10px 14px',
        borderRadius: 16,
        background: 'var(--accent-soft)',
        color: 'var(--text-primary)',
        fontSize: 14,
        lineHeight: 1.5,
      }}>
        {children}
      </div>
    </div>
  );
}

export function PillRow({ values }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {values.map((v, i) => (
        <span key={i} style={{
          padding: '6px 12px',
          borderRadius: 999,
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-subtle)',
          fontSize: 12.5,
          color: 'var(--text-primary)',
        }}>{v}</span>
      ))}
    </div>
  );
}

export function ChoiceRow({ options, onPick, multi }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onPick && onPick(opt)}
          style={{
            padding: '7px 12px',
            borderRadius: 999,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            cursor: 'pointer',
            fontSize: 12.5,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'background .12s, border-color .12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
        >
          {opt}
          {multi && <Icon name="plus" size={10} color="var(--text-muted)"/>}
        </button>
      ))}
    </div>
  );
}

export function KVInline({ pairs }) {
  return (
    <div style={{
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10,
      padding: 12,
      fontSize: 12.5,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {pairs.map(([k, v], i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: 'var(--text-muted)', minWidth: 100 }}>{k}</span>
          <span className="walt-mono" style={{ color: 'var(--text-primary)' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
