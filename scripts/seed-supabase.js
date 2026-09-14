/**
 * Supabase Seed Script & SQL Generator
 * Reads HSK_VOCABULARY from src/data/hsk-vocab.js
 * 1. Generates supabase/seed.sql
 * 2. If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_KEY) are present in .env, seeds directly to Supabase
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { HSK_VOCABULARY } from '../src/data/hsk-vocab.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSqlString(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

// 1. Generate supabase/seed.sql
function generateSqlSeed() {
  const seedFilePath = path.join(__dirname, '../supabase/seed.sql');
  let sql = `-- ==============================================================================
-- PANDA LINGUA — HSK 1 & HSK 2 VOCABULARY SEED DATA (${HSK_VOCABULARY.length} items)
-- ==============================================================================

-- Clean existing data if needed (optional)
-- TRUNCATE TABLE public.vocabulary_examples, public.vocabularies CASCADE;

`;

  // Vocabularies
  sql += `-- Insert Vocabularies\n`;
  sql += `INSERT INTO public.vocabularies (id, hanzi, pinyin, meaning, level, category) VALUES\n`;

  const vocabValues = HSK_VOCABULARY.map(v => {
    return `  (${escapeSqlString(v.id)}, ${escapeSqlString(v.hanzi)}, ${escapeSqlString(v.pinyin)}, ${escapeSqlString(v.meaning)}, ${escapeSqlString(v.level)}, ${escapeSqlString(v.category || 'Cơ bản')})`;
  });

  sql += vocabValues.join(',\n') + '\n';
  sql += `ON CONFLICT (id) DO UPDATE SET\n`;
  sql += `  hanzi = EXCLUDED.hanzi,\n`;
  sql += `  pinyin = EXCLUDED.pinyin,\n`;
  sql += `  meaning = EXCLUDED.meaning,\n`;
  sql += `  level = EXCLUDED.level;\n\n`;

  // Vocabulary Examples
  sql += `-- Insert Vocabulary Examples\n`;
  const exampleValues = [];
  HSK_VOCABULARY.forEach(v => {
    if (v.example) {
      exampleValues.push(
        `  (${escapeSqlString(v.id)}, ${escapeSqlString(v.example.hanzi)}, ${escapeSqlString(v.example.pinyin)}, ${escapeSqlString(v.example.meaning)}, 1)`
      );
    }
  });

  if (exampleValues.length > 0) {
    sql += `INSERT INTO public.vocabulary_examples (vocab_id, example_hanzi, example_pinyin, example_meaning, order_index) VALUES\n`;
    sql += exampleValues.join(',\n') + ';\n';
  }

  fs.writeFileSync(seedFilePath, sql, 'utf-8');
  console.log(`✅ Generated supabase/seed.sql with ${HSK_VOCABULARY.length} vocabulary words and ${exampleValues.length} examples!`);
}

// 2. Direct Seed via Supabase API (if .env is configured)
async function seedDirectlyToSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    console.log('ℹ️  No valid Supabase credentials in .env. Skipping direct REST API upload.');
    console.log('👉 To seed via Supabase Dashboard, simply copy & paste supabase/seed.sql into the SQL Editor on supabase.com.');
    return;
  }

  console.log(`🚀 Connecting to Supabase at ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Prepare vocabularies payload
    const vocabPayload = HSK_VOCABULARY.map(v => ({
      id: v.id,
      hanzi: v.hanzi,
      pinyin: v.pinyin,
      meaning: v.meaning,
      level: v.level,
      category: v.category || 'Cơ bản'
    }));

    const { error: vocabError } = await supabase
      .from('vocabularies')
      .upsert(vocabPayload, { onConflict: 'id' });

    if (vocabError) {
      console.error('❌ Error seeding vocabularies:', vocabError.message);
      return;
    }
    console.log(`✅ Successfully seeded ${vocabPayload.length} vocabularies to Supabase!`);

    // 2. Prepare examples payload
    const examplesPayload = HSK_VOCABULARY.filter(v => v.example).map(v => ({
      vocab_id: v.id,
      example_hanzi: v.example.hanzi,
      example_pinyin: v.example.pinyin,
      example_meaning: v.example.meaning,
      order_index: 1
    }));

    // Clear old examples and re-insert
    await supabase.from('vocabulary_examples').delete().neq('id', 0);
    const { error: exampleError } = await supabase
      .from('vocabulary_examples')
      .insert(examplesPayload);

    if (exampleError) {
      console.error('❌ Error seeding examples:', exampleError.message);
      return;
    }
    console.log(`✅ Successfully seeded ${examplesPayload.length} examples to Supabase!`);

  } catch (err) {
    console.error('❌ Direct seed failed:', err.message);
  }
}

async function main() {
  generateSqlSeed();
  await seedDirectlyToSupabase();
}

main();
