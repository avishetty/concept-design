// Walt — shared primitives: mascot, window chrome, icons, helpers.
// Loaded as Babel so it's transpiled inline. Exposes globals via window assign.

// ─────────────────────────────────────────────────────────────
//  Walt mascot — three stacked discs (bronze / silver / gold)
//  literal medallion-architecture character. Calm. Geometric.
//  Top disc has a face: two eyes + tiny mouth.
// ─────────────────────────────────────────────────────────────
function Walt({ size = 64, expression = 'calm', sleeping = false, thinking = false }) {
  // Three stacked discs — bronze (widest base), silver (mid), gold (head with face).
  // Slight stagger + tilt gives Walt a bit of personality without breaking the medallion metaphor.
  const palette = {
    bronze: 'var(--bronze)',
    silver: 'var(--silver)',
    gold:   'var(--gold)',
    face:   'var(--text-inverse)',
  };
  const w = size, h = size * 1.05;
  const eyesId = `walt-eyes-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <svg width={w} height={h} viewBox="0 0 48 50" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {thinking && (
        <style>{`
          @keyframes ${eyesId} { 0%,100% { transform: translateX(-1.2px); } 50% { transform: translateX(1.2px); } }
          .${eyesId} { animation: ${eyesId} 1.1s ease-in-out infinite; transform-origin: 24px 8px; transform-box: fill-box; }
        `}</style>
      )}
      <ellipse cx="24" cy="46" rx="20" ry="2.5" fill={palette.bronze} opacity="0.18"/>
      {/* Bronze base — widest, slightly tilted */}
      <g transform="translate(2 30) rotate(-2 22 6)">
        <rect x="0" y="0" width="44" height="13" rx="6.5" fill={palette.bronze}/>
        <rect x="0" y="0" width="44" height="3"  rx="3" fill="#fff" opacity="0.22"/>
      </g>
      {/* Silver mid — narrower than bronze, restrained highlight so it reads aged */}
      <g transform="translate(7 17) rotate(1.5 17 6)">
        <rect x="0" y="0" width="34" height="12" rx="6" fill={palette.silver}/>
        <rect x="0" y="0" width="34" height="2"  rx="2" fill="#fff" opacity="0.18"/>
      </g>
      {/* Gold head — smallest, tilted opposite for charm */}
      <g transform="translate(8 5) rotate(-1.5 16 6)">
        <rect x="0" y="0" width="32" height="13" rx="6.5" fill={palette.gold}/>
        <rect x="0" y="0" width="32" height="3"  rx="3" fill="#fff" opacity="0.45"/>
        <g className={thinking ? eyesId : ''}>
          {sleeping ? (
            <g stroke={palette.face} strokeWidth="1.1" strokeLinecap="round" fill="none">
              <path d="M11 7 L14 7" />
              <path d="M18 7 L21 7" />
            </g>
          ) : (
            <g fill={palette.face}>
              <circle cx="12" cy="7" r="1.6"/>
              <circle cx="20" cy="7" r="1.6"/>
            </g>
          )}
        </g>
        {!sleeping && (expression === 'happy'
          ? <path d="M14 10.5 Q16 12 18 10.5" stroke={palette.face} strokeWidth="0.9" fill="none" strokeLinecap="round"/>
          : <path d="M14.5 10.8 L17.5 10.8" stroke={palette.face} strokeWidth="0.9" strokeLinecap="round"/>
        )}
      </g>
    </svg>
  );
}

// Compact monogram — just the gold disc with the face.
function WaltMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect x="1" y="6" width="22" height="12" rx="6" fill="var(--gold)"/>
      <rect x="1" y="6" width="22" height="3"  rx="3" fill="#fff" opacity="0.45"/>
      <circle cx="9.5" cy="12" r="1.3" fill="var(--text-inverse)"/>
      <circle cx="14.5" cy="12" r="1.3" fill="var(--text-inverse)"/>
      <path d="M10 15 L14 15" stroke="var(--text-inverse)" strokeWidth="0.9" strokeLinecap="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  Desktop window chrome — Walt's own variant.
//  Minimal: traffic lights + title + segmented persona switch.
// ─────────────────────────────────────────────────────────────
function WaltWindow({ width = 1280, height = 800, title = 'Walt', persona, onPersona, children, footer, theme = 'dark', density = 'comfortable' }) {
  return (
    <div data-theme={theme} data-density={density} className="walt-root"
      style={{
        width, height, borderRadius: 14, overflow: 'hidden',
        background: 'var(--bg-app)',
        boxShadow: theme === 'dark'
          ? '0 0 0 1px rgba(255,255,255,0.06), 0 30px 90px rgba(0,0,0,0.55)'
          : '0 0 0 1px rgba(0,0,0,0.08), 0 30px 70px rgba(20,18,12,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
      <ChromeBar title={title} persona={persona} onPersona={onPersona} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>{children}</div>
      {footer}
    </div>
  );
}

function ChromeBar({ title, persona, onPersona }) {
  return (
    <div style={{
      height: 38, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--chrome-bg)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 12px',
      color: 'var(--chrome-text)',
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: '#ED6A5E' }}/>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: '#F4BF50' }}/>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: '#61C554' }}/>
      </div>
      <div style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 4px' }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <WaltMark size={18}/>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <div style={{ flex: 1 }}/>
      {persona && (
        <PersonaSwitch value={persona} onChange={onPersona}/>
      )}
      <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }}/>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)' }}>
        <Icon name="search" size={14}/>
        <span className="walt-mono" style={{ fontSize: 11 }}>⌘K</span>
      </div>
    </div>
  );
}

function PersonaSwitch({ value, onChange }) {
  const opts = [
    { key: 'engineer', label: 'Engineer', icon: 'terminal' },
    { key: 'analyst',  label: 'Analyst',  icon: 'chart' },
  ];
  return (
    <div style={{
      display: 'inline-flex', padding: 2,
      background: 'var(--bg-inset)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 999,
      height: 26,
    }}>
      {opts.map(o => {
        const active = value === o.key;
        return (
          <button key={o.key} onClick={() => onChange && onChange(o.key)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 22, padding: '0 10px', border: 0, cursor: 'pointer',
            background: active ? 'var(--bg-elevated)' : 'transparent',
            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: 999, fontSize: 12, fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.25), 0 0 0 1px var(--border-subtle) inset' : 'none',
          }}>
            <Icon name={o.icon} size={12}/> {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Icon — flat 1.5px stroke geometric icons. No emoji.
// ─────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.5 }) {
  const s = { display: 'inline-block', verticalAlign: '-2px', flexShrink: 0 };
  const stroke = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const fill = { fill: color };
  const paths = {
    search:   <g {...stroke}><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/></g>,
    terminal: <g {...stroke}><path d="M3.5 5 7 8 3.5 11"/><path d="M9 11 13 11"/><rect x="2" y="2.5" width="12" height="11" rx="2"/></g>,
    chart:    <g {...stroke}><path d="M2.5 13.5 5.5 9.5 8.5 11.5 13.5 5"/><path d="M2.5 13.5 13.5 13.5"/></g>,
    play:     <g {...fill}><path d="M5 3.5 12 8 5 12.5 z"/></g>,
    pause:    <g {...fill}><rect x="4" y="3.5" width="3" height="9" rx="0.5"/><rect x="9" y="3.5" width="3" height="9" rx="0.5"/></g>,
    plus:     <g {...stroke}><path d="M8 3.5 8 12.5"/><path d="M3.5 8 12.5 8"/></g>,
    check:    <g {...stroke}><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></g>,
    chevR:    <g {...stroke}><path d="M6 4 10 8 6 12"/></g>,
    chevD:    <g {...stroke}><path d="M4 6 8 10 12 6"/></g>,
    chevL:    <g {...stroke}><path d="M10 4 6 8 10 12"/></g>,
    folder:   <g {...stroke}><path d="M2 5 V12 a1 1 0 0 0 1 1 H13 a1 1 0 0 0 1-1 V6 a1 1 0 0 0-1-1 H8 L6.5 3.5 H3 a1 1 0 0 0-1 1 z"/></g>,
    db:       <g {...stroke}><ellipse cx="8" cy="4" rx="5" ry="1.6"/><path d="M3 4 V12 a5 1.6 0 0 0 10 0 V4"/><path d="M3 8 a5 1.6 0 0 0 10 0"/></g>,
    table:    <g {...stroke}><rect x="2.5" y="3" width="11" height="10" rx="1"/><path d="M2.5 6.5 H13.5"/><path d="M6 6.5 V13"/></g>,
    code:     <g {...stroke}><path d="M5 5 2 8 5 11"/><path d="M11 5 14 8 11 11"/><path d="M9.5 4 6.5 12"/></g>,
    sparkle:  <g {...stroke}><path d="M8 2 L8 14"/><path d="M2 8 L14 8"/><path d="M4 4 L12 12"/><path d="M12 4 L4 12"/></g>,
    flow:     <g {...stroke}><circle cx="3.5" cy="4" r="1.5"/><circle cx="12.5" cy="4" r="1.5"/><circle cx="8" cy="12" r="1.5"/><path d="M4.5 5 7 11"/><path d="M11.5 5 9 11"/></g>,
    settings: <g {...stroke}><circle cx="8" cy="8" r="2"/><path d="M8 1.5 V3 M8 13 V14.5 M1.5 8 H3 M13 8 H14.5 M3.5 3.5 L4.5 4.5 M11.5 11.5 L12.5 12.5 M3.5 12.5 L4.5 11.5 M11.5 4.5 L12.5 3.5"/></g>,
    bell:     <g {...stroke}><path d="M4 11 V7 a4 4 0 0 1 8 0 V11 L13 12 H3 z"/><path d="M6.5 13.5 a1.5 1.5 0 0 0 3 0"/></g>,
    user:     <g {...stroke}><circle cx="8" cy="6" r="2.5"/><path d="M3 13.5 a5 5 0 0 1 10 0"/></g>,
    arrowR:   <g {...stroke}><path d="M3 8 H13"/><path d="M9.5 4.5 13 8 9.5 11.5"/></g>,
    arrowUp:  <g {...stroke}><path d="M8 13 V3"/><path d="M4.5 6.5 8 3 11.5 6.5"/></g>,
    book:     <g {...stroke}><path d="M3 3 H7 a1.5 1.5 0 0 1 1.5 1.5 V13 a1.5 1.5 0 0 0-1.5-1.5 H3 z"/><path d="M13 3 H9 a1.5 1.5 0 0 0-1.5 1.5 V13 a1.5 1.5 0 0 1 1.5-1.5 H13 z"/></g>,
    branch:   <g {...stroke}><circle cx="4" cy="3.5" r="1.5"/><circle cx="4" cy="12.5" r="1.5"/><circle cx="12" cy="6" r="1.5"/><path d="M4 5 V11"/><path d="M4 8 H8 a3 3 0 0 0 3-3 V7.5"/></g>,
    pipe:     <g {...stroke}><rect x="1.5" y="6" width="13" height="4" rx="1.5"/><path d="M5 6 V4 M11 10 V12 M8 6 V4"/></g>,
    bolt:     <g {...stroke}><path d="M8.5 2 4 9 7.5 9 7 14 12 7 8.5 7 z"/></g>,
    eye:      <g {...stroke}><path d="M1.5 8 a6 4 0 0 1 13 0 a6 4 0 0 1-13 0 z"/><circle cx="8" cy="8" r="1.6"/></g>,
    git:      <g {...stroke}><circle cx="4" cy="8" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="12" r="1.5"/><path d="M4 6.5 a4 4 0 0 1 8-1.5"/><path d="M4 9.5 a4 4 0 0 0 8 1.5"/></g>,
    msg:      <g {...stroke}><path d="M2 4 a1 1 0 0 1 1-1 H13 a1 1 0 0 1 1 1 V11 a1 1 0 0 1-1 1 H7 L4 14 V12 H3 a1 1 0 0 1-1-1 z"/></g>,
    dots:     <g {...fill}><circle cx="3" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="13" cy="8" r="1"/></g>,
    moon:     <g {...stroke}><path d="M12.5 9.5 a5 5 0 0 1-7-7 a6 6 0 1 0 7 7 z"/></g>,
    sun:      <g {...stroke}><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5 V3 M8 13 V14.5 M1.5 8 H3 M13 8 H14.5 M3.5 3.5 L4.5 4.5 M11.5 11.5 L12.5 12.5 M3.5 12.5 L4.5 11.5 M11.5 4.5 L12.5 3.5"/></g>,
    schema:   <g {...stroke}><rect x="1.5" y="2.5" width="5" height="3" rx="0.5"/><rect x="9.5" y="2.5" width="5" height="3" rx="0.5"/><rect x="1.5" y="10.5" width="5" height="3" rx="0.5"/><rect x="9.5" y="10.5" width="5" height="3" rx="0.5"/><path d="M4 5.5 V10.5"/><path d="M12 5.5 V10.5"/><path d="M6.5 4 H9.5"/><path d="M6.5 12 H9.5"/></g>,
    notebook: <g {...stroke}><rect x="3" y="2" width="10" height="12" rx="1"/><path d="M5 5 H11"/><path d="M5 8 H9"/><path d="M5 11 H10"/><path d="M3 5 H4 M3 8 H4 M3 11 H4"/></g>,
    layers:   <g {...stroke}><path d="M8 2 L1.5 5 8 8 14.5 5 z"/><path d="M2 8 L8 11 14 8"/><path d="M2 11 L8 14 14 11"/></g>,
    rocket:   <g {...stroke}><path d="M10.5 2 a5 5 0 0 1 3.5 3.5 L9 11 L5 7 z"/><path d="M5 7 L3 9 L5 11 L7 9"/><path d="M9 11 L11 13"/></g>,
    download: <g {...stroke}><path d="M8 2.5 V10"/><path d="M4.5 7 8 10.5 11.5 7"/><path d="M2.5 13 H13.5"/></g>,
    minus:    <g {...stroke}><path d="M3.5 8 12.5 8"/></g>,
    x:        <g {...stroke}><path d="M4 4 12 12 M12 4 4 12"/></g>,
    refresh:  <g {...stroke}><path d="M13 8 a5 5 0 1 1-1.5-3.5"/><path d="M13 3 V5 H11"/></g>,
    star:     <g {...stroke}><path d="M8 2 9.7 6 14 6.3 10.7 9 11.7 13 8 11 4.3 13 5.3 9 2 6.3 6.3 6 z"/></g>,
    heart:    <g {...stroke}><path d="M8 13 C2 9 2 4.5 5 3.5 C6.5 3 8 4 8 5.5 C8 4 9.5 3 11 3.5 C14 4.5 14 9 8 13 z"/></g>,
    file:     <g {...stroke}><path d="M4 2 H9 L12 5 V13 a1 1 0 0 1-1 1 H4 a1 1 0 0 1-1-1 V3 a1 1 0 0 1 1-1 z"/><path d="M9 2 V5 H12"/></g>,
    clock:    <g {...stroke}><circle cx="8" cy="8" r="6"/><path d="M8 5 V8 L10 9.5"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={s} aria-hidden="true">
      {paths[name] || paths.dots}
    </svg>
  );
}

// Small spark sparkline (used for table previews)
function MiniSpark({ values = [3,5,4,7,6,9,8,11,9,12], color = 'var(--accent)', width = 60, height = 18 }) {
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 2) + 1;
    const y = height - 1 - ((v - min) / span) * (height - 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Mini bar series
function MiniBars({ values = [4,7,5,9,6,8,11,7,10,12], color = 'var(--accent)', width = 60, height = 18 }) {
  const max = Math.max(...values);
  const bw = (width - 2) / values.length - 1;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {values.map((v, i) => {
        const bh = (v / max) * (height - 2);
        return <rect key={i} x={1 + i * (bw + 1)} y={height - bh} width={bw} height={bh} rx="1" fill={color} opacity="0.85"/>;
      })}
    </svg>
  );
}

Object.assign(window, { Walt, WaltMark, WaltWindow, PersonaSwitch, Icon, MiniSpark, MiniBars });
