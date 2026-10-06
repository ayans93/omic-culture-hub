# OMIC Door Check-In

Standalone QR check-in app for OMIC Cultural Hub events (scanner + guest list,
backed by the "Final List" Google Sheet). Lives inside the `omic-culture-hub`
repo for convenience, but is otherwise completely independent of the main
`omic.spot` site:

- **Own Vite project.** `package.json`, `vite.config.js`, `node_modules`, and
  `dist` here are separate from the ones at the repo root. Building or
  deploying the main site never touches this folder, and vice versa.
- **Own Vercel project.** Deploy this folder as its *own* Vercel project
  (Root Directory: `checkin-app`), which gives it its own free
  `*.vercel.app` domain, separate from the omic.spot / omic-hub deployments.
- **Own Google Apps Script project.** `google-apps-script/Code.gs` here is a
  full, standalone backend -- it does not share a deployment with the main
  site's registration-form script. See the setup comment at the top of that
  file for the exact steps.

## Local development

```
cd checkin-app
npm install
npm run dev       # http://localhost:5174
```

## Deploying

1. Push changes to this repo as usual (staging/main branches).
2. In the Vercel dashboard, this folder's Vercel project auto-deploys from
   those same branches -- just with Root Directory set to `checkin-app`,
   so it only rebuilds when files in this folder change.
3. Backend changes go through the Apps Script project separately: paste the
   updated `Code.gs` into that project and redeploy (Manage deployments >
   Edit > New version), same as any Apps Script update.

## Configuration

`src/config.js` holds the one thing that ties this frontend to its backend:
`CHECKIN_ENDPOINT`, the Apps Script Web App `/exec` URL. Until that's filled
in, the app will show a "Check-in endpoint is not configured" error instead
of calling out to a placeholder URL.
