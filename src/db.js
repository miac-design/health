import Dexie from 'dexie'

export const db = new Dexie('wellnessOS')

db.version(1).stores({
  products: '++id, name, category, timeOfDay, createdAt',
  routineSteps: '++id, routine, order',
  routineChecks: '++id, [date+stepId], date',
  habits: '++id, name, order',
  habitLogs: '++id, [date+habitId], date',
  healthLogs: '++id, &date',
  progressPhotos: '++id, area, date',
  notes: '++id, category, date',
  wishlist: '++id, category',
})

export const CATEGORIES = ['Face', 'Body', 'Hair', 'Makeup', 'Supplement', 'Other']
export const NOTE_CATEGORIES = [
  'Routine changes',
  'Product reviews',
  'Questions',
  'Doctor recommendations',
  'Lab results',
  'Health notes',
]
export const PROGRESS_AREAS = ['Skin', 'Hair', 'Body']
export const SYMPTOMS = [
  'Headache', 'Cramps', 'Bloating', 'Breakout', 'Fatigue',
  'Nausea', 'Back pain', 'Insomnia', 'Anxiety', 'Cravings',
]

const seedSteps = [
  // morning
  { routine: 'morning', order: 1, title: 'Cleanser', emoji: '🫧', instructions: 'Massage onto damp skin for 60 seconds, rinse with lukewarm water.', quantity: 'Dime-sized amount', waitTime: '', area: 'Face', why: 'Removes overnight oil buildup and preps skin for actives.' },
  { routine: 'morning', order: 2, title: 'Treatment / Serum', emoji: '💧', instructions: 'Pat gently into skin, avoid the eye area.', quantity: '3–4 drops', waitTime: 'Wait 1–2 min to absorb', area: 'Face', why: 'Antioxidant protection and brightening for the day ahead.' },
  { routine: 'morning', order: 3, title: 'Moisturizer', emoji: '🧴', instructions: 'Smooth over face and neck in upward strokes.', quantity: 'Pea to nickel-sized', waitTime: '', area: 'Face', why: 'Locks in hydration and supports the skin barrier.' },
  { routine: 'morning', order: 4, title: 'Sunscreen', emoji: '☀️', instructions: 'Apply generously as the last skincare step. Reapply every 2h in the sun.', quantity: 'Two finger lengths', waitTime: 'Apply 15 min before sun', area: 'Face', why: 'The single most effective anti-aging and skin-health step.' },
  { routine: 'morning', order: 5, title: 'Supplements', emoji: '💊', instructions: 'Take your morning supplements — check the Supplement dashboard for doses.', quantity: 'As listed', waitTime: '', area: 'Body', why: 'Daily nutrient support.' },
  { routine: 'morning', order: 6, title: 'Big glass of water', emoji: '💧', instructions: 'Drink a full glass before coffee.', quantity: '300–500 ml', waitTime: '', area: 'Body', why: 'Rehydrates after sleep and kick-starts digestion.' },
  { routine: 'morning', order: 7, title: 'Morning walk', emoji: '🚶‍♀️', instructions: 'Get outside for daylight exposure.', quantity: '20–30 minutes', waitTime: '', area: 'Body', why: 'Daylight anchors your circadian rhythm and boosts mood.' },
  // evening
  { routine: 'evening', order: 1, title: 'Cleanse', emoji: '🫧', instructions: 'Double cleanse on makeup/SPF days: oil cleanser first, then gentle cleanser.', quantity: 'As needed', waitTime: '', area: 'Face', why: 'Removes sunscreen, makeup and pollution from the day.' },
  { routine: 'evening', order: 2, title: 'Treatment', emoji: '✨', instructions: 'Retinoid or exfoliant on scheduled nights only. Start 2–3× per week.', quantity: 'Pea-sized', waitTime: 'Wait 5 min on dry skin', area: 'Face', why: 'Overnight is when actives do their repair work.' },
  { routine: 'evening', order: 3, title: 'Eye cream', emoji: '👁️', instructions: 'Tap gently with ring finger along the orbital bone.', quantity: 'Rice grain per eye', waitTime: '', area: 'Face', why: 'The eye area is thinner and dries out first.' },
  { routine: 'evening', order: 4, title: 'Moisturizer / Night cream', emoji: '🌙', instructions: 'Slightly richer than your day cream. Include the neck.', quantity: 'Nickel-sized', waitTime: '', area: 'Face', why: 'Seals in treatments and repairs the barrier overnight.' },
  { routine: 'evening', order: 5, title: 'Lip balm', emoji: '💋', instructions: 'Generous layer before bed.', quantity: 'Thin layer', waitTime: '', area: 'Face', why: 'Prevents overnight moisture loss.' },
  { routine: 'evening', order: 6, title: 'Evening supplements', emoji: '💊', instructions: 'Magnesium & any night-time supplements, if applicable.', quantity: 'As listed', waitTime: '', area: 'Body', why: 'Some nutrients absorb better at night and support sleep.' },
  // shower
  { routine: 'shower', section: 'Hair', order: 1, title: 'Shampoo', emoji: '🧴', instructions: 'Focus on the scalp, massage 60s with fingertips — not nails.', quantity: 'Quarter-sized', waitTime: '', area: 'Hair', why: 'Cleansing the scalp, not the lengths, keeps hair healthy.' },
  { routine: 'shower', section: 'Hair', order: 2, title: 'Conditioner / Mask', emoji: '💆‍♀️', instructions: 'Mid-lengths to ends only. Use a mask instead 1× per week.', quantity: 'Two pumps', waitTime: 'Leave 2–3 min', area: 'Hair', why: 'Restores moisture and prevents breakage.' },
  { routine: 'shower', section: 'Body', order: 3, title: 'Body wash', emoji: '🛁', instructions: 'Lather with hands or a soft cloth, rinse well.', quantity: 'As needed', waitTime: '', area: 'Body', why: 'Gentle daily cleansing without stripping.' },
  { routine: 'shower', section: 'Body', order: 4, title: 'Body exfoliant', emoji: '🌾', instructions: 'Circular motions on rough areas — 1–2× per week only.', quantity: 'Small handful', waitTime: '', area: 'Body', why: 'Prevents ingrowns and keeps skin smooth.' },
  { routine: 'shower', section: 'Body', order: 5, title: 'Body lotion (after shower)', emoji: '🧴', instructions: 'Apply within 3 minutes of towelling off, while skin is damp.', quantity: 'Generous', waitTime: '', area: 'Body', why: 'Damp skin absorbs and holds moisture far better.' },
  { routine: 'shower', section: 'Feet', order: 6, title: 'Foot care', emoji: '🦶', instructions: 'Pumice or foot scrub on heels 1× per week, then rich foot cream.', quantity: 'As needed', waitTime: '', area: 'Feet', why: 'Prevents cracked heels and calluses.' },
  { routine: 'shower', section: 'Hands', order: 7, title: 'Hand cream', emoji: '🤲', instructions: 'Massage into hands and cuticles after every shower.', quantity: 'Pea-sized', waitTime: '', area: 'Hands', why: 'Hands show age first — they need daily care too.' },
  { routine: 'shower', section: 'Nails', order: 8, title: 'Cuticle oil', emoji: '💅', instructions: 'One drop per nail, massage in. File nails in one direction when dry.', quantity: '1 drop per nail', waitTime: '', area: 'Nails', why: 'Hydrated cuticles mean stronger, smoother nail growth.' },
]

