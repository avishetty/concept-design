# Ingestion Agent Spec
**Version:** 1.0 — 2026-05-11
**Status:** Milestone 1 — approved for implementation

---

## 1. Purpose

Build an agentic ingestion system that takes a user request like:

> "Ingest data from our SQL Server into BigQuery hourly"

and produces a working, scheduled, validated ingestion pipeline — without a human writing connector code.

The system must:
- Understand the user's intent and collect what it needs
- Connect to source and destination
- Discover schema automatically
- Plan the right load strategy per table (full refresh vs incremental)
- Pull data in safe batches with overlap handling
- Evaluate data quality at every stage
- Write to the destination
- Generate and register an Airflow DAG
- Write authoritative metadata to the Canonical layer only after a successful run

---

## 2. Architecture

### Full workflow

```
USER (free text request)
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  PORTAL  — entry point, not the agent                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  GOAL AGENT                                       LLM: YES      │
│                                                                 │
│  Asks: source type → dest type → creds → schedule              │
│  Writes goal to Canonical (lifecycle_status: pending_discovery) │
│  Signals Orchestration Agent → Discovery                        │
│  Receives table list → presents to user → user picks max 5     │
│  Confirms goal → lifecycle_status: ready                        │
│                                                                 │
│  Rules: max 5 tables · table selection after Discovery only     │
│         never proceed without confirmed creds                   │
│         surface Planning uncertainty back to user               │
│         surface Eval action_required back to user               │
└────────────────────────┬────────────────────────────────────────┘
                         │  lifecycle_status: ready
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION AGENT                              LLM: NO       │
│                                                                 │
│  S1  Connectivity     SQLAlchemy SELECT 1 + dest ping           │
│         │                                                       │
│  S2  Discovery        SQLAlchemy Inspector → schema + row count │
│         │  ← returns table list to Goal Agent                   │
│         │  ← waits: lifecycle_status = ready                    │
│  S3  Planning         LLM reasons: strategy · watermark ·       │  ← LLM (bounded)
│         │             merge · batch size · offset               │
│  S4  Data Pull        keyset batches · 10K rows · 3x retry      │
│         │                                                       │
│  S5  Eval post-pull   row count · dup PKs · types · nulls       │  ← LLM on failure only
│         │             bad rows → quarantine · clean rows pass   │
│  S6  Raw Writer       MERGE/UPSERT · tiebreaker from Planning   │
│         │                                                       │
│  S7  Eval post-write  count match · PK complete · spot check    │  ← LLM on failure only
│         │                                                       │
│  S8  Canonical        provisional write (dag_registered)        │
│         │             NOT visible downstream yet                │
│  S9  DAG Generator    Jinja → Airflow REST API                  │
│         │                                                       │
│         │  first successful DAG run                             │
│         ▼                                                       │
│  S10 Promotion        lifecycle_status → confirmed              │
│                       downstream systems now see this pipeline  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
               AIRFLOW DAG (scheduled runs)
                         │
                         ▼
                    dbt run (transform)
```

### LLM usage at a glance

| Component | LLM | Reason |
|---|---|---|
| Goal Agent | YES | Interprets free text, asks questions, presents options |
| Orchestration Agent | NO | Deterministic execution |
| S3 Planning | YES (bounded) | Identifies watermark col, handles ambiguous schemas |
| S5/S7 Eval Diagnostic | YES (on failure only) | Diagnoses why rows were quarantined |
| All other skills | NO | Pure function — connect, pull, write, checkpoint, generate |

### Two agents only

Everything outside Goal Agent and Orchestration Agent is a **skill** — a deterministic function with no agent lifecycle.

There is no State Agent, no Connector Agent, no Ingestion Planning Agent, no separate Airflow Agent. All of those responsibilities are skills inside the Orchestration Agent.

---

## 3. Sources and Destinations

### Sources — SQL family first

All SQL sources use one connector family: **SQLAlchemy Core** with a driver registry per dialect.
Do not use SQLAlchemy ORM.

