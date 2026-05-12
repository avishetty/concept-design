import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase, envLabel } from '../state.jsx';
import { NotificationsBell } from './NotificationsBell.jsx';
import { UserMenu } from './UserMenu.jsx';

// Shared top chrome — visible on both the org dashboard and inside a project shell.
// Layout: [ImageInc breadcrumb] · [project crumb + env pill (inside project)] ·
//          spacer · [bell] [user menu]
export function TopAppBar() {
  const { phase, ctx, goto } = usePhase();
  const inProject = phase === 'platform';
  return (
    <div style={{
      height: 44, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 18px',
      background: 'var(--bg-app)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <OrgCrumb onClick={() => goto('org')} ctx={ctx} clickable={inProject}/>
      {inProject && (
        <>
          <Icon name="chevR" size={9} color="var(--text-muted)"/>
          <span className="walt-mono" style={{
            fontSize: 12, color: 'var(--text-primary)', fontWeight: 600,
          }}>
            {ctx.projectName}
          </span>
          <span style={{
            fontSize: 10.5, padding: '2px 8px', borderRadius: 999,
            background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600,
            fontFamily: 'var(--font-mono)',
          }}>{envLabel(ctx)}</span>
        </>
      )}
      <div style={{ flex: 1 }}/>
      <NotificationsBell/>
      <UserMenu/>
    </div>
  );
}

function OrgCrumb({ onClick, ctx, clickable }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={!clickable}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '4px 8px 4px 4px',
        background: clickable && hover ? 'var(--bg-hover)' : 'transparent',
        border: 'none', borderRadius: 8,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background .12s',
        fontFamily: 'var(--font-sans)',
      }}
      title={clickable ? 'Back to ImageInc projects' : ctx.orgName}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 6,
        background: 'var(--accent)', color: 'var(--text-inverse, #fff)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
      }}>{ctx.orgInitials || 'II'}</span>
      <span style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
      }}>{ctx.orgName || 'ImageInc'}</span>
    </button>
  );
}
