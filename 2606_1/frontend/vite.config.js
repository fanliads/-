import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { resolve } from 'path';
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia'],
            dts: 'src/auto-imports.d.ts',
        }),
        Components({
            dts: 'src/components.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules'))
                        return;
                    if (id.includes('/axios/') || id.includes('/dayjs/') || id.includes('/@vueuse/')) {
                        return 'utilities';
                    }
                    return 'vendor';
                },
            },
        },
    },
});
