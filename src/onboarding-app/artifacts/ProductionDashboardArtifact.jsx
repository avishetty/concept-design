import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AgentCard } from '../components/AgentCard.jsx';

export function ProductionDashboardArtifact() {
  const { ctx } = usePhase();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--bg-app)' }}>
      <div style={{
        padding: '12px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Icon name="rocket" size={14} color="var(--accent)"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Production dashboard · {ctx.projectName}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>5 agents reporting to Walt · uptime 100% since 14m</div>
        </div>
        <span style={{
          fontSize: 11, padding: '3px 9px', borderRadius: 999,
          background: 'rgba(63,143,63,0.12)', color: 'var(--status-ok)',
          fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--status-ok)' }}/>
          Healthy
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            <Kpi label="Tables" value="220" delta="+12 today"/>
            <Kpi label="Silver views" value="60" delta="all gated"/>
            <Kpi label="DQ checks" value="312" delta="0 failing"/>
            <Kpi label="Policies" value="14" delta="3 PII"/>
            <Kpi label="Cost · 24h" value="$32.40" delta="−18%"/>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Production agents
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            <AgentCard
              agent="ingestor"
              status="healthy"
              lastRun="3 min ago"
              nextRun="in 27 min"
              activity={[
                { t: 'GL.journal_entries · +14,290 rows', at: '3m' },
                { t: 'AR.invoices · +1,420 rows',          at: '3m' },
                { t: 'sample → full ingest · 78% done',    at: '10m' },
              ]}
            />
            <AgentCard
              agent="transformer"
              status="healthy"
              lastRun="6 min ago"
              nextRun="on-event"
              activity={[
                { t: 's2_typecast.finance_ap_invoices · 0 quarantined', at: '6m' },
                { t: 's3_standardise.finance_ar_invoices · clean',      at: '6m' },
                { t: 'Reasoner requested fact_orders aggregate',        at: '8m' },
              ]}
            />
            <AgentCard
              agent="reasoner"
              status="running"
              lastRun="2 min ago"
              nextRun="streaming"
              note="Resolving customer entities across ERP and CRM — 18.9k → 16.2k unique."
              activity={[
                { t: 'entity_graph · customer_id ↔ erp.customer_no', at: '2m' },
                { t: 'metric · gross_margin published',               at: '4m' },
                { t: 'semantic model · v0.3 published',               at: '11m' },
              ]}
            />
            <AgentCard
              agent="operator"
              status="attn"
              lastRun="just now"
              nextRun="continuous"
              note="Schema drift detected: bronze.ap.invoices added column tax_jurisdiction. Proposing contract update — awaiting your review."
              activity={[
                { t: 'drift · ap.invoices.tax_jurisdiction (new col)', at: 'now' },
                { t: 'SQL perf · materialise s3_standardise nightly', at: '12m' },
                { t: 'DQ · 312/312 expectations passing',              at: '12m' },
              ]}
            />
            <AgentCard
              agent="governer"
              status="healthy"
              lastRun="1 min ago"
              nextRun="continuous"
              note="Enforced masking policy on bronze.ap.vendors.vendor_name (sha256). Retention rule active for 7-year audit window."
              activity={[
                { t: 'policy · masking on bronze.ap.vendors',         at: '1m' },
                { t: 'access · analyst-read grant for FINANCE_PROD',   at: '5m' },
                { t: 'audit · approval trail for PR #' + ctx.prNumber, at: '6m' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span className="walt-mono" style={{ fontSize: 17, color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{delta}</span>
    </div>
  );
}
