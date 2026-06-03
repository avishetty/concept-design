import React from 'react';
import { useBuilder } from './BuilderState.jsx';
import { BuilderComposer } from './BuilderComposer.jsx';

// Scene 1 — the Builder home: a centered greeting and the Builder input box.
// Submitting kicks off the build conversation (BUILDER_BUILD_SCRIPT).
export function BuilderHome() {
  const { dispatch } = useBuilder();
  const start = () => dispatch({ type: 'START_BUILD' });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, background: 'var(--bg-app)' }}>
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: 20,
      }}>
        <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.3, color: 'var(--text-primary)' }}>
          Hi Avi,<br/>How can I help you?
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 380, marginTop: 10 }}>
          Builder helps you author and refine your semantic model — datasets, fields, metrics, and relationships through conversation.
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <BuilderComposer placeholder="Ask a question about your data…" onSend={start}/>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 7 }}>
            Builder is in preview. Please verify responses independently.
          </div>
        </div>
      </div>
    </div>
  );
}
