import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { hilite } from '../../screens/shared.jsx';

const DEFAULT_QUERY = `-- ask the data
select
  date_trunc('month', issue_date) as month,
  count(*)                        as invoices,
  sum(amount)                     as total_amount,
  sum(amount) filter (where status = 'open') as open_amount
from silver.s3_standardise.finance_ap_invoices
where issue_date >= dateadd(month, -6, current_date)
group by 1
order by 1 desc;`;

const RESULT_HEADERS = ['month', 'invoices', 'total_amount', 'open_amount'];
const RESULT_ROWS = [
  ['2026-05-01', '14,210', '12,840,290.40', '3,128,090.00'],
  ['2026-04-01', '15,028', '13,290,400.10', '2,810,300.00'],
  ['2026-03-01', '14,602', '12,940,800.00', '1,940,210.00'],
  ['2026-02-01', '13,910', '12,140,100.00', '1,210,800.00'],
  ['2026-01-01', '12,440', '11,200,900.00', '802,400.00'],
  ['2025-12-01', '11,288', '10,400,200.00', '440,100.00'],
];

export function SqlEditorArtifact() {
  const [query, setQuery] = React.useState(DEFAULT_QUERY);
  const [state, setState] = React.useState('idle'); // 'idle' | 'running' | 'done'
  const [elapsed, setElapsed] = React.useState(0);

  const run = () => {
    setState('running');
    setElapsed(0);
    setTimeout(() => { setState('done'); setElapsed(820); }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{
        padding: '10px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>SQL editor · finance-platform</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Walt sandbox · read-only on <span className="walt-mono">silver.*</span> · mocked execution
          </div>
        </div>
        <span style={{
          fontSize: 11, padding: '3px 9px', borderRadius: 999,
          background: 'var(--bg-inset)', color: 'var(--text-secondary)',
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-mono)',
        }}>
          warehouse · ANALYST_WH (XS)
        </span>
        <button
          className="walt-btn primary"
          onClick={run}
          disabled={state === 'running'}
          style={{ padding: '6px 12px', fontSize: 12 }}
        >
          <Icon name="play" size={10} color="var(--accent-on)"/>
          {state === 'running' ? 'Running…' : 'Run'}
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Editor */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative', background: 'var(--code-bg)' }}>
          <pre
            aria-hidden
            style={{
              position: 'absolute', inset: 0, margin: 0,
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5, lineHeight: 1.65,
              color: 'var(--text-primary)',
              whiteSpace: 'pre',
              pointerEvents: 'none',
              overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: hilite(query) }}
          />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5, lineHeight: 1.65,
              color: 'transparent',
              caretColor: 'var(--text-primary)',
              background: 'transparent',
              border: 'none', outline: 'none',
              resize: 'none',
              whiteSpace: 'pre',
            }}
          />
        </div>

        {/* Results */}
        <div style={{
          height: 280, flexShrink: 0,
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div style={{
            padding: '8px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-inset)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>Results</span>
            {state === 'done' && (
              <>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {RESULT_ROWS.length} rows · {elapsed}ms</span>
                <span style={{ fontSize: 11, color: 'var(--status-ok)', fontWeight: 500 }}>
                  <Icon name="check" size={9} color="var(--status-ok)"/> ok
                </span>
              </>
            )}
            {state === 'running' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· running</span>}
            <div style={{ flex: 1 }}/>
            <button className="walt-btn ghost sm" style={{ fontSize: 11 }}><Icon name="chart" size={10}/> Chart</button>
            <button className="walt-btn ghost sm" style={{ fontSize: 11 }}><Icon name="download" size={10}/> Export</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {state === 'idle' && (
              <div style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: 12,
              }}>
                Run the query to see results.
              </div>
            )}
            {state === 'running' && (
              <div style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', fontSize: 12,
                gap: 8,
              }}>
                <span className="walt-dot run"/> Compiling on ANALYST_WH…
              </div>
            )}
            {state === 'done' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {RESULT_HEADERS.map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 12px',
                        background: 'var(--bg-surface)',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11, color: 'var(--text-muted)',
                        fontWeight: 500,
                        position: 'sticky', top: 0,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESULT_ROWS.map((row, i) => (
                    <tr key={i}>
                      {row.map((c, j) => (
                        <td key={j} style={{
                          padding: '7px 12px',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontFamily: 'var(--font-mono)', fontSize: 12,
                          color: 'var(--text-primary)',
                        }}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
