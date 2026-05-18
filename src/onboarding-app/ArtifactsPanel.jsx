import React from 'react';
import { Icon } from '../lib/components.jsx';
import { usePhase } from './state.jsx';
import { SamplePreviewArtifact } from './artifacts/SamplePreviewArtifact.jsx';
import { PullRequestArtifact } from './artifacts/PullRequestArtifact.jsx';
import { CodeArtifact } from './artifacts/CodeArtifact.jsx';
import { SqlEditorArtifact } from './artifacts/SqlEditorArtifact.jsx';
import { ContextArtifact } from './artifacts/ContextArtifact.jsx';
import { PlanArtifact } from './artifacts/PlanArtifact.jsx';
import { IngestionStatusArtifact } from './artifacts/IngestionStatusArtifact.jsx';

// ArtifactsPanel — single-artifact side panel for the chat shell.
//
// Design notes
// ------------
// The panel shows exactly one artifact at a time. Chat pills (and the few code
// review controls) push into it via openArtifact(view). There is no tab strip
// here any more — the live ingestion run and the silver build flow live on
// their own *project pages* (Ingestion / Transformation), reachable from the
// org dashboard or the in-chat status notifications.
//
// The persistent "anywhere" views (Code / SQL / Context) live behind an
// overflow menu in the header so the user can jump to them without leaving the
// chat surface.
const VIEW_META = {
  'silver-plan':       { label: 'Plan',             icon: 'wand' },
  'silver-code':       { label: 'Silver code',      icon: 'code' },
  'ingestion-status':  { label: 'Ingestion · live', icon: 'pulse' },
  'sample':            { label: 'Sample preview',   icon: 'table' },
  'pr':                { label: 'Pull request',     icon: 'git' },
  'code':              { label: 'Code',             icon: 'code' },
  'sql':               { label: 'SQL editor',       icon: 'terminal' },
  'context':           { label: 'Context',          icon: 'layers' },
};

// Views available behind the overflow menu — the persistent surfaces that
// stay reachable regardless of what task the agent is doing.
const PERSISTENT_VIEWS = [
  { view: 'code',    label: 'Code',    icon: 'code',
    desc: 'Browse the repo' },
  { view: 'sql',     label: 'SQL',     icon: 'terminal',
    desc: 'Run a query' },
  { view: 'context', label: 'Context', icon: 'layers',
    desc: 'What Walt remembers' },
];

// Width bounds for the split.
const DEFAULT_PANEL_WIDTH = 540;
const MIN_PANEL_WIDTH = 380;
const MIN_CHAT_WIDTH = 440;