| Source | Dialect | Driver | Default Port |
|---|---|---|---|
| SQL Server | mssql | pyodbc | 1433 |
| MySQL | mysql | pymysql | 3306 |
| Postgres | postgresql | psycopg2 | 5432 |
| Oracle | oracle | oracledb | 1521 |

**MVP first: SQL Server** — real connections exist (Revio billing, ImageInc RDS).

Database-specific differences live in small adapters. Core pull/inspect logic is shared.

### Destinations — five, all built upfront

| Destination | Status | Notes |
|---|---|---|
| BigQuery | MVP — only active destination | |
| Snowflake | Built, inactive until org provides credentials | |
| Databricks | Built, inactive until org provides credentials | |
| Redshift | Built, inactive until org provides credentials | |
| S3 Iceberg | Built, inactive until org provides credentials | Apache Polaris as catalog — proper Iceberg format, not parquet files |

Rules:
- One destination per pipeline — no fan-out
- All five adapters are built from day one
- A destination activates only when the org provides credentials for it

---

## 4. Credentials

**Walt never stores credentials.**

Walt stores only:
- Key store type (GCP Secret Manager, AWS Secrets Manager, etc.)
- Reference path within that key store
- Access method

The Credential collection step asks the user for key store references — not the secrets themselves.

MVP: `secrets.env` is a dev-only shim. It is not the production pattern. Credential store integration is V2.

---

## 5. Goal Agent — Workflow

**LLM: YES**

The Goal Agent runs inside the portal. It is the only thing the user talks to.

```
1.  Receive free-text request from portal
2.  Ask: source type?
3.  Ask: destination type?
4.  Ask: key store reference for source credentials
5.  Ask: key store reference for destination credentials
6.  Ask: schedule (hourly / daily / one-time)?
7.  Write partial goal to Canonical → lifecycle_status: pending_discovery
8.  Signal Orchestration Agent to run Connectivity + Discovery
9.  Receive discovered table list back from Orchestration Agent
10. Present tables to user — user selects up to 5
11. Confirm full goal with user
12. Write complete goal to Canonical → lifecycle_status: ready
```

**Rules the Goal Agent enforces:**
- Source must exist in the source registry
- Destination must exist in the destination registry
- Max 5 tables per pipeline
- Table selection only happens after Discovery returns — user cannot pick tables before seeing schema
- Never proceed to Orchestration without confirmed credentials
- Surface Planning uncertainty (confidence: medium/low) back to the user for confirmation
- Surface Eval action_required=true back to the user immediately

---

## 6. Orchestration Agent — 10 Skills

**LLM: NO** (except where noted per skill)

The Orchestration Agent reads the goal from Canonical and executes skills in order.
It does not make decisions — it executes. Decisions live in Planning and Eval Diagnostic.

```
Read goal (lifecycle_status: ready)
    │
    ▼
Skill 1:  Connectivity
    │
    ▼
Skill 2:  Discovery
    │  → returns table list to Goal Agent
    │  → waits for lifecycle_status: ready with selected tables
    ▼
Skill 3:  Planning          (LLM: YES — bounded call)
    │
    ▼
Skill 4:  Data Pull
    │
    ▼
Skill 5:  Eval — post-pull  (LLM: YES for diagnostic only, on failure)
    │  clean rows only
    ▼
Skill 6:  Raw Writer
    │
    ▼
Skill 7:  Eval — post-write (LLM: YES for diagnostic only, on failure)
    │
    ▼
Skill 8:  Canonical         (provisional write — lifecycle_status: dag_registered)
    │
    ▼
Skill 9:  DAG Generator
    │
    │  first successful DAG run
    ▼
Skill 10: Promotion         (lifecycle_status: dag_registered → confirmed)
```

---

## 7. Skill Specifications

### Skill 1 — Connectivity

**LLM: NO**

- Test source: `SELECT 1` via SQLAlchemy
- Test destination: SDK ping (BigQuery client for MVP)
- Rule: fail fast — stop and return error if either side unreachable

---

### Skill 2 — Discovery

**LLM: NO**

- Tool: SQLAlchemy Inspector
- Returns per table: name, columns (name, data_type, nullable, is_primary_key), estimated row count
- Stores schema snapshot to `de_ing_schema_versions` for drift detection in future runs
- Returns full table list to Goal Agent for user selection

