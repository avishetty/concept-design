import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { useBuilder } from './BuilderState.jsx';
import { WORKSPACE } from './builderScript.jsx';

// The mockup's WALT sidebar: wordmark, workspace selector, primary nav, recent
// chat history (context-dependent), and the admin/user footer.
export function BuilderSidebar() {
  const { view, activeScript, dispatch } = useBuilder();

  const inChat = view === 'home' || view === 'chat';
  const inBench = view === 'benchmarks' || view === 'benchmarkDetail';

  // Recent history reflects which conversation is live (mirrors the mockup's
  // per-scene history list).
  const history = activeScript === 'fix'
    ? [{ t: 'vf_validation fix', on: true }, { t: 'MRR Build Session', on: false }]
    : (view === 'chat'
        ? [{ t: 'MRR Build Session', on: true }]
        : []);

  return (
    <div style={{
      width: 208, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        fontSize: 17, fontWeight: 700, letterSpacing: '-0.5px',
        padding: '15px 16px 10px', color: 'var(--text-primary)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: 6, background: 'var(--semantic)',
          color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>W</span>
        WALT
      </div>

      <div style={{
        margin: '0 10px 10px',
        border: '1px solid var(--border-default)', borderRadius: 8,
        padding: '7px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Workspace</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{WORKSPACE}</div>
        </div>
        <Icon name="chevD" size={13} color="var(--text-muted)"/>
      </div>

      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="msg" label="Start New Chat" active={inChat}
          onClick={() => dispatch({ type: 'START_NEW_CHAT' })}/>
        <NavItem icon="layers" label="Benchmark Suites" active={inBench}
          onClick={() => dispatch({ type: 'GOTO_BENCHMARKS' })}/>
        <NavItem icon="settings" label="Workspace Settings" active={false}
          onClick={() => dispatch({ type: 'GOTO_BENCHMARKS' })}/>
      </div>

      {history.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 10px' }}/>
          <div style={{
            padding: '6px 16px 2px', fontSize: 10, color: 'var(--text-muted)',
            letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>Recent</div>
          {history.map((h, i) => (
            <div key={i} style={{
              padding: '6px 10px 6px 14px', margin: '0 8px', borderRadius: 8,
              fontSize: 12, cursor: 'pointer',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              background: h.on ? 'var(--bg-inset)' : 'transparent',
              color: h.on ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>{h.t}</div>
          ))}
        </>
      )}

      <div style={{ flex: 1 }}/>

      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 8 }}>
        <FootItem icon="shield" label="Admin Dashboard"/>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 8px', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="user" size={13} color="var(--text-secondary)"/> Avi Shetty
          </span>
          <Icon name="settings" size={12} color="var(--text-muted)"/>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '7px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 12, textAlign: 'left', fontFamily: 'var(--font-sans)',
        background: active ? 'var(--bg-inset)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 500,
        transition: 'background .12s ease, color .12s ease',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon name={icon} size={13} color="currentColor"/> {label}
    </button>
  );
}

function FootItem({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 8px', borderRadius: 8, fontSize: 12,
      color: 'var(--text-secondary)', cursor: 'pointer',
    }}>
      <Icon name={icon} size={13} color="var(--text-secondary)"/> {label}
    </div>
  );
}
