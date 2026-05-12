import React from 'react';
import { PHASES, phaseIndex } from '../state.jsx';

export function PhaseStepper({ phase, onJump }) {
  const idx = phaseIndex(phase);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {PHASES.map((p, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <button
            key={p.key}
            onClick={() => onJump && onJump(p.key)}
            title={p.label}
            style={{
              position: 'relative',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: active ? '4px 12px 4px 10px' : '4px 6px',
              border: 'none',
              background: active ? 'var(--accent-soft)' : 'transparent',
              cursor: 'pointer',
              borderRadius: 999,
              transition: 'background .2s ease, padding .2s ease',
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{
              width: active ? 7 : 5,
              height: active ? 7 : 5,
              borderRadius: 999,
              background: active
                ? 'var(--accent)'
                : done
                  ? 'var(--text-secondary)'
                  : 'var(--border-strong)',
              transition: 'all .2s ease',
              flexShrink: 0,
            }}/>
            {active && (
              <span
                className="phase-stepper-label"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  letterSpacing: '-0.005em',
                }}
              >
                {p.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
