import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';

// Inline affordance rendered inside a chat message. Chips never navigate the
// user out of the chat — they either:
//   • open an artifact in the side panel (`view: '...'`), or
//   • open a modal wizard over the chat (`wizard: 'sources' | ...`).
//
// View token reference (chat → side-panel ArtifactsPanel):
//   silver-plan      — PlanArtifact (focused plan for the active silver stage)
//   silver-code      — CodeArtifact (read-only review surface, no buttons)
//   ingestion-status — IngestionStatusArtifact (current ingest run + table profile)
//   sample           — SamplePreviewArtifact
//   pr               — PullRequestArtifact
//   code | sql | context — persistent views surfaced from the side-panel overflow menu
//
// Configuration UIs (sources, gitconnect) live in modal wizards (WIZARD_META)
// instead of the side panel — the side panel is for consuming information, not
// configuring the project.
const VIEW_LABEL = {
  'silver-plan':      'Silver layer plan',
  'silver-code':      'Silver layer code',
  'ingestion-status': 'Ingestion run',
  sample:             'Sample preview',
  pr:                 'Pull request',
  code:               'Repo',
  sql:                'SQL editor',
  context:            'Context',
};

const VIEW_ICON = {
  'silver-plan':      'layers',
  'silver-code':      'code',
  'ingestion-status': 'download',
  sample:             'table',
  pr:                 'git',
  code:               'code',
  sql:                'terminal',
  context:            'book',
};

// Modal wizards — chips with `wizard: '<key>'` open these instead of routing
// to the side panel.
const WIZARD_META = {
  sources:    { label: 'Set up sources',     icon: 'db'  },
  gitconnect: { label: 'Connect git remote', icon: 'git' },
};

export function ArtifactChip({ view, wizard, label, icon, hint }) {
  const { openArtifact, openWizard, shell } = usePhase();
  const [hover, setHover] = React.useState(false);

  const isWizard = !!wizard;
  const active   = !isWizard && shell.artifactView === view;
  const iconName = icon || (isWizard ? (WIZARD_META[wizard]?.icon || 'sparkle') : (VIEW_ICON[view] || 'sparkle'));
  const text     = label || (isWizard ? (WIZARD_META[wizard]?.label || 'Open') : (VIEW_LABEL[view] || 'Open artifact'));

  const onClick = () => {
    if (isWizard) {
      openWizard(wizard);
    } else if (view) {
      openArtifact(view);
    }
  };

  return (
    <button
      className="walt-pop-in"
      onClick={onClick}
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
