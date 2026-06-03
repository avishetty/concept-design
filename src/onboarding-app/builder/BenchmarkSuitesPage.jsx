import React from 'react';
import { useBuilder } from './BuilderState.jsx';
import { SETTINGS_TABS, SUITES } from './builderScript.jsx';

// Scene 4 — the Benchmark Suites list under a settings-style tab strip.
// Clicking the vf_validation_questions row opens its detail view (scene 5).
export function BenchmarkSuitesPage() {
  const { dispatch } = useBuilder();
  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', background: 'var(--bg-app)' }}>
      <SettingsTabs/>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '22px 28px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Benchmark Suites</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Track query quality across named question sets
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Name', 'Questions', 'Last Run', 'Score', 'Status', 'Cache', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 14px', fontWeight: 500,
                    color: 'var(--text-secondary)', background: 'var(--bg-inset)',
                    borderBottom: '1px solid var(--border-subtle)', fontSize: 11.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUITES.map(s => (
                <tr
                  key={s.id}
                  onClick={() => dispatch({ type: 'GOTO_DETAIL', suiteId: s.id })}
                  style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.subtitle}</div>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>{s.questions}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{s.lastRun}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>{s.score}</td>
                  <td style={{ padding: '11px 14px' }}><StatusTag status={s.status}/></td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{s.cache}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Open →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SettingsTabs() {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: '0 28px',
      borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
    }}>
      {SETTINGS_TABS.map(t => {
        const on = t === 'Benchmark Suites';
        return (
          <div key={t} style={{
            padding: '12px 12px', fontSize: 12.5, cursor: 'default',
            color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: on ? 600 : 500,
            borderBottom: '2px solid ' + (on ? 'var(--semantic)' : 'transparent'),
            marginBottom: -1,
          }}>{t}</div>
        );
      })}
    </div>
  );
}

export function StatusTag({ status }) {
  const ok = status === 'Completed';
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
      background: ok ? 'rgba(63,143,63,0.12)' : 'rgba(193,67,67,0.12)',
      color: ok ? 'var(--status-ok)' : 'var(--status-err)',
    }}>{status}</span>
  );
}
