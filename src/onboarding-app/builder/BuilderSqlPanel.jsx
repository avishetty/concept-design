import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { hilite } from '../../screens/shared.jsx';
import { useBuilder } from './BuilderState.jsx';
import { MRR_SUMMARY, MRR_PREVIEW, MRR_SQL } from './builderScript.jsx';

const DEFAULT_WIDTH = 380;
const MIN_WIDTH = 320;
const MIN_CHAT_WIDTH = 420;

const TABS = ['Summary', 'SQL', 'Results'];

// Scene 3 — the SQL artifact side panel. Slide-in + resize mirrors
// ArtifactsPanel; content is the MRR-by-segment mock with Summary / SQL /
// Results tabs.
export function BuilderSqlPanel() {
  const { sqlPanel, dispatch } = useBuilder();
  const isOpen = sqlPanel.open;
  const tab = sqlPanel.tab || 'summary';

  const [rendered, setRendered] = React.useState(isOpen);
  React.useEffect(() => {
    if (isOpen) { setRendered(true); return; }
    const t = setTimeout(() => setRendered(false), 320);
    return () => clearTimeout(t);
  }, [isOpen]);

  const [width, setWidth] = React.useState(DEFAULT_WIDTH);
  const [dragging, setDragging] = React.useState(false);
  const asideRef = React.useRef(null);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      if (!asideRef.current) return;
      const rect = asideRef.current.getBoundingClientRect();
      const parent = asideRef.current.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth };
      const desired = rect.right - e.clientX;
      const maxWidth = Math.max(MIN_WIDTH, parentRect.width - MIN_CHAT_WIDTH);
      setWidth(Math.max(MIN_WIDTH, Math.min(maxWidth, desired)));
    };
    const stop = () => setDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', stop);
    document.addEventListener('mouseleave', stop);
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('mouseleave', stop);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = '';
    };
  }, [dragging]);

  return (
    <aside ref={asideRef} style={{
      width: isOpen ? width : 0,
      flexShrink: 0, overflow: 'hidden', position: 'relative',
      transition: dragging ? 'none' : 'width .32s cubic-bezier(.22,.61,.36,1)',
      borderLeft: '1px solid ' + (isOpen ? 'var(--border-subtle)' : 'transparent'),
      background: 'var(--bg-surface)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      {isOpen && <ResizeHandle dragging={dragging} onStart={() => setDragging(true)}/>}
      {rendered && (
        <div className={isOpen ? 'walt-panel-in' : undefined} style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          opacity: isOpen ? 1 : 0, transition: 'opacity .2s ease',
        }}>
          <div style={{ padding: '11px 13px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Building the data query…</div>
              <button
                aria-label="Close panel"
                onClick={() => dispatch({ type: 'CLOSE_SQL' })}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', padding: 2 }}
              >
                <Icon name="x" size={14} color="currentColor"/>
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
              Agent: SQL_Generator&nbsp;·&nbsp;<span style={{ color: 'var(--status-ok)' }}>✓ Completed</span>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
            {TABS.map(t => {
              const key = t.toLowerCase();
              const on = key === tab;
              return (
                <button
                  key={t}
                  onClick={() => dispatch({ type: 'SET_SQL_TAB', tab: key })}
                  style={{
                    padding: '8px 13px', fontSize: 12, cursor: 'pointer',
                    border: 'none', background: 'transparent',
                    borderBottom: '2px solid ' + (on ? 'var(--semantic)' : 'transparent'),
                    color: on ? 'var(--semantic)' : 'var(--text-secondary)',
                    fontWeight: on ? 600 : 500, fontFamily: 'var(--font-sans)',
                  }}
                >{t}</button>
              );
            })}
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 13px' }}>
            {tab === 'summary' && <SummaryTab/>}
            {tab === 'sql' && <SqlTab/>}
            {tab === 'results' && <ResultsTab/>}
          </div>
        </div>
      )}
    </aside>
  );
}

function SummaryTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5 }}>
      {MRR_SUMMARY.map(row => (
        <div key={row.k} style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: 'var(--text-secondary)', minWidth: 78 }}>{row.k}</span>
          <span style={{ fontWeight: row.strong ? 600 : 400, color: 'var(--text-primary)' }}>{row.v}</span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', minWidth: 78 }}>Template</span>
        <span style={{
          background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999,
          padding: '2px 8px', fontSize: 10.5, fontWeight: 600,
        }}>Basic Analysis</span>
      </div>
    </div>
  );
}

function ResultsTab() {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 7, color: 'var(--text-primary)' }}>Preview output</div>
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {MRR_PREVIEW.headers.map((h, i) => (
              <th key={h} style={{
                padding: '4px 7px', textAlign: i === 0 ? 'left' : 'right',
                fontWeight: 500, color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-subtle)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MRR_PREVIEW.rows.map((r, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {r.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '4px 7px', textAlign: ci === 0 ? 'left' : 'right',
                  fontWeight: ci === 1 ? 600 : 400,
                  color: ci === 1 ? 'var(--accent)' : 'var(--text-primary)',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SqlTab() {
  return (
    <div style={{
      background: 'var(--code-bg)', border: '1px solid var(--border-subtle)',
      borderRadius: 8, padding: 11, overflowX: 'auto',
      fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.7,
      color: 'var(--text-primary)',
    }}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: hilite(MRR_SQL) }}/>
    </div>
  );
}

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
      style={{ position: 'absolute', top: 0, bottom: 0, left: -3, width: 8, cursor: 'col-resize', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ width: active ? 2 : 1, height: '100%', background: active ? 'var(--semantic)' : 'transparent', transition: 'background .14s ease, width .14s ease' }}/>
    </div>
  );
}
