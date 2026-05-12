import React from 'react';
import { Icon } from '../lib/components.jsx';
import { usePhase } from './state.jsx';
import { SESSIONS, getSessionMeta } from './sessions.js';

// Dropdown in the top-left of the chat column. Switches sessions, shows a brief
// summary for mocked past sessions, and offers "+ New session" as a quick affordance.
export function SessionPicker() {
  const { shell, setSession } = usePhase();
  const [open, setOpen] = React.useState(false);
  const meta = getSessionMeta(shell.sessionId);

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!e.target.closest?.('[data-session-picker]')) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (s) => {
    setOpen(false);
    if (s.id === 'new') {
      setSession('new-' + Date.now(), [{
        id: 'w0',
        role: 'walt',
        body: ["What's on your mind? I can add a source, build a new mart, triage drift, or just chat through an idea."],
      }]);
      return;
    }
    setSession(s.id, s.turns || []);
  };

  return (
    <div data-session-picker style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'var(--bg-surface)'; }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 10px 6px 8px',
          borderRadius: 8,
          border: '1px solid ' + (open ? 'var(--border-strong)' : 'var(--border-subtle)'),
          background: open ? 'var(--bg-elevated)' : 'var(--bg-surface)',
          cursor: 'pointer',
          fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500,
          maxWidth: 320,
          transition: 'background .14s ease, border-color .14s ease',
        }}
      >
        <Icon name="msg" size={12} color="var(--text-secondary)"/>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {meta.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {meta.subtitle}</span>
        <span style={{
          display: 'inline-flex',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform .2s cubic-bezier(.22,.61,.36,1)',
        }}>
          <Icon name="chevD" size={10} color="var(--text-muted)"/>
        </span>
      </button>
      {open && (
        <div
          className="walt-rise-in"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            minWidth: 320, maxWidth: 380,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(17,20,24,0.10), 0 2px 6px rgba(17,20,24,0.06)',
            padding: 6,
            zIndex: 30,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          <div style={{
            padding: '6px 10px 4px',
            fontSize: 10.5, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600,
          }}>
            Sessions in finance-platform
          </div>
          {SESSIONS.map((s, i) => (
            <button
              key={s.id}
              className="walt-stagger-in"
              style={{
                '--i': i + 1,
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 8,
                border: 'none',
                background: s.id === shell.sessionId ? 'var(--accent-soft)' : 'transparent',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 2,
                fontFamily: 'var(--font-sans)',
                transition: 'background .12s',
              }}
              onClick={() => pick(s)}
              onMouseEnter={(e) => { if (s.id !== shell.sessionId) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (s.id !== shell.sessionId) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600 }}>
                {s.id === shell.sessionId && <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)' }}/>}
                {s.label}
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500 }}>{s.when}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {s.summary}
              </div>
            </button>
          ))}
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 4px' }}/>
          <button
            className="walt-stagger-in"
            style={{
              '--i': SESSIONS.length + 1,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              transition: 'background .12s',
            }}
            onClick={() => pick({ id: 'new' })}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name="plus" size={11} color="var(--text-secondary)"/>
            New session
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· clear thread</span>
          </button>
        </div>
      )}
    </div>
  );
}
