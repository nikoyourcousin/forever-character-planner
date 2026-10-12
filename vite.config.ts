import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Connect, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

const IMAGE = /\.(jpe?g|png|webp)$/i

function wallpaperNames(root: string) {
  const dir = path.resolve(root, 'public/wallpapers')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE.test(name))
    .sort((a, b) => a.localeCompare(b))
}

function sendCatalog(root: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url?.split('?')[0]
    if (url !== '/wallpapers.json') return next()
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(wallpaperNames(root)))
  }
}

function wallpaperCatalog(): Plugin {
  return {
    name: 'wallpaper-catalog',
    configureServer(server) {
      server.middlewares.use(sendCatalog(server.config.root))
    },
    configurePreviewServer(server) {
      server.middlewares.use(sendCatalog(server.config.root))
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'wallpapers.json',
        source: JSON.stringify(wallpaperNames(process.cwd())),
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), wallpaperCatalog()],
})
