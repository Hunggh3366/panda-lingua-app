import { createClient } from '@supabase/supabase-js';

const url = 'https://avwhebqizfgicvylsfay.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2d2hlYnFpemZnaWN2eWxzZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTA5OTMsImV4cCI6MjEwMzQ4Njk5M30.6DOeJ91v3Gm6vfLZfIXMUlBUajcu0VxzvpoDS9elFy8';

const supabase = createClient(url, anonKey);

async function testConn() {
  console.log('Testing connection to new project at:', url);
  try {
    const { data, error } = await supabase.from('vocabularies').select('id').limit(1);
    console.log('Response from vocabularies table:', { data, error });
  } catch (err) {
    console.log('Error testing connection:', err);
  }
}

testConn();
