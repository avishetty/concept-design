import React from 'react';

// Self-contained store for the Builder (semantic-model) experience. Builder never
// touches the global onboarding reducer — it owns its own view routing, chat
// transcript, SQL side-panel state, and the "fix" launch context so the
// data-engineer flow stays completely untouched.

const initialState = {
  view: 'home',            // 'home' | 'chat' | 'benchmarks' | 'benchmarkDetail'
  activeScript: null,      // 'build' | 'fix' | null
  chatTurns: [],           // played turns for the active conversation
  chatKey: 0,              // bump to force a fresh autoplay run
  sqlPanel: { open: false, tab: 'summary' },
  fixContext: null,        // the benchmark run a "Fix with Builder" launched from
  committed: null,         // 'commit' | 'rerun' once an ActionRow is approved
  benchSuiteId: null,      // suite open in benchmarkDetail
  rerunning: false,        // detail page shows a "re-running" banner after a fix
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'START_BUILD':
      return {
        ...state,
        view: 'chat',
        activeScript: 'build',
        chatTurns: [],
        committed: null,
        sqlPanel: { open: false, tab: 'summary' },
        fixContext: null,
        chatKey: state.chatKey + 1,
      };

    case 'START_FIX':
      return {
        ...state,
        view: 'chat',
        activeScript: 'fix',
        chatTurns: [],
        committed: null,
        sqlPanel: { open: false, tab: 'summary' },
        fixContext: action.fixContext || null,
        chatKey: state.chatKey + 1,
      };

    case 'START_NEW_CHAT':
      return {
        ...state,
        view: 'home',
        activeScript: null,
        chatTurns: [],
        committed: null,
        sqlPanel: { open: false, tab: 'summary' },
        fixContext: null,
        chatKey: state.chatKey + 1,
      };

    case 'ADD_TURN':
      if (state.chatTurns.some(t => t.id === action.turn.id)) return state;
      return { ...state, chatTurns: [...state.chatTurns, action.turn] };

    case 'OPEN_SQL':
      return { ...state, sqlPanel: { open: true, tab: action.tab || state.sqlPanel.tab } };
    case 'CLOSE_SQL':
      return { ...state, sqlPanel: { ...state.sqlPanel, open: false } };
    case 'SET_SQL_TAB':
      return { ...state, sqlPanel: { ...state.sqlPanel, tab: action.tab } };

    case 'SET_COMMITTED':
      return { ...state, committed: action.action };

    case 'GOTO_BENCHMARKS':
      return { ...state, view: 'benchmarks' };

    case 'GOTO_DETAIL':
      return {
        ...state,
        view: 'benchmarkDetail',
        benchSuiteId: action.suiteId || state.benchSuiteId,
        rerunning: !!action.rerunning,
      };

    case 'CLEAR_RERUN':
      return { ...state, rerunning: false };

    default:
      return state;
  }
}

const BuilderContext = React.createContext(null);

export function BuilderProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const value = React.useMemo(() => ({ ...state, dispatch }), [state]);
  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const ctx = React.useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
}
