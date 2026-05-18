import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase, allProjects } from '../state.jsx';

// Full-bleed organization dashboard — ImageInc's home view, replacing the old
// left-rail navigation. Lists every project under the org with quick-action
// icons for entering Chat / Catalog / Runs / Memory / Settings directly.
export function OrgDashboardPage() {
  const { ctx, goto } = usePhase();
  const projects = allProjects(ctx);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: 'var(--bg-app)',
    }}>
      {/* Scrollable area — header and grid share the same centered column so
          the page title/subtitle line up with the project cards. */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '24px 28px 32px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Page header — aligned to the cards column */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 16,
            marginBottom: 18,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
                letterSpacing: -0.3, lineHeight: 1.15,
              }}>Projects</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                All data projects under {ctx.orgName || 'ImageInc'}
              </div>
            </div>
            <button
              className="walt-btn primary sm"
              onClick={() => goto('createProject')}
              style={{ fontSize: 12 }}
            >
              <Icon name="plus" size={11}/> New project
            </button>
          </div>

          {/* Cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: 16,
          }}>
            {projects.map(p => <ProjectCard key={p.id} project={p}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Project card --------------------------------------------------------- //

const STATUS_META = {
  active: { label: 'ACTIVE', tone: 'var(--status-ok)',   dot: 'var(--status-ok)' },
  paused: { label: 'PAUSED', tone: 'var(--text-muted)',  dot: 'var(--text-muted)' },
  draft:  { label: 'DRAFT',  tone: 'var(--status-warn)', dot: 'var(--status-warn)' },
};

function ProjectCard({ project: p }) {
  const { goto, setShellTab, set, openArtifact } = usePhase();
  const [hover, setHover] = React.useState(false);
  const status = STATUS_META[p.status] || STATUS_META.active;
  const isMine = !p.demo;

  // tab: which project page to land on. artifactView (optional): opens the
  // right-side panel to the given artifact once we're inside chat (used by
  // the "code" affordance to drop straight into the repo browser).
  const enterProject = (tab, artifactView) => {
    set({ activeProjectId: isMine ? '' : p.id });
    setShellTab(tab);
    if (artifactView) openArtifact(artifactView, 'code');
    goto('platform');
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => enterProject('chat')}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        padding: '16px 18px 14px',
        display: 'flex', flexDirection: 'column', gap: 12,
        cursor: 'pointer',
        boxShadow: hover
          ? '0 6px 18px rgba(17,20,24,0.06), 0 1px 2px rgba(17,20,24,0.04)'
          : '0 1px 2px rgba(17,20,24,0.03)',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow .14s ease, transform .14s ease, border-color .14s',
        borderColor: hover ? 'var(--border-default, var(--border-subtle))' : 'var(--border-subtle)',
        position: 'relative',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}>{p.name}</span>
            {isMine && (
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
                padding: '2px 6px', borderRadius: 4,
                background: 'var(--accent-soft)', color: 'var(--accent)',
              }}>YOURS</span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
            {p.domain} · {p.env}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          padding: '3px 8px', borderRadius: 4,
          background: 'var(--bg-inset)',
          color: status.tone,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: status.dot }}/>
          {status.label}
        </span>
      </div>

      {/* Sources → Target */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 14,
        alignItems: 'start',
      }}>
        <div>
          <div style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: 'var(--text-muted)', marginBottom: 4,
          }}>Sources</div>
          {(p.sources && p.sources.length) ? p.sources.map((s, i) => (
            <div key={i} style={{
              fontSize: 11.5, color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              display: 'flex', alignItems: 'center', gap: 6,
              lineHeight: 1.6,
            }}>
              <Icon name="db" size={10} color="var(--text-muted)"/>
              {s}
            </div>
          )) : (
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>—</div>
          )}
        </div>
        <Icon name="arrowR" size={12} color="var(--text-muted)" style={{ marginTop: 22 }}/>
        <div>
          <div style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            color: 'var(--text-muted)', marginBottom: 4,
          }}>Target</div>
          <div style={{
            fontSize: 11.5, color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="db" size={10} color="var(--text-muted)"/>
            {p.target}
          </div>
        </div>
      </div>

      {/* Layer pills + spec */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <LayerPill kind="bronze" count={p.bronze}/>
        <LayerPill kind="silver" count={p.silver}/>
        <LayerPill kind="gold"   count={p.gold}/>
        {p.spec && (
          <span style={{
            fontSize: 10.5, padding: '3px 8px', borderRadius: 999,
            background: 'var(--accent-soft)', color: 'var(--accent)',
            fontFamily: 'var(--font-mono)', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="file" size={9} color="currentColor"/>
            {p.spec}
          </span>
        )}
      </div>

      {/* Footer: owner / updated + persistent action row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginTop: 2,
        paddingTop: 10,
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Owner · {p.owner}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Updated {p.updated}
        </div>
      </div>

      {/* Quick action row — always visible, brightens on card hover */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', gap: 4,
          marginTop: -2,
          opacity: hover ? 1 : 0.7,
          transition: 'opacity .14s',
        }}
      >
        <ActionIcon icon="msg"      label="Open chat"        onClick={() => enterProject('chat')}/>
        <ActionIcon icon="pipe"     label="Ingestion"        onClick={() => enterProject('ingestion')}/>
        <ActionIcon icon="layers"   label="Transformation"   onClick={() => enterProject('transformation')}/>
        <ActionIcon icon="db"       label="Catalog"          onClick={() => enterProject('catalog')}/>
        <ActionIcon icon="code"     label="Browse code"      onClick={() => enterProject('chat', 'code')}/>
        <ActionIcon icon="pulse"    label="Agent runs"       onClick={() => enterProject('runs')}/>
        <ActionIcon icon="book"     label="Memory"           onClick={() => enterProject('memory')}/>
        <ActionIcon icon="settings" label="Settings"         onClick={() => enterProject('settings')}/>
      </div>
    </div>
  );
}

function LayerPill({ kind, count }) {
  const colors = {
    bronze: { dot: 'var(--bronze)', bg: 'var(--bronze-soft)', label: 'Bronze' },
    silver: { dot: 'var(--silver)', bg: 'var(--silver-soft)', label: 'Silver' },
    gold:   { dot: 'var(--gold)',   bg: 'var(--gold-soft)',   label: 'Gold' },
  };
  const c = colors[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, padding: '3px 9px', borderRadius: 999,
      background: c.bg, color: 'var(--text-secondary)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c.dot }}/>
      {c.label} <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{count}</span>
    </span>
  );
}

function ActionIcon({ icon, label, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={label}
      style={{
        width: 28, height: 28, borderRadius: 7,
        border: '1px solid ' + (hover ? 'var(--accent-soft)' : 'var(--border-subtle)'),
        background: hover ? 'var(--accent-soft)' : 'var(--bg-surface)',
        color: hover ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .12s, color .12s, border-color .12s',
      }}
    >
      <Icon name={icon} size={12} color="currentColor"/>
    </button>
  );
}
