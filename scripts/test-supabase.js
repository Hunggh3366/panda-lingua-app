import { createClient } from '@supabase/supabase-js';

const url = 'https://orlrgiwujnuyrdtxuwtk.supabase.co';
const key = 'sb_publishable_8WAx2OTqASLfGm12xDFq7Q_LNrwNVbE';
const secretKey = 'REVOKED_SUPABASE_SECRET_DO_NOT_USE';

async function test() {
  console.log('Testing anon key...');
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('vocabularies').select('id').limit(1);
  console.log('Anon key test response:', { data, error });

  console.log('Testing secret key...');
  const adminClient = createClient(url, secretKey);
  const { data: adminData, error: adminError } = await adminClient.from('vocabularies').select('id').limit(1);
  console.log('Admin key test response:', { adminData, adminError });
}

test();
