import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';

// Inline affordance rendered inside a chat message to open / focus an artifact view
// in the side panel. Behaves like a chip: hoverable, keyboard-focusable, communicates
// what will happen ("View live progress", "Open silver build", etc.).
const VIEW_LABEL = {
  connections: 'Sources & destinations',
  ingestion:   'Live ingestion',
  sample:      'Sample preview',
  silver:      'Silver build',
  pr:          'Pull request',
  production:  'Production dashboard',
  code:        'Repo',
  sql:         'SQL editor',
  context:     'Context',
};

const VIEW_ICON = {
  connections: 'pipe',
  ingestion:   'download',
  sample:      'table',
  silver:      'layers',
  pr:          'git',
  production:  'rocket',
  code:        'code',
  sql:         'terminal',
  context:     'book',
};

const VIEW_TAB = {
  connections: 'ingestion',
  ingestion:   'ingestion',
  sample:      'ingestion',
  production:  'ingestion',
  silver:      'transformation',
  pr:          'transformation',
  code:        'code',
  sql:         'sql',
  context:     'context',
};

export function ArtifactChip({ view, label, icon, hint, kind = 'default' }) {
  const { openArtifact, shell } = usePhase();
  const [hover, setHover] = React.useState(false);
  const active = shell.artifactView === view;
  const iconName = icon || VIEW_ICON[view] || 'sparkle';
  const text = label || VIEW_LABEL[view] || 'Open artifact';

  return (
    <button
      className="walt-pop-in"
      onClick={() => openArtifact(view, VIEW_TAB[view])}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 12px 6px 8px',
        borderRadius: 8,
        border: active
          ? '1px solid var(--accent)'
          : '1px solid ' + (hover ? 'var(--border-strong)' : 'var(--border-subtle)'),
        background: active
          ? 'var(--accent-soft)'
          : (hover ? 'var(--bg-elevated)' : 'var(--bg-surface)'),
        color: active ? 'var(--accent)' : 'var(--text-primary)',
        fontSize: 12.5, fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'border-color .16s ease, background .16s ease, transform .18s cubic-bezier(.22,.61,.36,1), color .16s ease, box-shadow .18s ease',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hover
          ? '0 4px 12px rgba(17,20,24,0.06), 0 1px 2px rgba(17,20,24,0.04)'
          : (active ? '0 1px 0 var(--accent-soft)' : 'none'),
        maxWidth: '100%',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 6,
        background: active ? 'var(--accent)' : (hover ? 'var(--bg-surface)' : 'var(--bg-inset)'),
        color: active ? 'white' : 'var(--text-secondary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background .16s ease, color .16s ease, box-shadow .16s ease',
        boxShadow: hover && !active ? 'inset 0 0 0 1px var(--border-subtle)' : 'none',
      }}>
        <Icon name={iconName} size={12} color={active ? 'white' : 'currentColor'}/>
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.25 }}>
        <span>{text}</span>
        {hint && (
          <span style={{ fontSize: 11, color: active ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 400 }}>
            {hint}
          </span>
        )}
      </span>
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        transform: hover ? 'translateX(2px)' : 'translateX(0)',
        transition: 'transform .18s cubic-bezier(.22,.61,.36,1)',
      }}>
        <Icon name="arrowR" size={10} color={active ? 'var(--accent)' : (hover ? 'var(--text-secondary)' : 'var(--text-muted)')}/>
      </span>
    </button>
  );
}
