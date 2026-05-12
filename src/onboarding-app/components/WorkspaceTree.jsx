import React from 'react';
import { Icon } from '../../lib/components.jsx';

// Renders the opinionated medallion folder structure that Walt scaffolds locally.
export function WorkspaceTree({ root = 'finance-platform', highlight = null }) {
  return (
    <div style={{
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 12,
      padding: '14px 16px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 1.8,
      color: 'var(--text-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 600 }}>
        <Icon name="folder" size={12} color="var(--text-muted)"/> {root}/
      </div>
      <Node icon="folder" depth={1} label="bronze/" sub="raw landing tables" active={highlight === 'bronze'}/>
      <Node icon="folder" depth={1} label="silver/" sub="" active={highlight === 'silver'}/>
      <Node icon="folder" depth={2} label="s1_dedup/"/>
      <Node icon="folder" depth={2} label="s2_typecast/"/>
      <Node icon="folder" depth={2} label="s3_standardise/"/>
      <Node icon="folder" depth={1} label="gold/" sub=""/>
      <Node icon="folder" depth={2} label="g1_dims/"/>
      <Node icon="folder" depth={2} label="g1_facts/"/>
      <Node icon="folder" depth={2} label="g2_agg/"/>
      <Node icon="folder" depth={1} label="platinum/" sub="per-consumer views"/>
      <Node icon="folder" depth={1} label="semantic/" sub="entities, metrics, models"/>
      <Node icon="folder" depth={1} label="tests/" sub="data + contract tests"/>
      <Node icon="folder" depth={1} label="policies/" sub="masking, retention, access"/>
      <Node icon="file"   depth={1} label="walt.yaml" sub="project config"/>
      <Node icon="file"   depth={1} label="README.md"/>
    </div>
  );
}

function Node({ icon, depth, label, sub, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      paddingLeft: depth * 16,
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
    }}>
      <Icon name={icon} size={11} color={active ? 'var(--accent)' : 'var(--text-muted)'}/>
      <span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
      {sub && <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 11 }}>· {sub}</span>}
    </div>
  );
}
