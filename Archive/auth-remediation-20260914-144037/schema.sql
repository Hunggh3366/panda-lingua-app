-- ==============================================================================
-- PANDA LINGUA (Gia sư từ vựng tiếng Trung) — SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. BẢNG DANH MỤC TỪ VỰNG (Vocabularies)
CREATE TABLE IF NOT EXISTS public.vocabularies (
    id VARCHAR(64) PRIMARY KEY,              -- vd: 'hsk1_001', 'hsk2_010'
    hanzi VARCHAR(32) NOT NULL,              -- Chữ Hán (vd: '你', '运动')
    pinyin VARCHAR(128) NOT NULL,            -- Phiên âm Pinyin (vd: 'nǐ', 'yùndòng')
    sino_vietnamese VARCHAR(128),            -- Âm Hán Việt (vd: 'Nhĩ', 'Vận Động')
    meaning TEXT NOT NULL,                   -- Nghĩa tiếng Việt
    level VARCHAR(16) NOT NULL DEFAULT 'HSK1',-- 'HSK1', 'HSK2', 'HSK3', ...
    category VARCHAR(64),                    -- Chủ đề (vd: 'Chào hỏi', 'Gia đình')
    audio_url TEXT,                          -- Đường dẫn file âm thanh (nếu có)
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BẢNG CÂU VÍ DỤ MINH HỌA (Vocabulary Examples)
CREATE TABLE IF NOT EXISTS public.vocabulary_examples (
    id BIGSERIAL PRIMARY KEY,
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    example_hanzi TEXT NOT NULL,             -- Chữ Hán ví dụ
    example_pinyin TEXT NOT NULL,            -- Pinyin ví dụ
    example_meaning TEXT NOT NULL,           -- Dịch nghĩa tiếng Việt ví dụ
    audio_url TEXT,
    order_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. BẢNG TIẾN ĐỘ HỌC TẬP VÀ THUẬT TOÁN SRS (User Vocabulary Progress)
CREATE TABLE IF NOT EXISTS public.user_vocab_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,                   -- ID người dùng (UUID hoặc Guest Client ID)
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'new', -- 'new', 'learning', 'mastered'
    repetition INT NOT NULL DEFAULT 0,       -- Số lần nhớ liên tiếp thành công
    ease_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.50, -- Hệ số ghi nhớ SM-2
    interval_days INT NOT NULL DEFAULT 0,    -- Khoảng cách ngày đến lần ôn tới
    last_reviewed_at TIMESTAMPTZ,            -- Thời điểm ôn gần nhất
    next_review_at TIMESTAMPTZ,              -- Thời điểm đến hạn ôn tập tiếp theo
    total_reviews INT NOT NULL DEFAULT 0,    -- Tổng số lần đã ôn
    total_lapses INT NOT NULL DEFAULT 0,     -- Tổng số lần bị quên (đánh giá Khó)
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, vocab_id)
);

-- 4. BẢNG LỊCH SỬ ĐÁNH GIÁ SRS (SRS Review Logs)
CREATE TABLE IF NOT EXISTS public.srs_review_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    rating VARCHAR(16) NOT NULL,             -- 'hard', 'good', 'easy'
    interval_before INT DEFAULT 0,
    interval_after INT DEFAULT 0,
    ease_factor_before NUMERIC(4, 2) DEFAULT 2.50,
    ease_factor_after NUMERIC(4, 2) DEFAULT 2.50,
    reviewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. BẢNG PHIÊN KIỂM TRA TRẮC NGHIỆM (Quiz Sessions)
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_type VARCHAR(32) DEFAULT 'daily_quiz', -- 'daily_quiz', 'custom'
    total_questions INT NOT NULL DEFAULT 5,
    correct_count INT NOT NULL DEFAULT 0,
    accuracy_percent INT NOT NULL DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. BẢNG CHI TIẾT TỪNG CÂU TRẮC NGHIỆM (Quiz Details)
CREATE TABLE IF NOT EXISTS public.quiz_details (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    selected_option TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. BẢNG HOẠT ĐỘNG THEO NGÀY (Daily Activities - Dùng vẽ biểu đồ 7 ngày & tính streak)
CREATE TABLE IF NOT EXISTS public.daily_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_date DATE NOT NULL,             -- YYYY-MM-DD
    new_words_count INT NOT NULL DEFAULT 0,
    reviews_count INT NOT NULL DEFAULT 0,
    quiz_count INT NOT NULL DEFAULT 0,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, activity_date)
);

-- 8. BẢNG CHỈ SỐ TỔNG HỢP (User Stats Summary)
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id TEXT PRIMARY KEY,
    streak_days INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_active_date DATE,
    total_learned INT NOT NULL DEFAULT 0,
    total_quiz_attempts INT NOT NULL DEFAULT 0,
    correct_quiz_attempts INT NOT NULL DEFAULT 0,
    quiz_accuracy INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES ĐỂ TỐI ƯU TRUY VẤN
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_vocab_level ON public.vocabularies(level);
CREATE INDEX IF NOT EXISTS idx_user_vocab_due ON public.user_vocab_progress(user_id, next_review_at) WHERE status != 'new';
CREATE INDEX IF NOT EXISTS idx_user_vocab_status ON public.user_vocab_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_act_user_date ON public.daily_activities(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_session_user ON public.quiz_sessions(user_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- 1. Vocabularies & Examples: Ai cũng đọc được (Public read)
DROP POLICY IF EXISTS "Public can read vocabularies" ON public.vocabularies;
CREATE POLICY "Public can read vocabularies" ON public.vocabularies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read examples" ON public.vocabulary_examples;
CREATE POLICY "Public can read examples" ON public.vocabulary_examples
    FOR SELECT USING (true);

-- Cho phép insert/update vocabularies khi seed dữ liệu
DROP POLICY IF EXISTS "Anon can insert vocabularies" ON public.vocabularies;
CREATE POLICY "Anon can insert vocabularies" ON public.vocabularies
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can insert examples" ON public.vocabulary_examples;
CREATE POLICY "Anon can insert examples" ON public.vocabulary_examples
    FOR ALL USING (true) WITH CHECK (true);

-- 2. User Data Tables: Cho phép thao tác với dữ liệu
DROP POLICY IF EXISTS "Allow all for user_vocab_progress" ON public.user_vocab_progress;
CREATE POLICY "Allow all for user_vocab_progress" ON public.user_vocab_progress
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for srs_review_logs" ON public.srs_review_logs;
CREATE POLICY "Allow all for srs_review_logs" ON public.srs_review_logs
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for quiz_sessions" ON public.quiz_sessions;
CREATE POLICY "Allow all for quiz_sessions" ON public.quiz_sessions
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for quiz_details" ON public.quiz_details;
CREATE POLICY "Allow all for quiz_details" ON public.quiz_details
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for daily_activities" ON public.daily_activities;
CREATE POLICY "Allow all for daily_activities" ON public.daily_activities
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for user_stats" ON public.user_stats;
CREATE POLICY "Allow all for user_stats" ON public.user_stats
    FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- TRIGGER CẬP NHẬT UPDATED_AT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_vocab_progress ON public.user_vocab_progress;
CREATE TRIGGER set_updated_at_user_vocab_progress
    BEFORE UPDATE ON public.user_vocab_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_daily_activities ON public.daily_activities;
CREATE TRIGGER set_updated_at_daily_activities
    BEFORE UPDATE ON public.daily_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_stats ON public.user_stats;
CREATE TRIGGER set_updated_at_user_stats
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
