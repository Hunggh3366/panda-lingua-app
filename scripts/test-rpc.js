import { createClient } from '@supabase/supabase-js';

const url = 'https://orlrgiwujnuyrdtxuwtk.supabase.co';
const serviceKey = 'REVOKED_SUPABASE_SECRET_DO_NOT_USE';

const supabase = createClient(url, serviceKey);

async function testRpc() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: 'SELECT 1;' });
    console.log('rpc exec_sql test:', { data, error });
  } catch (err) {
    console.log('rpc exec_sql error:', err.message);
  }
}

testRpc();
