import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';

// "Connect git remote" artifact. Surfaced when the user picks "Push to git repo" at
// the commit step. User enters a remote URL (or picks a configured provider), names
// the default branch, and confirms. The Confirm button clears the chat's awaiting-
// confirm gate, which advances the script to the PR-opened turn.

const PROVIDERS = [
  { id: 'github',    label: 'GitHub',     icon: 'git',   sample: 'github.com/imageinc/finance-platform' },
  { id: 'gitlab',    label: 'GitLab',     icon: 'git',   sample: 'gitlab.com/imageinc/finance-platform' },
  { id: 'bitbucket', label: 'Bitbucket',  icon: 'git',   sample: 'bitbucket.org/imageinc/finance-platform' },
  { id: 'azure',     label: 'Azure DevOps', icon: 'git', sample: 'dev.azure.com/imageinc/finance-platform' },
];

export function GitConnectArtifact() {
  const { ctx, set, shell, setAwaitingArtifactConfirm } = usePhase();
  const isAwaiting = shell.awaitingArtifactConfirm === 'gitconnect';
  const isConfirmed = !!ctx.gitRemote && !isAwaiting;

  const [providerId, setProviderId] = React.useState('github');
  const [url, setUrl] = React.useState(ctx.gitRemote || ctx.repoUrl || '');
  const [branch, setBranch] = React.useState('main');
  const [authMethod, setAuthMethod] = React.useState('ssh'); // ssh | token
  const [busy, setBusy] = React.useState(false);

  const provider = PROVIDERS.find(p => p.id === providerId);

  const canConfirm = url.trim().length > 0 && !busy;

  const onConfirm = () => {
    if (!canConfirm) return;
    setBusy(true);
    // Tiny faux network delay so the confirmation feels real.
    setTimeout(() => {
      // Flip the project from local-only to connected. The composer/breadcrumb
      // env pill will switch from "local · main" to the configured branch as soon
      // as gitConnected is true.
      set({
        gitRemote: url.trim(),
        repoUrl: url.trim(),
        branch: (branch || 'main').trim(),
        gitConnected: true,
      });
      setAwaitingArtifactConfirm(''); // unblocks the chat
      setBusy(false);
    }, 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'flex-end', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="git" size={13} color="var(--accent)"/>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                Connect git remote
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                Where should the project code live? Walt will commit and open the first PR.
              </div>
            </div>
          </div>
        </div>
        {isConfirmed && (
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 999,
            background: 'rgba(63,143,63,0.10)', color: 'var(--status-ok)',
            fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="check" size={9} color="var(--status-ok)"/> Connected
          </span>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Provider picker */}
        <Section title="Provider" desc="Pick where your repo lives.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {PROVIDERS.map(p => {
              const on = providerId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { setProviderId(p.id); if (!url) setUrl(p.sample); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '10px 12px',
                    border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border-subtle)'),
                    background: on ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    color: on ? 'var(--accent)' : 'var(--text-primary)',
                    borderRadius: 9,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12.5, fontWeight: on ? 600 : 500,
                    textAlign: 'left',
                    transition: 'border-color .14s, background .14s',
                  }}
                >
                  <Icon name={p.icon} size={13} color={on ? 'var(--accent)' : 'var(--text-secondary)'}/>
                  {p.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Remote URL */}
        <Section title="Remote URL" desc={'Paste a repo URL — Walt will create it if it doesn\u2019t exist (on supported providers).'}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 4px 4px 12px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 9,
            background: 'var(--bg-surface)',
          }}>
            <Icon name="git" size={13} color="var(--text-muted)"/>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={provider?.sample || 'github.com/org/repo'}
              spellCheck={false}
              style={{
                flex: 1,
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-mono)', fontSize: 12.5,
                color: 'var(--text-primary)',
                padding: '8px 0',
              }}
            />
          </div>
        </Section>

        {/* Branch + auth */}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Section title="Default branch" tight>
              <Input value={branch} onChange={setBranch} placeholder="main"/>
            </Section>
          </div>
          <div style={{ flex: 1 }}>
            <Section title="Authentication" tight>
              <div style={{ display: 'flex', gap: 6 }}>
                <Seg label="SSH key"        on={authMethod === 'ssh'}   onClick={() => setAuthMethod('ssh')}/>
                <Seg label="Personal token" on={authMethod === 'token'} onClick={() => setAuthMethod('token')}/>
              </div>
            </Section>
          </div>
        </div>

        {/* What will be committed */}
        <Section title="What Walt will commit" desc="Single commit on the default branch + PR with CI attached.">
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <li><Mono>silver/</Mono> — ~60 silver views (s1, s2, s3 stages)</li>
            <li><Mono>contracts/</Mono> — bronze + silver contracts, lineage stamps</li>
            <li><Mono>agents/</Mono> — Ingestor / Transformer / Reasoner / Operator / Governer config</li>
            <li><Mono>policies/</Mono> — PII masking, retention, escalation routes</li>
            <li><Mono>.walt/</Mono> — workspace metadata + run history</li>
          </ul>
        </Section>

        {/* CTA row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          background: isAwaiting ? 'var(--accent-soft)' : 'var(--bg-inset)',
          border: '1px solid ' + (isAwaiting ? 'color-mix(in srgb, var(--accent) 24%, transparent)' : 'var(--border-subtle)'),
          borderRadius: 10,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              {isConfirmed ? 'Remote saved.' : isAwaiting ? 'Walt is waiting for you' : 'Ready when you are'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              {isConfirmed
                ? <>Pushing to <Mono>{ctx.gitRemote}</Mono>. The PR opens next in the chat.</>
                : <>Confirm to commit + open PR. The chat will pick back up automatically.</>
              }
            </div>
          </div>
          <button
            className="walt-btn primary"
            onClick={onConfirm}
            disabled={!canConfirm || isConfirmed}
            style={{ opacity: (!canConfirm || isConfirmed) ? 0.55 : 1 }}
          >
            {isConfirmed ? <><Icon name="check" size={11}/> Connected</> :
             busy ? 'Connecting…' :
             <>Connect &amp; commit <Icon name="arrowR" size={11}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, tight, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tight ? 4 : 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', fontWeight: 600 }}>
          {title}
        </div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '8px 10px',
        border: '1px solid var(--border-subtle)',
        borderRadius: 9,
        background: 'var(--bg-surface)',
        fontFamily: 'var(--font-mono)', fontSize: 12.5,
        color: 'var(--text-primary)',
        outline: 'none',
      }}
    />
  );
}

function Seg({ label, on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '7px 10px',
        border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border-subtle)'),
        background: on ? 'var(--accent-soft)' : 'var(--bg-surface)',
        color: on ? 'var(--accent)' : 'var(--text-primary)',
        borderRadius: 9, cursor: 'pointer',
        fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: on ? 600 : 500,
        transition: 'border-color .14s, background .14s',
      }}
    >
      {label}
    </button>
  );
}

function Mono({ children }) {
  return <span className="walt-mono" style={{ background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4, fontSize: 11.5 }}>{children}</span>;
}
