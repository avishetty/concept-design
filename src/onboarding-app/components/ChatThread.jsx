import React from 'react';
import { Walt, Icon } from '../../lib/components.jsx';
import { AGENTS } from '../agents.js';
import { AgentAvatar, AgentBadge } from './AgentBadge.jsx';
import { ArtifactChip } from './ArtifactChip.jsx';

// How often the progress turn re-checks elapsed time to advance step state.
const PROGRESS_TICK_MS = 120;

// Renders the active session's turn array. Turns are simple JSON; this component
// owns the visual treatment for walt / user / system / agent voices and threads in
// optional artifact chips and choice pills.
export function ChatThread({ turns, onChoice, busy }) {
  const endRef = React.useRef(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns.length, busy]);

  return (
    <div style={{
      flex: 1, minHeight: 0, overflowY: 'auto',
      padding: '28px 36px 24px',
      background: 'var(--bg-surface)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {turns.map((t, i) => (
          <Turn key={t.id || i} turn={t} onChoice={onChoice} isLast={i === turns.length - 1}/>
        ))}
        {busy && <Typing/>}
        <div ref={endRef}/>
      </div>
    </div>
  );
}

function Turn({ turn, onChoice, isLast }) {
  if (turn.role === 'system')   return <SystemTurn turn={turn}/>;
  if (turn.role === 'user')     return <UserTurn turn={turn}/>;
  if (turn.role === 'agent')    return <AgentTurn turn={turn}/>;
  if (turn.role === 'progress') return <ProgressTurn turn={turn}/>;
  if (turn.role === 'task')     return <TaskTurn turn={turn} onChoice={onChoice} isLast={isLast}/>;
  return <WaltTurn turn={turn} onChoice={onChoice} isLast={isLast}/>;
}

