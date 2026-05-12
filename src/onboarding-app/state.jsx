import React from 'react';

// The setup-only phases now. After `createProject` the user lands in `platform`,
// which mounts the PlatformShell — no more linear stepper from that point on.
export const PHASES = [
  { key: 'login',          label: 'Sign in',      group: 'access' },
  { key: 'welcome',        label: 'Welcome',      group: 'access' },
  { key: 'createProject',  label: 'New project', group: 'setup' },
];

const PHASE_KEYS = PHASES.map(p => p.key);
// `org` and `platform` are destination phases reachable by goto() but not part of
// the setup sequence. Welcome routes to one or the other depending on whether the
// user already has a finance-platform project.
const ALL_PHASE_KEYS = [...PHASE_KEYS, 'platform', 'org'];

// Seeded sibling projects so the ImageInc dashboard feels populated even before
// Vincent has created anything. Vincent's own finance-platform is synthesized from
// `ctx` (see `currentProject` below) and prepended to this list at render time.
const SEED_PROJECTS = [
  {
    id: 'analytics-platform',
    name: 'analytics-platform',
    domain: 'Product analytics',
    env: 'prod',
    sources: ['Postgres · app_prod', 'Segment · events'],
    target: 'Snowflake · ANALYTICS',
    bronze: 42, silver: 28, gold: 14,
    owner: 'Maya V.', updated: '14 min ago',
    status: 'active', spec: 'product.yml',
    demo: true,
  },
  {
    id: 'growth-marts',
    name: 'growth-marts',
    domain: 'Growth',
    env: 'prod',
    sources: ['HubSpot', 'GA4', 'Stripe'],
    target: 'BigQuery · growth',
    bronze: 11, silver: 9, gold: 5,
    owner: 'Daniel K.', updated: '3 d ago',
    status: 'paused', spec: 'growth.yml',
    demo: true,
  },
  {
    id: 'supply-chain',
    name: 'supply-chain',
    domain: 'Operations',
    env: 'staging/dev',
    sources: ['SAP HANA · ECC'],
    target: 'Databricks · ops',
    bronze: 0, silver: 0, gold: 0,
    owner: 'Vincent L.', updated: 'yesterday',
    status: 'draft', spec: null,
    demo: true,
  },
];

// Cross-project drift / failure / policy events surfaced via the bell.
const SEED_NOTIFICATIONS = [
  {
    id: 'n-drift-1',
    kind: 'drift',
    project: 'finance-platform',
    body: 'bronze.ap.invoices · new column tax_jurisdiction',
    when: '10 min ago',
  },
  {
    id: 'n-run-1',
    kind: 'fail',
    project: 'growth-marts',
    body: 'silver_dedup.sales_pipeline · run failed (timeout)',
    when: '42 min ago',
  },
  {
    id: 'n-policy-1',
    kind: 'policy',
    project: 'analytics-platform',
    body: 'PII rule violated · email surfaced in gold.cohort_export',
    when: '2 h ago',
  },
];

const initialContext = {
  email: 'vincent@imageinc.com',
  fullName: 'Vincent Lee',
  orgName: 'ImageInc',
  orgInitials: 'II',
  projectName: 'finance-platform',
  localPath: '~/walt/finance-platform',
  domain: '',
  domainKey: '',            // matches a key in DOMAIN_BANK (Finance | HR | ...)
  sampleQuestions: [],
  sources: [],
  warehouseTarget: 'Snowflake · FINANCE_PROD',
  // A fresh project is local-only: the working tree lives at localPath, and `branch`
  // is the local branch name. When the user connects a git remote (gitConnected: true)
  // the branch label switches over to whatever they configured in the connect form.
  branch: 'main',
  gitConnected: false,
  ingestedTables: 0,
  ingestSample: 'last 30 days',
  scheduleFullIngestion: true,
  // Silver state lives here so artifact components can read/update via the reducer.
  silverStage: 'idle', // idle | s1 | s2 | s3 | done
  silverApproved: { s1: false, s2: false, s3: false },
  repoUrl: '',              // populated only when gitConnected
  prNumber: 142,
  prMerged: false,          // set when the user merges the PR in the panel
  prPromoted: false,        // set when the user promotes the merged build to production
  // Commit target — set by the final commit choice in the chat.
  commitTarget: '',         // '' | 'git' | 'local'
  gitRemote: '',            // user-entered remote URL when commitTarget === 'git'
  // Org-level state.
  projectCreated: false,    // flips true the moment Vincent finishes createProject
  activeProjectId: '',      // which org-dashboard card is "in view"; '' = Vincent's own
  projects: SEED_PROJECTS,
  notifications: SEED_NOTIFICATIONS,
};