---

### Skill 3 — Planning

**LLM: YES**

This is one of two skills where LLM reasoning is genuinely needed. A rule tree cannot reliably identify watermark columns across arbitrary schemas, handle soft-delete patterns, or surface ambiguity appropriately.

**What Planning decides per table:**

| Decision | Description |
|---|---|
| sync_strategy | full_refresh / incremental_timestamp / incremental_id |
| watermark_col | which column drives incremental — LLM identifies from schema + sample rows |
| watermark_type | timestamp / integer_id / null |
| incremental_offset | how far back to overlap on each pull |
| batch_size | fixed 10K for MVP |
| max_rows_bootstrap | 5M limit for full refresh |
| dedup_key | PK column(s) for merge |
| initial_load_strategy | full_refresh / incremental_from_beginning |
| merge_strategy | how the destination resolves duplicate rows (see below) |
| merge_tiebreaker_col | column used to decide which version of a row wins |
| confidence | high / medium / low |
| warnings | list of things the user should know |
| blocked | true/false + reason if no viable strategy found |

**LLM receives:**
- Full column list from Discovery (names, types, nullable, PKs)
- Row count estimate
- 5-10 sample rows (values only — not bulk data)
- Existing watermark from `de_ing_watermarks` if this is a re-plan

**LLM reasoning examples:**
- "I see `modified_at` and `created_at` — `modified_at` is the better watermark as it captures updates not just inserts"
- "Row count is 200M — full refresh would exceed the 5M limit, forcing incremental. No clear watermark column found — surfacing this to user"
- "I see `deleted_at` — soft-delete pattern. Incremental must include a filter on this column to capture deletes"
- "Column name `ult_mod` — abbreviated Spanish for last modified. Selecting as watermark column."

**If confidence is medium or low** → Goal Agent surfaces the decision to the user for confirmation before proceeding.
**If blocked** → Goal Agent explains to the user, table cannot be ingested without resolution.

#### Full Refresh Rules

- Allowed only if row count ≤ 5,000,000 rows
- If row count > 5M → agent blocks table, surfaces to user: "This table has Xm rows. Full refresh is not safe. Recommend incremental — confirm or override."
- Batch size: 10,000 rows (fixed)
- Pagination: keyset — `WHERE pk > :last_batch_max_pk ORDER BY pk LIMIT 10000` (inclusive boundary)
- Overlap at boundary: each batch pulls from last batch's max PK inclusive — dedup handled by Raw Writer MERGE
- Merge strategy: **source_wins** — source always overwrites destination unconditionally

#### Incremental Rules

**Timestamp-based:**
```
pull_start = last_watermark - 5 minutes offset
pull_end   = now
next watermark = pull_end

Example:
  Run 1: pulls 13:00 → 14:00, watermark set to 14:00
  Run 2: pulls 13:55 → 15:00, watermark set to 15:00
  Run 3: pulls 14:55 → 16:00, watermark set to 16:00
```

**ID-based (append-only tables):**
```
pull_start = last_max_id - 100 rows offset
pull_end   = current MAX(pk) from source

Example:
  Run 1: pulls id 1 → 50,000,     watermark set to 50,000
  Run 2: pulls id 49,900 → 75,000, watermark set to 75,000
```

The overlap (5 minutes / 100 rows) exists to catch rows committed late due to clock skew, replication lag, or out-of-order inserts. Overlapping rows land in the destination twice and are resolved by the MERGE.

#### Merge Strategy — Who Wins

Raw Writer uses MERGE/UPSERT on the destination PK — never plain INSERT.

| Merge Strategy | When Used | Rule |
|---|---|---|
| latest_timestamp_wins | incremental_timestamp | UPDATE only if src.watermark_col > dest.watermark_col |
| insert_only | incremental_id (append-only) | INSERT only — skip existing PKs, rows never update |
| source_wins | full_refresh | UPDATE unconditionally — source is the snapshot |

