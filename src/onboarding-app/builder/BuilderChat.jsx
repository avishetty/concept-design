import React from 'react';
import { Icon } from '../../lib/components.jsx';
import { ChatThread } from '../components/ChatThread.jsx';
import { useBuilder } from './BuilderState.jsx';
import { BuilderComposer } from './BuilderComposer.jsx';
import { BuilderActionContext } from './BuilderActions.jsx';
import { getScript } from './builderScript.jsx';

// Per-role typing delays, mirroring the data-engineer autoplayer in
// PlatformShell. Task turns own their in-bubble progress strip, so they get no
// extra typing delay.
function typingDelayFor(role) {
  if (role === 'user') return 720;
  if (role === 'task') return 0;
  return 760;
}

// Scenes 2, 3, 6 — the live build / fix conversation. A contained autoplay
// engine walks the active script: assistant/task turns play automatically, but
// every scripted USER turn pauses and waits for the presenter to send from the
// composer before it lands (so the human drives the conversation). The one
// exception is the build script's opening user turn, which the Home composer
// already triggered. Keyed by chatKey upstream so each START_BUILD / START_FIX
// remounts fresh.
export function BuilderChat() {
  const { activeScript, chatTurns, committed, fixContext, dispatch } = useBuilder();
  const script = React.useMemo(() => getScript(activeScript), [activeScript]);

  const [cursor, setCursor] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  // True when the turn at `cursor` is a user turn waiting for a composer send.
  const [awaiting, setAwaiting] = React.useState(false);
  const advanceTimer = React.useRef(null);

  // The build script's first turn is the question the user already typed on the
  // Home screen, so it auto-plays; every other user turn waits for input.
  const isAutoFirstUserTurn = (idx, turn) =>
    turn.role === 'user' && idx === 0 && activeScript === 'build';

  React.useEffect(() => {
    if (cursor >= script.length) { setBusy(false); setAwaiting(false); return; }
    const turn = script[cursor];

    // Pause on scripted user turns — wait for the composer (handled in onSend).
    if (turn.role === 'user' && !isAutoFirstUserTurn(cursor, turn)) {
      setBusy(false);
      setAwaiting(true);
      return;
    }

    setAwaiting(false);
    setBusy(turn.role !== 'task');

    const playDelay = turn.role === 'user' ? 220 : typingDelayFor(turn.role);
    const t1 = setTimeout(() => {
      setBusy(false);

      const played = (turn.role === 'task')
        ? { ...turn, playedAt: Date.now() }
        : turn;
      dispatch({ type: 'ADD_TURN', turn: played });

      if (turn.openSqlPanel) dispatch({ type: 'OPEN_SQL', tab: 'summary' });

      // Task turns delay their advance until the in-bubble progress finishes,
      // so the outro/actions land after the strip completes.
      let advanceDelay = 220;
      if (turn.role === 'task') {
        const steps = (turn.steps || []).length;
        const stepMs = turn.stepMs || 800;
        advanceDelay = steps * stepMs + 320;
      }
      advanceTimer.current = setTimeout(() => setCursor(c => c + 1), advanceDelay);
    }, playDelay);

    return () => {
      clearTimeout(t1);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, script]);

  // Composer send: only meaningful while we're paused on a user turn. Plays the
  // scripted user turn (preserving its rich body, e.g. attached file chips)
  // regardless of what was typed, then resumes autoplay.
  const onSend = React.useCallback(() => {
    if (!awaiting) return;
    const turn = script[cursor];
    if (!turn || turn.role !== 'user') return;
    dispatch({ type: 'ADD_TURN', turn });
    setAwaiting(false);
    setCursor(c => c + 1);
  }, [awaiting, script, cursor, dispatch]);

  const onAction = React.useCallback((action) => {
    if (action === 'changes') {
      // Soft acknowledgement — keep the conversation where it is.
      return;
    }
    dispatch({ type: 'SET_COMMITTED', action });
    if (action === 'rerun') {
      // Commit, then bounce back to the benchmark detail in a re-running state.
      setTimeout(() => {
        dispatch({ type: 'GOTO_DETAIL', rerunning: true });
      }, 1500);
    }
  }, [dispatch]);

  const actionValue = React.useMemo(() => ({
    committed,
    onAction,
    onOpenSql: () => dispatch({ type: 'OPEN_SQL', tab: 'summary' }),
  }), [committed, onAction, dispatch]);

  return (
    <BuilderActionContext.Provider value={actionValue}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, background: 'var(--bg-surface)' }}>
        {activeScript === 'fix' && fixContext && <FixContextBanner ctx={fixContext}/>}
        <ChatThread turns={chatTurns} onChoice={() => {}} busy={busy}/>
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <BuilderComposer
              disabled={!awaiting}
              placeholder={awaiting ? 'Your turn — type a reply and send to continue…' : 'Builder is responding…'}
              onSend={onSend}
            />
          </div>
        </div>
      </div>
    </BuilderActionContext.Provider>
  );
}

// The pre-loaded context strip shown when Builder is launched from a benchmark
// run (scene 6). Not a chat bubble — a sticky banner above the transcript.
function FixContextBanner({ ctx }) {
  return (
    <div style={{
      flexShrink: 0,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--accent-soft)',
      padding: '10px 16px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: 'var(--accent)', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sparkle" size={13} color="#fff"/>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
            Launched from {ctx.suite} · {ctx.runLabel}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            “{ctx.question}” — Builder pre-loaded this run’s context to diagnose the failure.
          </div>
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 600, flexShrink: 0,
          padding: '2px 8px', borderRadius: 999,
          background: ctx.status === 'success' ? 'rgba(63,143,63,0.12)' : 'rgba(193,67,67,0.12)',
          color: ctx.status === 'success' ? 'var(--status-ok)' : 'var(--status-err)',
        }}>{ctx.status === 'success' ? 'Passed' : 'Failed'}</span>
      </div>
    </div>
  );
}