// Display helper: what to show in the env/branch pill (composer, breadcrumb, sidebar).
// Local-only repos show "local · <branch>"; connected repos show the bare branch.
export function envLabel(ctx) {
  const branch = ctx?.branch || 'main';
  return ctx?.gitConnected ? branch : `local · ${branch}`;
}

// Synthesizes Vincent's own finance-platform card from the live `ctx` so the
// dashboard reflects whatever he's done in the chat flow (sources picked, tables
// landed, silver counts, PR state, etc.). Returns null until createProject is done.
export function currentProject(ctx) {
  if (!ctx?.projectCreated) return null;
  // Map the user's selected source keys (e.g. 'sqlserver', 'netsuite') to display
  // labels matching the screenshot convention.
  const SOURCE_LABEL = {
    sqlserver: 'SQL Server · ERP_PROD',
    postgres:  'Postgres · app-backend',
    netsuite:  'NetSuite',
    stripe:    'Stripe',
    salesforce: 'Salesforce',
    snowflake: 'Snowflake · raw',
    bigquery:  'BigQuery · raw',
    kafka:     'Kafka · events',
    s3:        'S3 · landing',
    csv:       'CSV · uploads',
  };
  const sources = (ctx.sources || []).slice(0, 3).map(k => SOURCE_LABEL[k] || k);
  // Live counts derived from chat-flow milestones. Bronze fills in once ingest
  // completes; silver/gold step up as stages get approved + PR merges.
  const bronze = ctx.silverApproved?.s1 || ctx.silverApproved?.s2 || ctx.silverApproved?.s3 ? 220 : (ctx.ingestedTables || 0);
  const silverApproved = (ctx.silverApproved?.s1 ? 1 : 0) + (ctx.silverApproved?.s2 ? 1 : 0) + (ctx.silverApproved?.s3 ? 1 : 0);
  const silver = silverApproved === 3 ? 18 : silverApproved * 6;
  const gold = ctx.prMerged ? 3 : 0;
  // Status: draft until ingest completes, then active. (Pause is reserved for the
  // demo siblings.)
  const status = (bronze > 0) ? 'active' : 'draft';
  return {
    id: 'finance-platform',
    name: ctx.projectName || 'finance-platform',
    domain: ctx.domainKey || 'Finance',
    env: 'staging/dev',
    sources: sources.length ? sources : ['SQL Server · ERP_PROD'],
    target: ctx.warehouseTarget || 'Snowflake · FINANCE_PROD',
    bronze, silver, gold,
    owner: 'Vincent L.', updated: '2 min ago',
    status, spec: 'finance.yml',
    demo: false,
  };
}

// Returns the merged list of projects to render on the dashboard: Vincent's own
// (if it exists) first, then the seeded siblings. Used by OrgDashboardPage.
export function allProjects(ctx) {
  const mine = currentProject(ctx);
  return mine ? [mine, ...(ctx.projects || [])] : (ctx.projects || []);
}