**Planning output contract:**
```
sync_strategy:           full_refresh | incremental_timestamp | incremental_id
watermark_col:           column name (null if full_refresh)
watermark_type:          timestamp | integer_id | null
incremental_offset:      5 (minutes, timestamp) | 100 (rows, id)
batch_size:              10000
max_rows_bootstrap:      5000000
dedup_key:               PK column(s)
initial_load_strategy:   full_refresh | incremental_from_beginning
merge_strategy:          latest_timestamp_wins | insert_only | source_wins
merge_tiebreaker_col:    column name (null if insert_only or source_wins)
confidence:              high | medium | low
warnings:                list
blocked:                 true/false + reason
```

**Planning rules YAML (customer-overridable):**
```yaml
planning:
  max_rows_full_refresh: 5000000
  batch_size: 10000
  incremental_offset_minutes: 5
  incremental_offset_rows: 100
  default_strategy: full_refresh
```

---

### Skill 4 — Data Pull

**LLM: NO**

- Tool: SQLAlchemy Core — parameterised SELECT, never string-interpolated SQL
- Reads sync_strategy, watermark_col, batch_size, incremental_offset from Planning output
- Reads last watermark from `de_ing_watermarks`
- Pulls in batches of 10K rows using keyset pagination
- Retry: 3x on transient error, exponential backoff
- Passes each batch to Eval Skill 5 before writing

---

### Skill 5 — Eval (post-pull)

**LLM: NO for mechanical checks. LLM: YES for diagnostic reasoning — only on failure.**

The pipeline never stops on eval failure. Bad rows are quarantined. Clean rows proceed to Raw Writer.

#### Mechanical checks (every batch)

| Check | On failure |
|---|---|
| Row count vs source COUNT(*) | log |
| Duplicate PKs in batch | quarantine dupes |
| Type conformance — value fits declared type | quarantine violations |
| Null violations — null in non-nullable column | quarantine |
| Watermark continuity — gap between last watermark and first row | log warning, continue |
| Schema drift — new/dropped column or type change vs Discovery snapshot | flag, surface to user |

#### Diagnostic reasoning (fires only when rows are quarantined or drift detected)

LLM receives:
- Up to 100 quarantine row samples
- Distribution of quarantine_reason counts
- Schema diff vs last Discovery snapshot
- Last N run results from `de_ing_pipeline_runs`

LLM produces a diagnosis and action decision:
- Identifies root cause (schema change at source, source data artifact, type mismatch, etc.)
- Decides if action is required from user or if it is a known safe pattern

What happens with the diagnosis:

| Situation | Action |
|---|---|
| Root cause clear, no action needed | log diagnosis, continue |
| Schema drift detected | surface to Goal Agent → user notified, Discovery re-run recommended |
| >50% of rows quarantined | surface to Goal Agent → user must decide |
| Type mismatch in destination | surface to Goal Agent → flag for engineering, pipeline continues |
| Source data artifact (e.g. replication dupes) | log as known pattern, continue |

---

### Skill 6 — Raw Writer

**LLM: NO**

- Writes clean rows only (quarantine already removed bad rows)
- Uses MERGE/UPSERT — never plain INSERT
- Merge strategy and tiebreaker column come from Planning output
- Raw zone only — no transformations
- Schema-on-write; STRING fallback for unknown types
- MVP: BigQuery client

---

### Skill 7 — Eval (post-write)

**LLM: NO for mechanical checks. LLM: YES for diagnostic reasoning — only on failure.**

#### Mechanical checks

| Check | On failure |
|---|---|
| Row count match — rows written = rows sent to writer | log |
| PK completeness — every source PK exists in destination | log |
| Spot check — random 50 rows, compare every field source vs destination | log, quarantine mismatches |
| Null preservation — nulls from source are null in destination, not empty string | quarantine |

Diagnostic reasoning fires on failure with same logic as Skill 5.

#### Eval output contract (both passes)

```
post_pull_status:          pass | warn | quarantine
post_write_status:         pass | warn | quarantine
rows_pulled:               integer
rows_quarantined:          integer
rows_clean:                integer
quarantine_reasons:        {duplicate_pk: N, type_violation: N, null_violation: N, write_mismatch: N}
schema_drift_detected:     true/false
drift_detail:              list of changed columns
diagnosis:                 LLM-generated text (null if no issues)
action_required:           true/false
action_reason:             text (surfaced to Goal Agent if true)
```

