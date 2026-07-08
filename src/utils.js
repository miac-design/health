export function todayStr(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export function fmtDate(iso, opts = { month: 'short', day: 'numeric' }) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts)
}

export function fmtDateLong(iso) {
  return fmtDate(iso, { weekday: 'long', month: 'long', day: 'numeric' })
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function lastNDates(n) {
  return Array.from({ length: n }, (_, i) => todayStr(i - (n - 1)))
}

export function daysUntil(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return Math.ceil((new Date(y, m - 1, d) - new Date()) / 86400000)
}

// Compress an uploaded image to a bounded-size JPEG data URL so photos
// stay small enough to live comfortably in IndexedDB and JSON exports.
export function readImageFile(file, maxDim = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Not a valid image'))
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function money(v) {
  if (v === '' || v == null || isNaN(Number(v))) return ''
  return Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
