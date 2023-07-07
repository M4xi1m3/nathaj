import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    publicDir: 'static',
    base: './',
    resolve: {
        alias: {
            '@nathaj/simulator': fileURLToPath(new URL('../simulator/src/index.ts', import.meta.url))
        }
    }
});
