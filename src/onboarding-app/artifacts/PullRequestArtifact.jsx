import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AgentAvatar } from '../components/AgentBadge.jsx';

const FILES = [
  { kind: 'A', path: 'silver/s1_dedup/finance_ap_invoices.sql',         added: 48, removed: 0 },
  { kind: 'A', path: 'silver/s1_dedup/finance_ar_invoices.sql',         added: 51, removed: 0 },
  { kind: 'A', path: 'silver/s1_dedup/finance_gl_journal_entries.sql',  added: 56, removed: 0 },
  { kind: 'A', path: 'silver/s2_typecast/finance_ap_invoices.sql',      added: 62, removed: 0 },
  { kind: 'A', path: 'silver/s2_typecast/finance_ar_invoices.sql',      added: 64, removed: 0 },
  { kind: 'A', path: 'silver/s3_cleanse/finance_ap_invoices.sql',       added: 71, removed: 0 },
  { kind: 'A', path: 'silver/s3_cleanse/finance_ar_invoices.sql',       added: 73, removed: 0 },
  { kind: 'A', path: 'tests/silver/test_dedup_grain.yaml',              added: 22, removed: 0 },
  { kind: 'A', path: 'tests/silver/test_quarantine_routes.yaml',        added: 34, removed: 0 },
  { kind: 'A', path: 'tests/silver/test_cleanse_rules.yaml',            added: 28, removed: 0 },
  { kind: 'A', path: 'policies/pii/finance_vendors.yaml',               added: 9,  removed: 0 },
  { kind: 'M', path: 'walt.yaml',                                       added: 6,  removed: 1 },
];

const CHECKS = [
  { name: 'lint · sqlfluff',                       state: 'ok', detail: '14s' },
  { name: 'contracts · schemaspy',                 state: 'ok', detail: '8s' },
  { name: 'unit tests · row parity',               state: 'ok', detail: '22s' },
  { name: 'great_expectations · DQ',               state: 'ok', detail: '34s · 312 expectations' },
  { name: 'policy · masking + retention',          state: 'ok', detail: '4s' },
  { name: 'reviewer agents · approvals captured',  state: 'ok', detail: '0s' },
];

const COMMITS = [
  { hash: '9af3c1d', msg: 'silver/s1_dedup · finance_* dedup views + _s1_quarantine (dedup-builder-agent)', author: 'walt-bot', at: '2 min ago' },
  { hash: '7b80c4e', msg: 'silver/s2_typecast · finance_* type-cast views + _s2_quarantine (type-cast-builder-agent)', author: 'walt-bot', at: '8 min ago' },
  { hash: '4e21f9a', msg: 'silver/s3_cleanse · finance_* cleanse views + _s3_quarantine (cleanse-builder-agent)', author: 'walt-bot', at: '12 min ago' },
  { hash: '1c0aa55', msg: "extend boolean normalisation map ('Y/N') + route mandatory cast failures to _s2_quarantine", author: 'walt-bot · review-fix', at: '14 min ago' },
  { hash: 'd91e6c0', msg: 'walt.yaml · register reviewer attestations (promotion gate)', author: 'walt-bot', at: '15 min ago' },
];

export function PullRequestArtifact() {
  const { ctx, set, addTurn } = usePhase();
  const merged = ctx.prMerged;
  const branch = ctx.branch || 'main';

  // Single entry point for the Commit button so we can echo a user turn into
  // the chat alongside flipping ctx.prMerged. The echo prevents the chat from
  // showing two Walt avatars in a row (pr-opened → pr-merged) with no visible
  // user action between them.
  const onCommit = () => {
    if (merged) return;
    set({ prMerged: true });
    addTurn({
      id: 'u-pr-commit-' + Date.now(),
      role: 'user',
      body: ['Committed PR #' + (ctx.prNumber || '')],
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--bg-surface)' }}>
      <div style={{
        height: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 22px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-app)',
      }}>
        <Icon name="git" size={13} color="var(--text-secondary)"/>
        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{ctx.repoUrl}</span>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>pull/{ctx.prNumber}</span>
        <div style={{ flex: 1 }}/>
        <button
          className="walt-btn primary"
          onClick={onCommit}
          disabled={merged}
          title={merged ? 'Committed. Promotion to production is a separate step in chat.' : 'Commit this PR into ' + branch}
          style={{ opacity: merged ? 0.55 : 1, padding: '6px 12px', fontSize: 12 }}
        >
          <Icon name={merged ? 'check' : 'git'} size={11} color="var(--accent-on)"/>
          {merged ? 'Committed' : 'Commit'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 22px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              feat(silver): finance domain — dedup, type-cast, cleanse (S1 → S2 → S3)
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> #{ctx.prNumber}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '2px 9px', borderRadius: 999,
                background: merged ? 'rgba(98,69,168,0.10)' : 'rgba(63,143,63,0.10)',
                color: merged ? 'var(--semantic)' : 'var(--status-ok)',
                fontSize: 11, fontWeight: 600,
              }}>
                <Icon name={merged ? 'check' : 'git'} size={9} color={merged ? 'var(--semantic)' : 'var(--status-ok)'}/>
                {merged ? 'Committed' : 'Open · ready to commit'}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>walt-bot</span> · <strong>5 commits</strong> into <strong style={{ fontFamily: 'var(--font-mono)' }}>{branch}</strong> from <strong style={{ fontFamily: 'var(--font-mono)' }}>walt/silver-finance</strong>
              </span>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <AgentAvatar agent="transformer" size={20}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Summary by Transformer</span>
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>(reviewer-attested)</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <li>11 silver views across S1 / S2 / S3 for the finance domain.</li>
              <li>1 quarantine route added in S2 to capture amount-cast failures (14 rows).</li>
              <li>Reviewer agents approved all three layers; round-trip counts: S1 · 1/3, S2 · 2/3, S3 · 1/3.</li>
              <li>312 great_expectations DQ rules registered with the Operator agent for production.</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-inset)',
              fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
            }}>
              <Icon name="check" size={11} color="var(--status-ok)"/> All checks passed
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>· 6 / 6</span>
            </div>
            {CHECKS.map(c => (
              <div key={c.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <Icon name="check" size={11} color="var(--status-ok)"/>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{c.name}</span>
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.detail}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '9px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-inset)',
              fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
            }}>
              <Icon name="file" size={11} color="var(--text-secondary)"/>
              Files changed
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                · {FILES.length} files · +{FILES.reduce((a, f) => a + f.added, 0)} −{FILES.reduce((a, f) => a + f.removed, 0)}
              </span>
            </div>
            {FILES.map(f => (
              <div key={f.path} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 12px',
                borderTop: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)', fontSize: 11.5,
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  background: f.kind === 'A' ? 'rgba(63,143,63,0.14)' : 'rgba(176,122,31,0.14)',
                  color: f.kind === 'A' ? 'var(--status-ok)' : 'var(--status-warn)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                }}>{f.kind}</span>
                <span style={{ color: 'var(--text-primary)' }}>{f.path}</span>
                <div style={{ flex: 1 }}/>
                <span style={{ color: 'var(--status-ok)' }}>+{f.added}</span>
                <span style={{ color: 'var(--status-err)' }}>−{f.removed}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Commits</div>
            {COMMITS.map(c => (
              <div key={c.hash} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                fontSize: 12,
              }}>
                <span className="walt-mono" style={{ color: 'var(--accent)' }}>{c.hash}</span>
                <span style={{ color: 'var(--text-primary)' }}>{c.msg}</span>
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.author}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {c.at}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
