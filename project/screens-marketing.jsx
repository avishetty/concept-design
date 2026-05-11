// Marketing / foundations surfaces — landing page + design system foundations card.

// ─────────────────────────────────────────────────────────────
//  FOUNDATIONS — design system at-a-glance
// ─────────────────────────────────────────────────────────────
function FoundationsScreen({ theme = 'dark' }) {
  return (
    <div data-theme={theme} className="walt-root" style={{
      width: '100%', minHeight: '100%',
      background: 'var(--bg-app)',
      padding: '40px 48px 60px',
    }}>
      <FoundationsHeader/>
      <FoundationsGrid/>
    </div>
  );
}

function FoundationsHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 40 }}>
      <Walt size={88} expression="calm"/>
      <div style={{ flex: 1 }}>
        <div className="walt-mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 8 }}>walt-de · design system v0.1</div>
        <div className="walt-serif" style={{ fontSize: 64, lineHeight: 1, letterSpacing: -0.02, color: 'var(--text-primary)' }}>
          A calm system for a tireless engineer.
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 14, maxWidth: 720, lineHeight: 1.5 }}>
          Walt is an AI data engineer. The system has to serve two crowds — engineers in dense IDE-like flows, analysts in calm question-and-answer surfaces — without feeling like two different products.
          One palette, two themes. One type ramp, two densities. The medallion architecture lives in the color tokens.
        </div>
      </div>
    </div>
  );
}

function FoundationsGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Section title="Palette" subtitle="The three medallion tiers are first-class brand tokens. Status + semantic round it out.">
        <PaletteRow/>
      </Section>

      <Section title="Theming" subtitle="Engineer-dark by default. Analyst-light shares the same tokens; only --bg-* and --text-* swap.">
        <ThemePreview/>
      </Section>

      <Section title="Type" subtitle="Geist for UI, Geist Mono for code and tabular numerics, Instrument Serif for analyst-facing headings only.">
        <TypeRamp/>
      </Section>

      <Section title="Spacing & density" subtitle="A 4-step ramp. Compact density shaves ~20% off vertical metrics — analyst comfortable, engineer compact.">
        <SpacingRow/>
      </Section>

      <Section title="Components" subtitle="Each component is theme- and density-aware. Walt's status (running / paused / pending) is communicated through colour + a single soft pulse.">
        <ComponentRow/>
      </Section>

      <Section title="Walt — the mascot" subtitle="Three stacked discs literally embody the bronze / silver / gold medallion architecture. The gold disc is the face. Calm, geometric, never animated except for one slow blink.">
        <MascotRow/>
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="walt-card" style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="walt-serif" style={{ fontSize: 28, color: 'var(--text-primary)', letterSpacing: -0.01 }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 680, lineHeight: 1.5 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function PaletteRow() {
  const groups = [
    { name: 'Medallion', items: [
      { n: 'bronze', v: '--bronze', hex: '#C2733E' },
      { n: 'silver', v: '--silver', hex: '#B7BCC9' },
      { n: 'gold',   v: '--gold',   hex: '#E0AF68' },
    ]},
    { name: 'Surface · dark', items: [
      { n: 'bg-app',      v: '--bg-app',      hex: '#0B0D12' },
      { n: 'bg-surface',  v: '--bg-surface',  hex: '#11141B' },
      { n: 'bg-elevated', v: '--bg-elevated', hex: '#181C26' },
      { n: 'bg-inset',    v: '--bg-inset',    hex: '#0E1118' },
    ]},
    { name: 'Accent + semantic', items: [
      { n: 'accent',   v: '--accent',   hex: '#7AA2F7' },
      { n: 'semantic', v: '--semantic', hex: '#BB9AF7' },
    ]},
    { name: 'Status', items: [
      { n: 'ok',   v: '--status-ok',   hex: '#9ECE6A' },
      { n: 'warn', v: '--status-warn', hex: '#E0AF68' },
      { n: 'err',  v: '--status-err',  hex: '#F7768E' },
      { n: 'run',  v: '--status-run',  hex: '#7DCFFF' },
    ]},
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
      {groups.map((g, i) => (
        <div key={i}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 10 }}>{g.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {g.items.map((c, j) => (
              <div key={j} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr auto', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: c.hex, border: '1px solid rgba(255,255,255,0.06)' }}/>
                <div>
                  <div className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{c.n}</div>
                  <div className="walt-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.v}</div>
                </div>
                <div className="walt-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.hex}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ThemePreview() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {['dark', 'light'].map(theme => (
        <div key={theme} data-theme={theme} className="walt-root" style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-app)',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)' }}>
            <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={14} color="var(--text-muted)"/>
            <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
              {theme === 'dark' ? 'Engineer · dark' : 'Analyst · light'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
              {theme === 'dark' ? 'default · contrast 14.1 : 1' : 'contrast 13.6 : 1'}
            </span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="walt-chip bronze">bronze</span>
              <span className="walt-chip silver">silver</span>
              <span className="walt-chip gold">gold</span>
              <span className="walt-chip accent">accent</span>
              <span className="walt-chip semantic">semantic</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
              The body sentence at <span className="walt-mono">--text-primary</span>.
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Secondary copy. <span className="walt-mono" style={{ color: 'var(--text-muted)' }}>--text-muted</span> for metadata.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="walt-btn primary sm">Primary</button>
              <button className="walt-btn sm">Default</button>
              <button className="walt-btn ghost sm">Ghost</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TypeRamp() {
  const items = [
    { f: 'serif', s: 48, w: 400, t: 'Why did MRR dip in week 18?', l: 'Display · Instrument Serif 48/52', n: '--font-serif' },
    { f: 'sans',  s: 28, w: 600, t: 'Onboard Stripe payment events', l: 'H1 · Geist 28/34 600', n: '--font-sans' },
    { f: 'sans',  s: 18, w: 600, t: 'Conform bronze → silver: dim_payment_method', l: 'H2 · Geist 18/26 600' },
    { f: 'sans',  s: 14, w: 400, t: 'Walt drafted a plan and started on the bronze layer.', l: 'Body · Geist 14/20 400' },
    { f: 'sans',  s: 12, w: 400, t: '4,812 rows · 12.1s · 0 violations', l: 'Caption · Geist 12/16 400', muted: true },
    { f: 'mono',  s: 13, w: 400, t: "stg_stripe__payment_method_updated", l: 'Mono · Geist Mono 13/18', n: '--font-mono' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 260px', alignItems: 'baseline', gap: 24, paddingBottom: 14, borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 0 }}>
          <div className={`walt-${it.f}`} style={{ fontSize: it.s, fontWeight: it.w, color: it.muted ? 'var(--text-muted)' : 'var(--text-primary)', letterSpacing: it.s > 24 ? -0.01 : 0 }}>
            {it.t}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {it.l}{it.n && <span className="walt-mono" style={{ marginLeft: 8 }}>{it.n}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpacingRow() {
  const sp = [
    { name: '--s-2',  px: 8 },
    { name: '--s-3',  px: 12 },
    { name: '--s-4',  px: 16 },
    { name: '--s-5',  px: 20 },
    { name: '--s-6',  px: 24 },
    { name: '--s-7',  px: 32 },
    { name: '--s-8',  px: 40 },
    { name: '--s-9',  px: 56 },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {sp.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: s.px, height: 28, background: 'var(--accent)', opacity: 0.7, borderRadius: 4,
          }}/>
          <div>
            <div className="walt-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{s.name}</div>
            <div className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.px}px</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComponentRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      <CompCell label="Buttons">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="walt-btn primary">Run pipeline</button>
          <button className="walt-btn">Branch</button>
          <button className="walt-btn ghost">Cancel</button>
          <button className="walt-btn primary sm"><Icon name="arrowUp" size={12}/> Send</button>
        </div>
      </CompCell>
      <CompCell label="Status chips">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="walt-chip ok"><Icon name="check" size={10}/> succeeded</span>
          <span className="walt-chip warn">drift 6.4%</span>
          <span className="walt-chip err">permission denied</span>
          <span className="walt-chip accent"><Icon name="clock" size={10}/> running</span>
          <span className="walt-chip semantic"><Icon name="sparkle" size={10}/> Walt</span>
        </div>
      </CompCell>
      <CompCell label="Tier chips">
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="walt-chip bronze">BRONZE</span>
          <span className="walt-chip silver">SILVER</span>
          <span className="walt-chip gold">GOLD</span>
        </div>
      </CompCell>

      <CompCell label="Tool call" wide>
        <div className="walt-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
            <Icon name="chevD" size={12} color="var(--text-muted)"/>
            <Icon name="bolt" size={13} color="var(--semantic)"/>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Profile webhook payload</span>
            <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>profile_source(sample_size: 5000)</span>
            <div style={{ flex: 1 }}/>
            <span className="walt-chip ok"><Icon name="check" size={10}/> ok</span>
            <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>3.4s</span>
          </div>
        </div>
      </CompCell>

      <CompCell label="Persona switch">
        <PersonaSwitch value="engineer" onChange={() => {}}/>
      </CompCell>

      <CompCell label="Run state">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px 2px 6px', borderRadius: 999, background: 'rgba(125,207,255,0.10)', border: '1px solid rgba(125,207,255,0.30)', color: 'var(--status-run)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            <span className="walt-dot run"/> run
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px 2px 6px', borderRadius: 999, background: 'rgba(158,206,106,0.10)', border: '1px solid rgba(158,206,106,0.30)', color: 'var(--status-ok)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            <span className="walt-dot ok"/> ok
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px 2px 6px', borderRadius: 999, background: 'rgba(247,118,142,0.10)', border: '1px solid rgba(247,118,142,0.30)', color: 'var(--status-err)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            <span className="walt-dot err"/> err
          </span>
        </div>
      </CompCell>
    </div>
  );
}

function CompCell({ label, children, wide }) {
  return (
    <div style={{ gridColumn: wide ? 'span 2' : 'auto' }}>
      <div className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.06 }}>{label}</div>
      <div style={{ padding: 14, background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>{children}</div>
    </div>
  );
}

function MascotRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
      {[
        { e: 'calm',     l: 'calm · default' },
        { e: 'happy',    l: 'happy · ok' },
        { e: 'thinking', l: 'thinking · agent running', thinking: true },
        { e: 'calm',     l: 'sleeping · idle session', sleeping: true },
        { e: 'error',    l: 'error · needs you' },
      ].map((m, i) => (
        <div key={i} style={{ padding: 24, background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 12, textAlign: 'center' }}>
          <Walt size={84} expression={m.e} sleeping={m.sleeping} thinking={m.thinking}/>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>{m.l}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  LANDING PAGE
// ─────────────────────────────────────────────────────────────
function LandingPage({ theme = 'dark' }) {
  return (
    <div data-theme={theme} className="walt-root" style={{
      width: '100%', minHeight: '100%',
      background: 'var(--bg-app)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
    }}>
      <LandingNav/>
      <LandingHero/>
      <LandingMarquee/>
      <LandingMedallion/>
      <LandingTwoPersonas/>
      <LandingArtifacts/>
      <LandingFooter/>
    </div>
  );
}

function LandingNav() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '20px 56px',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <WaltMark size={22}/>
      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>walt</span>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', gap: 22, fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>Product</span>
        <span>For engineers</span>
        <span>For analysts</span>
        <span>Docs</span>
        <span>Pricing</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginLeft: 24 }}>
        <button className="walt-btn ghost sm">Sign in</button>
        <button className="walt-btn primary sm">Get the desktop app <Icon name="arrowR" size={12}/></button>
      </div>
    </div>
  );
}

function LandingHero() {
  return (
    <div style={{ padding: '80px 56px 60px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 60, alignItems: 'center' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 6px', borderRadius: 999, background: 'var(--semantic-soft)', color: 'var(--semantic)', fontSize: 12, fontWeight: 600, marginBottom: 28 }}>
          <Walt size={20}/> Meet Walt · v0.1 in private beta
        </div>
        <div className="walt-serif" style={{ fontSize: 84, lineHeight: 1, letterSpacing: -0.025, color: 'var(--text-primary)' }}>
          The data engineer<br/>
          that never sleeps,<br/>
          and never <span style={{ color: 'var(--gold)' }}>guesses</span>.
        </div>
        <div style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 24, maxWidth: 580 }}>
          Walt ingests, conforms, and ships data through your medallion architecture — and shows its work as live artifacts. Engineers ship in hours, not weeks. Analysts ask questions and get answers backed by the same gold tables.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 36 }}>
          <button className="walt-btn primary" style={{ height: 44, padding: '0 20px', fontSize: 14 }}>
            <Icon name="download" size={14}/> Download for macOS
          </button>
          <button className="walt-btn" style={{ height: 44, padding: '0 20px', fontSize: 14 }}>
            <Icon name="play" size={12}/> Watch a 90-second tour
          </button>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 28, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={12} color="var(--status-ok)"/> Snowflake · Databricks · BigQuery · Postgres</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={12} color="var(--status-ok)"/> SOC 2 Type II</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={12} color="var(--status-ok)"/> On-prem available</span>
        </div>
      </div>
      <HeroPanel/>
    </div>
  );
}

function HeroPanel() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(circle at 30% 30%, rgba(122,162,247,0.18), transparent 60%), radial-gradient(circle at 70% 70%, rgba(187,154,247,0.16), transparent 60%)', filter: 'blur(40px)' }}/>
      <div style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 22,
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <Walt size={36}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Onboard Stripe payment events</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Walt · 8 steps · 4 done · 1 awaiting you</div>
          </div>
          <span className="walt-chip semantic"><Icon name="sparkle" size={10}/> live</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <HeroStep state="ok"   label="Profile webhook payload"        m="profile_source · 3.4s"/>
          <HeroStep state="ok"   label="Generate bronze model"          m="emit_dbt_model · 0.8s" badge="bronze"/>
          <HeroStep state="ok"   label="Run dbt build"                  m="4,812 rows · 12.1s"/>
          <HeroStep state="pend" label="Conform to silver · waiting on you" m="natural key decision" badge="silver"/>
          <HeroStep state="idle" label="Update gold revenue model"      m="queued" badge="gold"/>
        </div>

        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-inset)', borderRadius: 10, border: '1px solid var(--border-subtle)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Walt size={20}/>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <span style={{ color: 'var(--text-primary)' }}>Bronze landed cleanly — 0 violations.</span> Should I treat <span className="walt-mono">idempotency_key</span> as part of the natural key, or de-dupe on <span className="walt-mono">(payment_method_id, updated_at)</span>?
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStep({ state, label, m, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px',
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8,
      opacity: state === 'idle' ? 0.6 : 1,
    }}>
      <StepDot state={state}/>
      <span style={{ fontSize: 12.5, color: 'var(--text-primary)', flex: 1 }}>{label}</span>
      {badge && <span className={`walt-chip ${badge}`} style={{ height: 18, padding: '0 6px', fontSize: 10, textTransform: 'uppercase' }}>{badge}</span>}
      <span className="walt-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m}</span>
    </div>
  );
}

