import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { hilite } from '../../screens/shared.jsx';

// `kind` distinguishes physical storage from derived objects so the tree can
// render the right glyph: 'table' (physical), 'view' (virtual), 'mv' (materialized).
const TREE = [
  {
    layer: 'bronze',
    label: 'bronze',
    desc: '1:1 mirror of sources · 220 objects',
    tables: [
      { name: 'gl.journal_entries',     kind: 'table', rows: '2.1M',  fresh: '3m' },
      { name: 'gl.gl_accounts',         kind: 'table', rows: '4.8k',  fresh: '3m' },
      { name: 'ap.invoices',            kind: 'table', rows: '186k',  fresh: '3m' },
      { name: 'ap.vendors',             kind: 'table', rows: '2.4k',  fresh: '3m', pii: true },
      { name: 'ar.invoices',            kind: 'table', rows: '512k',  fresh: '3m' },
      { name: 'ar.customers',           kind: 'table', rows: '18.9k', fresh: '3m', pii: true },
      { name: 'cash.bank_transactions', kind: 'table', rows: '1.3M',  fresh: '3m' },
      { name: 'defrev.deferred_revenue',kind: 'table', rows: '88k',   fresh: '3m' },
    ],
  },
  {
    layer: 'silver',
    label: 'silver',
    desc: 'Dedup · type-cast · standardise · 60 views',
    tables: [
      { name: 's1_dedup.finance_ap_invoices',         kind: 'view', rows: '184,917', fresh: '6m' },
      { name: 's2_typecast.finance_ap_invoices',      kind: 'view', rows: '184,903', fresh: '6m' },
      { name: 's3_standardise.finance_ap_invoices',   kind: 'view', rows: '184,903', fresh: '6m' },
      { name: 's1_dedup.finance_ar_invoices',         kind: 'view', rows: '508,210', fresh: '6m' },
      { name: 's2_typecast.finance_ar_invoices',      kind: 'view', rows: '508,205', fresh: '6m' },
      { name: 's3_standardise.finance_ar_invoices',   kind: 'view', rows: '508,205', fresh: '6m' },
    ],
  },
  {
    layer: 'gold',
    label: 'gold',
    desc: 'Analyst-ready marts · 0 objects (build on request)',
    tables: [],
    empty: 'No gold marts yet. Ask Walt to build one — e.g. "Build a cash + AR mart for FP&A."',
  },
];

// Per-kind glyph + tooltip suffix. Tables get the canonical grid, views the eye,
// materialized views the layered stack (physical store backed by a view spec).
const KIND_META = {
  table: { icon: 'table',  label: 'table' },
  view:  { icon: 'eye',    label: 'view' },
  mv:    { icon: 'layers', label: 'materialized view' },
};

