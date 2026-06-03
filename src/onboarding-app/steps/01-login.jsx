import React from 'react';
import { Walt, WaltMark, Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';

export function LoginStep() {
  const { advance, set, goto, ctx } = usePhase();
  const [email, setEmail] = React.useState(ctx.email);
  const [password, setPassword] = React.useState('••••••••••••');

  const submit = (e) => {
    e?.preventDefault?.();
    set({ email });
    advance();
  };

  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex',
      background: 'var(--bg-app)',
    }}>
      {/* Left rail · branding */}
      <div style={{
        width: '46%', minWidth: 360,
        background: 'linear-gradient(165deg, var(--bg-surface) 0%, var(--bg-inset) 100%)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        padding: '64px 60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <WaltMark size={20} accent="var(--accent)"/>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Walt</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32, maxWidth: 460 }}>
          <Walt size={88} blinking/>
          <div>
            <div className="walt-serif" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              A calm system for a tireless data engineer.
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginTop: 18, lineHeight: 1.55 }}>
              Walt orchestrates five agents — Ingestor, Transformer, Reasoner, Operator, Governer — to land your data, model it, and keep it honest.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={11}/> Local-first workspaces</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={11}/> Reviewer gates on every layer</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={11}/> Policy-aware</span>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          v0.1 · desktop preview
        </div>
      </div>

      {/* Right rail · form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
      }}>
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Welcome back</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>Sign in to your workspace.</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" style={ssoBtn} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <SsoMark provider="google"/> Continue with Google
            </button>
            <button type="button" style={ssoBtn} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <SsoMark provider="okta"/> Continue with Okta SSO
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 11.5 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
            <span>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Work email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} autoFocus/>
            </Field>
            <Field label="Password" hint={<a style={link}>Forgot</a>}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input}/>
            </Field>
          </div>

          <button type="submit" className="walt-btn primary" style={{ height: 40, fontSize: 14 }}>
            Sign in <Icon name="arrowR" size={12} color="var(--accent-on)"/>
          </button>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            New to Walt? <a style={link}>Request access</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-dim)', fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
            <span>preview</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
          </div>

          <button
            type="button"
            onClick={() => goto('builder')}
            style={builderLinkBtn}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--semantic-soft)'; e.currentTarget.style.borderColor = 'var(--semantic)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          >
            <Icon name="sparkle" size={13} color="var(--semantic)"/>
            Enter Builder · Semantic Model (Preview)
            <Icon name="arrowR" size={12} color="var(--semantic)"/>
          </button>
        </form>
      </div>
    </div>
  );
}

const input = {
  width: '100%', boxSizing: 'border-box',
  height: 38, padding: '0 12px',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  fontSize: 13.5,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color .12s, box-shadow .12s',
};

const ssoBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  height: 40, width: '100%',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  fontSize: 13.5, fontWeight: 500,
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'background .12s, border-color .12s',
};

const link = { color: 'var(--accent)', textDecoration: 'none', fontSize: 12, cursor: 'pointer' };

const builderLinkBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  height: 38, width: '100%',
  background: 'transparent',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  fontSize: 13, fontWeight: 500,
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'background .12s, border-color .12s',
};

function hoverOn(e) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }
function hoverOff(e) { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }

function Field({ label, hint, children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
        {hint}
      </div>
      {children}
    </div>
  );
}

function SsoMark({ provider }) {
  if (provider === 'google') {
    return (
      <svg width="16" height="16" viewBox="0 0 18 18">
        <path fill="#EA4335" d="M9 3.6c1.6 0 3 .6 4.1 1.6l3-3C14.3 1 11.8 0 9 0 5.5 0 2.4 2 1 4.8L4.6 7.6C5.3 5.3 7 3.6 9 3.6z"/>
        <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8c-.2 1.1-.9 2-1.8 2.7l3 2.3c1.7-1.6 2.6-4 2.6-6.7z"/>
        <path fill="#FBBC05" d="M4.6 10.4c-.2-.7-.4-1.5-.4-2.4s.2-1.6.4-2.4L1 2.8C.4 4.3 0 6 0 8s.4 3.7 1 5.2l3.6-2.8z"/>
        <path fill="#34A853" d="M9 16c2.4 0 4.5-.8 6-2.2l-3-2.3c-.8.6-1.9.9-3 .9-2 0-3.7-1.4-4.4-3.2L1 13.2C2.4 16 5.5 16 9 16z"/>
      </svg>
    );
  }
  // okta
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" fill="none" stroke="#007DC1" strokeWidth="2.4"/>
    </svg>
  );
}