function WaltTurn({ turn, onChoice, isLast }) {
  return (
    <div className="walt-rise-in" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, marginTop: -2, width: 28, height: 28 }}>
        <Walt size={28}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(turn.body || []).map((line, i) => (
          <div key={i} style={{
            fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65,
          }}>{line}</div>
        ))}
        {/* A turn can have one chip (`turn.chip`) or several (`turn.chips`). Both
            render in a single horizontal strip so they read like one row of
            affordances rather than back-to-back avatars. */}
        {(turn.chips || (turn.chip ? [turn.chip] : [])).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(turn.chips || [turn.chip]).map((c, idx) => (
              <ArtifactChip
                key={c.view || c.wizard || idx}
                view={c.view}
                wizard={c.wizard}
                label={c.label}
                hint={c.hint}
              />
            ))}
          </div>
        )}
        {turn.choices && isLast && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
            {turn.choices.map((c, idx) => (
              <button
                key={c.id || c.label}
                className="walt-stagger-in"
                style={{
                  '--i': idx,
                  padding: '7px 14px',
                  borderRadius: 999,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  transition: 'background .16s ease, border-color .16s ease, color .16s ease, transform .16s cubic-bezier(.22,.61,.36,1), box-shadow .16s ease',
                }}
                onClick={() => onChoice && onChoice(c, turn)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-soft)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(94,106,210,0.10)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserTurn({ turn }) {
  return (
    <div className="walt-rise-in" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: 540,
        padding: '10px 14px',
        borderRadius: 16,
        background: 'var(--accent-soft)',
        color: 'var(--text-primary)',
        fontSize: 14,
        lineHeight: 1.5,
      }}>
        {(turn.body || []).join(' ')}
      </div>
    </div>
  );
}

function AgentTurn({ turn }) {
  const a = AGENTS[turn.agent] || AGENTS.transformer;
  return (
    <div className="walt-rise-in" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <AgentAvatar agent={turn.agent} size={28}/>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: a.color }}>{a.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {a.role}</span>
        </div>
        {(turn.body || []).map((line, i) => (
          <div key={i} style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function SystemTurn({ turn }) {
  if (turn.agent) {
    return (
      <div className="walt-rise-in" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: AGENTS[turn.agent]?.soft || 'var(--bg-inset)',
        border: '1px solid color-mix(in srgb, ' + (AGENTS[turn.agent]?.color || 'var(--border-strong)') + ' 25%, transparent)',
        borderRadius: 10,
      }}>
        <AgentAvatar agent={turn.agent} size={24}/>
        <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>
          {(turn.body || []).join(' ')}
        </span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· joined just now</span>
      </div>
    );
  }
  return (
    <div className="walt-rise-in" style={{
      alignSelf: 'center',
      fontSize: 11.5, color: 'var(--text-muted)',
      padding: '4px 12px',
      background: 'var(--bg-inset)',
      borderRadius: 999,
    }}>
      {(turn.body || []).join(' ')}
    </div>
  );
}

// A streaming-style progress trace for autonomous work (ingestion, silver builds, …).
// Shows the responsible agent at the top and a vertical list of step rows that
// reveal themselves one at a time. Each row transitions queued → running → done
// based on elapsed time since `turn.playedAt`; this means the visual state is
// derived from a timestamp rather than mutable component state, so unmount/
// remount (e.g. tab navigation) just resumes from the correct frame.
function ProgressTurn({ turn }) {
  const steps = turn.steps || [];
  const stepMs = turn.stepMs || 800;
  const startAt = turn.playedAt || 0;
  const total = steps.length;

  // If we know when this turn started, derive the active step from elapsed time.
  // No timestamp (e.g. older saved turn) → assume the whole thing already ran.
  const computeIdx = React.useCallback(() => {
    if (!startAt) return total;
    const elapsed = Date.now() - startAt;
    return Math.max(0, Math.min(total, Math.floor(elapsed / stepMs)));
  }, [startAt, stepMs, total]);

  const [idx, setIdx] = React.useState(computeIdx);

  React.useEffect(() => {
    if (idx >= total) return;
    const t = setInterval(() => {
      const next = computeIdx();
      setIdx(next);
      if (next >= total) clearInterval(t);
    }, PROGRESS_TICK_MS);
    return () => clearInterval(t);
  }, [idx, total, computeIdx]);

  const agent = AGENTS[turn.agent] || AGENTS.transformer;
  const allDone = idx >= total;

  return (
    <div className="walt-rise-in" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <AgentAvatar agent={turn.agent || 'transformer'} size={28}/>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: agent.color }}>{agent.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {turn.title || agent.role}</span>
          {!allDone && (
            <span style={{
              fontSize: 10.5, fontWeight: 600,
              color: 'var(--text-muted)',
              padding: '1px 7px', borderRadius: 999,
              background: 'var(--bg-inset)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span className="walt-dot run" style={{ width: 6, height: 6 }}/>
              working
            </span>
          )}
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 2,
          paddingLeft: 2,
          borderLeft: `2px solid ${agent.color}`,
          marginLeft: 2,
        }}>
          {steps.map((s, i) => {
            const state = i < idx ? 'done' : i === idx ? 'running' : 'queued';
            return <ProgressStep key={s.id || i} step={s} state={state} accent={agent.color}/>;
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressStep({ step, state, accent }) {
  const isDone    = state === 'done';
  const isRunning = state === 'running';
  const isQueued  = state === 'queued';

  // Reserve a fixed strip on the left for the marker so labels align nicely
  // regardless of state. Marker is: spinner (running), filled dot (done), hollow (queued).
  const marker = (
    <span style={{
      width: 14, height: 14, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {isRunning && <span className="walt-spinner" style={{ '--c': accent }} aria-hidden="true"/>}
      {isDone && (
        <span style={{
          width: 12, height: 12, borderRadius: 999,
          background: accent, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={8} color="#fff" strokeWidth={2}/>
        </span>
      )}
      {isQueued && (
        <span style={{
          width: 8, height: 8, borderRadius: 999,
          border: '1.5px solid var(--border-default)',
          background: 'transparent',
        }}/>
      )}
    </span>
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '4px 0 4px 10px',
      opacity: isQueued ? 0.45 : 1,
      transition: 'opacity .25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {marker}
        <Icon
          name={step.icon || 'sparkle'}
          size={12}
          color={isQueued ? 'var(--text-muted)' : isRunning ? accent : 'var(--text-secondary)'}
        />
        <span style={{
          fontSize: 12.5,
          color: isQueued ? 'var(--text-muted)' : 'var(--text-primary)',
          fontWeight: isRunning ? 600 : 500,
          lineHeight: 1.4,
        }}>
          {step.label}
        </span>
      </div>
      {isDone && step.result && (
        <div style={{
          marginLeft: 22 + 12 + 8, // marker + icon + gap
          display: 'inline-flex',
        }}>
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 6,
            background: 'var(--bg-inset)',
            color: 'var(--text-secondary)',
            fontFamily: step.resultMono === false ? 'inherit' : 'var(--font-mono)',
            border: '1px solid var(--border-subtle)',
            lineHeight: 1.4,
          }}>
            {step.resultIcon && (
              <Icon name={step.resultIcon} size={10} color="var(--text-muted)"/>
            )}
            {step.result}
          </span>
        </div>
      )}
    </div>
  );
}

// TaskTurn — single chat bubble that represents one agent work cycle. Walt
// stays the orchestrator voice: the intro / outro lines render with Walt's
// avatar, while the agent's identity appears only as a subtle label on the
// progress strip (no separate avatar bubble per sub-step).
//
// Shape (additive on top of WaltTurn):
//   {
//     role: 'task',
//     body:    [...]              // optional intro lines, rendered as Walt
//     agent:   'ingestor' | ...   // primary agent responsible
//     subLabel:'raw-landing-agent'// optional sub-agent label
//     title:   'Mirroring sources into bronze'
//     steps:   [...]              // ProgressTurn steps
//     stepMs:  800                // optional override
//     outro:   [...lines]         // optional lines shown once progress finishes
//     chip:    { view, label, hint }   // optional artifact pill
//     choices: [...]              // optional reply pills
//     gated:   boolean            // when true, outro/chip/choices wait for
//                                 //   progress completion (default true)
//   }
function TaskTurn({ turn, onChoice, isLast }) {
  const steps  = turn.steps || [];
  const stepMs = turn.stepMs || 800;
  const startAt = turn.playedAt || 0;
  const total = steps.length;
  const gated = turn.gated !== false; // default true

  const computeIdx = React.useCallback(() => {
    if (!startAt) return total;
    const elapsed = Date.now() - startAt;
    return Math.max(0, Math.min(total, Math.floor(elapsed / stepMs)));
  }, [startAt, stepMs, total]);
  const [idx, setIdx] = React.useState(computeIdx);
  React.useEffect(() => {
    if (idx >= total) return;
    const t = setInterval(() => {
      const next = computeIdx();
      setIdx(next);
      if (next >= total) clearInterval(t);
    }, PROGRESS_TICK_MS);
    return () => clearInterval(t);
  }, [idx, total, computeIdx]);

  const agent = AGENTS[turn.agent] || AGENTS.transformer;
  const allDone = total === 0 || idx >= total;
  // Outro / chip / choices reveal only when work finishes (so the bubble feels
  // like one continuous task rather than several disconnected updates).
  const showTail = !gated || allDone;

  return (
    <div className="walt-rise-in" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, marginTop: -2, width: 28, height: 28 }}>
        <Walt size={28} thinking={!allDone}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Intro — Walt's voice */}
        {(turn.body || []).map((line, i) => (
          <div key={'b' + i} style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65 }}>{line}</div>
        ))}

        {/* Agent strip (no avatar — just a subtle label) + progress steps */}
        {total > 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            padding: '10px 12px',
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderLeft: `3px solid ${agent.color}`,
            borderRadius: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 18, height: 18, borderRadius: 999,
                background: agent.soft, color: agent.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={agent.icon} size={10} color={agent.color}/>
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: agent.color }}>{agent.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {turn.title || agent.role}</span>
              {turn.subLabel && (
                <span className="walt-mono" style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 4,
                  background: 'var(--bg-inset)', color: 'var(--text-muted)',
                }}>{turn.subLabel}</span>
              )}
              <div style={{ flex: 1 }}/>
              {!allDone ? (
                <span style={{
                  fontSize: 10.5, fontWeight: 600,
                  color: 'var(--text-muted)',
                  padding: '1px 7px', borderRadius: 999,
                  background: 'var(--bg-inset)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <span className="walt-dot run" style={{ width: 6, height: 6 }}/>
                  working
                </span>
              ) : (
                <span style={{
                  fontSize: 10.5, fontWeight: 600,
                  color: 'var(--status-ok)',
                  padding: '1px 7px', borderRadius: 999,
                  background: 'rgba(63,143,63,0.10)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Icon name="check" size={9} color="var(--status-ok)"/>
                  done
                </span>
              )}
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 2,
              paddingLeft: 2,
            }}>
              {steps.map((s, i) => {
                const state = i < idx ? 'done' : i === idx ? 'running' : 'queued';
                return <ProgressStep key={s.id || i} step={s} state={state} accent={agent.color}/>;
              })}
            </div>
          </div>
        )}

        {/* Outro / chip / choices — gated behind progress completion */}
        {showTail && (turn.outro || []).map((line, i) => (
          <div key={'o' + i} className="walt-rise-in" style={{
            fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65,
          }}>{line}</div>
        ))}
        {showTail && (turn.chips || (turn.chip ? [turn.chip] : [])).length > 0 && (
          <div className="walt-rise-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(turn.chips || [turn.chip]).map((c, idx) => (
              <ArtifactChip
                key={c.view || c.wizard || idx}
                view={c.view}
                wizard={c.wizard}
                label={c.label}
                hint={c.hint}
              />
            ))}
          </div>
        )}
        {showTail && turn.choices && isLast && (
          <div className="walt-rise-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
            {turn.choices.map((c, idx2) => (
              <ChoiceButton key={c.id || c.label} c={c} index={idx2} onClick={() => onChoice && onChoice(c, turn)}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Factored choice pill so WaltTurn + TaskTurn share styling. The hover state
// matches the original WaltTurn implementation exactly.
function ChoiceButton({ c, index, onClick }) {
  return (
    <button
      className="walt-stagger-in"
      style={{
        '--i': index,
        padding: '7px 14px',
        borderRadius: 999,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-surface)',
        cursor: 'pointer',
        fontSize: 12.5,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        transition: 'background .16s ease, border-color .16s ease, color .16s ease, transform .16s cubic-bezier(.22,.61,.36,1), box-shadow .16s ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--accent-soft)';
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(94,106,210,0.10)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface)';
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {c.label}
    </button>
  );
}

function Typing() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, marginTop: -2, width: 28, height: 28 }}>
        <Walt size={28} thinking/>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '8px 12px',
        background: 'var(--bg-inset)',
        borderRadius: 14,
      }}>
        <Dot delay={0}/>
        <Dot delay={0.15}/>
        <Dot delay={0.3}/>
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span style={{
      width: 5, height: 5, borderRadius: 999, background: 'var(--text-muted)',
      animation: 'walt-pulse 1.2s ease-in-out infinite',
      animationDelay: delay + 's',
    }}/>
  );
}
