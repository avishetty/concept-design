import React from 'react';
import { Icon } from '../../lib/components.jsx';

// Bridge between scripted turn bodies (static React nodes living in
// builderScript.jsx) and the live BuilderChat component. A turn body can drop in
// an <ActionRow action="commit" /> and have its buttons call back into the chat
// without the script needing a handle on component state.
export const BuilderActionContext = React.createContext({
  committed: null,
  onAction: () => {},
});

// The mockup's green "Approve & commit" / ghost "Request changes" buttons. These
// are intentionally NOT generic choice pills — they carry their own treatment.
//   action: 'commit'  → Approve & commit (scene 3)
//           'rerun'   → Approve & re-run benchmark (scene 6)
export function ActionRow({ action = 'commit' }) {
  const { committed, onAction } = React.useContext(BuilderActionContext);

  if (committed === action) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        color: 'var(--status-ok)', fontWeight: 600, fontSize: 13,
        background: 'rgba(63,143,63,0.10)',
        padding: '7px 12px', borderRadius: 8,
      }}>
        <Icon name="check" size={12} color="var(--status-ok)" strokeWidth={2}/>
        {action === 'rerun'
          ? 'Committed. Re-running benchmark vf_validation_questions…'
          : 'Committed to the semantic model.'}
      </div>
    );
  }

  const primaryLabel = action === 'rerun' ? 'Approve & re-run benchmark' : 'Approve & commit';

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
      <button
        onClick={() => onAction(action)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#3B6D11', color: '#fff', border: 'none',
          padding: '7px 14px', borderRadius: 8,
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          transition: 'filter .14s ease, transform .12s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <Icon name="check" size={11} color="#fff" strokeWidth={2}/>
        {primaryLabel}
      </button>
      <button
        onClick={() => onAction('changes')}
        style={{
          background: 'var(--bg-inset)', color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          padding: '7px 13px', borderRadius: 8,
          fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          transition: 'background .14s ease, border-color .14s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-inset)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
      >
        Request changes
      </button>
    </div>
  );
}

// A clickable artifact card (the "monthly_recurring_revenue_by_segment" / SQL
// pills in scenes 3 + 6). When `openable`, clicking opens the SQL side panel.
export function ArtifactCard({ title, meta, tone = 'info', openable = false }) {
  const { onOpenSql } = React.useContext(BuilderActionContext);
  const toneBg = tone === 'ok' ? 'rgba(63,143,63,0.12)' : 'var(--accent-soft)';
  const toneFg = tone === 'ok' ? 'var(--status-ok)' : 'var(--accent)';
  return (
    <button
      onClick={openable ? onOpenSql : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        border: '1px solid var(--border-default)', borderRadius: 8,
        padding: '8px 11px', marginTop: 7,
        background: 'var(--bg-inset)', textAlign: 'left',
        cursor: openable ? 'pointer' : 'default',
        fontFamily: 'var(--font-sans)',
        transition: 'background .14s ease, border-color .14s ease',
      }}
      onMouseEnter={(e) => { if (openable) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; } }}
      onMouseLeave={(e) => { if (openable) { e.currentTarget.style.background = 'var(--bg-inset)'; e.currentTarget.style.borderColor = 'var(--border-default)'; } }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: toneBg, color: toneFg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="code" size={14} color={toneFg}/>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{meta}</span>
      </span>
      {openable && <Icon name="chevR" size={13} color="var(--text-muted)"/>}
    </button>
  );
}
