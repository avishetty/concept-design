import React from 'react';
import { Icon } from '../lib/components.jsx';
import { usePhase, envLabel } from './state.jsx';
import { ChatThread } from './components/ChatThread.jsx';
import { ChatComposer } from './components/ChatComposer.jsx';
import { SessionPicker } from './SessionPicker.jsx';
import { ArtifactsPanel } from './ArtifactsPanel.jsx';
import {
  FIRST_RUN_SCRIPT,
  scriptIndexById,
  renderBody,
  DOMAIN_BANK,
} from './sessions.js';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { RunsPage } from './pages/RunsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { MemoryPage } from './pages/MemoryPage.jsx';

// The project shell is just the selected tab's content. Chrome (breadcrumb, bell,
// user menu) lives in the shared TopAppBar above. The user enters a specific tab
// by clicking the matching quick-action icon on the org-dashboard card and pops
// back to the dashboard via the breadcrumb to switch tabs.
export function PlatformShell() {
  const { shell, ctx } = usePhase();
  // Demo siblings are read-only stubs — surface a light banner so it's clear the
  // chat machinery isn't wired for those projects.
  const isDemo = !!ctx.activeProjectId;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg-app)' }}>
      {isDemo && <DemoProjectBanner/>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {shell.shellTab === 'chat'     && <ChatTabContent/>}
        {shell.shellTab === 'catalog'  && <CatalogPage/>}
        {shell.shellTab === 'runs'     && <RunsPage/>}
        {shell.shellTab === 'memory'   && <MemoryPage/>}
        {shell.shellTab === 'settings' && <SettingsPage/>}
      </div>
    </div>
  );
}

function DemoProjectBanner() {
  const { ctx, goto } = usePhase();
  return (
    <div style={{
      height: 32, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 18px',
      background: 'var(--accent-soft)',
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 11.5, color: 'var(--accent)',
    }}>
      <Icon name="eye" size={11} color="currentColor"/>
      <span style={{ fontWeight: 600 }}>{ctx.activeProjectId}</span>
      <span style={{ color: 'var(--text-muted)' }}>· demo project · read-only preview</span>
      <div style={{ flex: 1 }}/>
      <button
        onClick={() => goto('org')}
        className="walt-btn ghost sm"
        style={{ fontSize: 11, padding: '3px 8px' }}
      >
        Back to projects
      </button>
    </div>
  );
}

function ChatTabContent() {
  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <ChatColumn/>
      <ArtifactsPanel/>
    </div>
  );
}

