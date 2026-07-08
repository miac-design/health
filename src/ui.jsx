import React, { useRef, useState } from 'react'
import { readImageFile, CATEGORY_EMOJI } from './utils'

export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function Seg({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o} type="button" className={value === o ? 'active' : ''} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}

export function Chips({ options, value, onChange, allLabel }) {
  return (
    <div className="chips">
      {allLabel != null && (
        <button className={`chip ${value === null ? 'active' : ''}`} onClick={() => onChange(null)}>{allLabel}</button>
      )}
      {options.map(o => (
        <button key={o} className={`chip ${value === o ? 'active' : ''}`} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  )
}

export function Stars({ value = 0, onChange, readonly }) {
  return (
    <div className={`star-row ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          className={n <= value ? 'on' : ''}
          onClick={readonly ? undefined : () => onChange(n === value ? 0 : n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >⭐</button>
      ))}
    </div>
  )
}

export function Stepper({ value, onChange, min = 0, max = 99, step = 1, suffix = '' }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}>−</button>
      <span className="val">{value}{suffix}</span>
      <button type="button" onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}>+</button>
    </div>
  )
}

const SCALE_FACES = ['😞', '😕', '😐', '🙂', '😄']
export function Scale({ value, onChange, faces = SCALE_FACES }) {
  return (
    <div className="scale">
      {faces.map((f, i) => (
        <button key={i} type="button" className={value === i + 1 ? 'active' : ''}
          onClick={() => onChange(value === i + 1 ? null : i + 1)} aria-label={`${i + 1} of 5`}>
          {f}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={!!on} aria-label={label} />
  )
}

export function PhotoInput({ value, onChange, label = 'Add photo' }) {
  const ref = useRef()
  return (
    <div className="photo-input" onClick={() => ref.current.click()} role="button" tabIndex={0}>
      {value ? <img src={value} alt="" /> : <><span style={{ fontSize: 26 }}>📷</span>{label}</>}
      <input
        ref={ref} type="file" accept="image/*" hidden
        onChange={async e => {
          const f = e.target.files[0]
          if (f) onChange(await readImageFile(f))
          e.target.value = ''
        }}
      />
    </div>
  )
}

export function ProductThumb({ product, size = 62, radius = 16, emoji }) {
  const style = { width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }
  if (product?.photo) return <img src={product.photo} alt={product.name} style={style} />
  return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, background: 'linear-gradient(135deg, var(--sage-50), var(--sand))' }}>
      {emoji || CATEGORY_EMOJI[product?.category] || '🧴'}
    </div>
  )
}

export function Empty({ emoji, title, children, action }) {
  return (
    <div className="empty">
      <div className="e-emoji">{emoji}</div>
      <div className="e-title">{title}</div>
      <p>{children}</p>
      {action}
    </div>
  )
}

/* ---------- charts (single-series, sage; hover tooltip per point) ---------- */

export function Sparkline({ points, labels, color = 'var(--chart-1)', height = 64, unit = '', goal }) {
  const [tip, setTip] = useState(null)
  const w = 100, h = 40, pad = 3
  const vals = points.map(p => (p == null ? null : Number(p)))
  const present = vals.filter(v => v != null)
  if (present.length === 0) {
    return <div className="tiny" style={{ padding: '18px 0' }}>No data yet — log a few days to see the trend.</div>
  }
  const min = Math.min(...present, goal ?? Infinity)
  const max = Math.max(...present, goal ?? -Infinity)
  const span = max - min || 1
  const x = i => pad + (i / Math.max(1, vals.length - 1)) * (w - pad * 2)
  const y = v => h - pad - ((v - min) / span) * (h - pad * 2)
  const segs = []
  let cur = []
  vals.forEach((v, i) => {
    if (v == null) { if (cur.length) segs.push(cur); cur = [] }
    else cur.push([x(i), y(v), i])
  })
  if (cur.length) segs.push(cur)

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="none">
        {goal != null && (
          <line x1={pad} x2={w - pad} y1={y(goal)} y2={y(goal)} stroke="var(--ink-3)" strokeWidth="0.5" strokeDasharray="2 2" />
        )}
        {segs.map((seg, si) => (
          <polyline key={si} fill="none" stroke={color} strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"
            points={seg.map(([px, py]) => `${px},${py}`).join(' ')} />
        ))}
        {segs.flat().map(([px, py, i]) => (
          <circle key={i} cx={px} cy={py} r={tip?.i === i ? 2.6 : 1.4} fill={color}
            stroke="var(--surface)" strokeWidth="0.8" style={{ cursor: 'pointer' }}
            onMouseEnter={() => setTip({ i, px, py })}
            onMouseLeave={() => setTip(null)}
            onClick={() => setTip(tip?.i === i ? null : { i, px, py })}
          />
        ))}
      </svg>
      {tip && (
        <div className="chart-tip" style={{ left: `${tip.px}%`, top: `${(tip.py / h) * 100}%` }}>
          {labels?.[tip.i] ? `${labels[tip.i]} · ` : ''}{vals[tip.i]}{unit}
        </div>
      )}
    </div>
  )
}

export function Ring({ value, max, size = 120, stroke = 11, color = 'var(--chart-1)', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, max ? value / max : 0))
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-deep)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}
