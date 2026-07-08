import React, { useRef } from 'react'
import { readImageFile } from './utils'
import { Icon, ICON_CHOICES, CATEGORY_ICON } from './icons'

export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
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
        ><Icon name="star" /></button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={!!on} aria-label={label} />
  )
}

export function IconPicker({ value, onChange }) {
  return (
    <div className="icon-picker">
      {ICON_CHOICES.map(n => (
        <button key={n} type="button" className={value === n ? 'active' : ''}
          onClick={() => onChange(n)} aria-label={n}>
          <Icon name={n} size={19} />
        </button>
      ))}
    </div>
  )
}

export function PhotoInput({ value, onChange, label = 'Add photo' }) {
  const ref = useRef()
  return (
    <div className="photo-input" onClick={() => ref.current.click()} role="button" tabIndex={0}>
      {value ? <img src={value} alt="" /> : <><Icon name="camera" size={26} />{label}</>}
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

export function ProductThumb({ product, size = 62, radius = 16, icon }) {
  const style = { width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }
  if (product?.photo) return <img src={product.photo} alt={product.name} style={style} />
  return (
    <div className="icn-box t-sage" style={{ ...style, background: 'linear-gradient(135deg, var(--sage-50), var(--sand))' }}>
      <Icon name={icon || CATEGORY_ICON[product?.category] || 'droplets'} size={Math.round(size * 0.42)} />
    </div>
  )
}

export function Empty({ icon, title, children, action }) {
  return (
    <div className="empty">
      <div className="e-icon"><Icon name={icon} size={36} /></div>
      <div className="e-title">{title}</div>
      <p>{children}</p>
      {action}
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