// Per-table sample fixtures. Keyed by fully-qualified `<layer>.<table>` so that
// clicking a table in the tree both seeds the editor and shows realistic rows
// when the user hits Run. Tables without an explicit fixture fall back to the
// generic preview synthesised from `genericSample()`.
const SAMPLES = {
  'bronze.gl.journal_entries': {
    headers: ['journal_id', 'entry_date', 'account', 'amount', 'currency', 'status'],
    rows: [
      ['JE-2026-0042191', '2026-05-08', '4000-Sales-AMER',   '142,840.50',  'USD', 'posted'],
      ['JE-2026-0042190', '2026-05-08', '6000-COGS-AMER',    '-58,210.00',  'USD', 'posted'],
      ['JE-2026-0042189', '2026-05-07', '1100-Cash',         '92,400.00',   'USD', 'posted'],
      ['JE-2026-0042188', '2026-05-07', '2100-AP',           '-12,810.10',  'USD', 'draft'],
      ['JE-2026-0042187', '2026-05-07', '4100-Services',     '8,420.00',    'EUR', 'posted'],
      ['JE-2026-0042186', '2026-05-06', '4000-Sales-EMEA',   '210,400.00',  'EUR', 'posted'],
      ['JE-2026-0042185', '2026-05-06', '1100-Cash',         '300,000.00',  'USD', 'posted'],
      ['JE-2026-0042184', '2026-05-05', '3000-Equity',       '-12,000.00',  'USD', 'posted'],
    ],
  },
  'bronze.gl.gl_accounts': {
    headers: ['account_id', 'account_name', 'type', 'parent', 'active'],
    rows: [
      ['1000', 'Assets',         'asset',     null,    'true'],
      ['1100', 'Cash',           'asset',     '1000',  'true'],
      ['1200', 'Accounts Receivable', 'asset','1000',  'true'],
      ['2000', 'Liabilities',    'liability', null,    'true'],
      ['2100', 'Accounts Payable','liability','2000',  'true'],
      ['3000', 'Equity',         'equity',    null,    'true'],
      ['4000', 'Sales-AMER',     'revenue',   null,    'true'],
      ['4100', 'Services',       'revenue',   null,    'true'],
      ['6000', 'COGS-AMER',      'expense',   null,    'true'],
    ],
  },
  'bronze.ap.invoices': {
    headers: ['invoice_id', 'vendor_id', 'issue_date', 'due_date', 'amount', 'status'],
    rows: [
      ['INV-0000182441', 'V-00214', '2026-05-08', '2026-06-07', '12,840.10', 'open'],
      ['INV-0000182440', 'V-00198', '2026-05-08', '2026-06-07',  '4,200.00', 'open'],
      ['INV-0000182439', 'V-00198', '2026-05-07', '2026-06-06', '18,900.50', 'paid'],
      ['INV-0000182438', 'V-00122', '2026-05-07', '2026-06-06',  '8,800.00', 'open'],
      ['INV-0000182437', 'V-00322', '2026-05-07', '2026-06-06', '32,400.00', 'open'],
      ['INV-0000182436', 'V-00214', '2026-05-06', '2026-06-05', '12,810.10', 'paid'],
      ['INV-0000182435', 'V-00102', '2026-05-06', '2026-06-05',  '6,540.00', 'paid'],
      ['INV-0000182434', 'V-00214', '2026-05-05', '2026-06-04', '14,200.00', 'open'],
    ],
  },
  'bronze.ap.vendors': {
    headers: ['vendor_id', 'name', 'email *', 'tax_id *', 'country', 'active'],
    pii: true,
    rows: [
      ['V-00102', 'Acme Logistics LLC',   '████████@acme.co',      '████████4521', 'US', 'true'],
      ['V-00122', 'BlueWave Cloud Inc',   '████████@bluewave.io',  '████████8810', 'US', 'true'],
      ['V-00198', 'Northwind Suppliers',  '████████@northwind.eu', '████████2241', 'NL', 'true'],
      ['V-00214', 'Helio Energy GmbH',    '████████@helio.de',     '████████9912', 'DE', 'true'],
      ['V-00322', 'Pacific Print & Pack', '████████@pp-pack.jp',   '████████1041', 'JP', 'true'],
    ],
  },
  'bronze.ar.invoices': {
    headers: ['invoice_id', 'customer_id', 'issue_date', 'due_date', 'amount', 'status'],
    rows: [
      ['AR-0000482104', 'C-04421', '2026-05-08', '2026-06-07', '212,400.00', 'open'],
      ['AR-0000482103', 'C-04421', '2026-05-08', '2026-06-07',  '18,800.00', 'paid'],
      ['AR-0000482102', 'C-02211', '2026-05-07', '2026-06-06',  '92,400.00', 'open'],
      ['AR-0000482101', 'C-04421', '2026-05-07', '2026-06-06',  '14,800.00', 'paid'],
      ['AR-0000482100', 'C-01018', '2026-05-06', '2026-06-05', '320,000.00', 'open'],
      ['AR-0000482099', 'C-02211', '2026-05-06', '2026-06-05',  '12,420.00', 'paid'],
      ['AR-0000482098', 'C-08810', '2026-05-05', '2026-06-04',   '8,400.00', 'overdue'],
    ],
  },
  'bronze.ar.customers': {
    headers: ['customer_id', 'name', 'email *', 'phone *', 'segment', 'mrr'],
    pii: true,
    rows: [
      ['C-01018', 'Helio Energy GmbH',    '████████@helio.de',     '████████92', 'enterprise', '320,000.00'],
      ['C-02211', 'Acme Logistics LLC',   '████████@acme.co',      '████████14', 'mid',        '92,400.00'],
      ['C-04421', 'Northwind Suppliers',  '████████@northwind.eu', '████████41', 'enterprise', '212,400.00'],
      ['C-08810', 'Coastline Holdings',   '████████@coastline.us', '████████88', 'mid',         '8,400.00'],
      ['C-09120', 'Lumen Studio',         '████████@lumen.io',     '████████12', 'smb',         '1,840.00'],
    ],
  },
  'bronze.cash.bank_transactions': {
    headers: ['txn_id', 'posted_at', 'account', 'memo', 'amount', 'direction'],
    rows: [
      ['BTX-9128471', '2026-05-08 14:02', 'JPM-OPS-USD',  'ACH credit · C-04421 AR-0000482103',  '18,800.00', 'credit'],
      ['BTX-9128470', '2026-05-08 13:58', 'JPM-OPS-USD',  'Wire out · V-00198 INV-0000182440',  '-4,200.00', 'debit'],
      ['BTX-9128469', '2026-05-08 11:21', 'JPM-OPS-USD',  'ACH credit · C-02211 AR-0000482099', '12,420.00', 'credit'],
      ['BTX-9128468', '2026-05-08 10:04', 'BMO-PAY-CAD',  'Payroll run · semi-monthly',        '-184,210.00', 'debit'],
      ['BTX-9128467', '2026-05-07 17:42', 'JPM-OPS-USD',  'ACH credit · C-04421 AR-0000482101', '14,800.00', 'credit'],
      ['BTX-9128466', '2026-05-07 09:18', 'DB-OPS-EUR',   'SEPA out · V-00214 INV-0000182434',  '-14,200.00', 'debit'],
    ],
  },
  'bronze.defrev.deferred_revenue': {
    headers: ['contract_id', 'customer_id', 'recognise_month', 'amount', 'status'],
    rows: [
      ['SOW-2026-0418', 'C-01018', '2026-05', '26,666.67', 'scheduled'],
      ['SOW-2026-0418', 'C-01018', '2026-06', '26,666.67', 'scheduled'],
      ['SOW-2026-0418', 'C-01018', '2026-07', '26,666.66', 'scheduled'],
      ['SOW-2025-0911', 'C-04421', '2026-05', '17,700.00', 'recognised'],
      ['SOW-2025-0911', 'C-04421', '2026-06', '17,700.00', 'scheduled'],
      ['SOW-2026-0301', 'C-02211', '2026-05',  '7,700.00', 'recognised'],
    ],
  },
  'silver.s1_dedup.finance_ap_invoices': {
    headers: ['invoice_id', 'vendor_id', 'issue_date', 'amount', 'currency', '_walt_dup_count'],
    rows: [
      ['INV-0000182441', 'V-00214', '2026-05-08', '12840.10',  'USD', '1'],
      ['INV-0000182440', 'V-00198', '2026-05-08',  '4200.00',  'USD', '2'],
      ['INV-0000182439', 'V-00198', '2026-05-07', '18900.50',  'USD', '1'],
      ['INV-0000182438', 'V-00122', '2026-05-07',  '8800.00',  'USD', '1'],
      ['INV-0000182437', 'V-00322', '2026-05-07', '32400.00',  'USD', '1'],
      ['INV-0000182436', 'V-00214', '2026-05-06', '12810.10',  'USD', '3'],
      ['INV-0000182435', 'V-00102', '2026-05-06',  '6540.00',  'USD', '1'],
      ['INV-0000182434', 'V-00214', '2026-05-05', '14200.00',  'USD', '1'],
    ],
  },
  'silver.s2_typecast.finance_ap_invoices': {
    headers: ['invoice_id', 'vendor_id', 'issue_date::date', 'due_date::date', 'amount::numeric(18,2)', 'status::varchar'],
    rows: [
      ['INV-0000182441', 'V-00214', '2026-05-08', '2026-06-07', '12840.10', 'open'],
      ['INV-0000182440', 'V-00198', '2026-05-08', '2026-06-07',  '4200.00', 'open'],
      ['INV-0000182439', 'V-00198', '2026-05-07', '2026-06-06', '18900.50', 'paid'],
      ['INV-0000182438', 'V-00122', '2026-05-07', '2026-06-06',  '8800.00', 'open'],
      ['INV-0000182437', 'V-00322', '2026-05-07', '2026-06-06', '32400.00', 'open'],
      ['INV-0000182436', 'V-00214', '2026-05-06', '2026-06-05', '12810.10', 'paid'],
    ],
  },
  'silver.s3_standardise.finance_ap_invoices': {
    headers: ['invoice_id', 'vendor_id', 'issue_date', 'due_date', 'amount_usd', 'status', 'is_overdue'],
    rows: [
      ['INV-0000182441', 'V-00214', '2026-05-08', '2026-06-07', '12840.10', 'open',    'false'],
      ['INV-0000182440', 'V-00198', '2026-05-08', '2026-06-07',  '4200.00', 'open',    'false'],
      ['INV-0000182439', 'V-00198', '2026-05-07', '2026-06-06', '18900.50', 'paid',    'false'],
      ['INV-0000182438', 'V-00122', '2026-05-07', '2026-06-06',  '8800.00', 'open',    'false'],
      ['INV-0000182437', 'V-00322', '2026-05-07', '2026-06-06', '32400.00', 'open',    'false'],
      ['INV-0000182436', 'V-00214', '2026-05-06', '2026-06-05', '12810.10', 'paid',    'false'],
      ['INV-0000182435', 'V-00102', '2026-05-06', '2026-06-05',  '6540.00', 'paid',    'false'],
      ['INV-0000182434', 'V-00214', '2026-05-05', '2026-06-04', '14200.00', 'open',    'false'],
    ],
  },
  'silver.s1_dedup.finance_ar_invoices': {
    headers: ['invoice_id', 'customer_id', 'issue_date', 'amount', 'currency', '_walt_dup_count'],
    rows: [
      ['AR-0000482104', 'C-04421', '2026-05-08', '212400.00', 'USD', '1'],
      ['AR-0000482103', 'C-04421', '2026-05-08',  '18800.00', 'USD', '2'],
      ['AR-0000482102', 'C-02211', '2026-05-07',  '92400.00', 'USD', '1'],
      ['AR-0000482101', 'C-04421', '2026-05-07',  '14800.00', 'USD', '1'],
      ['AR-0000482100', 'C-01018', '2026-05-06', '320000.00', 'USD', '1'],
    ],
  },
  'silver.s2_typecast.finance_ar_invoices': {
    headers: ['invoice_id', 'customer_id', 'issue_date::date', 'due_date::date', 'amount::numeric(18,2)', 'status::varchar'],
    rows: [
      ['AR-0000482104', 'C-04421', '2026-05-08', '2026-06-07', '212400.00', 'open'],
      ['AR-0000482103', 'C-04421', '2026-05-08', '2026-06-07',  '18800.00', 'paid'],
      ['AR-0000482102', 'C-02211', '2026-05-07', '2026-06-06',  '92400.00', 'open'],
      ['AR-0000482101', 'C-04421', '2026-05-07', '2026-06-06',  '14800.00', 'paid'],
    ],
  },
  'silver.s3_standardise.finance_ar_invoices': {
    headers: ['invoice_id', 'customer_id', 'issue_date', 'due_date', 'amount_usd', 'status', 'days_overdue'],
    rows: [
      ['AR-0000482104', 'C-04421', '2026-05-08', '2026-06-07', '212400.00', 'open',    '0'],
      ['AR-0000482103', 'C-04421', '2026-05-08', '2026-06-07',  '18800.00', 'paid',    '0'],
      ['AR-0000482102', 'C-02211', '2026-05-07', '2026-06-06',  '92400.00', 'open',    '0'],
      ['AR-0000482101', 'C-04421', '2026-05-07', '2026-06-06',  '14800.00', 'paid',    '0'],
      ['AR-0000482100', 'C-01018', '2026-05-06', '2026-06-05', '320000.00', 'open',    '0'],
      ['AR-0000482099', 'C-02211', '2026-05-06', '2026-06-05',  '12420.00', 'paid',    '0'],
      ['AR-0000482098', 'C-08810', '2026-05-05', '2026-06-04',   '8400.00', 'overdue', '3'],
    ],
  },
};

