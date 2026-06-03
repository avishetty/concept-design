import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { useBuilder } from './BuilderState.jsx';
import { SettingsTabs } from './BenchmarkSuitesPage.jsx';
import { RUN_COLUMNS, DETAIL_QUESTIONS, SUITES } from './builderScript.jsx';

// Scene 5 — the benchmark detail run-grid. The key design decision: a
// "Fix with Builder" button sits on EVERY run cell — success and error alike —
// so any run can launch Builder with that run's context pre-loaded.
export function BenchmarkDetailPage() {
  const { benchSuiteId, rerunning, dispatch } = useBuilder();
  const suite = SUITES.find(s => s.id === benchSuiteId) || SUITES[0];

  const launchFix = (q, col, cell) => {
    dispatch({
      type: 'START_FIX',
      fixContext: {
        suite: suite.name,
        runLabel: col.label,
        question: q.question,
        status: cell,
      },
    });
  };

  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', background: 'var(--bg-app)' }}>
      <SettingsTabs/>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 28px' }}>
        <button
          onClick={() => dispatch({ type: 'GOTO_BENCHMARKS' })}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 12,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
          }}
        >
          <Icon name="arrowL" size={12} color="var(--text-secondary)"/> Back to Suites
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>{suite.name}</div>
          <span style={{
            fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
            background: 'rgba(199,143,42,0.14)', color: 'var(--status-warn)',
          }}>Cache bypassed</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>answer {suite.questions} questions</div>

        {rerunning && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14,
            padding: '9px 13px', borderRadius: 10,
            background: 'var(--semantic-soft)', border: '1px solid var(--semantic)',
          }}>
            <span className="walt-spinner" style={{ '--c': 'var(--semantic)' }} aria-hidden="true"/>
            <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>
              Re-running <b>{suite.name}</b> with the committed semantic-model changes…
            </span>
            <button
              onClick={() => dispatch({ type: 'CLEAR_RERUN' })}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', padding: 2 }}
              aria-label="Dismiss"
            >
              <Icon name="x" size={13} color="currentColor"/>
            </button>
          </div>
        )}

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                <th style={thStyle(26)}>#</th>
                <th style={thStyle()}>Question</th>
                {RUN_COLUMNS.map(col => (
                  <th key={col.id} style={thStyle(150)}>
                    {col.label}
                    <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>{col.score}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DETAIL_QUESTIONS.map(q => (
                <tr key={q.n} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', verticalAlign: 'top' }}>{q.n}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', verticalAlign: 'top' }}>{q.question}</td>
                  {q.cells.map((cell, ci) => (
                    <td key={ci} style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      {cell === null ? (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-start' }}>
                          <RunChip status={cell}/>
                          <FixButton onClick={() => launchFix(q, RUN_COLUMNS[ci], cell)}/>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Click “Fix with Builder” on any run — success or error — to launch Builder in chat mode with the run context pre-loaded.
        </div>
      </div>
    </div>
  );
}

function thStyle(width) {
  return {
    textAlign: 'left', padding: '10px 14px', fontWeight: 500,
    color: 'var(--text-secondary)', background: 'var(--bg-inset)',
    borderBottom: '1px solid var(--border-subtle)', fontSize: 11.5,
    width: width || undefined,
  };
}

function RunChip({ status }) {
  const ok = status === 'success';
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 6,
      background: ok ? 'rgba(63,143,63,0.12)' : 'rgba(193,67,67,0.12)',
      color: ok ? 'var(--status-ok)' : 'var(--status-err)',
    }}>{status}</span>
  );
}

function FixButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'var(--semantic-soft)', color: 'var(--semantic)',
        border: '1px solid var(--semantic)', borderRadius: 7,
        padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        transition: 'background .14s ease, filter .14s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.97)'; e.currentTarget.style.background = 'var(--semantic)'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.background = 'var(--semantic-soft)'; e.currentTarget.style.color = 'var(--semantic)'; }}
    >
      <Icon name="sparkle" size={9} color="currentColor"/> Fix with Builder
    </button>
  );
}
