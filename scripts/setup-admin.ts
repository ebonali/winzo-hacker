import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_URL এবং SUPABASE_SERVICE_ROLE_KEY অবশ্যই .env ফাইলে থাকতে হবে।');
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL এবং ADMIN_PASSWORD অবশ্যই .env ফাইলে থাকতে হবে।');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`→ Supabase: ${SUPABASE_URL}`);
  console.log(`→ Admin email: ${ADMIN_EMAIL}`);

  // 1. check if user already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', ADMIN_EMAIL.trim())
    .maybeSingle();

  let userId: string;

  if (existing?.id) {
    userId = existing.id;
    console.log('ℹ  Admin user already exists, updating password + role...');

    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updateErr) {
      console.error('❌ Password update failed:', updateErr.message);
      process.exit(1);
    }
  } else {
    console.log('→ Creating admin auth user...');
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL.trim(),
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'System Admin' },
    });
    if (createErr || !created?.user) {
      console.error('❌ User creation failed:', createErr?.message);
      process.exit(1);
    }
    userId = created.user.id;

    // profile row is created by DB trigger, but ensure it exists
    await supabase
      .from('profiles')
      .upsert({ id: userId, email: ADMIN_EMAIL.trim(), name: 'System Admin', role: 'admin' }, { onConflict: 'id' });
  }

  // 2. make sure profile role = admin
  const { error: roleErr } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, email: ADMIN_EMAIL.trim(), name: 'System Admin', role: 'admin' },
      { onConflict: 'id' }
    );
  if (roleErr) {
    console.error('❌ Profile upsert failed:', roleErr.message);
    process.exit(1);
  }

  console.log('✅ Admin account ready!');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log('   এখন `npm run dev` চালিয়ে ওয়েবসাইটে এই অ্যাকাউন্টে লগইন করলেই এডমিন ড্যাশবোর্ড পাবেন।');
}

main();