const SAMPLE_LIMIT_DEFAULT = 100;

// Best-effort SQL → table mapping. We only need to recognise the shapes we
// generate ourselves (`select * from <layer>.<table> limit N;`) so users can
// edit the LIMIT or sprinkle whitespace and still get a faithful preview.
function detectTable(sql) {
  if (!sql) return null;
  const m = sql.match(/from\s+([a-z0-9_]+)\.([a-z0-9_.]+)/i);
  if (!m) return null;
  return `${m[1].toLowerCase()}.${m[2].toLowerCase()}`;
}

function buildSeedQuery(layer, tableName) {
  return `select *\nfrom ${layer}.${tableName}\nlimit ${SAMPLE_LIMIT_DEFAULT};`;
}

// Fallback preview for tables we don't have hand-authored fixtures for. We
// derive plausible column names from the table path and emit a handful of
// rows so the user still sees structure when sampling esoteric tables.
function genericSample(fqName) {
  if (!fqName) return null;
  const headers = ['id', 'name', 'created_at', 'updated_at', 'status'];
  const rows = Array.from({ length: 6 }, (_, i) => {
    const id = `${fqName.split('.').pop().slice(0, 3).toUpperCase()}-${(1000 + i).toString().padStart(6, '0')}`;
    return [
      id,
      `record_${i + 1}`,
      `2026-05-${(8 - i).toString().padStart(2, '0')} 10:${(42 - i).toString().padStart(2, '0')}`,
      `2026-05-${(8 - i).toString().padStart(2, '0')} 10:${(43 - i).toString().padStart(2, '0')}`,
      i === 0 ? 'open' : i === 1 ? 'paid' : 'active',
    ];
  });
  return { headers, rows, generic: true };
}

