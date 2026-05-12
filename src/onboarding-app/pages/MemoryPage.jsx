import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { PageHeader } from './CatalogPage.jsx';
import { AgentAvatar } from '../components/AgentBadge.jsx';

// Walt's per-project memory — what's been decided, who decided it, and what
// Walt has learned from the codebase. Most of the feed is derived from existing
// chat-flow state (domain locked, sources picked, silver approvals, PR merged),
// so it stays in lockstep with whatever Vincent has done.
export function MemoryPage() {
  const { ctx, openArtifact } = usePhase();
  const decisions = buildDecisions(ctx);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: 'var(--bg-app)',
    }}>
      <PageHeader
        title="Memory"
        subtitle={`Walt's working memory for ${ctx.projectName} \u2014 decisions, context Walt always honors, and what it has learned from your codebase.`}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 32px' }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 20,
          alignItems: 'start',
        }}>
          {/* Decisions feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionHeader title="Decisions &amp; milestones" count={decisions.length}/>
            {decisions.length === 0 ? (
              <EmptyState/>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {decisions.map(d => (
                  <DecisionCard key={d.id} decision={d} openArtifact={openArtifact}/>
                ))}
              </div>
            )}
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PinnedContext ctx={ctx}/>
            <CodebaseLearning ctx={ctx}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Decisions feed -------------------------------------------------------- //

function buildDecisions(ctx) {
  const out = [];
  if (ctx.domainKey) {
    out.push({
      id: 'domain',
      agent: 'reasoner',
      title: 'Domain locked',
      body: `Scope set to ${ctx.domainKey}. Walt will only build pipelines that serve this domain until you say otherwise.`,
      when: 'earlier today',
    });
  }
  if (ctx.sources?.length) {
    out.push({
      id: 'sources',
      agent: 'ingestor',
      title: 'Sources confirmed',
      body: `Mirroring ${ctx.sources.length} source${ctx.sources.length === 1 ? '' : 's'} into bronze. PII masked at landing; lineage stamped per row.`,
      when: 'earlier today',
      action: { label: 'View sources', view: 'connections', tab: 'ingestion' },
    });
  }
  if (ctx.ingestedTables > 0 || ctx.silverApproved?.s1 || ctx.silverApproved?.s2 || ctx.silverApproved?.s3) {
    out.push({
      id: 'ingest',
      agent: 'ingestor',
      title: 'Ingestion + profile complete',
      body: '220 tables landed in bronze. Schemas profiled, types detected, PII masked. Walt will refresh the sample every 30 days.',
      when: 'earlier today',
      action: { label: 'Open ingestion', view: 'ingestion', tab: 'ingestion' },
    });
  }
  ['s1', 's2', 's3'].forEach((stage, i) => {
    if (ctx.silverApproved?.[stage]) {
      const labels = { s1: 'Dedup', s2: 'Type-cast', s3: 'Standardise' };
      out.push({
        id: `silver-${stage}`,
        agent: 'transformer',
        title: `Silver ${stage.toUpperCase()} approved · ${labels[stage]}`,
        body: `You reviewed the produced views and approved the ${labels[stage].toLowerCase()} stage. Walt has frozen the implementation; future runs are idempotent.`,
        when: 'earlier today',
        action: { label: 'Open silver', view: 'silver', tab: 'transformation' },
      });
    }
  });
  if (ctx.prMerged) {
    out.push({
      id: 'pr',
      agent: 'governer',
      title: `PR #${ctx.prNumber} committed`,
      body: `Silver layer rolled forward into ${ctx.gitConnected ? ctx.branch : 'local main'}. CI green, 312 expectations passed.`,
      when: 'just now',
      action: { label: 'Open PR', view: 'pr', tab: 'transformation' },
    });
  }
  if (ctx.gitConnected && ctx.gitRemote) {
    out.push({
      id: 'git',
      agent: 'operator',
      title: 'Git remote connected',
      body: `Working copy now tracks ${ctx.gitRemote}. Walt will branch + open PRs against ${ctx.branch} from here on out.`,
      when: 'just now',
      action: { label: 'Git settings', view: 'gitconnect', tab: 'context' },
    });
  }
  return out.reverse(); // newest at top
}

function DecisionCard({ decision: d, openArtifact }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex', gap: 12,
    }}>
      <div style={{ flexShrink: 0, paddingTop: 1 }}>
        <AgentAvatar agent={d.agent} size={26}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {d.title}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {d.when}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
          {d.body}
        </div>
        {d.action && (
          <button
            onClick={() => openArtifact(d.action.view, d.action.tab)}
            className="walt-btn ghost sm"
            style={{ fontSize: 11, marginTop: 8, padding: '3px 9px' }}
          >
            {d.action.label} <Icon name="arrowR" size={9}/>
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: '40px 24px',
      background: 'var(--bg-surface)',
      border: '1px dashed var(--border-subtle)',
      borderRadius: 12,
      textAlign: 'center',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        background: 'var(--bg-inset)', color: 'var(--text-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        <Icon name="book" size={16} color="currentColor"/>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
        No decisions yet
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
        As you work with Walt, every confirmation, source pick, and approval lands here as durable project memory.
      </div>
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count}</span>
    </div>
  );
}

// --- Right rail panels ---------------------------------------------------- //

const PINNED_FACTS = [
  { id: 'goal',    label: 'North-star',  body: 'Close the books 3 days faster by giving finance trustworthy AR / AP / GL marts.' },
  { id: 'owner',   label: 'Project owner', body: 'Vincent Lee · vincent@imageinc.com' },
  { id: 'gates',   label: 'Approval gate', body: 'Every silver stage requires human approval. Walt never auto-promotes.' },
  { id: 'pii',     label: 'PII policy',  body: 'Mask at landing. Email, SSN, phone, vendor_name flagged in bronze profiles.' },
];

function PinnedContext({ ctx }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="star" size={11} color="var(--text-muted)"/>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          Pinned context
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PINNED_FACTS.map(f => (
          <div key={f.id}>
            <div style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>{f.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
              {f.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodebaseLearning({ ctx }) {
  const connected = !!ctx.gitConnected;
  return (
    <div style={{
      background: connected ? 'var(--bg-surface)' : 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: '12px 14px',
      opacity: connected ? 1 : 0.85,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="git" size={11} color="var(--text-muted)"/>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          Learned from codebase
        </span>
        {connected && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3,
            padding: '2px 6px', borderRadius: 4,
            background: 'rgba(63,143,63,0.12)', color: 'var(--status-ok)',
          }}>LIVE</span>
        )}
      </div>
      {connected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {ctx.gitRemote || 'git@github.com:imageinc/finance-platform.git'}
          </div>
          <Stat label="Files indexed"      value="142"/>
          <Stat label="Patterns extracted" value="38"/>
          <Stat label="Semantic models"    value="entity_graph_v2"/>
          <Stat label="Last sync"          value="2 min ago"/>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Connect a git remote and Walt will read your existing code to learn naming, modeling, and ownership patterns it should preserve.
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
            Walt won't change anything without your approval.
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  );
}
