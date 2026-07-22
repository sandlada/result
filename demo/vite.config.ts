import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                home: 'index.html',
                core: 'core.html',
                async: 'async.html',
                option: 'option.html',
                reliability: 'reliability.html',
            },
        },
    },
});