function LandingMarquee() {
  const items = [
    'Snowflake', 'Databricks', 'BigQuery', 'Postgres', 'dbt', 'sqlmesh', 'Airflow', 'Stripe', 'Segment', 'Salesforce', 'Looker', 'Tableau', 'Hex', 'Mode',
  ];
  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '20px 0', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', gap: 56, justifyContent: 'center', overflow: 'hidden', flexWrap: 'wrap' }}>
        {items.map((it, i) => (
          <span key={i} className="walt-mono" style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 0.04 }}>{it}</span>
        ))}
      </div>
    </div>
  );
}

function LandingMedallion() {
  return (
    <div style={{ padding: '90px 56px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 720, marginBottom: 48 }}>
        <div className="walt-mono" style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 12 }}>The medallion, automated</div>
        <div className="walt-serif" style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: -0.02, color: 'var(--text-primary)' }}>
          One opinionated path from raw to revenue.
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.55 }}>
          Walt knows the layers. He profiles your source, drafts the bronze model from the inferred contract, conforms silver with the right surrogate keys, and only touches gold once you've signed off. Every step is a live artifact you can read, edit, and re-run.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        <TierCard tier="bronze" name="Bronze · raw, typed" lines={['Schema inferred from source contract', 'PII auto-tagged + masked', 'Append-only with audit columns']}/>
        <TierCard tier="silver" name="Silver · conformed" lines={['Surrogate keys + SCD2 history', "De-duped with Walt's reasoning", 'Tests Walt picks, you approve']}/>
        <TierCard tier="gold"   name="Gold · semantic"    lines={['Semantic measures + dimensions', 'Backs every dashboard + question', 'Freshness SLA enforced upstream']}/>
      </div>
    </div>
  );
}

