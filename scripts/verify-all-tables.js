import { createClient } from '@supabase/supabase-js';

const url = 'https://avwhebqizfgicvylsfay.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2d2hlYnFpemZnaWN2eWxzZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTA5OTMsImV4cCI6MjEwMzQ4Njk5M30.6DOeJ91v3Gm6vfLZfIXMUlBUajcu0VxzvpoDS9elFy8';

const supabase = createClient(url, anonKey);

async function verifyAll() {
  console.log('🔍 Bắt đầu kiểm tra toàn bộ 8 bảng trên Supabase...');

  const tables = [
    'vocabularies',
    'vocabulary_examples',
    'user_vocab_progress',
    'srs_review_logs',
    'quiz_sessions',
    'quiz_details',
    'daily_activities',
    'user_stats'
  ];

  let successCount = 0;

  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(3);
      if (error) {
        console.error(`❌ Bảng "${t}":`, error.message);
      } else {
        console.log(`✅ Bảng "${t}": Đã tạo thành công! (Số bản ghi hiện có: ${data?.length})`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Bảng "${t}":`, err.message);
    }
  }

  // Check vocabularies with joined examples
  const { data: vocabWithExamples, error: joinErr } = await supabase
    .from('vocabularies')
    .select('id, hanzi, pinyin, meaning, level, vocabulary_examples(example_hanzi, example_pinyin, example_meaning)')
    .limit(3);

  if (!joinErr && vocabWithExamples) {
    console.log('✅ Truy vấn JOIN từ vựng kèm câu ví dụ thành công:', JSON.stringify(vocabWithExamples, null, 2));
  }

  // Test inserting a test user progress row & deleting it
  const testUserId = 'test_user_verify';
  const { error: insertErr } = await supabase.from('user_vocab_progress').upsert({
    user_id: testUserId,
    vocab_id: 'hsk1_001',
    status: 'learning',
    repetition: 1,
    ease_factor: 2.5,
    interval_days: 1
  });

  if (!insertErr) {
    console.log('✅ Kiểm tra ghi dữ liệu (INSERT/UPSERT) vào user_vocab_progress: THÀNH CÔNG!');
    // Clean up
    await supabase.from('user_vocab_progress').delete().eq('user_id', testUserId);
  } else {
    console.error('❌ Lỗi ghi user_vocab_progress:', insertErr.message);
  }

  console.log(`\n🎉 KẾT QUẢ: ${successCount}/${tables.length} bảng đã sẵn sàng 100%!`);
}

verifyAll();
