import React from 'react';
import { BuilderProvider, useBuilder } from './BuilderState.jsx';
import { BuilderSidebar } from './BuilderSidebar.jsx';
import { BuilderHome } from './BuilderHome.jsx';
import { BuilderChat } from './BuilderChat.jsx';
import { BuilderSqlPanel } from './BuilderSqlPanel.jsx';
import { BenchmarkSuitesPage } from './BenchmarkSuitesPage.jsx';
import { BenchmarkDetailPage } from './BenchmarkDetailPage.jsx';

// Full-bleed shell for the Builder (semantic-model) experience. Ships its own
// WALT sidebar + main-area view switch and never renders the data-engineer
// chrome. Wrapped in its own provider so Builder state stays isolated.
export function BuilderShell() {
  return (
    <BuilderProvider>
      <BuilderLayout/>
    </BuilderProvider>
  );
}

function BuilderLayout() {
  const { view, chatKey } = useBuilder();

  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex',
      background: 'var(--bg-app)', overflow: 'hidden',
    }}>
      <BuilderSidebar/>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', minHeight: 0 }}>
        {view === 'home' && <BuilderHome/>}
        {view === 'chat' && (
          <>
            <BuilderChat key={chatKey}/>
            <BuilderSqlPanel/>
          </>
        )}
        {view === 'benchmarks' && <BenchmarkSuitesPage/>}
        {view === 'benchmarkDetail' && <BenchmarkDetailPage/>}
      </div>
    </div>
  );
}
