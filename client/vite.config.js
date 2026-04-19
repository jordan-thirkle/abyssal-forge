/**
 * @description Vite configuration for Abyssal Forge client
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, '../shared'),
        },
    },
    optimizeDeps: {
        exclude: ['@babylonjs/havok'],
    },
    server: {
        port: 5173,
    },
    build: {
        target: 'esnext',
        // Keep chunks reasonable for fast initial load
        rollupOptions: {
            output: {
                manualChunks: {
                    babylon: ['@babylonjs/core', '@babylonjs/materials', '@babylonjs/gui'],
                    react: ['react', 'react-dom'],
                    zustand: ['zustand'],
                },
            },
        },
    },
});
