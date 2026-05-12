import React from 'react';
import { Icon } from '../lib/components.jsx';
import { usePhase } from './state.jsx';
import { ConnectionsArtifact } from './artifacts/ConnectionsArtifact.jsx';
import { IngestionArtifact } from './artifacts/IngestionArtifact.jsx';
import { SamplePreviewArtifact } from './artifacts/SamplePreviewArtifact.jsx';
import { SilverBuildArtifact } from './artifacts/SilverBuildArtifact.jsx';
import { PullRequestArtifact } from './artifacts/PullRequestArtifact.jsx';
import { ProductionDashboardArtifact } from './artifacts/ProductionDashboardArtifact.jsx';
import { CodeArtifact } from './artifacts/CodeArtifact.jsx';
import { SqlEditorArtifact } from './artifacts/SqlEditorArtifact.jsx';
import { ContextArtifact } from './artifacts/ContextArtifact.jsx';
import { GitConnectArtifact } from './artifacts/GitConnectArtifact.jsx';

const TABS = [
  { key: 'ingestion',      label: 'Ingestion',      icon: 'cloud' },
  { key: 'transformation', label: 'Transformation', icon: 'wand' },
  { key: 'code',           label: 'Code',           icon: 'code' },
  { key: 'sql',            label: 'SQL',            icon: 'terminal' },
  { key: 'context',        label: 'Context',        icon: 'layers' },
];

const INGESTION_VIEWS = ['connections', 'ingestion', 'sample', 'production'];
const TRANSFORMATION_VIEWS = ['silver', 'pr'];
const CODE_VIEWS = ['code'];
const SQL_VIEWS = ['sql'];
const CONTEXT_VIEWS = ['context', 'gitconnect'];

const TAB_DEFAULT_VIEW = {
  ingestion: 'ingestion',
  transformation: 'silver',
  code: 'code',
  sql: 'sql',
  context: 'context',
};

// Width bounds. Chat needs enough room to keep the 720px reading column comfortable;
// the artifact panel needs enough room for code/table grids.
const DEFAULT_PANEL_WIDTH = 540;
const MIN_PANEL_WIDTH = 380;
const MIN_CHAT_WIDTH = 440;

export function ArtifactsPanel() {
  const { shell, openArtifact, setArtifactTab } = usePhase();
  const { artifactView, artifactTab } = shell;
  const isOpen = !!artifactView;

  // Keep the *contents* mounted briefly during a close so the slide-out reads as motion,
  // not as a hard cut. `rendered` follows `isOpen` with a small trailing delay.
  const [rendered, setRendered] = React.useState(isOpen);
  React.useEffect(() => {
    if (isOpen) {
      setRendered(true);
      return;
    }
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
      // Panel hugs the right edge; new width = right edge - cursor x.
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

  // If the viewport shrinks below what the current width allows, gently re-clamp.
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

  const onTab = (k) => {
    if (artifactTab === k) return;
    const defaultView = TAB_DEFAULT_VIEW[k];
    openArtifact(defaultView, k);
  };

  return (
    <aside ref={asideRef} style={{
      width: isOpen ? width : 0,
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative',
      // Drop the width transition while dragging so the panel tracks the cursor 1:1.
      transition: dragging
        ? 'border-left-color .2s ease'
        : 'width .32s cubic-bezier(.22,.61,.36,1), border-left-color .2s ease',
      borderLeft: '1px solid ' + (isOpen ? 'var(--border-subtle)' : 'transparent'),
      background: 'var(--bg-app)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      {isOpen && (
        <ResizeHandle
          dragging={dragging}
          onStart={() => setDragging(true)}
        />
      )}
      {rendered && (
        <div
          className={isOpen ? 'walt-panel-in' : undefined}
          style={{
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity .2s ease',
          }}
        >
          <div style={{
            height: 40, flexShrink: 0,
            display: 'flex', alignItems: 'center',
            padding: '0 12px 0 4px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0, overflowX: 'auto' }}>
              {TABS.map(t => {
                const on = artifactTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => onTab(t.key)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      height: 30, padding: '0 11px',
                      borderRadius: 7,
                      border: 'none',
                      background: on ? 'var(--bg-inset)' : 'transparent',
                      color: on ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: on ? 600 : 500,
                      fontFamily: 'var(--font-sans)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background .12s, color .12s',
                    }}
                  >
                    <Icon name={t.icon} size={11} color={on ? 'var(--text-secondary)' : 'currentColor'}/>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div key={artifactView} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'walt-fade-in .26s ease' }}>
            <ArtifactBody view={artifactView} tab={artifactTab}/>
          </div>
        </div>
      )}
    </aside>
  );
}

// Thin vertical grab strip on the panel's left edge. Hit area is wider than the visible
// line so it's forgiving without taking real estate from the content.
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

function ArtifactBody({ view, tab }) {
  // Some tabs can hold multiple views; show the active view, plus a sub-strip when there are multiple choices.
  const viewsForTab = {
    ingestion:      INGESTION_VIEWS,
    transformation: TRANSFORMATION_VIEWS,
    code:           CODE_VIEWS,
    sql:            SQL_VIEWS,
    context:        CONTEXT_VIEWS,
  }[tab] || [];

  const showSubStrip = viewsForTab.length > 1;

  return (
    <>
      {showSubStrip && <SubStrip views={viewsForTab} active={view}/>}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {renderView(view)}
      </div>
    </>
  );
}

const VIEW_LABEL = {
  connections: 'Sources',
  ingestion:   'Live ingestion',
  sample:      'Sample preview',
  production:  'Production',
  silver:      'Silver build',
  pr:          'Pull request',
  code:        'Code',
  sql:         'SQL',
  context:     'Context',
  gitconnect:  'Git remote',
};

const VIEW_ICON = {
  connections: 'db',
  ingestion:   'pulse',
  sample:      'table',
  production:  'rocket',
  silver:      'wand',
  pr:          'git',
  code:        'code',
  sql:         'terminal',
  context:     'layers',
  gitconnect:  'git',
};

function SubStrip({ views, active }) {
  const { openArtifact, shell } = usePhase();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '8px 12px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      overflowX: 'auto',
    }}>
      {views.map(v => {
        const on = active === v;
        return (
          <button
            key={v}
            onClick={() => openArtifact(v, shell.artifactTab)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 9px',
              borderRadius: 999,
              border: on ? '1px solid var(--border-default)' : '1px solid transparent',
              background: on ? 'var(--bg-elevated)' : 'transparent',
              fontSize: 11, fontWeight: on ? 600 : 500,
              color: on ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon name={VIEW_ICON[v]} size={10} color={on ? 'var(--text-secondary)' : 'currentColor'}/>
            {VIEW_LABEL[v]}
          </button>
        );
      })}
    </div>
  );
}

function renderView(view) {
  switch (view) {
    case 'connections': return <ConnectionsArtifact/>;
    case 'ingestion':   return <IngestionArtifact/>;
    case 'sample':      return <SamplePreviewArtifact/>;
    case 'silver':      return <SilverBuildArtifact/>;
    case 'pr':          return <PullRequestArtifact/>;
    case 'production':  return <ProductionDashboardArtifact/>;
    case 'code':        return <CodeArtifact/>;
    case 'sql':         return <SqlEditorArtifact/>;
    case 'context':     return <ContextArtifact/>;
    case 'gitconnect':  return <GitConnectArtifact/>;
    default:
      return <EmptyState/>;
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
