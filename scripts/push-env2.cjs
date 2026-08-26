// Push env vars to Vercel via stdin
const { spawnSync } = require('child_process');
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
  const r = spawnSync('npx', ['vercel', 'env', 'add', key, 'production'], {
    input: value + '\n',
    encoding: 'utf8',
    shell: true,
    timeout: 60000,
  });
  const out = ((r.stdout || '') + (r.stderr || '')).replace(/\s+/g, ' ').trim();
  console.log(key, '=>', out.slice(-120));
}
console.log('DONE');