export function ArtifactsPanel() {
  const { shell, openArtifact } = usePhase();
  const { artifactView } = shell;
  const isOpen = !!artifactView;

  // Keep contents mounted briefly during a close so the slide-out reads as motion.
  const [rendered, setRendered] = React.useState(isOpen);
  React.useEffect(() => {
    if (isOpen) { setRendered(true); return; }
    const t = setTimeout(() => setRendered(false), 320);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Resizable split between chat column and artifact panel.
  const [width, setWidth] = React.useState(DEFAULT_PANEL_WIDTH);
  const [dragging, setDragging] = React.useState(false);
  const asideRef = React.useRef(null);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      if (!asideRef.current) return;
      const aside = asideRef.current;
      const rect = aside.getBoundingClientRect();
      const parent = aside.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth };
      const desired = rect.right - e.clientX;
      const maxWidth = Math.max(MIN_PANEL_WIDTH, parentRect.width - MIN_CHAT_WIDTH);
      const clamped = Math.max(MIN_PANEL_WIDTH, Math.min(maxWidth, desired));
      setWidth(clamped);
    };
    const stop = () => setDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', stop);
    document.addEventListener('mouseleave', stop);
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('mouseleave', stop);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
    };
  }, [dragging]);

  React.useEffect(() => {
    const onResize = () => {
      if (!asideRef.current?.parentElement) return;
      const parentWidth = asideRef.current.parentElement.getBoundingClientRect().width;
      const maxWidth = Math.max(MIN_PANEL_WIDTH, parentWidth - MIN_CHAT_WIDTH);
      setWidth(w => Math.min(w, maxWidth));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const meta = VIEW_META[artifactView] || { label: 'Artifact', icon: 'sparkle' };

  return (
    <aside ref={asideRef} style={{
      width: isOpen ? width : 0,
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative',
      transition: dragging
        ? 'border-left-color .2s ease'
        : 'width .32s cubic-bezier(.22,.61,.36,1), border-left-color .2s ease',
      borderLeft: '1px solid ' + (isOpen ? 'var(--border-subtle)' : 'transparent'),
      background: 'var(--bg-app)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      {isOpen && <ResizeHandle dragging={dragging} onStart={() => setDragging(true)}/>}
      {rendered && (
        <div
          className={isOpen ? 'walt-panel-in' : undefined}
          style={{
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity .2s ease',
          }}
        >
          <PanelHeader
            meta={meta}
            activeView={artifactView}
            onPick={(v) => openArtifact(v)}
          />
          <div
            key={artifactView}
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'walt-fade-in .26s ease' }}
          >
            {renderView(artifactView)}
          </div>
        </div>
      )}
    </aside>
  );
}

function PanelHeader({ meta, activeView, onPick }) {
  return (
    <div style={{
      height: 40, flexShrink: 0,
      display: 'flex', alignItems: 'center',
      padding: '0 6px 0 14px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Icon name={meta.icon} size={12} color="var(--text-secondary)"/>
      <span style={{
        marginLeft: 8, fontSize: 12.5, fontWeight: 600,
        color: 'var(--text-primary)', letterSpacing: -0.1,
      }}>
        {meta.label}
      </span>
      <div style={{ flex: 1 }}/>
      <OverflowMenu activeView={activeView} onPick={onPick}/>
    </div>
  );
}

function OverflowMenu({ activeView, onPick }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        aria-label="More views"
        title="More views"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 28, height: 28, borderRadius: 6,
          border: '1px solid ' + (open ? 'var(--border-default, var(--border-subtle))' : 'transparent'),
          background: open ? 'var(--bg-inset)' : 'transparent',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .12s, color .12s, border-color .12s',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <Icon name="dots" size={14} color="currentColor"/>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 30,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default, var(--border-subtle))',
          borderRadius: 10,
          boxShadow: '0 12px 28px rgba(17,20,24,0.10), 0 2px 6px rgba(17,20,24,0.05)',
          padding: 4,
          minWidth: 220,
        }}>
          <div style={{
            padding: '6px 10px 8px',
            fontSize: 10.5, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600,
          }}>Open view</div>
          {PERSISTENT_VIEWS.map(v => {
            const on = activeView === v.view;
            return (
              <button
                key={v.view}
                onClick={() => { onPick(v.view); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: 'none', background: on ? 'var(--accent-soft)' : 'transparent',
                  cursor: 'pointer',
                  color: on ? 'var(--accent)' : 'var(--text-primary)',
                  fontSize: 12, fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: on ? 'var(--accent-soft)' : 'var(--bg-inset)',
                  color: on ? 'var(--accent)' : 'var(--text-secondary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name={v.icon} size={11} color="currentColor"/>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: on ? 600 : 500 }}>{v.label}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{v.desc}</span>
                </span>
                {on && <Icon name="check" size={10} color="var(--accent)"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Thin vertical grab strip on the panel's left edge.
function ResizeHandle({ dragging, onStart }) {
  const [hover, setHover] = React.useState(false);
  const active = dragging || hover;
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onMouseDown={(e) => { e.preventDefault(); onStart(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        top: 0, bottom: 0, left: -3,
        width: 8,
        cursor: 'col-resize',
        zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        width: active ? 2 : 1,
        height: '100%',
        background: active ? 'var(--accent)' : 'transparent',
        transition: 'background .14s ease, width .14s ease',
        opacity: dragging ? 1 : (hover ? 0.85 : 1),
      }}/>
    </div>
  );
}

function renderView(view) {
  switch (view) {
    case 'silver-plan':      return <PlanArtifact/>;
    case 'silver-code':      return <CodeArtifact/>;
    case 'ingestion-status': return <IngestionStatusArtifact/>;
    case 'sample':           return <SamplePreviewArtifact/>;
    case 'pr':               return <PullRequestArtifact/>;
    case 'code':             return <CodeArtifact/>;
    case 'sql':              return <SqlEditorArtifact/>;
    case 'context':          return <ContextArtifact/>;
    default:                 return <EmptyState/>;
  }
}

function EmptyState() {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, textAlign: 'center',
      color: 'var(--text-muted)',
    }}>
      <div style={{ maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <Icon name="sidePanel" size={22} color="var(--text-muted)"/>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>Nothing pinned</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          Walt will open artifacts here as you work. Click a chip in chat to focus one.
        </div>
      </div>
    </div>
  );
}