export function CatalogPage() {
  const { setShellTab } = usePhase();
  const [open, setOpen] = React.useState({ bronze: true, silver: true, gold: true });
  // The first bronze table is the friendliest landing — seeds the editor on
  // first render so users see what's possible without having to click first.
  const initialFq = `${TREE[0].layer}.${TREE[0].tables[0].name}`;
  const [selected, setSelected] = React.useState(initialFq);
  const [query, setQuery] = React.useState(buildSeedQuery(TREE[0].layer, TREE[0].tables[0].name));
  const [state, setState] = React.useState('idle'); // 'idle' | 'running' | 'done' | 'error'
  const [resultFq, setResultFq] = React.useState(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);

  const pickTable = (layer, tableName) => {
    const fq = `${layer}.${tableName}`;
    setSelected(fq);
    setQuery(buildSeedQuery(layer, tableName));
    setState('idle');
    setResultFq(null);
  };

  const run = () => {
    setState('running');
    const fq = detectTable(query);
    const ms = 540 + Math.floor(Math.random() * 360);
    setTimeout(() => {
      setResultFq(fq);
      setElapsedMs(ms);
      setState('done');
    }, ms);
  };

  const sample = resultFq ? (SAMPLES[resultFq] || genericSample(resultFq)) : null;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: 'var(--bg-app)',
    }}>
      <PageHeader
        title="Catalog"
        subtitle="Bronze · silver · gold across the project. Pick a table to seed the editor, or write your own query."
      />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left: catalog tree */}
        <div style={{
          width: 340, flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0 14px' }}>
            {TREE.map(g => (
              <Group
                key={g.layer}
                group={g}
                open={open[g.layer]}
                selectedFq={selected}
                onToggle={() => setOpen(o => ({ ...o, [g.layer]: !o[g.layer] }))}
                onPickTable={pickTable}
                onAsk={() => setShellTab('chat')}
              />
            ))}
          </div>
        </div>

        {/* Right: SQL editor + results */}
        <SqlPane
          query={query}
          onChange={setQuery}
          onRun={run}
          state={state}
          sample={sample}
          resultFq={resultFq}
          elapsedMs={elapsedMs}
        />
      </div>
    </div>
  );
}

