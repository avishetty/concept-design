import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { Modal } from './Modal.jsx';
import { usePhase } from '../state.jsx';

// GitConnectWizard — multi-step modal for wiring the project up to a git remote.
// Mirrors the SourceWizard pattern: chips with `wizard: 'gitconnect'` open this
// instead of routing to the side panel. The side panel is for *consuming*
// information; configuration like this lives in modals over the chat so the
// user never feels like they've left the conversation.
//
// Flow:
//   1. Repository    — pick provider + remote URL + default branch + auth.
//   2. Commit        — preview of what Walt will commit, then Connect + commit.
//   3. Done          — confirmation frame; auto-closes after a short delay.
//
// On finish the wizard writes:
//   ctx.gitRemote / repoUrl / branch / gitConnected
// And clears shell.awaitingArtifactConfirm if it was set to 'gitconnect' so the
// scripted chat can move past w-git-setup. We also echo a user turn in the chat
// for the "Connected the git remote" so the avatar/user alternation holds.

const PROVIDERS = [
  { id: 'github',    label: 'GitHub',       icon: 'git', sample: 'github.com/imageinc/finance-platform' },
  { id: 'gitlab',    label: 'GitLab',       icon: 'git', sample: 'gitlab.com/imageinc/finance-platform' },
  { id: 'bitbucket', label: 'Bitbucket',    icon: 'git', sample: 'bitbucket.org/imageinc/finance-platform' },
  { id: 'azure',     label: 'Azure DevOps', icon: 'git', sample: 'dev.azure.com/imageinc/finance-platform' },
];

const STEPS = [
  { key: 'repo',    label: 'Repository' },
  { key: 'commit',  label: 'Commit' },
];

