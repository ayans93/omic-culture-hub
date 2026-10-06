import { defineConfig } from 'vite';

// Standalone single-page app -- deliberately its own Vite project (own
// package.json, own node_modules, own Vercel project) so it can be built
// and deployed completely independently of the main omic.spot site that
// lives one directory up. See README.md in this folder for the full
// reasoning and deployment steps.
export default defineConfig({
  server: {
    port: 5174,
    open: false
  }
});
