import { createClient } from '@supabase/supabase-js';

const url = 'https://orlrgiwujnuyrdtxuwtk.supabase.co';
const serviceKey = 'REVOKED_SUPABASE_SECRET_DO_NOT_USE';
const anonKey = 'sb_publishable_8WAx2OTqASLfGm12xDFq7Q_LNrwNVbE';

const supabase = createClient(url, serviceKey);

async function inspectDb() {
  const commonTables = [
    'users', 'profiles', 'badminton_courts', 'courts', 'bookings',
    'vocabularies', 'vocabulary_examples', 'lessons', 'sessions',
    'daily_activities', 'user_stats', 'user_vocab_progress'
  ];

  console.log('Inspecting tables on ' + url + '...');
  for (const table of commonTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`✅ Table exists: "${table}" (sample count/data: ${JSON.stringify(data)})`);
    } else {
      console.log(`❌ Table "${table}": ${error.message} (code: ${error.code})`);
    }
  }
}

inspectDb();