export function GitConnectWizard({ open, onClose }) {
  const { ctx, set, shell, setAwaitingArtifactConfirm, closeWizard, addTurn } = usePhase();

  const [stepIdx, setStepIdx] = React.useState(0);
  const [providerId, setProviderId] = React.useState('github');
  const [url, setUrl] = React.useState(ctx.gitRemote || ctx.repoUrl || '');
  const [branch, setBranch] = React.useState(ctx.branch || 'main');
  const [authMethod, setAuthMethod] = React.useState('ssh');
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  // Reset when reopened so the wizard's state matches the current shell state
  // (e.g. if the user closes mid-flow and re-opens via the chip again).
  React.useEffect(() => {
    if (!open) return;
    setStepIdx(0);
    setProviderId('github');
    setUrl(ctx.gitRemote || ctx.repoUrl || '');
    setBranch(ctx.branch || 'main');
    setAuthMethod('ssh');
    setBusy(false);
    setDone(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const provider = PROVIDERS.find(p => p.id === providerId) || PROVIDERS[0];
  const step = STEPS[stepIdx];

  const canNext = (() => {
    if (step.key === 'repo')   return url.trim().length > 0 && branch.trim().length > 0;
    if (step.key === 'commit') return !busy && !done;
    return false;
  })();

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      finish();
    }
  };
  const goBack = () => { if (stepIdx > 0) setStepIdx(stepIdx - 1); };

  const finish = () => {
    if (busy || done) return;
    setBusy(true);
    // Faux network delay so the commit "feels real" — mirrors SourceWizard's
    // validate step pacing.
    setTimeout(() => {
      set({
        gitRemote: url.trim(),
        repoUrl: url.trim(),
        branch: (branch || 'main').trim(),
        gitConnected: true,
      });
      setDone(true);
      setBusy(false);
      // Echo a user turn in chat and unblock the script if it was waiting.
      if (shell.awaitingArtifactConfirm === 'gitconnect') {
        addTurn({
          id: 'u-wizard-gitconnect-' + Date.now(),
          role: 'user',
          body: ['Connected the git remote'],
        });
        setAwaitingArtifactConfirm('');
      }
      // Brief pause on the done frame, then close.
      setTimeout(() => {
        closeWizard();
        onClose?.();
      }, 850);
    }, 700);
  };

  return (
    <Modal
      open={open}
      title="Connect git remote"
      subtitle={<>Walt will commit your silver views + agent config to this remote and open the first PR.</>}
      icon="git"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <StepStrip stepIdx={stepIdx} done={done}/>
          <div style={{ flex: 1 }}/>
          {!done && (
            <>
              {stepIdx > 0 && (
                <button className="walt-btn ghost sm" onClick={goBack} disabled={busy}>
                  <Icon name="chevL" size={11}/> Back
                </button>
              )}
              <button
                className="walt-btn primary"
                onClick={goNext}
                disabled={!canNext}
                style={{ opacity: canNext ? 1 : 0.55 }}
              >
                {stepIdx === STEPS.length - 1
                  ? (busy ? 'Connecting…' : 'Connect & commit')
                  : 'Continue'}
                {stepIdx < STEPS.length - 1 && !busy && <Icon name="arrowR" size={11}/>}
              </button>
            </>
          )}
          {done && (
            <span style={{
              fontSize: 12, color: 'var(--status-ok)', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="check" size={11} color="var(--status-ok)"/>
              Remote connected · opening the PR
            </span>
          )}
        </>
      }
    >
      {!done && step.key === 'repo' && (
        <RepoStep
          providerId={providerId}
          onProvider={(id) => {
            setProviderId(id);
            const p = PROVIDERS.find(x => x.id === id);
            if (!url && p) setUrl(p.sample);
          }}
          provider={provider}
          url={url}        onUrl={setUrl}
          branch={branch}  onBranch={setBranch}
          authMethod={authMethod} onAuthMethod={setAuthMethod}
        />
      )}
      {!done && step.key === 'commit' && (
        <CommitStep url={url} branch={branch}/>
      )}
      {done && <DoneFrame url={url}/>}
    </Modal>
  );
}

// ----- step strip --------------------------------------------------------- //

function StepStrip({ stepIdx, done }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {STEPS.map((s, i) => {
        const isDone = done || i < stepIdx;
        const isActive = !done && i === stepIdx;
        return (
          <span
            key={s.key}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--accent)' : isDone ? 'var(--status-ok)' : 'var(--text-muted)',
            }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: 999,
              background: isDone ? 'var(--status-ok)' : isActive ? 'var(--accent)' : 'var(--bg-inset)',
              color: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
            }}>
              {isDone ? <Icon name="check" size={8} color="white"/> : (i + 1)}
            </span>
            {s.label}
            {i < STEPS.length - 1 && (
              <span style={{ width: 6, height: 1, background: 'var(--border-default, var(--border-subtle))', marginLeft: 2 }}/>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ----- step bodies -------------------------------------------------------- //

function RepoStep({ providerId, onProvider, provider, url, onUrl, branch, onBranch, authMethod, onAuthMethod }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Section
        title="Provider"
        desc="Pick where your repo lives. Walt creates the repo on supported providers if it doesn't exist."
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {PROVIDERS.map(p => {
            const on = providerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onProvider(p.id)}
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

      <Section
        title="Remote URL"
        desc="Paste the full repository URL — Walt creates it if it doesn't exist (on supported providers)."
      >
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
            onChange={e => onUrl(e.target.value)}
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

      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <Section title="Default branch" tight>
            <Input value={branch} onChange={onBranch} placeholder="main"/>
          </Section>
        </div>
        <div style={{ flex: 1 }}>
          <Section title="Authentication" tight>
            <div style={{ display: 'flex', gap: 6 }}>
              <Seg label="SSH key"        on={authMethod === 'ssh'}   onClick={() => onAuthMethod('ssh')}/>
              <Seg label="Personal token" on={authMethod === 'token'} onClick={() => onAuthMethod('token')}/>
            </div>
          </Section>
        </div>
      </div>

      <div style={{
        padding: '10px 12px', background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)', borderRadius: 10,
        fontSize: 12, color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="shield" size={12} color="var(--text-muted)"/>
        Walt fetches a short-lived token at run time. Nothing is persisted in the project repo.
      </div>
    </div>
  );
}

function CommitStep({ url, branch }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        padding: '10px 12px', background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)', borderRadius: 10,
        fontSize: 12, color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="git" size={12} color="var(--text-muted)"/>
        Pushing to <span className="walt-mono">{url || 'remote'}</span> · branch{' '}
        <span className="walt-mono">{branch || 'main'}</span>
      </div>

      <Section
        title="What Walt will commit"
        desc="A single commit on the default branch, then a PR with CI checks attached."
      >
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '12px 14px',
        }}>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
            <li><Mono>silver/</Mono> — ~60 silver views (S1 / S2 / S3 stages)</li>
            <li><Mono>contracts/</Mono> — bronze + silver contracts, lineage stamps</li>
            <li><Mono>agents/</Mono> — Ingestor / Transformer / Reasoner / Operator / Governer config</li>
            <li><Mono>policies/</Mono> — PII masking, retention, escalation routes</li>
            <li><Mono>.walt/</Mono> — workspace metadata + run history</li>
          </ul>
        </div>
      </Section>

      <Section title="What happens next" tight>
        <ol style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          <li>Walt pushes the commit + opens a PR with CI attached.</li>
          <li>The chat picks back up with the PR details.</li>
          <li>You review the PR in the side panel and click Commit when you're satisfied.</li>
        </ol>
      </Section>
    </div>
  );
}

function DoneFrame({ url }) {
  return (
    <div style={{
      padding: '24px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      textAlign: 'center',
    }}>
      <span style={{
        width: 56, height: 56, borderRadius: 999,
        background: 'rgba(63,143,63,0.12)', color: 'var(--status-ok)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="check" size={24} color="var(--status-ok)"/>
      </span>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
        Remote connected
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 460, lineHeight: 1.55 }}>
        Pushed to <span className="walt-mono">{url}</span>. The chat will pick back up with the PR
        in a moment — you can review the diff and commit from the side panel.
      </div>
    </div>
  );
}

// ----- shared bits -------------------------------------------------------- //

function Section({ title, desc, tight, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tight ? 6 : 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{
          fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5,
          color: 'var(--text-primary)', fontWeight: 700,
        }}>
          {title}
        </div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>}
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
  return (
    <span className="walt-mono" style={{
      background: 'var(--bg-inset)', padding: '1px 5px', borderRadius: 4, fontSize: 11.5,
    }}>{children}</span>
  );
}