function ChatColumn() {
  const {
    shell, ctx, addTurn, set,
    setComposerSuggestions, clearComposerSuggestions,
    setIngestionStatus, setSilverStageStatus, setAwaitingArtifactConfirm,
  } = usePhase();
  const turns = shell.chatTurns;
  const [busy, setBusy] = React.useState(false);

  // Autoplay state: which turn id are we *about to play* next? We key off ids (not
  // indices) so that branch choices with `next: '<id>'` can jump forward.
  const lastPlayed = shell.chatTurns[shell.chatTurns.length - 1];
  const [nextId, setNextId] = React.useState(() => {
    if (shell.sessionId !== 'first-run') return null;
    // Resume from wherever the thread currently stands.
    if (lastPlayed) {
      const last = FIRST_RUN_SCRIPT.find(t => t.id === lastPlayed.id);
      if (last?.choices) return null; // paused on a user choice
      // If lastPlayed.id has a `next` (because user picked a branching choice), the
      // setNextId call in onChoice will have already pointed us there. Default to the
      // following script entry.
      const i = scriptIndexById(lastPlayed.id);
      if (i >= 0 && i + 1 < FIRST_RUN_SCRIPT.length) return FIRST_RUN_SCRIPT[i + 1].id;
      return null;
    }
    return FIRST_RUN_SCRIPT[0].id;
  });

  // When the session changes, resync.
  React.useEffect(() => {
    if (shell.sessionId === 'first-run') {
      const last = shell.chatTurns[shell.chatTurns.length - 1];
      if (!last) { setNextId(FIRST_RUN_SCRIPT[0].id); return; }
      const lastTurn = FIRST_RUN_SCRIPT.find(t => t.id === last.id);
      if (lastTurn?.choices) { setNextId(null); return; }
      const i = scriptIndexById(last.id);
      setNextId(i >= 0 && i + 1 < FIRST_RUN_SCRIPT.length ? FIRST_RUN_SCRIPT[i + 1].id : null);
    } else {
      setNextId(null);
    }
  }, [shell.sessionId]);

  // Watch ingestion + silver gates: when the simulated work signals "done", the next
  // turn (which has waitForIngestion / waitForSilver) becomes playable. This effect
  // doesn't directly advance — the main autoplay effect below picks up on the state
  // change because shell.ingestionStatus / silverStageStatus are in its deps.

  // Main autoplay effect.
  React.useEffect(() => {
    if (shell.sessionId !== 'first-run') return;
    if (!nextId) return;

    const turn = FIRST_RUN_SCRIPT.find(t => t.id === nextId);
    if (!turn) return;

    // Gate: waitForIngestion — pause until ingestion completes.
    if (turn.waitForIngestion && shell.ingestionStatus !== 'complete') return;
    // Gate: waitForSilver — pause until that silver stage finished simulating.
    if (turn.waitForSilver && shell.silverStageStatus?.[turn.waitForSilver] !== 'review') return;
    // Gate: waitForMerge — pause until the user clicks Merge in the PR panel.
    if (turn.waitForMerge && !ctx.prMerged) return;

    setBusy(true);
    let typingDelay;
    if (turn.role === 'system')        typingDelay = 460;
    else if (turn.role === 'user')     typingDelay = 1100;
    else if (turn.role === 'progress') typingDelay = 0;   // appears immediately under the kick-off turn
    else                                typingDelay = 820;

    const t1 = setTimeout(() => {
      setBusy(false);
      // Render any {{ctx}} interpolation against current ctx, including chip label/hint.
      const interp = (s) => typeof s === 'string'
        ? s.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] != null ? String(ctx[k]) : '')
        : s;
      const renderedTurn = {
        ...turn,
        body: renderBody(turn.body, ctx),
        chip: turn.chip ? { ...turn.chip, label: interp(turn.chip.label), hint: interp(turn.chip.hint) } : turn.chip,
        // Progress turns interpolate {{ctx}} into their step labels too, and we
        // stamp `playedAt` so the visual frame survives unmount/remount (the
        // step state is derived from elapsed time, not component state).
        ...(turn.role === 'progress'
          ? {
              steps: (turn.steps || []).map(s => ({
                ...s,
                label:  interp(s.label),
                result: interp(s.result),
              })),
              playedAt: Date.now(),
            }
          : null),
      };
      addTurn(renderedTurn);

      // Side effects when the turn plays.
      if (turn.setCtx) set(turn.setCtx);
      // Note: `turn.action: { type: 'openArtifact' }` used to auto-open the
      // side panel. We intentionally don't auto-open anymore — the user opens
      // the panel by clicking the chip on the turn (every turn that had an
      // auto-open also ships a chip pointing to the same view).

      // composerSuggestionsByDomain — surface the right question bank in the composer.
      if (turn.composerSuggestionsByDomain) {
        const bank = DOMAIN_BANK[ctx.domainKey] || DOMAIN_BANK.Finance;
        setComposerSuggestions(bank, true);
        return; // pause — user must reply via composer
      }

      if (turn.startIngestion) {
        setIngestionStatus('running');
        // Simulate ingestion taking ~6 seconds, then flip to 'complete' so the
        // chat unblocks even if the user never opens the panel.
        setTimeout(() => setIngestionStatus('complete'), 6000);
      }
      if (turn.startSilverStage) {
        const stage = turn.startSilverStage;
        set({ silverStage: stage });
        setSilverStageStatus(stage, 'running');
        // Per-stage simulated build duration. S2 is a touch longer to mirror the
        // "needed two rounds" narrative.
        const buildMs = stage === 's2' ? 4500 : 3500;
        setTimeout(() => setSilverStageStatus(stage, 'review'), buildMs);
      }
      if (turn.awaitConfirm) {
        setAwaitingArtifactConfirm(turn.awaitConfirm);
        setNextId(null); // pause — user must confirm inside the artifact; second effect resumes
        return;
      }
      if (turn.choices) {
        return; // pause on user choice
      }

      // Otherwise, advance to next in script (or to turn.next if specified).
      if (turn.next) {
        setNextId(turn.next);
      } else {
        const i = scriptIndexById(turn.id);
        setNextId(i >= 0 && i + 1 < FIRST_RUN_SCRIPT.length ? FIRST_RUN_SCRIPT[i + 1].id : null);
      }
    }, typingDelay);
    return () => clearTimeout(t1);
  }, [nextId, shell.sessionId, shell.ingestionStatus, shell.silverStageStatus, ctx.prMerged]);

  // Watch for artifact confirmation completion (e.g. git remote saved).
  React.useEffect(() => {
    if (shell.awaitingArtifactConfirm) return; // still awaiting
    // If a prior turn was awaiting confirm and it just cleared, advance past it.
    const last = shell.chatTurns[shell.chatTurns.length - 1];
    if (!last) return;
    const lastTurn = FIRST_RUN_SCRIPT.find(t => t.id === last.id);
    if (!lastTurn?.awaitConfirm) return;
    if (nextId) return; // we've already moved past
    const i = scriptIndexById(lastTurn.id);
    if (i >= 0 && i + 1 < FIRST_RUN_SCRIPT.length) setNextId(FIRST_RUN_SCRIPT[i + 1].id);
  }, [shell.awaitingArtifactConfirm]);

  // Handle a pill click (multiple-choice). Adds a user turn echoing the choice label,
  // applies its setCtx, and advances autoplay to choice.next (per-choice override),
  // fromTurn.next (per-turn default), or the next script index.
  // `next: null` on a choice explicitly halts auto-advance (e.g. "hold off — I'll do it later").
  const onChoice = (choice, fromTurn) => {
    if (shell.sessionId !== 'first-run') return;
    if (choice.setCtx) set(choice.setCtx);
    addTurn({ id: 'u-' + (fromTurn?.id || 'choice') + '-' + choice.id, role: 'user', body: [choice.label] });
    if (Object.prototype.hasOwnProperty.call(choice, 'next')) {
      setNextId(choice.next); // explicit destination (or null to halt)
    } else if (fromTurn?.next) {
      setNextId(fromTurn.next); // per-turn default destination
    } else {
      const i = scriptIndexById(fromTurn?.id || '');
      setNextId(i >= 0 && i + 1 < FIRST_RUN_SCRIPT.length ? FIRST_RUN_SCRIPT[i + 1].id : null);
    }
  };

  // The composer "Send" surfaces here when the script is awaiting user text.
  const onSendUserText = (text) => {
    if (shell.sessionId !== 'first-run') return;
    // Record the user's reply as a user turn and apply derived ctx.
    const lines = text.split(/\n+/).filter(Boolean);
    addTurn({ id: 'u-text-' + Date.now(), role: 'user', body: lines });
    // Best-effort: remember the answer set on ctx.
    set({ sampleQuestions: text.split(/[;\n]/).map(s => s.trim()).filter(Boolean) });
    // The composer already cleared shell.composerSuggestions / awaitingUserText.
    // Advance to the turn following the last script turn that requested composer input.
    const last = shell.chatTurns[shell.chatTurns.length - 1] || FIRST_RUN_SCRIPT.find(t => t.composerSuggestionsByDomain);
    const anchorId = last?.id || 'w-dayone';
    const i = scriptIndexById(anchorId);
    if (i >= 0 && i + 1 < FIRST_RUN_SCRIPT.length) setNextId(FIRST_RUN_SCRIPT[i + 1].id);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      minWidth: 0, minHeight: 0,
      background: 'var(--bg-surface)',
    }}>
      <ChatHeader/>
      <ChatThread turns={turns} onChoice={onChoice} busy={busy}/>
      <ChatComposer env={useEnv()} onSend={onSendUserText}/>
    </div>
  );
}

