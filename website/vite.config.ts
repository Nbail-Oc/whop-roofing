import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { whop } from '@whop/cli/vite'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const whopServerEntry = {
  name: 'whop-tanstack-server-entry',
  writeBundle() {
    const serverOutput = resolve(process.cwd(), 'dist/server')
    const serverBundle = resolve(serverOutput, 'server.js')
    if (existsSync(serverBundle)) copyFileSync(serverBundle, resolve(serverOutput, 'index.js'))
  },
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact(), whopServerEntry, whop()],
})

export default config
