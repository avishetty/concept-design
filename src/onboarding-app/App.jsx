import React from 'react';
import { WaltMark } from '../lib/components.jsx';
import { PhaseProvider, usePhase } from './state.jsx';
import { PhaseStepper } from './components/PhaseStepper.jsx';
import { TopAppBar } from './components/TopAppBar.jsx';

import { LoginStep } from './steps/01-login.jsx';
import { WelcomeStep } from './steps/02-welcome.jsx';
import { CreateProjectStep } from './steps/03-create-project.jsx';
import { PlatformShell } from './PlatformShell.jsx';
import { OrgDashboardPage } from './pages/OrgDashboardPage.jsx';
import { BuilderShell } from './builder/BuilderShell.jsx';

const STEPS = {
  login:          LoginStep,
  welcome:        WelcomeStep,
  createProject:  CreateProjectStep,
  platform:       PlatformShell,
  org:            OrgDashboardPage,
  builder:        BuilderShell,
};

export function OnboardingApp() {
  return (
    <PhaseProvider initialPhase="login">
      <Shell/>
    </PhaseProvider>
  );
}

function Shell() {
  const { phase, goto } = usePhase();
  // Login is full-bleed; setup phases get the stepper. The `org` and `platform`
  // destinations share a single TopAppBar that carries the breadcrumb, the
  // notifications bell, and the user menu (which holds Sign out).
  const isLogin = phase === 'login';
  const isPlatform = phase === 'platform';
  const isOrg = phase === 'org';
  // Builder is a self-contained, full-bleed experience: it ships its own sidebar
  // chrome, so it gets neither the setup stepper nor the shared TopAppBar.
  const isBuilder = phase === 'builder';
  const showStepper = !isLogin && !isPlatform && !isOrg && !isBuilder;
  const showTopBar = isPlatform || isOrg;

  return (
    <div data-theme="light" data-density="comfortable" className="walt-root" style={{
      height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-app)',
      overflow: 'hidden',
    }}>
      <TitleBar isLogin={isLogin}/>
      {showStepper && (
        <div style={{
          height: 44, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 20px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <PhaseStepper phase={phase} onJump={goto}/>
          <div style={{ flex: 1 }}/>
        </div>
      )}
      {showTopBar && <TopAppBar/>}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <PhaseFader phase={phase}/>
      </div>
    </div>
  );
}

function TitleBar({ isLogin }) {
  const { phase, ctx } = usePhase();
  const titleText = isLogin
    ? 'Walt'
    : phase === 'platform'
      ? `Walt · ${ctx.projectName || 'finance-platform'}`
      : phase === 'builder'
        ? 'Walt · Global Sellout'
        : `Walt · ${ctx.orgName || 'ImageInc'}`;
  return (
    <div style={{
      height: 36, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px',
      background: 'var(--chrome-bg)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', gap: 7 }}>
        <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FF5F57' }}/>
        <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FEBC2E' }}/>
        <span style={{ width: 11, height: 11, borderRadius: 999, background: '#28C840' }}/>
      </div>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 11.5, color: 'var(--chrome-text)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <WaltMark size={12} accent="var(--accent)"/>
        {titleText}
      </div>
      <span className="walt-mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>desktop · v0.1</span>
    </div>
  );
}

// Light cross-fade between phases so transitions feel intentional.
function PhaseFader({ phase }) {
  const [renderPhase, setRenderPhase] = React.useState(phase);
  const [state, setState] = React.useState('idle');

  React.useEffect(() => {
    if (phase === renderPhase) return;
    setState('out');
    const swap = setTimeout(() => {
      setRenderPhase(phase);
      setState('in');
    }, 140);
    const settle = setTimeout(() => {
      setState('idle');
    }, 320);
    return () => { clearTimeout(swap); clearTimeout(settle); };
  }, [phase, renderPhase]);

  const StepComponent = STEPS[renderPhase];
  const style = state === 'out'
    ? { opacity: 0, transform: 'translateY(4px)' }
    : { opacity: 1, transform: 'translateY(0px)' };

  return (
    <div style={{
      flex: 1, minWidth: 0, minHeight: 0, display: 'flex',
      transition: 'opacity .16s ease, transform .18s ease',
      ...style,
    }}>
      {StepComponent ? <StepComponent/> : null}
    </div>
  );
}
