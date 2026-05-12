import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';

// Persistent chat composer at the bottom of the chat column.
//
// When `shell.composerSuggestions` is non-empty, a row of suggestion chips renders
// above the textarea. Clicking a chip toggles its inclusion in the message; the user
// can also type freely. On send, the composer dispatches a user-turn through the
// `onSend` callback (wired in PlatformShell.ChatColumn) which advances the script.
export function ChatComposer({
  placeholder = "Reply to Walt, ask a question, or type / for commands…",
  env = 'staging/dev',
  onSend,
}) {
  const { shell, clearComposerSuggestions } = usePhase();
  const suggestions = shell.composerSuggestions || [];
  const awaiting = shell.awaitingUserText;

  const [value, setValue] = React.useState('');
  const [picked, setPicked] = React.useState(() => new Set());
  const [focused, setFocused] = React.useState(false);
  const taRef = React.useRef(null);

  // Whenever suggestions arrive (a new gating prompt), reset the local picked set
  // so the user starts fresh.
  React.useEffect(() => {
    setPicked(new Set());
    setValue('');
  }, [suggestions.length === 0 ? '' : suggestions.map(s => s.id).join('|')]);

  // Recompute the textarea content from the picked set whenever it changes. The
  // user can still type over it.
  React.useEffect(() => {
    if (picked.size === 0) return;
    const ordered = suggestions.filter(s => picked.has(s.id)).map(s => s.label);
    setValue(ordered.join('; '));
  }, [picked, suggestions]);

  React.useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(140, taRef.current.scrollHeight) + 'px';
  }, [value]);

  const togglePicked = (id) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSend = value.trim().length > 0;
  const handleSend = () => {
    if (!canSend) return;
    const text = value.trim();
    if (onSend) onSend(text);
    setValue('');
    setPicked(new Set());
    clearComposerSuggestions();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      flexShrink: 0,
      padding: '10px 28px 24px',
      background: 'var(--bg-surface)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {suggestions.length > 0 && (
          <SuggestionRow
            suggestions={suggestions}
            picked={picked}
            onToggle={togglePicked}
            awaiting={awaiting}
          />
        )}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid ' + (
            awaiting && !canSend
              ? 'var(--accent)'
              : focused ? 'var(--border-default)' : 'var(--border-subtle)'
          ),
          borderRadius: 22,
          padding: '14px 16px 10px',
          boxShadow: focused
            ? '0 0 0 4px var(--accent-soft), 0 1px 2px rgba(17,20,24,0.04), 0 14px 30px rgba(17,20,24,0.07)'
            : awaiting
              ? '0 0 0 4px var(--accent-soft), 0 1px 2px rgba(17,20,24,0.03), 0 10px 26px rgba(17,20,24,0.05)'
              : '0 1px 2px rgba(17,20,24,0.03), 0 10px 26px rgba(17,20,24,0.05)',
          transition: 'border-color .18s ease, box-shadow .2s ease',
        }}>
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (picked.size > 0) setPicked(new Set());
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={awaiting
              ? 'Reply to Walt, or paste a doc with the questions to answer…'
              : placeholder}
            rows={1}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: 'none', outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 14, lineHeight: 1.55,
              fontFamily: 'var(--font-sans)',
              resize: 'none',
              padding: '2px 2px 10px',
              minHeight: 24, maxHeight: 140,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconBtn icon="plus" title="Attach"/>
            <Pill icon="sparkle" label="Agent · Walt"/>
            <Pill icon="branch" label={env}/>
            <div style={{ flex: 1 }}/>
            <IconBtn icon="mic" title="Voice"/>
            <button
              aria-label="Send"
              onClick={handleSend}
              disabled={!canSend}
              style={{
                width: 30, height: 30, borderRadius: 999, border: 'none',
                cursor: canSend ? 'pointer' : 'default',
                background: canSend ? 'var(--accent)' : 'var(--border-default)',
                color: 'var(--text-inverse)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .14s, transform .12s, box-shadow .14s',
                boxShadow: canSend ? '0 1px 2px rgba(17,20,24,0.08)' : 'none',
                marginLeft: 4,
              }}
              onMouseEnter={(e) => {
                if (!canSend) return;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(17,20,24,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = canSend ? '0 1px 2px rgba(17,20,24,0.08)' : 'none';
              }}
            >
              <Icon name="arrowUp" size={13} color="var(--text-inverse)"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suggestion chip row that surfaces above the textarea when the script is asking the
// user a question via the composer. Each chip is toggleable; the textarea below mirrors
// the picked selection (which the user can override by typing).
function SuggestionRow({ suggestions, picked, onToggle, awaiting }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      marginBottom: 10,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
      }}>
        <Icon name="sparkle" size={10} color="var(--accent)"/>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          Suggested — pick any, edit, or type your own
        </span>
        {awaiting && (
          <span className="walt-breathe" style={{
            marginLeft: 'auto',
            fontSize: 10, color: 'var(--accent)', fontWeight: 600,
          }}>
            ↓ awaiting your reply
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {suggestions.map((s, i) => {
          const on = picked.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggle(s.id)}
              className="walt-stagger-in"
              style={{
                '--i': i,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 11px',
                borderRadius: 999,
                border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border-default)'),
                background: on ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: on ? 'var(--accent)' : 'var(--text-primary)',
                fontSize: 12, fontWeight: on ? 600 : 500,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'background .14s, border-color .14s, color .14s, transform .12s',
              }}
              onMouseEnter={(e) => {
                if (!on) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }
              }}
              onMouseLeave={(e) => {
                if (!on) {
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }
              }}
            >
              <Icon
                name={on ? 'check' : 'plus'}
                size={10}
                color={on ? 'var(--accent)' : 'var(--text-muted)'}
              />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IconBtn({ icon, title }) {
  return (
    <button
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 999,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .12s, color .12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      <Icon name={icon} size={14}/>
    </button>
  );
}

function Pill({ icon, label }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 26, padding: '0 9px',
      borderRadius: 999,
      color: 'var(--text-secondary)',
      fontSize: 12, fontWeight: 500,
      background: 'transparent', border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      transition: 'background .12s, color .12s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      <Icon name={icon} size={11} color="currentColor"/>
      {label}
      <Icon name="chevD" size={9} color="currentColor"/>
    </button>
  );
}
