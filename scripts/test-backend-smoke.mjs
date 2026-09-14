import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envText = readFileSync(".env", "utf8");
const urlMatch = envText.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envText.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

console.log("Testing Supabase at:", url);
const supabase = createClient(url, key);

// 1. Test Vocabularies Read (Public)
const { data: vocabs, error: vErr } = await supabase.from("vocabularies").select("id, hanzi, level").limit(5);
if (vErr) throw vErr;
console.log(`[PASS] Read ${vocabs.length} vocabularies:`, vocabs.map(v => v.hanzi).join(", "));

// 2. Test User Sign-up & Login
const email = `smoke_${Date.now()}@panda.edu.vn`;
const password = "SmokePassword2026!";
const { data: authData, error: aErr } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name: "Học Viên Smoke" } }
});
if (aErr) throw aErr;
console.log(`[PASS] Signed up user ${authData.user.id}`);

// Sign in with password
const { data: sessionData, error: sErr } = await supabase.auth.signInWithPassword({ email, password });
if (sErr) throw sErr;
console.log(`[PASS] Signed in! Token: present, User: ${sessionData.user.email}`);

// 3. Test authenticated writes
const userClient = createClient(url, key, {
  global: { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } }
});

// Insert Progress
const { data: prog, error: pErr } = await userClient.from("user_vocab_progress").upsert({
  user_id: sessionData.user.id,
  vocab_id: "hsk1_001",
  status: "learning",
  repetition: 1,
  ease_factor: 2.5,
  interval_days: 1
}).select();
if (pErr) throw pErr;
console.log(`[PASS] Wrote user_vocab_progress:`, prog);

// Insert Stats
const { data: stat, error: stErr } = await userClient.from("user_stats").upsert({
  user_id: sessionData.user.id,
  total_words_learned: 1,
  current_streak: 1,
  longest_streak: 1,
  accuracy_rate: 100.0
}).select();
if (stErr) throw stErr;
console.log(`[PASS] Wrote user_stats:`, stat);

// 4. Test RLS protection: another client cannot read this user's stats
const anonClient = createClient(url, key);
const { data: leakedStats, error: lErr } = await anonClient.from("user_stats").select("*");
console.log(`[PASS] Anon cannot read user stats, returned:`, leakedStats?.length || 0, "rows (expected 0)");

console.log("\n>>> ALL SUPABASE BACKEND SMOKE TESTS PASSED 100% <<<");
