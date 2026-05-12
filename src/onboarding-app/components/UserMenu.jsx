import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';

export function UserMenu() {
  const { ctx, reset, goto, setShellTab, set } = usePhase();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const initials = (ctx.fullName || 'Vincent Lee')
    .split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();

  const onOrgSettings = () => {
    // Stub: drop into Vincent's project settings — the closest existing UI.
    set({ activeProjectId: '' });
    setShellTab('settings');
    goto('platform');
    setOpen(false);
  };

  const onSignOut = () => {
    setOpen(false);
    reset(); // returns to login
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={ctx.fullName}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '3px 8px 3px 3px',
          border: '1px solid transparent',
          background: open ? 'var(--bg-hover)' : 'transparent',
          borderRadius: 999,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          transition: 'background .12s',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{
          width: 24, height: 24, borderRadius: 999,
          background: 'var(--text-primary)', color: 'var(--text-inverse, #fff)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10.5, fontWeight: 700, letterSpacing: 0.2,
        }}>{initials}</span>
        <span style={{
          fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
        }}>{ctx.fullName}</span>
        <Icon name="chevD" size={9} color="var(--text-muted)"/>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          width: 256,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(17,20,24,0.18), 0 2px 6px rgba(17,20,24,0.08)',
          padding: 6,
          zIndex: 60,
        }}>
          {/* Identity */}
          <div style={{ padding: '10px 10px 8px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'var(--text-primary)', color: 'var(--text-inverse, #fff)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>{initials}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {ctx.fullName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {ctx.email}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 4px' }}/>

          <MenuItem icon="settings" onClick={onOrgSettings}>Organization settings</MenuItem>
          <MenuItem icon="user" onClick={onOrgSettings}>Members &amp; access</MenuItem>

          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 4px' }}/>

          <MenuItem icon="refresh" tone="err" onClick={onSignOut}>Sign out</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, tone, onClick, children }) {
  const [hover, setHover] = React.useState(false);
  const color = tone === 'err' ? 'var(--status-err)' : 'var(--text-primary)';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%',
        padding: '7px 10px',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        border: 'none', borderRadius: 8,
        color,
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 12.5, fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        transition: 'background .12s',
      }}
    >
      <Icon name={icon} size={12} color="currentColor"/>
      {children}
    </button>
  );
}
