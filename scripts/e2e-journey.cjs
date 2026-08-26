// Full user journey e2e test
const fs = require('fs');
const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach((l) => {
  const m = /^([A-Z_]+)="(.*)"\s*$/.exec(l.trim());
  if (m) env[m[1]] = m[2];
});

const BASE = 'http://localhost:3000';
const SUPABASE_URL = env.SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

const { createClient } = require('@supabase/supabase-js');
const admin = createClient(SUPABASE_URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = `reader${Date.now()}@gmail.com`;
const TEST_PASS = 'readerPass12345';

async function main() {
  // 1. create a normal user (confirmed)
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASS,
    email_confirm: true,
    user_metadata: { name: 'Test Reader' },
  });
  if (cErr) throw new Error('create user: ' + cErr.message);
  console.log('1. test user created:', TEST_EMAIL);

  // 2. sign in as the user
  const auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
  }).then((r) => r.json());
  const userH = { Authorization: `Bearer ${auth.access_token}`, 'Content-Type': 'application/json' };
  console.log('2. user login: OK');

  // 3. user tries to read chapter -> should be 403
  const before = await fetch(`${BASE}/api/book/chapter/1`, { headers: userH });
  console.log('3. chapter before purchase:', before.status, '(expect 403)');

  // 4. user submits order
  const orderRes = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: userH,
    body: JSON.stringify({ txId: 'e2e-test-txid-abcdef1234567890' }),
  });
  const orderData = await orderRes.json();
  console.log('4. order submitted:', orderRes.status, '| status:', orderData.order?.status, '| id:', orderData.order?.id?.slice(0, 8));

  // 5. admin login
  const adminAuth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  }).then((r) => r.json());
  const adminH = { Authorization: `Bearer ${adminAuth.access_token}`, 'Content-Type': 'application/json' };

  // 6. admin sees pending order
  const orders = await fetch(`${BASE}/api/admin/orders`, { headers: adminH }).then((r) => r.json());
  const pending = orders.orders.find((o) => o.id === orderData.order.id);
  console.log('6. admin sees pending order:', !!pending, '| email:', pending?.email);

  // 7. admin approves
  const approve = await fetch(`${BASE}/api/admin/orders/${orderData.order.id}/approve`, {
    method: 'POST', headers: adminH,
  });
  console.log('7. admin approve:', approve.status);

  // 8. user reads chapter -> should be 200
  const after = await fetch(`${BASE}/api/book/chapter/2`, { headers: userH });
  const chData = await after.json();
  console.log('8. chapter after approval:', after.status, '(expect 200)');
  console.log('   watermark name:', chData.watermark?.name, '| order:', chData.watermark?.orderId?.slice(0, 8));

  // 9. admin revokes access
  const revoke = await fetch(`${BASE}/api/admin/access/revoke`, {
    method: 'POST', headers: adminH, body: JSON.stringify({ userId: created.user.id }),
  });
  console.log('9. admin revoke:', revoke.status);

  // 10. user tries again -> 403
  const revoked = await fetch(`${BASE}/api/book/chapter/2`, { headers: userH });
  console.log('10. chapter after revoke:', revoked.status, '(expect 403)');

  // cleanup: delete test user (cascades to orders/access)
  await admin.auth.admin.deleteUser(created.user.id);
  console.log('11. cleanup: test user deleted');

  console.log('\nALL E2E TESTS DONE');
}

main().catch((e) => {
  console.error('TEST ERROR:', e.message);
  process.exit(1);
});
