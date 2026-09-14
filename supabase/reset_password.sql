-- Reset password cho tài khoản admin (hah4327@gmail.com)
-- Chạy lệnh này trong mục SQL Editor trên trang quản trị Supabase

UPDATE auth.users 
SET encrypted_password = crypt('hung1234@', gen_salt('bf')) 
WHERE email = 'hah4327@gmail.com';
