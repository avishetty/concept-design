import React from 'react';
import { Walt, Icon } from '../../lib/components.jsx';
import { usePhase } from '../state.jsx';
import { WorkspaceTree } from '../components/WorkspaceTree.jsx';

const TEMPLATES = [
  { key: 'finance',  label: 'Finance analytics', icon: 'chart', desc: 'GL, AP/AR, cash, close + forecast' },
  { key: 'product',  label: 'Product analytics', icon: 'flow',  desc: 'Events, retention, monetisation' },
  { key: 'growth',   label: 'Growth marts',      icon: 'sparkle', desc: 'Marketing, attribution, channels' },
  { key: 'blank',    label: 'Blank project',     icon: 'layers', desc: 'Start from scratch' },
];

export function CreateProjectStep() {
  const { advance, back, ctx, set } = usePhase();
  const [name, setName] = React.useState(ctx.projectName);
  const [path, setPath] = React.useState(ctx.localPath);
  const [warehouse, setWarehouse] = React.useState(ctx.warehouseTarget);
  const [template, setTemplate] = React.useState('finance');

  const submit = () => {
    set({
      projectName: name,
      localPath: path,
      warehouseTarget: warehouse,
    });
    advance();
  };

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* Form */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 48px 56px', display: 'flex', flexDirection: 'column', gap: 26 }}>
          <button
            onClick={() => back()}
            className="walt-btn ghost sm"
            style={{ alignSelf: 'flex-start', paddingLeft: 4, marginLeft: -4 }}
          >
            <Icon name="chevL" size={11}/> Back
          </button>

          <div>
            <div className="walt-serif" style={{ fontSize: 26, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              New project
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>
              Walt will scaffold an opinionated workspace using the medallion architecture (bronze → silver → gold → semantic).
            </div>
          </div>

          <Field label="Project name" hint="Used for the local folder and git repo.">
            <input style={input} value={name} onChange={(e) => setName(e.target.value)} autoFocus/>
          </Field>

          <Field label="Local workspace path" hint="Walt scaffolds this folder. Cloud workspaces are coming.">
            <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
              <input style={{ ...input, borderTopRightRadius: 0, borderBottomRightRadius: 0 }} value={path} onChange={(e) => setPath(e.target.value)}/>
              <button type="button" style={{
                height: 38, padding: '0 12px', border: '1px solid var(--border-default)', borderLeft: 'none',
                borderTopRightRadius: 8, borderBottomRightRadius: 8,
                background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                fontSize: 12.5, cursor: 'pointer',
              }}>Browse…</button>
            </div>
          </Field>

          <Field label="Destination warehouse" hint="Walt sets up staging and prod schemas here. We'll add source connections in your first session.">
            <select style={input} value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
              <option>Snowflake · FINANCE_PROD</option>
              <option>Snowflake · ANALYTICS</option>
              <option>BigQuery · imageinc-warehouse</option>
              <option>Databricks · uc-default</option>
              <option>Postgres · local-dev</option>
            </select>
          </Field>

          <NextSteps/>

          <Field label="Starting template" hint="Sets domain defaults and sample policies. You can change everything later.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TEMPLATES.map(t => {
                const on = template === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTemplate(t.key)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: on ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                      background: on ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: 6,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name={t.icon} size={13} color={on ? 'var(--accent)' : 'var(--text-secondary)'}/>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</span>
                    </div>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="walt-btn primary" onClick={submit} style={{ height: 40, fontSize: 14 }}>
              Create project <Icon name="arrowR" size={12} color="var(--accent-on)"/>
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
              Scaffolds the folder structure and sets up the agents.
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{
        width: 420, flexShrink: 0,
        background: 'var(--bg-app)',
        padding: '40px 32px',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Walt size={26}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Workspace preview</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>This is the opinionated structure I'll scaffold.</div>
          </div>
        </div>
        <WorkspaceTree root={name}/>
        <div style={{
          marginTop: 16,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          padding: '10px 12px', borderRadius: 10,
          fontSize: 12, lineHeight: 1.55,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <Icon name="sparkle" size={11} color="var(--accent)"/>
          <span>
            The medallion structure is our opinionated default. Walt agents write to these folders, and reviewer agents gate every promotion between layers.
          </span>
        </div>
      </div>
    </div>
  );
}

const input = {
  width: '100%', boxSizing: 'border-box',
  height: 38, padding: '0 12px',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  fontSize: 13.5,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{hint}</span>}
    </div>
  );
}

function NextSteps() {
  const STEPS = [
    { icon: 'cloud',  title: 'Connect sources',  desc: 'Walt mirrors them into bronze with PII masked.' },
    { icon: 'table',  title: 'Pull a sample',    desc: 'A 30-day slice so you can eyeball the contracts.' },
    { icon: 'wand',   title: 'Build silver',     desc: 'Transformer agent runs dedup · type-cast · standardise.' },
  ];
  return (
    <div style={{
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        What happens next · in chat
      </div>
      <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.title}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 4px 4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={s.icon} size={11}/>
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{s.title}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45 }}>{s.desc}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 1, alignSelf: 'stretch',
                background: 'var(--border-subtle)',
                margin: '4px 12px',
              }}/>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
