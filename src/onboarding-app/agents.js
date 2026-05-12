// Walt — primary + sub-agent registry for the first-run prototype.

export const AGENTS = {
  ingestor: {
    key: 'ingestor',
    name: 'Ingestor',
    role: 'Lands raw data into Bronze',
    icon: 'download',
    color: 'var(--accent)',
    soft: 'var(--accent-soft)',
    summary: 'Pulls from sources on a cadence. Mirrors raw, masks PII, lineage stamps.',
  },
  transformer: {
    key: 'transformer',
    name: 'Transformer',
    role: 'Bronze → Silver → Gold pipelines',
    icon: 'wand',
    color: 'var(--semantic)',
    soft: 'var(--semantic-soft)',
    summary: 'Dedup, type-cast, standardise. Builds dims, facts, aggregates with reviewer gates.',
  },
  reasoner: {
    key: 'reasoner',
    name: 'Reasoner',
    role: 'Semantic models + entity graph',
    icon: 'schema',
    color: 'var(--gold)',
    soft: 'var(--gold-soft)',
    summary: 'Builds the semantic layer and entity resolution graph for natural-language analytics.',
  },
  operator: {
    key: 'operator',
    name: 'Operator',
    role: 'DQ, drift, perf, recommendations',
    icon: 'pulse',
    color: '#3F8F3F',
    soft: 'rgba(63,143,63,0.10)',
    summary: 'Watches data quality, schema drift, and SQL perf. Recommends new transforms when needed.',
  },
  governer: {
    key: 'governer',
    name: 'Governer',
    role: 'Policy + compliance enforcement',
    icon: 'shield',
    color: '#B07A1F',
    soft: 'rgba(176,122,31,0.10)',
    summary: 'Enforces masking, retention, access policies, and audit trails. Blocks promotions that violate policy.',
  },
};

export const AGENT_ORDER = ['ingestor', 'transformer', 'reasoner', 'operator', 'governer'];

// Sub-agent (builder + reviewer) pairs per medallion sub-layer.
export const SUB_AGENTS = {
  bronze: {
    builder: 'raw-landing-agent',
    reviewer: 'raw-landing-reviewer-agent',
    label: 'Bronze landing',
    parent: 'ingestor',
  },
  s1: {
    builder: 'dedup-builder-agent',
    reviewer: 'dedup-reviewer-agent',
    label: 'Silver S1 · Deduplication',
    parent: 'transformer',
  },
  s2: {
    builder: 'type-cast-builder-agent',
    reviewer: 'type-cast-reviewer-agent',
    label: 'Silver S2 · Type-cast',
    parent: 'transformer',
  },
  s3: {
    builder: 'standardisation-builder-agent',
    reviewer: 'standardisation-reviewer-agent',
    label: 'Silver S3 · Standardisation',
    parent: 'transformer',
  },
  g1Dim: {
    builder: 'dimension-builder-agent',
    reviewer: 'dimension-reviewer-agent',
    label: 'Gold G1 · Dimensions',
    parent: 'transformer',
  },
  g1Fact: {
    builder: 'fact-builder-agent',
    reviewer: 'fact-reviewer-agent',
    label: 'Gold G1 · Facts',
    parent: 'transformer',
  },
  g2: {
    builder: 'aggregation-builder-agent',
    reviewer: 'aggregation-reviewer-agent',
    label: 'Gold G2 · Aggregations',
    parent: 'transformer',
  },
  materialisation: {
    builder: 'materialisation-builder-agent',
    reviewer: 'materialisation-reviewer-agent',
    label: 'Materialisation',
    parent: 'operator',
  },
};

// The 7-point reviewer checklist (from the agent governance spec).
export const REVIEWER_CHECKLIST = [
  { id: 'contract', label: 'View contract', desc: 'All columns from upstream contract present and correctly named' },
  { id: 'lineage',  label: 'Lineage passthrough', desc: '_ingested_at, _source, _batch_id, _ingestion_date unchanged' },
  { id: 'quarantine', label: 'Quarantine coverage', desc: 'Every failure mode has a quarantine route' },
  { id: 'noBleed',  label: 'No logic bleed', desc: 'View applies only its sub-layer\u2019s logic' },
  { id: 'naming',   label: 'Naming convention', desc: '{layer}.{domain}_{entity}_{qualifier}' },
  { id: 'metadata', label: 'Metadata columns', desc: 'Layer metadata columns added and populated' },
  { id: 'idempotency', label: 'Idempotency', desc: 'Re-running produces the same result' },
];

export const PII_CHECKLIST = {
  id: 'pii', label: 'PII + governance', desc: 'Platinum only \u2014 PII handled per domain policy; governance columns present',
};