**Eval rules YAML (customer-overridable):**
```yaml
eval:
  on_failure: quarantine
  row_count_match: 100              # 100% mandatory by default
  pk_completeness: 100
  spot_check_sample: 50
  type_conformance: quarantine
  quarantine_surface_threshold: 50  # surface to user if >50% of rows quarantined
```

---

### Skill 8 — Canonical (provisional)

**LLM: NO**

Writes all pipeline metadata to Postgres canonical tables. All writes at this stage are **provisional** — `lifecycle_status = dag_registered`. Downstream systems do not see these records until Skill 10 promotes them.

What gets written:

| Data | Table |
|---|---|
| Source tables + columns (name, type, nullable, is_primary_key, constraints) | de_ing_tables, de_ing_columns |
| Destination tables + columns | de_tables, de_columns |
| Pipeline name, DAG name, schedule, lifecycle_status, environment | de_ing_pipelines |
| Ingestion strategy per table (sync_strategy, watermark_col, merge_strategy) | de_ing_tables |
| Column mapping source → destination | de_column_lineage |
| FK relationships between source tables | de_ing_table_relationships |
| Run audit trail (rows_pulled, rows_written, rows_quarantined, eval_status) | de_ing_pipeline_runs |

---

### Skill 9 — DAG Generator

**LLM: NO**

Generates one DAG file per environment (dev / staging / prod). Same logic, different environment tag and Airflow connection IDs.

- Renders Airflow DAG from Jinja template per environment
- DAG naming convention: `{pipeline_name}_{dag_type}_{environment}` — e.g. `pipeline_1_ingestion_prod`
- DAG triggers dbt run on success (transformation side)
- Registers DAG via Airflow REST API
- Updates `de_ing_pipelines.lifecycle_status` → `dag_registered`
- Writes a row to `de_ing_dags` for each generated DAG (one per environment)

**Every generated DAG includes two callbacks baked in by Skill 9:**

`on_success_callback` — calls Promotion Skill with dag_id, pipeline_id, environment, run_id

`on_failure_callback` — calls Failure Skill with dag_id, pipeline_id, environment, error detail
- Updates `de_ing_dags.lifecycle_status` → `failed`
- Writes error to `de_ing_pipeline_runs`
- Surfaces to portal if environment = prod

**MVP rule — all DAGs must be generated by Skill 9:**

In MVP, only DAGs generated by Skill 9 are supported. Hand-written DAGs or DAGs from external tools deployed directly to Airflow are outside the system boundary. They will not have the callbacks, Promotion Skill will not fire, and canonical will not be updated.

This is intentional. External DAG support is a V2 concern. In MVP, Skill 9 is the only path to canonical truth. Any DAG that does not go through Skill 9 does not exist as far as canonical is concerned.

The callbacks work regardless of how the generated DAG file is deployed to Airflow — through the portal, a CI/CD pipeline, or manually. The deployment mechanism does not matter. What matters is that the DAG file was generated by Skill 9.

---

### Skill 10 — Promotion

**LLM: NO**

Triggered by Airflow's `on_success_callback` — not polled, not scheduled. Airflow calls it natively when a DAG completes successfully.

**Promotion logic:**

1. Always update `de_ing_dags.last_confirmed_at` → now (every environment)
2. Check environment:
   - If environment ≠ prod → log success, do NOT promote to confirmed, return
   - If environment = prod → continue
3. Update `de_ing_dags.lifecycle_status` → `confirmed` for this DAG
4. Check: are ALL DAGs in this pipeline now confirmed in prod?
   - YES → update `de_ing_pipelines.lifecycle_status` → `confirmed`
   - NO → pipeline stays at `dag_registered` until remaining DAGs confirm

**What each environment means:**

