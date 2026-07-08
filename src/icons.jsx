import React from 'react'
import {
  House, Sun, Sunrise, Moon, ShowerHead, Package, Pill, ShoppingBag, HeartPulse, Heart,
  CalendarCheck, TrendingUp, Camera, NotebookPen, Settings, Droplets, Droplet, Bath, Brush,
  Palette, Dumbbell, Apple, GlassWater, ListChecks, Search, Timer, TriangleAlert, Flame, Star,
  Smile, SmilePlus, Frown, Meh, Angry, Laugh, Leaf, Thermometer, RefreshCw, CircleHelp,
  Stethoscope, FlaskConical, Download, Upload, Plus, Pencil, Check, X, ChevronUp, ChevronDown,
  Sparkles, Footprints, Bed, Zap, BatteryLow, BatteryMedium, BatteryFull, CircleCheck,
  Waves, Hand, ExternalLink, ArrowLeftRight, PersonStanding, Flower2, Book, Music, Scale,
  Eye, Salad, Utensils, Images, GitCompareArrows, Weight,
} from 'lucide-react'

// Single source of truth for every icon in the app. Names are kebab-case and
// stored in the DB for habits/steps; Icon falls back to rendering the raw
// string so legacy emoji data keeps working.
const MAP = {
  house: House, sun: Sun, sunrise: Sunrise, moon: Moon, 'shower-head': ShowerHead,
  package: Package, pill: Pill, 'shopping-bag': ShoppingBag, 'heart-pulse': HeartPulse,
  heart: Heart, 'calendar-check': CalendarCheck, 'trending-up': TrendingUp, camera: Camera,
  'notebook-pen': NotebookPen, settings: Settings, droplets: Droplets, droplet: Droplet,
  bath: Bath, brush: Brush, palette: Palette, dumbbell: Dumbbell, apple: Apple,
  'glass-water': GlassWater, 'list-checks': ListChecks, search: Search, timer: Timer,
  'triangle-alert': TriangleAlert, flame: Flame, star: Star, smile: Smile,
  'smile-plus': SmilePlus, frown: Frown, meh: Meh, angry: Angry, laugh: Laugh, leaf: Leaf,
  thermometer: Thermometer, 'refresh-cw': RefreshCw, 'circle-help': CircleHelp,
  stethoscope: Stethoscope, 'flask-conical': FlaskConical, download: Download, upload: Upload,
  plus: Plus, pencil: Pencil, check: Check, x: X, 'chevron-up': ChevronUp,
  'chevron-down': ChevronDown, sparkles: Sparkles, footprints: Footprints, bed: Bed, zap: Zap,
  'battery-low': BatteryLow, 'battery-medium': BatteryMedium, 'battery-full': BatteryFull,
  'circle-check': CircleCheck, waves: Waves, hand: Hand, 'external-link': ExternalLink,
  'arrow-left-right': ArrowLeftRight, 'person-standing': PersonStanding, 'flower-2': Flower2,
  book: Book, music: Music, scale: Scale, eye: Eye, salad: Salad, utensils: Utensils,
  images: Images, 'git-compare-arrows': GitCompareArrows, weight: Weight,
}

export function Icon({ name, size = 18, strokeWidth = 1.75, className = '', style }) {
  const C = MAP[name]
  if (!C) {
    // legacy emoji (or unknown name) — render as text so old data still shows
    return <span className={className} style={{ fontSize: Math.round(size * 0.9), lineHeight: 1, ...style }}>{name || '•'}</span>
  }
  return <C size={size} strokeWidth={strokeWidth} className={className} style={style} aria-hidden="true" />
}

// Tinted rounded container for an icon — the visual unit used across tiles,
// lists and headers. Tints: sage (default) | sand | blush | water | lav
export function IconBox({ name, tint = 'sage', size = 48, iconSize, className = '' }) {
  return (
    <span className={`icn-box t-${tint} ${className}`} style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}>
      <Icon name={name} size={iconSize || Math.round(size * 0.48)} />
    </span>
  )
}

// Curated choices for the habit / routine-step icon pickers
export const ICON_CHOICES = [
  'sunrise', 'sun', 'moon', 'sparkles', 'droplet', 'droplets', 'glass-water', 'waves',
  'bath', 'shower-head', 'brush', 'palette', 'pill', 'heart', 'dumbbell', 'person-standing',
  'footprints', 'flower-2', 'bed', 'leaf', 'apple', 'salad', 'book', 'music', 'timer',
  'camera', 'smile', 'zap', 'eye', 'hand',
]

export const CATEGORY_ICON = {
  Face: 'droplets', Body: 'bath', Hair: 'brush', Makeup: 'palette', Supplement: 'pill', Other: 'package',
}
