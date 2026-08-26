import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { CHAPTERS_DATA } from '../server/bookData';

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`Seeding ${CHAPTERS_DATA.length} chapters...`);

  const rows = CHAPTERS_DATA.map((c) => ({
    number: c.number,
    title: c.title,
    subtitle: c.subtitle || '',
    read_time: c.readTime || '',
    key_takeaways: c.keyTakeaways || [],
    content: c.content || '',
    has_interactive_simulator: !!c.hasInteractiveSimulator,
  }));

  // upsert in chunks (by unique column "number")
  for (let i = 0; i < rows.length; i += 5) {
    const chunk = rows.slice(i, i + 5);
    const { error } = await supabase.from('chapters').upsert(chunk, { onConflict: 'number' });
    if (error) {
      console.error('Chunk failed:', error.message);
      process.exit(1);
    }
  }

  const { count } = await supabase.from('chapters').select('*', { count: 'exact', head: true });
  console.log(`Done. chapters in DB: ${count}`);
}

main();
