import React from 'react';
import { Icon } from '../../lib/components.jsx';

// The Builder input box from the mockup: leading @ icon, free-text field, a
// paperclip, the purple "Builder · Preview" pill, and a circular send button.
// Builder-specific on purpose — it carries the Builder branding the rest of the
// experience relies on (the Walt mascot is reused as the assistant avatar).
export function BuilderComposer({ placeholder = 'Ask a question about your data…', onSend, disabled = false }) {
  const [value, setValue] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  const send = () => {
    if (disabled) return;
    const text = value.trim();
    onSend && onSend(text);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{
      border: '1px solid ' + (focused && !disabled ? 'var(--semantic)' : 'var(--border-default)'),
      borderRadius: 16, padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: 8,
      background: 'var(--bg-surface)',
      boxShadow: focused && !disabled ? '0 0 0 4px var(--semantic-soft)' : 'none',
      opacity: disabled ? 0.55 : 1,
      transition: 'border-color .16s ease, box-shadow .18s ease, opacity .16s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="at" size={15} color="var(--text-muted)"/>
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="paperclip" size={15} color="var(--text-muted)"/>
        <span style={{
          background: 'var(--semantic)', color: '#fff', borderRadius: 12,
          padding: '4px 9px', fontSize: 11, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name="sparkle" size={10} color="#fff"/>
          Builder <span style={{ opacity: 0.75, marginLeft: 2 }}>Preview</span>
          <Icon name="chevD" size={9} color="#fff"/>
        </span>
        <div style={{ flex: 1 }}/>
        <button
          aria-label="Send"
          onClick={send}
          disabled={disabled}
          style={{
            width: 26, height: 26, borderRadius: 999, border: 'none',
            background: 'var(--semantic)', color: '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'filter .14s ease, transform .12s ease',
          }}
          onMouseEnter={(e) => { if (disabled) return; e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Icon name="arrowUp" size={13} color="#fff"/>
        </button>
      </div>
    </div>
  );
}
