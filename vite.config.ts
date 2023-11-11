import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import preset_env from 'postcss-preset-env'
import autoprefixer from 'autoprefixer'

const basePath = fileURLToPath(new URL('./src', import.meta.url)),
  browserslist = ['last 3 versions, not dead, > 1%']

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': basePath } },
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
    preprocessorOptions: {
      scss: { additionalData: "@import '@/assets/mixins';" },
    },
    postcss: {
      plugins: [
        preset_env({ browsers: browserslist }),
        autoprefixer({ overrideBrowserslist: browserslist }),
      ],
    },
  },
})
