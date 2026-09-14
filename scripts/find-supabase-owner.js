import { createClient } from '@supabase/supabase-js';

const url = 'https://orlrgiwujnuyrdtxuwtk.supabase.co';
const secretKey = 'REVOKED_SUPABASE_SECRET_DO_NOT_USE';

const supabaseAdmin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function listUsersAndAdmins() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (data?.users) {
    console.log('List of registered users/emails in this Supabase project:');
    data.users.forEach(u => {
      console.log(`- Email: ${u.email}, CreatedAt: ${u.created_at}, Role: ${u.role}, LastSignIn: ${u.last_sign_in_at}`);
    });
  } else {
    console.log('Error listing users:', error);
  }
}

listUsersAndAdmins();
