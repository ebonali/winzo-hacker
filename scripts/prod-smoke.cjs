// Production smoke test
const fs = require('fs');
const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach((l) => {
  const m = /^([A-Z_]+)="(.*)"\s*$/.exec(l.trim());
  if (m) env[m[1]] = m[2];
});

const BASE = 'https://winzo-hacker.vercel.app';

async function main() {
  // admin login via Supabase
  const auth = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: env.VITE_SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  }).then((r) => r.json());
  console.log('1. supabase login:', auth.access_token ? 'OK' : 'FAILED');

  const H = { Authorization: `Bearer ${auth.access_token}`, 'Content-Type': 'application/json' };

  // /api/me
  const me = await fetch(`${BASE}/api/me`, { headers: H }).then((r) => r.json());
  console.log('2. /api/me:', me.user?.email, '| role:', me.user?.role, '| hasAccess:', me.hasAccess);

  // admin stats
  const stats = await fetch(`${BASE}/api/admin/stats`, { headers: H }).then((r) => r.json());
  console.log('3. admin/stats:', JSON.stringify(stats).slice(0, 140));

  // chapter as admin
  const ch = await fetch(`${BASE}/api/book/chapter/1`, { headers: H });
  const chData = await ch.json();
  console.log('4. chapter 1:', ch.status, '| watermark:', chData.watermark?.email);

  // zini create without login -> should be 401
  const zini = await fetch(`${BASE}/api/payment/zinipay/create`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  console.log('5. zini create no-auth:', zini.status, '(expect 401)');
}

main().catch((e) => { console.error('ERR:', e.message); process.exit(1); });
