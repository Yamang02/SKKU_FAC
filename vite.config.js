import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    root: 'src/frontend',
    build: {
        outDir: '../../dist',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: {
                main: 'src/frontend/main.js'
            }
        }
    },
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11']
        })
    ],
    server: {
        port: 5173
    }
});
