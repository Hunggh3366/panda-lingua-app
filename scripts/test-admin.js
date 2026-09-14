import { createClient } from '@supabase/supabase-js';

const url = 'https://orlrgiwujnuyrdtxuwtk.supabase.co';
const secretKey = 'REVOKED_SUPABASE_SECRET_DO_NOT_USE';

const supabaseAdmin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testAdmin() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 10 });
  console.log('List users test:', { userCount: data?.users?.length, error });
}

testAdmin();
