import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the built app works from any static host or file path
export default defineConfig({
  plugins: [react()],
  base: './',
})