function Group({ group, open, selectedFq, onToggle, onPickTable, onAsk }) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: group.layer === 'bronze' ? 'rgba(176,122,31,0.14)' :
                       group.layer === 'silver' ? 'rgba(128,131,140,0.14)' :
                                                  'rgba(176,134,31,0.16)',
          color:      group.layer === 'bronze' ? 'var(--bronze)' :
                       group.layer === 'silver' ? 'var(--silver)' :
                                                  'var(--gold)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="layers" size={11}/>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{group.label}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{group.desc}</div>
        </div>
        <Icon name={open ? 'chevD' : 'chevR'} size={11} color="var(--text-muted)"/>
      </button>
      {open && (
        <div style={{ padding: '2px 8px 6px' }}>
          {group.tables.length === 0 && (
            <div style={{
              padding: '10px 12px',
              fontSize: 11.5, color: 'var(--text-muted)',
              display: 'flex', alignItems: 'flex-start', gap: 8,
              borderRadius: 8,
              background: 'var(--bg-inset)',
              lineHeight: 1.5,
            }}>
              <Icon name="sparkle" size={12} color="var(--text-muted)"/>
              <span style={{ flex: 1 }}>{group.empty}</span>
              <button className="walt-btn ghost sm" onClick={onAsk} style={{ fontSize: 10.5 }}>
                <Icon name="msg" size={10}/> Ask
              </button>
            </div>
          )}
          {group.tables.map(t => {
            const fq = `${group.layer}.${t.name}`;
            const isSelected = fq === selectedFq;
            return (
              <TableRow
                key={fq}
                layer={group.layer}
                table={t}
                isSelected={isSelected}
                onPick={() => onPickTable(group.layer, t.name)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TableRow({ layer, table: t, isSelected, onPick }) {
  const [hover, setHover] = React.useState(false);
  const meta = KIND_META[t.kind] || KIND_META.table;
  return (
    <button
      onClick={onPick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`Sample ${meta.label} ${layer}.${t.name}`}
      style={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 8px',
        background: isSelected
          ? 'var(--accent-soft)'
          : hover ? 'var(--bg-hover)' : 'transparent',
        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
        border: 'none', cursor: 'pointer',
        borderRadius: 6,
      }}
    >
      <Icon name={meta.icon} size={11} color={isSelected ? 'var(--accent)' : 'var(--text-muted)'}/>
      <span className="walt-mono" style={{
        fontSize: 11.5, fontWeight: isSelected ? 600 : 500,
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{t.name}</span>
      {t.pii && (
        <span style={{
          fontSize: 9.5, padding: '1px 5px', borderRadius: 999,
          background: 'rgba(98,69,168,0.10)', color: 'var(--semantic)', fontWeight: 600,
        }}>PII</span>
      )}
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.rows}</span>
    </button>
  );
}

// --- Right pane: SQL editor + results ------------------------------------- //

function SqlPane({ query, onChange, onRun, state, sample, resultFq, elapsedMs }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', minHeight: 0,
      background: 'var(--bg-app)',
    }}>
      {/* Editor header */}
      <div style={{
        padding: '10px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>SQL editor</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Walt sandbox · read-only · sampled execution
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
          onClick={onRun}
          disabled={state === 'running' || !query.trim()}
          style={{ padding: '6px 12px', fontSize: 12 }}
        >
          <Icon name="play" size={10} color="var(--accent-on)"/>
          {state === 'running' ? 'Running…' : 'Run'}
        </button>
      </div>

      {/* Editor body */}
      <div style={{
        flex: '0 0 auto',
        height: '38%',
        minHeight: 180,
        position: 'relative', background: 'var(--code-bg)',
      }}>
        <pre
          aria-hidden
          style={{
            position: 'absolute', inset: 0, margin: 0,
            padding: '14px 18px',
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
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            padding: '14px 18px',
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
        flex: 1, minHeight: 0,
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-inset)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>Results</span>
          {state === 'done' && sample && (
            <>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                · {sample.rows.length} rows · {elapsedMs}ms
              </span>
              {resultFq && (
                <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  · {resultFq}
                </span>
              )}
              {sample.generic && (
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 999,
                  background: 'var(--bg-inset)', color: 'var(--text-muted)', fontWeight: 600,
                  border: '1px solid var(--border-subtle)',
                }}>SYNTH</span>
              )}
              <span style={{ fontSize: 11, color: 'var(--status-ok)', fontWeight: 500 }}>
                <Icon name="check" size={9} color="var(--status-ok)"/> ok
              </span>
            </>
          )}
          {state === 'done' && !sample && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              · could not detect a table reference
            </span>
          )}
          {state === 'running' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· running</span>}
          {state === 'idle'    && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· ready</span>}
          <div style={{ flex: 1 }}/>
          <button className="walt-btn ghost sm" style={{ fontSize: 11 }} disabled={state !== 'done' || !sample}>
            <Icon name="chart" size={10}/> Chart
          </button>
          <button className="walt-btn ghost sm" style={{ fontSize: 11 }} disabled={state !== 'done' || !sample}>
            <Icon name="download" size={10}/> Export
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {state === 'idle' && (
            <EmptyState
              icon="play"
              title="Run the query to see results"
              hint="Pick a table from the left to seed a query, or edit the SQL above."
            />
          )}
          {state === 'running' && (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', fontSize: 12, gap: 8,
            }}>
              <span className="walt-dot run"/> Compiling on ANALYST_WH…
            </div>
          )}
          {state === 'done' && sample && (
            <ResultsTable sample={sample}/>
          )}
          {state === 'done' && !sample && (
            <EmptyState
              icon="sparkle"
              title="No matching table"
              hint="We couldn't parse a table reference from the query. Pick one on the left or include a fully-qualified name (e.g. silver.s3_standardise.finance_ap_invoices)."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsTable({ sample }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          {sample.headers.map(h => (
            <th key={h} style={{
              textAlign: 'left', padding: '8px 12px',
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11, color: 'var(--text-muted)',
              fontWeight: 500,
              position: 'sticky', top: 0,
              whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sample.rows.map((row, i) => (
          <tr key={i}>
            {row.map((c, j) => (
              <td key={j} style={{
                padding: '7px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: c === null ? 'var(--text-muted)' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
                fontStyle: c === null ? 'italic' : 'normal',
              }}>{c === null ? 'NULL' : c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyState({ icon, title, hint }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: 24,
      color: 'var(--text-muted)', textAlign: 'center',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        background: 'var(--bg-inset)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={13} color="var(--text-muted)"/>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.5 }}>{hint}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div style={{
      height: 56, flexShrink: 0,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '0 28px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{subtitle}</div>
      </div>
    </div>
  );
}
