import React from 'react';
import { Icon } from '../../lib/components.jsx';

const TABLES = [
  {
    name: 'bronze.gl.journal_entries',
    rows: '2,143,892', cols: 18, note: 'Fact-grained · period-partitioned',
    cells: [
      ['journal_id', 'period_id', 'account_no', 'debit', 'credit', '_ingested_at'],
      ['JE-20180001', 'P2025-04', '1000-00', '12,400.00', '0.00',  '2026-05-11 18:04Z'],
      ['JE-20180002', 'P2025-04', '4100-12', '0.00',       '8,210.50', '2026-05-11 18:04Z'],
      ['JE-20180003', 'P2025-04', '2150-00', '0.00',       '950.00',   '2026-05-11 18:04Z'],
      ['JE-20180004', 'P2025-04', '5200-00', '1,800.00', '0.00',  '2026-05-11 18:04Z'],
    ],
    qa: { freshness: 'ok', null: 'ok', drift: 'ok' },
  },
  {
    name: 'bronze.ap.vendors',
    rows: '2,418', cols: 11, note: 'PII masked · vendor_name → sha256',
    cells: [
      ['vendor_id', 'vendor_name', 'country', 'payment_terms', '_ingested_at'],
      ['V-00001',   'sha256:9a2c…',  'US',     'NET-30',         '2026-05-11 18:04Z'],
      ['V-00002',   'sha256:1f81…',  'IE',     'NET-45',         '2026-05-11 18:04Z'],
      ['V-00003',   'sha256:7e44…',  'US',     'NET-30',         '2026-05-11 18:04Z'],
    ],
    qa: { freshness: 'ok', null: 'ok', drift: 'ok' },
  },
  {
    name: 'bronze.ar.invoices',
    rows: '512,063', cols: 16, note: 'Aged-bucket helpful for receivables',
    cells: [
      ['invoice_id', 'customer_id', 'issue_date', 'amount', 'currency', 'status'],
      ['INV-44012',  'C-1923',      '2025-03-12', '4,290.00', 'USD',     'paid'],
      ['INV-44013',  'C-2810',      '2025-03-12', '12,140.00','USD',     'open'],
      ['INV-44014',  'C-1923',      '2025-03-14', '780.00',   'USD',     'paid'],
    ],
    qa: { freshness: 'ok', null: 'attn', drift: 'ok' },
  },
  {
    name: 'bronze.cash.bank_transactions',
    rows: '1,308,440', cols: 12, note: 'CDC stream · 1-min late',
    cells: [
      ['txn_id', 'account_no', 'txn_date', 'amount', 'memo'],
      ['T-90041','BANK-001',    '2025-03-12','-2,400.00', 'ACH OUT'],
      ['T-90042','BANK-001',    '2025-03-12','+18,000.00','WIRE IN'],
      ['T-90043','BANK-002',    '2025-03-12','-560.18',   'CC SWEEP'],
    ],
    qa: { freshness: 'ok', null: 'ok', drift: 'ok' },
  },
];

export function SamplePreviewArtifact() {
  const [active, setActive] = React.useState(TABLES[0].name);
  const current = TABLES.find(t => t.name === active);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Sample preview</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          220 tables in <span className="walt-mono">bronze.finance.*</span> · here are 4 of the priority tables. Reviewer is running contract + freshness checks.
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '14px 22px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABLES.map(t => {
            const on = active === t.name;
            return (
              <button
                key={t.name}
                onClick={() => setActive(t.name)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 7,
                  border: '1px solid ' + (on ? 'var(--border-default)' : 'transparent'),
                  background: on ? 'var(--bg-elevated)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: on ? 600 : 500,
                }}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        <div style={{
          flex: 1, minHeight: 0,
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
        }}>
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-inset)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span className="walt-mono" style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600 }}>{current.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{current.note}</span>
            </div>
            <div style={{ flex: 1 }}/>
            <Stat label="Rows" value={current.rows}/>
            <Stat label="Cols" value={String(current.cols)}/>
            <span style={{ width: 1, height: 22, background: 'var(--border-subtle)' }}/>
            <QaDot label="Freshness" state={current.qa.freshness}/>
            <QaDot label="Nulls" state={current.qa.null}/>
            <QaDot label="Drift" state={current.qa.drift}/>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {current.cells[0].map((h, i) => (
                    <th key={i} style={{
                      textAlign: 'left',
                      padding: '9px 12px',
                      background: 'var(--bg-surface)',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontWeight: 500,
                      position: 'sticky', top: 0,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.cells.slice(1).map((row, i) => (
                  <tr key={i}>
                    {row.map((c, j) => (
                      <td key={j} style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--text-primary)',
                      }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{label}</span>
      <span className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function QaDot({ label, state }) {
  const colors = { ok: 'var(--status-ok)', attn: 'var(--status-warn)', err: 'var(--status-err)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: 'var(--text-secondary)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: colors[state] }}/>
      {label}
    </span>
  );
}
