import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                home: 'index.html',
                error: 'error.html',
                'one-track': 'one-track.html',
                'two-tracks': 'two-tracks.html',
                'many-tracks': 'many-tracks.html',
            },
        },
    },
});
