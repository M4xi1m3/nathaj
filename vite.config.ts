import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    publicDir: 'static',
    test: {
        globals: true,
        environment: 'happy-dom',
    },
    base: '/nathaj/'
});
