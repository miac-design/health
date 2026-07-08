import React, { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, PROGRESS_AREAS } from '../db'
import { Modal, Field, Seg, Empty } from '../ui'
import { Icon } from '../icons'
import { todayStr, fmtDate, readImageFile } from '../utils'

function UploadForm({ area, onClose }) {
  const [rec, setRec] = useState({ area, date: todayStr(), notes: '', photo: '' })
  const save = async e => {
    e.preventDefault()
    if (!rec.photo) return
    await db.progressPhotos.add(rec)
    onClose()
  }
  return (
    <Modal title="Add progress photo" onClose={onClose}>
      <form onSubmit={save}>
        <Field label="Photo">
          <label className="photo-input" style={{ width: '100%', height: 200 }}>
            {rec.photo ? <img src={rec.photo} alt="" /> : <><Icon name="camera" size={30} />Tap to choose a photo</>}
            <input type="file" accept="image/*" hidden onChange={async e => {
              const f = e.target.files[0]
              if (f) setRec({ ...rec, photo: await readImageFile(f, 1200) })
            }} />
          </label>
        </Field>
        <div className="form-row">
          <Field label="Area">
            <Seg options={PROGRESS_AREAS} value={rec.area} onChange={v => setRec({ ...rec, area: v })} />
          </Field>
          <Field label="Date">
            <input className="input" type="date" max={todayStr()} value={rec.date}
              onChange={e => setRec({ ...rec, date: e.target.value })} />
          </Field>
        </div>
        <Field label="Notes — what's improving, what you changed">
          <textarea className="input" value={rec.notes} onChange={e => setRec({ ...rec, notes: e.target.value })} />
        </Field>
        <button className="btn" type="submit" style={{ width: '100%' }} disabled={!rec.photo}>Save photo</button>
      </form>
    </Modal>
  )
}

export default function Progress() {
  const [area, setArea] = useState('Skin')
  const [adding, setAdding] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [picked, setPicked] = useState([])
  const [viewing, setViewing] = useState(null)

  const photos = useLiveQuery(() => db.progressPhotos.where('area').equals(area).toArray(), [area]) || []
  const sorted = useMemo(() => [...photos].sort((a, b) => b.date.localeCompare(a.date)), [photos])
  const pickedPhotos = picked.map(id => photos.find(p => p.id === id)).filter(Boolean)

  const clickPhoto = p => {
    if (!compareMode) { setViewing(p); return }
    setPicked(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev.slice(-1), p.id])
  }

  return (
    <>
      <h1 className="page-title">Before & After</h1>
      <p className="page-sub">Progress is slow until you look back</p>

      <div className="spread" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <Seg options={PROGRESS_AREAS} value={area} onChange={v => { setArea(v); setPicked([]) }} />
        {sorted.length >= 2 && (
          <button className={`btn small ${compareMode ? '' : 'ghost'}`}
            onClick={() => { setCompareMode(!compareMode); setPicked([]) }}>
            {compareMode ? 'Exit compare' : <><Icon name="git-compare-arrows" size={13} /> Compare two</>}
          </button>
        )}
      </div>

      {compareMode && pickedPhotos.length === 2 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="compare">
            {[...pickedPhotos].sort((a, b) => a.date.localeCompare(b.date)).map((p, i) => (
              <figure key={p.id}>
                <img src={p.photo} alt="" />
                <figcaption>{i === 0 ? 'Before · ' : 'After · '}{fmtDate(p.date, { year: 'numeric', month: 'short', day: 'numeric' })}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
      {compareMode && pickedPhotos.length < 2 && (
        <div className="banner" style={{ marginBottom: 18 }}><Icon name="images" size={18} style={{ flexShrink: 0 }} /><span>Tap two photos to see them side by side.</span></div>
      )}

      {sorted.length === 0 ? (
        <Empty icon="camera" title={`No ${area.toLowerCase()} photos yet`}
          action={<button className="btn" onClick={() => setAdding(true)}>+ Add first photo</button>}>
          Take a photo in the same light and angle every couple of weeks — future you will thank you.
        </Empty>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {sorted.map(p => (
            <div key={p.id} className={`progress-photo-card ${picked.includes(p.id) ? 'selected' : ''}`}
              onClick={() => clickPhoto(p)}>
              <img src={p.photo} alt="" />
              <span className="pp-date">{fmtDate(p.date, { year: '2-digit', month: 'short', day: 'numeric' })}</span>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setAdding(true)} aria-label="Add photo"><Icon name="plus" size={26} /></button>

      {adding && <UploadForm area={area} onClose={() => setAdding(false)} />}
      {viewing && (
        <Modal title={fmtDate(viewing.date, { year: 'numeric', month: 'long', day: 'numeric' })} onClose={() => setViewing(null)}>
          <img src={viewing.photo} alt="" style={{ width: '100%', borderRadius: 16 }} />
          {viewing.notes && <p style={{ fontSize: 14.5 }}>{viewing.notes}</p>}
          <button className="btn danger" style={{ marginTop: 10 }} onClick={async () => {
            if (confirm('Delete this photo?')) { await db.progressPhotos.delete(viewing.id); setViewing(null) }
          }}>Delete photo</button>
        </Modal>
      )}
    </>
  )
}