| Environment | DAG succeeds | Outcome |
|---|---|---|
| dev | yes | `last_confirmed_at` updated · `lifecycle_status` stays `dag_registered` |
| staging | yes | `last_confirmed_at` updated · `lifecycle_status` stays `dag_registered` |
| prod | yes | `lifecycle_status` → `confirmed` · pipeline check runs |
| any | no | `on_failure_callback` fires · `lifecycle_status` → `failed` · canonical unchanged |

**This is the gate. Nothing is canonical truth until lifecycle_status = confirmed in prod.**

**Why multi-environment is built from day one:**
Even when running a single environment today, the environment check costs nothing to include and prevents a painful retrofit when dev/staging/prod separation is needed. The field is already in the schema — the logic must reflect it correctly from the start.

---

## 8. Canonical Lifecycle — Critical Design

### The rules

1. Canonical is NOT final until `lifecycle_status = confirmed`.
2. `confirmed` is only set after a successful run **in production**.
3. Dev and staging successful runs update `last_confirmed_at` but do NOT promote to confirmed.
4. **The DAG is the unit of canonical ownership.** The pipeline is the container.
5. A pipeline is confirmed only when ALL its DAGs are confirmed in prod.

### Pipeline vs DAG lifecycle

A pipeline contains one or more DAGs. Each DAG owns a specific slice of the canonical layer:

| DAG type | Canonical slice it owns |
|---|---|
| ingestion | de_ing_tables, de_ing_columns, de_ing_watermarks, de_column_lineage (source→raw), de_ing_pipeline_runs |
| transformation | de_transformations, de_lineage (raw→conformed→gold), de_tables, de_columns (conformed side) |

When a DAG changes and runs successfully in prod — only that DAG's canonical slice is promoted.
The other DAGs' slices are untouched.
The pipeline promotes to confirmed only when every DAG in it is confirmed.

**Example:** Pipeline has ingestion DAG + dbt DAG. Team changes the dbt model and deploys.
- dbt DAG runs successfully in prod → dbt canonical slice confirmed
- Ingestion canonical slice unchanged — it was already confirmed from before
- Pipeline: both DAGs confirmed → pipeline confirmed

### State machine (de_ing_pipelines.lifecycle_status)

```
draft
  → pending_discovery     Goal Agent wrote partial goal
  → pending_confirmation  Discovery returned, user selecting tables
  → ready                 User confirmed, Orchestration Agent about to execute
  → dag_registered        DAGs created — provisional — engineers may still iterate
  → confirmed             ALL DAGs confirmed in prod — canonical is final
  → failed                Unrecoverable error
```

### State machine (de_ing_dags.lifecycle_status)

```
draft
  → dag_registered        DAG generated and registered in Airflow
  → confirmed             This DAG ran successfully in prod — its canonical slice is final
  → failed                This DAG failed
```

### Two-phase canonical writes

**Phase 1 — during pipeline build (dag_registered):**
- All canonical tables written with provisional data
- NOT visible to downstream systems

**Phase 2 — after successful prod DAG run (confirmed):**
- Promotion Skill fires per DAG
- When all DAGs confirmed → pipeline confirmed
- Downstream systems see this pipeline as authoritative

### Why this matters — answering the team's questions

| Question | Answer |
|---|---|
| I changed a dbt model and ran it. Is lineage updated? | Only after that dbt DAG runs successfully in prod. |
| Does the dbt change affect ingestion lineage? | No. Each DAG owns its own canonical slice independently. |
| When is end-to-end lineage accurate? | When all DAGs in the pipeline are confirmed in prod. |
| I ran successfully in dev. Is canonical updated? | No. Dev updates last_confirmed_at only. Prod run required to confirm. |
| The pipeline code changed. When does canonical reflect it? | After the changed DAG runs successfully in prod. Not before. |

Engineers iterate on non-prod. DAGs fail. Code changes. That is all expected. The pipeline stays at `dag_registered` through all iterations. Only a clean successful prod run confirms a DAG's slice. Provisional metadata never pollutes the canonical layer that other systems depend on.

**MVP boundary — no external DAG support:**
In MVP, canonical is only updated by DAGs generated through Skill 9. DAGs written by hand or deployed from external tools are outside the system. They have no callbacks, Promotion Skill will not fire, and canonical will not reflect them. External DAG ingestion into the canonical layer is a V2 concern.

