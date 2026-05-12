import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';

// Glyph + tone for each notification kind. Tones map to existing CSS tokens so
// they look at home in both light and dark themes.
const KIND_META = {
  drift:  { icon: 'bolt',   tone: 'var(--status-warn)', label: 'Drift detected' },
  fail:   { icon: 'x',      tone: 'var(--status-err)',  label: 'Run failed' },
  policy: { icon: 'shield', tone: 'var(--status-info)', label: 'Policy violation' },
};

export function NotificationsBell() {
  const { ctx, goto, set, dismissNotification } = usePhase();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);
  const count = (ctx.notifications || []).length;

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onOpenProject = (n) => {
    if (n.project === 'finance-platform') {
      // Vincent's live project — drop straight into the chat with the panel closed.
      set({ activeProjectId: '' });
      goto('platform');
    } else {
      // Demo siblings — open the read-only stub.
      set({ activeProjectId: n.project });
      goto('platform');
    }
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={count ? `${count} unread notifications` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          width: 30, height: 30, borderRadius: 8,
          border: '1px solid transparent',
          background: open ? 'var(--bg-hover)' : 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer', position: 'relative',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .12s, color .12s',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <Icon name="bell" size={14} color="currentColor"/>
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 3, right: 3,
            minWidth: 14, height: 14, padding: '0 3px',
            borderRadius: 999,
            background: 'var(--status-err)', color: '#fff',
            fontSize: 9.5, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--bg-app)',
            fontFamily: 'var(--font-sans)',
          }}>{count}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          width: 360,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(17,20,24,0.18), 0 2px 6px rgba(17,20,24,0.08)',
          padding: 0,
          zIndex: 60,
        }}>
          <div style={{
            padding: '12px 14px 10px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Notifications
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Across all ImageInc projects
            </div>
          </div>
          {count === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              You're all caught up.
            </div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {(ctx.notifications || []).map(n => {
                const meta = KIND_META[n.kind] || KIND_META.drift;
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: '11px 14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex', gap: 10,
                    }}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: meta.tone, color: '#fff',
                      flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={meta.icon} size={12} color="currentColor"/>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: meta.tone,
                        letterSpacing: 0.2, textTransform: 'uppercase',
                      }}>{meta.label}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-primary)', marginTop: 2, lineHeight: 1.45 }}>
                        {n.body}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: 6,
                      }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          <span className="walt-mono">{n.project}</span> · {n.when}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => onOpenProject(n)}
                            className="walt-btn ghost sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                          >
                            Open <Icon name="arrowR" size={9}/>
                          </button>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            title="Dismiss"
                            style={{
                              width: 22, height: 22, borderRadius: 6,
                              border: 'none', background: 'transparent',
                              color: 'var(--text-muted)', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Icon name="x" size={10} color="currentColor"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
