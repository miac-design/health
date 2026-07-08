import React, { useRef, useState } from 'react'
import { exportAll, importAll, clearAll } from '../db'
import { downloadJSON, todayStr } from '../utils'
import { Field } from '../ui'
import { Icon } from '../icons'

export default function Settings() {
  const fileRef = useRef()
  const [token, setToken] = useState(localStorage.getItem('todoistToken') || '')
  const [msg, setMsg] = useState(null)

  const doExport = async () => {
    downloadJSON(await exportAll(), `wellness-backup-${todayStr()}.json`)
    setMsg('Backup downloaded ✓')
  }

  const doImport = async e => {
    const f = e.target.files[0]
    if (!f) return
    try {
      const dump = JSON.parse(await f.text())
      if (!confirm('Importing replaces everything currently in the dashboard with this backup. Continue?')) return
      await importAll(dump)
      setMsg('Backup restored ✓')
    } catch {
      setMsg('That file could not be read as a backup.')
    }
    e.target.value = ''
  }

  const saveToken = () => {
    if (token.trim()) localStorage.setItem('todoistToken', token.trim())
    else localStorage.removeItem('todoistToken')
    setMsg(token.trim() ? 'Todoist connected ✓' : 'Todoist disconnected')
  }

  const wipe = async () => {
    if (!confirm('Delete ALL data — products, photos, logs, notes? This cannot be undone.')) return
    if (!confirm('Really sure? Consider downloading a backup first.')) return
    await clearAll()
    localStorage.clear()
    location.reload()
  }

  return (
    <>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Your data lives privately in this browser — back it up now and then</p>

      {msg && <div className="banner" style={{ marginBottom: 16 }}><Icon name="circle-check" size={18} style={{ flexShrink: 0 }} /><span>{msg}</span></div>}

      <div className="stack">
        <div className="card">
          <div className="row-flex" style={{ gap: 8, fontWeight: 650, marginBottom: 6 }}><Icon name="download" size={17} /> Backup & restore</div>
          <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
            Everything — including product and progress photos — is stored in this browser's local database.
            Download a backup regularly, and use it to move to a new phone or computer.
          </p>
          <div className="row-flex" style={{ flexWrap: 'wrap' }}>
            <button className="btn" onClick={doExport}>Download backup</button>
            <button className="btn secondary" onClick={() => fileRef.current.click()}>Restore from backup</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={doImport} />
          </div>
        </div>

        <div className="card">
          <div className="row-flex" style={{ gap: 8, fontWeight: 650, marginBottom: 6 }}><Icon name="circle-check" size={17} /> Todoist</div>
          <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
            Your habits live in Todoist under the <b>Wellness Habits</b> project. Paste your Todoist
            API token (Todoist → Settings → Integrations → Developer) and the sync goes both ways:
            checking a habit here completes the task there, completing a task there checks the habit
            here. The token stays on this device.
          </p>
          <Field label="API token">
            <input className="input" type="password" value={token} onChange={e => setToken(e.target.value)}
              placeholder="Paste token…" autoComplete="off" />
          </Field>
          <button className="btn secondary" onClick={saveToken}>{token ? 'Save token' : 'Disconnect'}</button>
        </div>

        <div className="card">
          <div className="row-flex" style={{ gap: 8, fontWeight: 650, marginBottom: 6 }}><Icon name="triangle-alert" size={17} /> Danger zone</div>
          <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>Erase everything and start fresh.</p>
          <button className="btn danger" onClick={wipe}>Delete all data</button>
        </div>
      </div>
    </>
  )
}
