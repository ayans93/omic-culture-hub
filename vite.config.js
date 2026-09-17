import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        events: resolve(__dirname, 'events.html'),
        nothingUnusual: resolve(__dirname, 'nothing-unusual.html'),
        artCompetition: resolve(__dirname, 'art-competition.html'),
        videoArtTalk: resolve(__dirname, 'video-art-talk.html'),
        cafe: resolve(__dirname, 'cafe.html'),
        shows: resolve(__dirname, 'shows.html'),
      }
    }
  }
});