const seedHabits = [
  { order: 1, name: 'Morning skincare', emoji: '🌞' },
  { order: 2, name: 'Evening skincare', emoji: '🌙' },
  { order: 3, name: 'Supplements', emoji: '💊' },
  { order: 4, name: 'Walking', emoji: '🚶‍♀️' },
  { order: 5, name: 'Exercise', emoji: '🏋️' },
  { order: 6, name: 'Stretching', emoji: '🤸‍♀️' },
  { order: 7, name: 'Meditation', emoji: '🧘‍♀️' },
  { order: 8, name: '8 glasses of water', emoji: '💧' },
  { order: 9, name: 'Sleep by 11pm', emoji: '😴' },
]

export async function seedIfEmpty() {
  const stepCount = await db.routineSteps.count()
  if (stepCount === 0) await db.routineSteps.bulkAdd(seedSteps)
  const habitCount = await db.habits.count()
  if (habitCount === 0) await db.habits.bulkAdd(seedHabits)
}

export async function exportAll() {
  const dump = { exportedAt: new Date().toISOString(), version: 1 }
  for (const table of db.tables) dump[table.name] = await table.toArray()
  return dump
}

export async function importAll(dump) {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      if (Array.isArray(dump[table.name])) {
        await table.clear()
        await table.bulkAdd(dump[table.name])
      }
    }
  })
}

export async function clearAll() {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear()
  })
}
