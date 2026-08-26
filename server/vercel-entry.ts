import { createApp } from "./app";

// Vercel serverless entrypoint (bundled to api/index.js at build time).
// Express app is cached across warm invocations.
let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  return cachedApp(req, res);
}
