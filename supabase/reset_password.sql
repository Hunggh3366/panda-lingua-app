-- Reset password cho tài khoản admin (hah4327@gmail.com)
-- Chạy lệnh này trong mục SQL Editor trên trang quản trị Supabase

UPDATE auth.users 
SET encrypted_password = crypt('hung1234@', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'hah4327@gmail.com';

INSERT INTO public.profiles (id, email, display_name, role, status, ai_enabled)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Admin Hùng'), 'admin', 'active', TRUE
FROM auth.users
WHERE email = 'hah4327@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', status = 'active', ai_enabled = TRUE;