// Shell-level state — the platform shell is the long-lived chrome after createProject.
// Gating fields (ingestionStatus / silverStageStatus) are watched by the chat autoplayer
// so it pauses the script until simulated work signals "complete" / "review-ready".
const initialShellState = {
  shellTab: 'chat',         // 'chat' | 'catalog' | 'runs' | 'settings'
  sessionId: 'first-run',   // active session
  artifactView: null,       // 'connections' | 'ingestion' | 'sample' | 'silver' | 'code' | 'sql' | 'pr' | 'production' | 'context' | 'gitconnect' | null
  artifactTab: 'ingestion', // 'ingestion' | 'transformation' | 'code' | 'sql' | 'context'
  artifactPinned: false,
  // Remembers the last view shown so the side-panel toggle in the chat header can
  // reopen what the user was looking at most recently.
  lastArtifactView: null,
  lastArtifactTab: null,
  chatTurns: [],            // {id, role: 'walt'|'user'|'system', body, chip?}
  // Composer suggestion chips — when non-empty, shown above the textarea. Chips are
  // toggleable selections that the user can pick + edit before sending.
  composerSuggestions: [],  // [{ id, label }]
  // True while the script is waiting for the user to send a free-form message via the
  // composer (no choice pills — the user must reply through the input).
  awaitingUserText: false,
  // Simulated long-running work signals. The chat autoplayer polls these to gate
  // continuation. Each is one of: 'idle' | 'running' | 'complete'.
  ingestionStatus: 'idle',
  silverStageStatus: { s1: 'idle', s2: 'idle', s3: 'idle' }, // each: idle | running | review | approved
  // Awaiting an explicit confirm step inside an artifact (e.g. git remote setup).
  awaitingArtifactConfirm: '',
};

const Ctx = React.createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'advance': {
      const i = PHASE_KEYS.indexOf(state.phase);
      // Once the user passes `createProject`, the next phase is the platform shell.
      let next;
      if (i === PHASE_KEYS.length - 1) {
        next = 'platform';
      } else if (i < 0) {
        // Already in `platform` — advance is a no-op for the phase machine.
        next = state.phase;
      } else {
        next = PHASE_KEYS[i + 1];
      }
      // When createProject completes (next === 'platform'), mark the project as
      // created so the org dashboard surfaces it and the welcome step knows to
      // skip create on subsequent visits.
      const ctxUpdate = action.ctx || {};
      const finalCtx = next === 'platform'
        ? { ...state.ctx, ...ctxUpdate, projectCreated: true, activeProjectId: '' }
        : { ...state.ctx, ...ctxUpdate };
      return { ...state, phase: next, ctx: finalCtx };
    }
    case 'back': {
      const i = PHASE_KEYS.indexOf(state.phase);
      if (i <= 0) return state;
      return { ...state, phase: PHASE_KEYS[i - 1] };
    }
    case 'goto': {
      if (!ALL_PHASE_KEYS.includes(action.phase)) return state;
      return { ...state, phase: action.phase };
    }
    case 'set': {
      return { ...state, ctx: { ...state.ctx, ...action.ctx } };
    }
    case 'reset': {
      return {
        phase: 'login',
        ctx: { ...initialContext },
        shell: { ...initialShellState },
      };
    }
    // Shell-level actions
    case 'setShellTab': {
      return { ...state, shell: { ...state.shell, shellTab: action.tab } };
    }
    case 'openArtifact': {
      const tab = action.tab || state.shell.artifactTab;
      return {
        ...state,
        shell: {
          ...state.shell,
          artifactView: action.view,
          artifactTab: tab,
          lastArtifactView: action.view,
          lastArtifactTab: tab,
          shellTab: 'chat', // ensure the side panel is visible from chat
        },
      };
    }
    case 'closeArtifact': {
      // Don't close if pinned — user explicitly chose to keep it open.
      if (state.shell.artifactPinned) return state;
      // Remember what was open so the chat-header toggle can restore it.
      return {
        ...state,
        shell: {
          ...state.shell,
          lastArtifactView: state.shell.artifactView || state.shell.lastArtifactView,
          lastArtifactTab:  state.shell.artifactTab  || state.shell.lastArtifactTab,
          artifactView: null,
        },
      };
    }
    case 'setArtifactTab': {
      return { ...state, shell: { ...state.shell, artifactTab: action.tab } };
    }
    case 'togglePinArtifact': {
      return { ...state, shell: { ...state.shell, artifactPinned: !state.shell.artifactPinned } };
    }
    case 'addTurn': {
      return { ...state, shell: { ...state.shell, chatTurns: [...state.shell.chatTurns, action.turn] } };
    }
    case 'setTurns': {
      return { ...state, shell: { ...state.shell, chatTurns: action.turns } };
    }
    case 'setSession': {
      return { ...state, shell: { ...state.shell, sessionId: action.sessionId, chatTurns: action.turns || [] } };
    }
    // Composer suggestions — chips shown above the textarea when the script wants the
    // user to reply via the composer (e.g. day-one questions).
    case 'setComposerSuggestions': {
      return {
        ...state,
        shell: {
          ...state.shell,
          composerSuggestions: action.suggestions || [],
          awaitingUserText: !!action.awaitingUserText,
        },
      };
    }
    case 'clearComposerSuggestions': {
      return {
        ...state,
        shell: { ...state.shell, composerSuggestions: [], awaitingUserText: false },
      };
    }
    case 'setIngestionStatus': {
      return { ...state, shell: { ...state.shell, ingestionStatus: action.status } };
    }
    case 'setSilverStageStatus': {
      return {
        ...state,
        shell: {
          ...state.shell,
          silverStageStatus: { ...state.shell.silverStageStatus, [action.stage]: action.status },
        },
      };
    }
    case 'setAwaitingArtifactConfirm': {
      return { ...state, shell: { ...state.shell, awaitingArtifactConfirm: action.key || '' } };
    }
    case 'dismissNotification': {
      return {
        ...state,
        ctx: {
          ...state.ctx,
          notifications: (state.ctx.notifications || []).filter(n => n.id !== action.id),
        },
      };
    }
    case 'setActiveProjectId': {
      return { ...state, ctx: { ...state.ctx, activeProjectId: action.id || '' } };
    }
    default:
      return state;
  }
}

