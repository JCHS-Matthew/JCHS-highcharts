import { defineConfig } from 'vite'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/js/JCHS-highcharts.js',
      name: 'JCHSHighcharts',
      formats: ['iife'],
      fileName: () => 'JCHS-highcharts.js'
    },
    rollupOptions: {
      external: ['highcharts'],
      output: {
        globals: {
          highcharts: 'Highcharts'
        },
        assetFileNames: 'JCHS-highcharts[extname]'
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano({ preset: 'default' })
      ]
    }
  }
})
