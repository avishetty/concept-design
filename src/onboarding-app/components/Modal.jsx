import React from 'react';
import { Icon } from '../../lib/components.jsx';

// Modal — generic overlay container. Renders into a portal mounted on document.body
// so it floats above the chat shell without stacking inside the panel split. The
// backdrop is click-to-close (unless the caller passes lockBackdrop) and Escape
// also closes.
//
// API
// ---
// <Modal open title subtitle icon size onClose lockBackdrop footer>
//   {body}
// </Modal>
//
// size: 'sm' | 'md' | 'lg' — caps max width (520 / 720 / 920).
export function Modal({
  open,
  title,
  subtitle,
  icon = 'sparkle',
  size = 'md',
  lockBackdrop = false,
  onClose,
  footer,
  children,
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !lockBackdrop) onClose?.(); };
    document.addEventListener('keydown', onKey);
    // Stop the page behind from scrolling while the modal is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, lockBackdrop]);

  if (!open) return null;

  const maxWidth = size === 'sm' ? 520 : size === 'lg' ? 920 : 720;

  return (
    <div
      onMouseDown={(e) => {
        if (lockBackdrop) return;
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(17,20,24,0.42)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'walt-fade-in .18s ease',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="walt-modal-title"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 14,
          width: '100%',
          maxWidth,
          maxHeight: '86vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(17,20,24,0.18), 0 4px 12px rgba(17,20,24,0.08)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          animation: 'walt-pop-in .22s cubic-bezier(.22,.61,.36,1)',
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: '16px 18px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent-soft)', color: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name={icon} size={15} color="currentColor"/>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="walt-modal-title" style={{
              fontSize: 15, fontWeight: 600,
              color: 'var(--text-primary)', letterSpacing: -0.1,
            }}>{title}</div>
            {subtitle && (
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.55 }}>
                {subtitle}
              </div>
            )}
          </div>
          {!lockBackdrop && (
            <button
              aria-label="Close"
              onClick={() => onClose?.()}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .12s, color .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Icon name="x" size={12} color="currentColor"/>
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: 'auto',
          padding: '16px 18px',
          background: 'var(--bg-app)',
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            flexShrink: 0,
            padding: '12px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
