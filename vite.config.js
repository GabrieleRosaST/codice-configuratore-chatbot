import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'a64b-188-12-155-170.ngrok-free.app'
    ]
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    target: 'esnext',
    minify: false, // Cambia a true in produzione!
    sourcemap: true,
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/react_app_entry.js'), // Metti qui il tuo entrypoint
      name: 'MoodleChatbotConfigurator',
      formats: ['amd'], // AMD PER MOODLE!
      fileName: () => 'react_app_bundle_entry.js',
    },
    rollupOptions: {
        external: [
          'core_ajax'
        ],
      output: {
        amd: {
          id: 'block_configuratore/react_app_bundle_entry', // ID che Moodle si aspetta!
        },
        globals: {
          core_ajax: 'M.core_ajax', // Mappa core_ajax alle globali di Moodle
        },
      },
    },
  },
})