function TierCard({ tier, name, lines }) {
  return (
    <div className="walt-card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 999, background: `var(--${tier})`, opacity: 0.10, filter: 'blur(20px)' }}/>
      <div style={{ position: 'relative' }}>
        <span className={`walt-chip ${tier}`} style={{ height: 26, padding: '0 12px', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.04 }}>{tier}</span>
        <div className="walt-serif" style={{ fontSize: 26, color: 'var(--text-primary)', marginTop: 20, letterSpacing: -0.01 }}>{name}</div>
        <ul style={{ margin: '20px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lines.map((l, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <Icon name="check" size={14} color={`var(--${tier})`}/> {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LandingTwoPersonas() {
  return (
    <div style={{ padding: '90px 56px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <PersonaCard
          eyebrow="For data engineers"
          title="Walt is your tireless co-engineer."
          body="Sessions, plans, artifacts, and tool calls — Walt does the toil. You make the calls. Branch into git, run dbt, audit with great-expectations, ship with sqlmesh. Walt remembers your conventions and follows them next time."
          bullets={['Plans you can read and edit', 'Live artifacts: code, schemas, lineage', 'Audit trail for every tool call', 'Works on top of your existing dbt project']}
          icon="terminal"
          accent="var(--accent)"
        />
        <PersonaCard
          eyebrow="For analysts + business"
          title="Ask. Walt answers, then shows the receipts."
          body="Walt queries the same gold tables your engineers maintain. Every answer comes with the SQL, the source rows, and a notebook you can fork. No more &lsquo;is this number right?&rsquo;."
          bullets={['Natural-language questions on governed data', 'Auto-generated dashboards + decks', 'Notebooks fork from any answer', 'Comments + collaboration with your DE team']}
          icon="chart"
          accent="var(--semantic)"
        />
      </div>
    </div>
  );
}

function PersonaCard({ eyebrow, title, body, bullets, icon, accent }) {
  return (
    <div className="walt-card" style={{ padding: 36, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
        color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={20}/>
      </div>
      <div className="walt-mono" style={{ fontSize: 11, color: accent, textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 20 }}>{eyebrow}</div>
      <div className="walt-serif" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: -0.015, color: 'var(--text-primary)', marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: 16 }}>{body}</div>
      <ul style={{ margin: '24px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--text-primary)' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, marginTop: 7, flexShrink: 0 }}/> {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LandingArtifacts() {
  return (
    <div style={{ padding: '90px 56px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 760, marginBottom: 40 }}>
        <div className="walt-mono" style={{ fontSize: 12, color: 'var(--semantic)', textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 12 }}>Artifacts, not just outputs</div>
        <div className="walt-serif" style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: -0.02, color: 'var(--text-primary)' }}>
          Everything Walt does becomes something you can read, edit, and ship.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { i: 'code',     n: 'SQL + dbt models', d: 'Generated from contracts. Editable, testable, version-controlled.' },
          { i: 'schema',   n: 'Semantic models',  d: 'Measures, dimensions, joins. The shared vocabulary.' },
          { i: 'chart',    n: 'Live charts',      d: 'Re-run against the latest gold table. Embed anywhere.' },
          { i: 'flow',     n: 'Pipeline DAGs',    d: 'Read upstream + downstream. Walt explains every node.' },
          { i: 'notebook', n: 'Notebooks',        d: 'Cells of SQL, prose, and charts. Forkable.' },
          { i: 'layers',   n: 'Slide decks',      d: 'Walt turns an answer into a presentation in one click.' },
          { i: 'file',     n: 'Reports',          d: 'Markdown reports with citations to source rows.' },
          { i: 'eye',      n: 'Lineage views',    d: 'Where a column came from. Where it gets used.' },
        ].map((a, i) => (
          <div key={i} className="walt-card" style={{ padding: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon name={a.i} size={16}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{a.n}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingFooter() {
  return (
    <div style={{ padding: '80px 56px 56px' }}>
      <div style={{
        padding: 48, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(122,162,247,0.10), rgba(187,154,247,0.10))',
        border: '1px solid var(--border-default)',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center',
      }}>
        <div>
          <div className="walt-serif" style={{ fontSize: 44, lineHeight: 1.1, letterSpacing: -0.015, color: 'var(--text-primary)' }}>
            Give your data team a tireless engineer.
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 12, maxWidth: 560 }}>
            Private beta · macOS, Windows, Linux. Web app coming soon. Bring your own warehouse.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="walt-btn primary" style={{ height: 48, padding: '0 22px', fontSize: 14 }}>
            <Icon name="download" size={14}/> Get the desktop app
          </button>
          <button className="walt-btn" style={{ height: 40 }}>Talk to the team</button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 40 }}>
        <WaltMark size={18}/>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2026 Walt · SOC 2 Type II · Made for the data platform you already have</span>
      </div>
    </div>
  );
}

Object.assign(window, { FoundationsScreen, LandingPage });