---

## 9. dbt and Airflow

- **dbt**: transformation side only — all SQL written as dbt models. Ingestion does not use dbt.
- **Airflow**: MVP orchestration engine — schedules ingestion pulls AND triggers dbt runs after ingestion succeeds.
- DAG generation is Skill 9 — a deterministic template render, not an agent.

**Orchestration engine scope:**
MVP uses Airflow only. Future versions will integrate with additional orchestration engines (Prefect, Dagster, etc.). The DAG Generator skill is the only component that is Airflow-specific — all other skills are engine-agnostic. Swapping the orchestration engine in V2+ means replacing Skill 9 only.

---

## 10. MVP vs V2

### In MVP

- SQL Server as first source
- BigQuery as only active destination
- Single environment (no dev/staging/prod distinction)
- Max 5 tables per pipeline
- Full refresh and incremental (timestamp + ID-based)
- Eval with quarantine — pipeline never stops
- 100% match default, customer overrides via rules YAML
- Canonical lifecycle: provisional → confirmed
- Promotion Skill gates confirmed
- dbt + Airflow for scheduling
- **Airflow is the only orchestration engine in MVP**
- All 5 destination adapters built — inactive until credentials provided

### Not in MVP (V2)

- Additional orchestration engines (Prefect, Dagster, etc.) — only Skill 9 needs replacing
- Multi-environment promotion (dev → staging → prod)
- CI/CD pipelines for pipeline code
- Observability dashboards / pipeline health UI
- Governance layer (access control, data ownership, approval workflows)
- Credential store integration (GCP Secret Manager, AWS Secrets Manager)
- Data contracts + schema evolution handling
- Multiple destinations per pipeline
- CDC / binlog ingestion
- API connectors
- Schema drift automated recovery
- Snowflake external Iceberg tables

---

## 11. Rules YAML — Full Structure

Every customer pipeline can override defaults here. No code change needed.

```yaml
planning:
  max_rows_full_refresh: 5000000     # block full refresh above this row count
  batch_size: 10000
  incremental_offset_minutes: 5      # timestamp overlap window
  incremental_offset_rows: 100       # id-based overlap
  default_strategy: full_refresh     # fallback if Planning cannot determine

eval:
  on_failure: quarantine             # never stop — quarantine and continue
  row_count_match: 100               # 100% match required (ease per customer)
  pk_completeness: 100
  spot_check_sample: 50
  type_conformance: quarantine
  quarantine_surface_threshold: 50   # surface to user if >50% quarantined
```

---

## 12. Schema — de_ing_quarantine

All rows rejected by the Eval Skill land here. Pipeline never stops — bad rows are captured, clean rows proceed.

| Column | Type | Description |
|---|---|---|
| id | TEXT PK | |
| pipeline_run_id | TEXT FK | de_ing_pipeline_runs.id |
| pipeline_id | TEXT FK | de_ing_pipelines.id |
| table_name | TEXT | source table name |
| row_pk | TEXT | PK value of quarantined row (null if PK itself missing) |
| raw_row_json | TEXT | full source row serialised as JSON |
| quarantine_reason | TEXT | duplicate_pk / type_violation / null_violation / write_mismatch |
| quarantine_at | TIMESTAMPTZ | |

---

## 13. Success Criteria

The system succeeds when an engineer can say:

> "Ingest these 3 SQL Server tables into BigQuery hourly"

and the system can:

1. Ask for key store references for source and destination credentials
2. Connect to source and destination
3. Discover the full schema including PKs and column types
4. Present tables for selection (max 5)
5. Plan the right load strategy per table — including finding the watermark column via reasoning
6. Pull data in safe overlapping batches
7. Evaluate data quality — quarantine bad rows, never stop
8. Write clean rows to destination using the correct merge strategy
9. Write provisional metadata to Canonical
10. Generate and register an Airflow DAG
11. Promote canonical to confirmed after first successful DAG run
12. Surface schema drift or data issues to the user with a diagnosis

Without a human writing connector code, pull logic, or merge SQL.
