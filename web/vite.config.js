import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works on GitHub Pages project sites
// (user.github.io/<repo>/) and on custom domains without changes.
export default defineConfig({
  plugins: [react()],
  base: './',
})