export function PhaseProvider({ children, initialPhase = 'login' }) {
  const [state, dispatch] = React.useReducer(reducer, {
    phase: initialPhase,
    ctx: { ...initialContext },
    shell: { ...initialShellState },
  });
  const value = React.useMemo(() => ({
    phase: state.phase,
    ctx: state.ctx,
    shell: state.shell,
    advance: (ctx) => dispatch({ type: 'advance', ctx }),
    back: () => dispatch({ type: 'back' }),
    goto: (phase) => dispatch({ type: 'goto', phase }),
    set: (ctx) => dispatch({ type: 'set', ctx }),
    reset: () => dispatch({ type: 'reset' }),
    setShellTab: (tab) => dispatch({ type: 'setShellTab', tab }),
    openArtifact: (view, tab) => dispatch({ type: 'openArtifact', view, tab }),
    closeArtifact: () => dispatch({ type: 'closeArtifact' }),
    setArtifactTab: (tab) => dispatch({ type: 'setArtifactTab', tab }),
    togglePinArtifact: () => dispatch({ type: 'togglePinArtifact' }),
    addTurn: (turn) => dispatch({ type: 'addTurn', turn }),
    setTurns: (turns) => dispatch({ type: 'setTurns', turns }),
    setSession: (sessionId, turns) => dispatch({ type: 'setSession', sessionId, turns }),
    setComposerSuggestions: (suggestions, awaitingUserText = true) =>
      dispatch({ type: 'setComposerSuggestions', suggestions, awaitingUserText }),
    clearComposerSuggestions: () => dispatch({ type: 'clearComposerSuggestions' }),
    setIngestionStatus: (status) => dispatch({ type: 'setIngestionStatus', status }),
    setSilverStageStatus: (stage, status) => dispatch({ type: 'setSilverStageStatus', stage, status }),
    setAwaitingArtifactConfirm: (key) => dispatch({ type: 'setAwaitingArtifactConfirm', key }),
    dismissNotification: (id) => dispatch({ type: 'dismissNotification', id }),
    setActiveProjectId: (id) => dispatch({ type: 'setActiveProjectId', id }),
  }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePhase() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('usePhase must be used inside PhaseProvider');
  return v;
}

export function phaseIndex(phase) {
  return PHASE_KEYS.indexOf(phase);
}
