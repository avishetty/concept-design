import React from 'react';
import { Walt, Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { AGENTS, AGENT_ORDER } from '../agents.js';
import { AgentAvatar } from '../components/AgentBadge.jsx';

export function WelcomeStep() {
  const { advance, goto, ctx } = usePhase();
  const hasProject = !!ctx.projectCreated;
  // Returning sessions (Vincent already has a finance-platform) jump straight to
  // the ImageInc dashboard. First-timers see the empty state below and advance
  // into createProject.
  React.useEffect(() => {
    if (hasProject) goto('org');
  }, [hasProject]);
  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflowY: 'auto' }}>
      <div style={{ flex: 1, padding: '56px 56px 64px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Walt size={64} blinking/>
            <div>
              <div className="walt-serif" style={{ fontSize: 28, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                Welcome, {ctx.fullName.split(' ')[0]}.
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
                Let's stand up your first data project at {ctx.orgName || 'ImageInc'}. It's quick — Walt does the heavy lifting.
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-default)',
            borderRadius: 14,
            padding: 36,
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="layers" size={22}/>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>No projects of yours yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Create a project to scope a domain, connect sources, and let your agents start building.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="walt-btn primary" onClick={() => advance()}>
                <Icon name="plus" size={12} color="var(--accent-on)"/> New project
              </button>
              <button className="walt-btn ghost" onClick={() => goto('org')}>
                Browse ImageInc projects
              </button>
            </div>
          </div>

          {/* Meet your agents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Your agents
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {AGENT_ORDER.map(k => {
                const a = AGENTS[k];
                return (
                  <div key={k} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AgentAvatar agent={k} size={26}/>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.role}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
