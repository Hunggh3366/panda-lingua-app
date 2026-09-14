const url = 'https://orlrgiwujnuyrdtxuwtk.supabase.co';
const serviceKey = 'REVOKED_SUPABASE_SECRET_DO_NOT_USE';

async function testEndpoints() {
  const query = 'CREATE TABLE IF NOT EXISTS public.test_ping (id int);';

  const endpoints = [
    { name: 'pg/query', url: `${url}/pg/query`, headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) },
    { name: 'rest/v1/query', url: `${url}/rest/v1/query`, headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) },
    { name: 'database/query', url: `https://api.supabase.com/v1/projects/orlrgiwujnuyrdtxuwtk/database/query`, headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) },
    { name: 'pg-admin', url: `${url}/pg`, headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: ep.headers,
        body: ep.body
      });
      const text = await res.text();
      console.log(`Endpoint [${ep.name}] (${res.status}):`, text.substring(0, 300));
    } catch (err) {
      console.log(`Endpoint [${ep.name}] error:`, err.message);
    }
  }
}

testEndpoints();
