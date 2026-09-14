import { createClient } from '@supabase/supabase-js';

const url = 'https://orlrgiwujnuyrdtxuwtk.supabase.co';
const key = 'REVOKED_SUPABASE_SECRET_DO_NOT_USE';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('vocabularies').select('id, hanzi, meaning').limit(5);
  if (!error && data) {
    console.log('🎉 DATABASE IS LIVE AND READY! Found vocabularies:', data);
  } else {
    console.log('⏳ Tables not yet created or error:', error?.message);
  }
}

check();
