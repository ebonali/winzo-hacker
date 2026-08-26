// Push env vars from local .env to Vercel (production)
const { execSync } = require('child_process');
const fs = require('fs');

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach((l) => {
  const m = /^([A-Z_]+)="(.*)"\s*$/.exec(l.trim());
  if (m) env[m[1]] = m[2];
});

const toPush = [
  ['SUPABASE_URL', env.SUPABASE_URL],
  ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY],
  ['VITE_SUPABASE_URL', env.VITE_SUPABASE_URL],
  ['VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY],
  ['ZINIPAY_API_KEY', env.ZINIPAY_API_KEY],
];

for (const [key, value] of toPush) {
  if (!value) {
    console.log('SKIP (empty):', key);
    continue;
  }
  try {
    execSync(`npx vercel env add ${key} production "${value}"`, { stdio: 'pipe' });
    console.log('ADDED:', key);
  } catch (e) {
    console.log('FAILED:', key, '-', String(e.stderr || e.message).slice(0, 150));
  }
}
console.log('DONE');