function useEnv() {
  const { ctx } = usePhase();
  return envLabel(ctx);
}

function ChatHeader() {
  const { shell, openArtifact, closeArtifact } = usePhase();
  const isOpen = !!shell.artifactView;
  const togglePanel = () => {
    if (isOpen) {
      closeArtifact();
      return;
    }
    // Re-open whatever was last shown; fall back to the Context view as a sensible default.
    const view = shell.lastArtifactView || 'context';
    const tab  = shell.lastArtifactTab  || (view === 'context' || view === 'gitconnect' ? 'context' : 'ingestion');
    openArtifact(view, tab);
  };
  return (
    <div style={{
      height: 48, flexShrink: 0,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: 12,
    }}>
      <SessionPicker/>
      <div style={{ flex: 1 }}/>
      <button className="walt-btn ghost sm" title="Share session" style={{ fontSize: 11.5 }}>
        <Icon name="user" size={11}/> Share
      </button>
      <button className="walt-btn ghost sm" title="Session settings" style={{ fontSize: 11.5 }}>
        <Icon name="settings" size={11}/>
      </button>
      <PanelToggle isOpen={isOpen} onToggle={togglePanel}/>
    </div>
  );
}

// Compact icon button that opens / closes the side panel.
// Highlighted while the panel is open so users can read state at a glance.
function PanelToggle({ isOpen, onToggle }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={isOpen ? 'Hide side panel' : 'Show side panel'}
      aria-pressed={isOpen}
      style={{
        width: 28, height: 28, borderRadius: 7,
        border: '1px solid ' + (isOpen ? 'var(--accent-soft)' : 'transparent'),
        background: isOpen
          ? 'var(--accent-soft)'
          : hover ? 'var(--bg-hover)' : 'transparent',
        color: isOpen ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .14s, color .14s, border-color .14s',
      }}
    >
      <Icon name="sidePanel" size={13} color="currentColor"/>
    </button>
  );
}
