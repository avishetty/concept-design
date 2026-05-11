import React from 'react';
import { Walt, WaltMark } from './lib/components.jsx';
import { DesignCanvas, DCSection, DCArtboard } from './lib/canvas.jsx';
import {
  useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor,
} from './lib/tweaks.jsx';
import { EngineerApp } from './screens/engineer.jsx';
import { AnalystApp } from './screens/analyst.jsx';
import { OnboardingScenarioScreen } from './screens/onboarding.jsx';
import {
  MedallionScreen, SQLEditorScreen, CatalogScreen, ObservabilityScreen,
} from './screens/engineer-extras.jsx';
import { FoundationsScreen, LandingPage } from './screens/marketing.jsx';

const TWEAKS_DEFAULTS = {
  theme: 'light',
  density: 'comfortable',
  accent: '#7DCFFF',
  gold: '#E0AF68',
};

function WaltWin({ title, subtitle, children, theme = 'dark', density = 'comfortable', width = 1280, height = 800, persona = 'engineer' }) {
  const accentColor = persona === 'analyst' ? 'var(--semantic)' : 'var(--accent)';
  return (
    <div data-theme={theme} data-density={density} className="walt-root" style={{
      width, height,
      background: 'var(--bg-app)',
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{
        height: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 14px',
        background: 'var(--chrome-bg)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: '#FF5F57' }}/>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: '#FEBC2E' }}/>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: '#28C840' }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10 }}>
          <WaltMark size={16} accent={accentColor}/>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--chrome-text)' }}>{title}</span>
          {subtitle && <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>· {subtitle}</span>}
        </div>
        <div style={{ flex: 1 }}/>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 8px', borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          fontSize: 10.5, color: 'var(--chrome-text)', fontFamily: 'var(--font-mono)',
        }}>
          <Walt size={11}/> walt v0.1
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

function FullWin({ title, subtitle, children, theme = 'dark', width = 1280, height = 820 }) {
  return (
    <div data-theme={theme} className="walt-root" style={{
      width, height,
      background: 'var(--bg-app)',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px',
        background: 'var(--chrome-bg)', borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FF5F57' }}/>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FEBC2E' }}/>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#28C840' }}/>
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 11.5, color: 'var(--chrome-text)', fontWeight: 600 }}>
          {title}{subtitle ? ` · ${subtitle}` : ''}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
  );
}

export default function App() {
  const [t, setTweak] = useTweaks(TWEAKS_DEFAULTS);

  const styleOverride = `
    .walt-root { --accent: ${t.accent}; --gold: ${t.gold}; }
    .walt-root .walt-btn.primary { background: ${t.accent}; }
  `;

  const theme = t.theme;
  const density = t.density;

  return (
    <React.Fragment>
      <style>{styleOverride}</style>

      <DesignCanvas title="Walt DE" subtitle="A calm system for a tireless data engineer · v0.1 design exploration" background="#07080C">

        <DCSection id="brand" title="01 · Brand + system" subtitle="The world Walt lives in.">
          <DCArtboard id="landing" label="Landing page" width={1280} height={1800}>
            <FullWin title="walt.dev" theme={theme} width={1280} height={1800}>
              <LandingPage theme={theme}/>
            </FullWin>
          </DCArtboard>
          <DCArtboard id="foundations" label="Design system · foundations" width={1280} height={2200}>
            <FullWin title="design.walt.dev / foundations" theme={theme} width={1280} height={2200}>
              <FoundationsScreen theme={theme}/>
            </FullWin>
          </DCArtboard>
        </DCSection>

        <DCSection id="engineer" title="02 · For data engineers" subtitle="The dense, dark-by-default work surface. Chat, plan, and live artifacts side-by-side.">
          <DCArtboard id="eng-onboarding" label="Scenario · first session (source → bronze → silver → gold → semantic)" width={1440} height={1600}>
            <WaltWin title="walt — finance-platform" subtitle="acme · new session" theme={theme} density={density} width={1440} height={1600} persona="engineer">
              <OnboardingScenarioScreen/>
            </WaltWin>
          </DCArtboard>
          <DCArtboard id="eng-chat" label="Engineer · session + plan" width={1440} height={900}>
            <WaltWin title="walt — analytics-platform" subtitle="acme · prod" theme={theme} density={density} width={1440} height={900} persona="engineer">
              <EngineerApp/>
            </WaltWin>
          </DCArtboard>
          <DCArtboard id="eng-medallion" label="Engineer · pipelines + medallion (toggle DAG / models)" width={1440} height={900}>
            <WaltWin title="walt — medallion" theme={theme} density={density} width={1440} height={900} persona="engineer">
              <MedallionScreen/>
            </WaltWin>
          </DCArtboard>
          <DCArtboard id="eng-sql" label="Engineer · SQL editor + AI assist" width={1440} height={900}>
            <WaltWin title="walt — cohort_decomp.sql" theme={theme} density={density} width={1440} height={900} persona="engineer">
              <SQLEditorScreen/>
            </WaltWin>
          </DCArtboard>
          <DCArtboard id="eng-catalog" label="Engineer · data catalog" width={1440} height={900}>
            <WaltWin title="walt — catalog / gold.fct_revenue" theme={theme} density={density} width={1440} height={900} persona="engineer">
              <CatalogScreen/>
            </WaltWin>
          </DCArtboard>
          <DCArtboard id="eng-runs" label="Engineer · job runs" width={1440} height={900}>
            <WaltWin title="walt — observability / runs" theme={theme} density={density} width={1440} height={900} persona="engineer">
              <ObservabilityScreen/>
            </WaltWin>
          </DCArtboard>
        </DCSection>

        <DCSection id="analyst" title="03 · For analysts + business" subtitle="The same Walt, a quieter room. Light theme by default, question-first, answers with receipts.">
          <DCArtboard id="ana-ask" label="Analyst · ask Walt" width={1440} height={900}>
            <WaltWin title="walt — ask · w18 mrr" theme="light" density="comfortable" width={1440} height={900} persona="analyst">
              <AnalystApp/>
            </WaltWin>
          </DCArtboard>
          <DCArtboard id="ana-ask-dark" label="Analyst · in dark theme" width={1440} height={900}>
            <WaltWin title="walt — ask · w18 mrr" theme="dark" density="comfortable" width={1440} height={900} persona="analyst">
              <AnalystApp/>
            </WaltWin>
          </DCArtboard>
        </DCSection>

      </DesignCanvas>

      <TweaksPanel title="Walt · Tweaks" subtitle="Try the system in different modes">
        <TweakSection title="Theme">
          <TweakRadio
            label="Default theme"
            value={t.theme}
            options={[
              { value: 'dark', label: 'Engineer · dark' },
              { value: 'light', label: 'Analyst · light' },
            ]}
            onChange={(v) => setTweak('theme', v)}
          />
          <TweakRadio
            label="Density"
            value={t.density}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
            onChange={(v) => setTweak('density', v)}
          />
        </TweakSection>
        <TweakSection title="Accent">
          <TweakColor
            label="Engineer accent"
            value={t.accent}
            options={['#7AA2F7', '#9ECE6A', '#BB9AF7', '#7DCFFF', '#E0AF68']}
            onChange={(v) => setTweak('accent', v)}
          />
          <TweakColor
            label="Gold tier"
            value={t.gold}
            options={['#E0AF68', '#D9A441', '#F2C97A', '#C6873D']}
            onChange={(v) => setTweak('gold', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}
