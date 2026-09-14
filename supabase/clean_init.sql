-- ==============================================================================
-- PANDA LINGUA — CLEAN FRESH PROJECT INITIALIZATION
-- ==============================================================================

-- 1. TABLES
CREATE TABLE IF NOT EXISTS public.vocabularies (
    id VARCHAR(64) PRIMARY KEY,
    hanzi VARCHAR(32) NOT NULL,
    pinyin VARCHAR(128) NOT NULL,
    sino_vietnamese VARCHAR(128),
    meaning TEXT NOT NULL,
    level VARCHAR(16) NOT NULL DEFAULT 'HSK1',
    category VARCHAR(64),
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vocabulary_examples (
    id BIGSERIAL PRIMARY KEY,
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    example_hanzi TEXT NOT NULL,
    example_pinyin TEXT NOT NULL,
    example_meaning TEXT NOT NULL,
    audio_url TEXT,
    order_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Học viên Panda',
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_vocab_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    repetition INT NOT NULL DEFAULT 0,
    ease_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.50,
    interval_days INT NOT NULL DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    total_reviews INT NOT NULL DEFAULT 0,
    total_lapses INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, vocab_id)
);

CREATE TABLE IF NOT EXISTS public.srs_review_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    rating VARCHAR(16) NOT NULL,
    interval_before INT DEFAULT 0,
    interval_after INT DEFAULT 0,
    ease_factor_before NUMERIC(4, 2) DEFAULT 2.50,
    ease_factor_after NUMERIC(4, 2) DEFAULT 2.50,
    reviewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(32) DEFAULT 'daily_quiz',
    total_questions INT NOT NULL DEFAULT 5,
    correct_count INT NOT NULL DEFAULT 0,
    accuracy_percent INT NOT NULL DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_details (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    vocab_id VARCHAR(64) NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
    selected_option TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    new_words_count INT NOT NULL DEFAULT 0,
    reviews_count INT NOT NULL DEFAULT 0,
    quiz_count INT NOT NULL DEFAULT 0,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, activity_date)
);

CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_words_learned INT NOT NULL DEFAULT 0,
    total_reviews INT NOT NULL DEFAULT 0,
    mastered_count INT NOT NULL DEFAULT 0,
    learning_count INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_study_date DATE,
    accuracy_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_quizzes INT NOT NULL DEFAULT 0,
    total_quiz_correct INT NOT NULL DEFAULT 0,
    total_time_spent INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. ENABLE RLS
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
DROP POLICY IF EXISTS "Public can read vocabularies" ON public.vocabularies;
CREATE POLICY "Public can read vocabularies" ON public.vocabularies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read examples" ON public.vocabulary_examples;
CREATE POLICY "Public can read examples" ON public.vocabulary_examples FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users own profile" ON public.profiles;
CREATE POLICY "Users own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users own vocab progress" ON public.user_vocab_progress;
CREATE POLICY "Users own vocab progress" ON public.user_vocab_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own review logs" ON public.srs_review_logs;
CREATE POLICY "Users own review logs" ON public.srs_review_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users own quiz sessions" ON public.quiz_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own quiz details" ON public.quiz_details;
CREATE POLICY "Users own quiz details" ON public.quiz_details FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quiz_sessions qs WHERE qs.id = session_id AND qs.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_sessions qs WHERE qs.id = session_id AND qs.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users own daily activity" ON public.daily_activities;
CREATE POLICY "Users own daily activity" ON public.daily_activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own stats" ON public.user_stats;
CREATE POLICY "Users own stats" ON public.user_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_vocab_progress ON public.user_vocab_progress;
CREATE TRIGGER set_updated_at_user_vocab_progress BEFORE UPDATE ON public.user_vocab_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_daily_activities ON public.daily_activities;
CREATE TRIGGER set_updated_at_daily_activities BEFORE UPDATE ON public.daily_activities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_stats ON public.user_stats;
CREATE TRIGGER set_updated_at_user_stats BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. INSERT ALL 225 VOCABULARIES AND EXAMPLES
-- ==============================================================================
-- PANDA LINGUA — FULL HSK 1 & HSK 2 VOCABULARY SEED DATA (225 items)
-- ==============================================================================

INSERT INTO public.vocabularies (id, hanzi, pinyin, meaning, level, category) VALUES
  ('hsk1_001', '你', 'nǐ', 'bạn, anh, chị (ngôi thứ 2)', 'HSK1', 'Cơ bản'),
  ('hsk1_002', '我', 'wǒ', 'tôi, mình, em (ngôi thứ 1)', 'HSK1', 'Cơ bản'),
  ('hsk1_003', '他', 'tā', 'anh ấy, ông ấy', 'HSK1', 'Cơ bản'),
  ('hsk1_004', '她', 'tā', 'cô ấy, bà ấy', 'HSK1', 'Cơ bản'),
  ('hsk1_005', '好', 'hǎo', 'tốt, đẹp, khỏe', 'HSK1', 'Cơ bản'),
  ('hsk1_006', '谢谢', 'xièxie', 'cảm ơn', 'HSK1', 'Cơ bản'),
  ('hsk1_007', '不客气', 'bú kèqi', 'đừng khách sáo, không có chi', 'HSK1', 'Cơ bản'),
  ('hsk1_008', '再见', 'zàijiàn', 'tạm biệt, hẹn gặp lại', 'HSK1', 'Cơ bản'),
  ('hsk1_009', '明天', 'míngtiān', 'ngày mai', 'HSK1', 'Cơ bản'),
  ('hsk1_010', '今天', 'jīntiān', 'hôm nay', 'HSK1', 'Cơ bản'),
  ('hsk1_011', '吃', 'chī', 'ăn', 'HSK1', 'Cơ bản'),
  ('hsk1_012', '喝', 'hē', 'uống', 'HSK1', 'Cơ bản'),
  ('hsk1_013', '水', 'shuǐ', 'nước', 'HSK1', 'Cơ bản'),
  ('hsk1_014', '茶', 'chá', 'trà, chè', 'HSK1', 'Cơ bản'),
  ('hsk1_015', '苹果', 'píngguǒ', 'quả táo', 'HSK1', 'Cơ bản'),
  ('hsk1_016', '米饭', 'mǐfàn', 'cơm', 'HSK1', 'Cơ bản'),
  ('hsk1_017', '喜欢', 'xǐhuan', 'thích', 'HSK1', 'Cơ bản'),
  ('hsk1_018', '汉语', 'Hànyǔ', 'tiếng Hán, tiếng Trung', 'HSK1', 'Cơ bản'),
  ('hsk1_019', '学校', 'xuéxiào', 'trường học', 'HSK1', 'Cơ bản'),
  ('hsk1_020', '老师', 'lǎoshī', 'giáo viên', 'HSK1', 'Cơ bản'),
  ('hsk1_021', '朋友', 'péngyou', 'bạn bè', 'HSK1', 'Cơ bản'),
  ('hsk1_022', '家', 'jiā', 'nhà, gia đình', 'HSK1', 'Cơ bản'),
  ('hsk1_023', '爸爸', 'bàba', 'bố, ba', 'HSK1', 'Cơ bản'),
  ('hsk1_024', '妈妈', 'māma', 'mẹ, má', 'HSK1', 'Cơ bản'),
  ('hsk1_025', '看', 'kàn', 'nhìn, xem, đọc', 'HSK1', 'Cơ bản'),
  ('hsk1_026', '听', 'tīng', 'nghe', 'HSK1', 'Cơ bản'),
  ('hsk1_027', '说', 'shuō', 'nói', 'HSK1', 'Cơ bản'),
  ('hsk1_028', '读', 'dú', 'đọc', 'HSK1', 'Cơ bản'),
  ('hsk1_029', '写', 'xiě', 'viết', 'HSK1', 'Cơ bản'),
  ('hsk1_030', '钱', 'qián', 'tiền', 'HSK1', 'Cơ bản'),
  ('hsk1_031', '是', 'shì', 'là', 'HSK1', 'Cơ bản'),
  ('hsk1_032', '有', 'yǒu', 'có', 'HSK1', 'Cơ bản'),
  ('hsk1_033', '大', 'dà', 'to, lớn', 'HSK1', 'Cơ bản'),
  ('hsk1_034', '小', 'xiǎo', 'nhỏ, bé', 'HSK1', 'Cơ bản'),
  ('hsk1_035', '多', 'duō', 'nhiều', 'HSK1', 'Cơ bản'),
  ('hsk1_036', '少', 'shǎo', 'ít', 'HSK1', 'Cơ bản'),
  ('hsk1_037', '上', 'shàng', 'ở trên, lên', 'HSK1', 'Cơ bản'),
  ('hsk1_038', '下', 'xià', 'ở dưới, xuống', 'HSK1', 'Cơ bản'),
  ('hsk1_039', '中', 'zhōng', 'giữa, trung', 'HSK1', 'Cơ bản'),
  ('hsk1_040', '人', 'rén', 'người', 'HSK1', 'Cơ bản'),
  ('hsk1_041', '书', 'shū', 'sách', 'HSK1', 'Cơ bản'),
  ('hsk1_042', '猫', 'māo', 'con mèo', 'HSK1', 'Cơ bản'),
  ('hsk1_043', '狗', 'gǒu', 'con chó', 'HSK1', 'Cơ bản'),
  ('hsk1_044', '电影', 'diànyǐng', 'phim điện ảnh', 'HSK1', 'Cơ bản'),
  ('hsk1_045', '电视', 'diànshì', 'tivi', 'HSK1', 'Cơ bản'),
  ('hsk1_046', '电脑', 'diànnǎo', 'máy tính', 'HSK1', 'Cơ bản'),
  ('hsk1_047', '手机', 'shǒujī', 'điện thoại di động', 'HSK1', 'Cơ bản'),
  ('hsk1_048', '学生', 'xuésheng', 'học sinh, sinh viên', 'HSK1', 'Cơ bản'),
  ('hsk1_049', '医生', 'yīsheng', 'bác sĩ', 'HSK1', 'Cơ bản'),
  ('hsk1_050', '工作', 'gōngzuò', 'công việc, làm việc', 'HSK1', 'Cơ bản'),
  ('hsk1_051', '去', 'qù', 'đi', 'HSK1', 'Cơ bản'),
  ('hsk1_052', '来', 'lái', 'đến, tới', 'HSK1', 'Cơ bản'),
  ('hsk1_053', '坐', 'zuò', 'ngồi, ngồi xe', 'HSK1', 'Cơ bản'),
  ('hsk1_054', '买', 'mǎi', 'mua', 'HSK1', 'Cơ bản'),
  ('hsk1_055', '做', 'zuò', 'làm, làm món', 'HSK1', 'Cơ bản'),
  ('hsk1_056', '会', 'huì', 'biết, có thể', 'HSK1', 'Cơ bản'),
  ('hsk1_057', '能', 'néng', 'có thể (khả năng)', 'HSK1', 'Cơ bản'),
  ('hsk1_058', '想', 'xiǎng', 'muốn, nghĩ', 'HSK1', 'Cơ bản'),
  ('hsk1_059', '认识', 'rènshi', 'quen biết, nhận ra', 'HSK1', 'Cơ bản'),
  ('hsk1_060', '名字', 'míngzi', 'tên', 'HSK1', 'Cơ bản'),
  ('hsk1_061', '岁', 'suì', 'tuổi', 'HSK1', 'Cơ bản'),
  ('hsk1_062', '年', 'nián', 'năm', 'HSK1', 'Cơ bản'),
  ('hsk1_063', '月', 'yuè', 'tháng', 'HSK1', 'Cơ bản'),
  ('hsk1_064', '日', 'rì', 'ngày', 'HSK1', 'Cơ bản'),
  ('hsk1_065', '星期', 'xīngqī', 'tuần, thứ trong tuần', 'HSK1', 'Cơ bản'),
  ('hsk1_066', '点', 'diǎn', 'giờ, điểm', 'HSK1', 'Cơ bản'),
  ('hsk1_067', '分钟', 'fēnzhōng', 'phút', 'HSK1', 'Cơ bản'),
  ('hsk1_068', '早上', 'zǎoshang', 'buổi sáng', 'HSK1', 'Cơ bản'),
  ('hsk1_069', '晚上', 'wǎnshang', 'buổi tối', 'HSK1', 'Cơ bản'),
  ('hsk1_070', '饭馆', 'fànguǎn', 'nhà hàng', 'HSK1', 'Cơ bản'),
  ('hsk1_071', '商店', 'shāngdiàn', 'cửa hàng', 'HSK1', 'Cơ bản'),
  ('hsk1_072', '医院', 'yīyuàn', 'bệnh viện', 'HSK1', 'Cơ bản'),
  ('hsk1_073', '火车', 'huǒchē', 'tàu lửa', 'HSK1', 'Cơ bản'),
  ('hsk1_074', '飞机', 'fēijī', 'máy bay', 'HSK1', 'Cơ bản'),
  ('hsk1_075', '出租车', 'chūzūchē', 'xe taxi', 'HSK1', 'Cơ bản'),
  ('hsk1_076', '天气', 'tiānqì', 'thời tiết', 'HSK1', 'Cơ bản'),
  ('hsk1_077', '下雨', 'xiàyǔ', 'mưa', 'HSK1', 'Cơ bản'),
  ('hsk1_078', '热', 'rè', 'nóng', 'HSK1', 'Cơ bản'),
  ('hsk1_079', '冷', 'lěng', 'lạnh', 'HSK1', 'Cơ bản'),
  ('hsk1_080', '高兴', 'gāoxìng', 'vui vẻ, hân hạnh', 'HSK1', 'Cơ bản'),
  ('hsk1_081', '对不起', 'duìbuqǐ', 'xin lỗi', 'HSK1', 'Cơ bản'),
  ('hsk1_082', '没关系', 'méi guānxi', 'không sao đâu', 'HSK1', 'Cơ bản'),
  ('hsk1_083', '请', 'qǐng', 'xin mời, làm ơn', 'HSK1', 'Cơ bản'),
  ('hsk1_084', '多少', 'duōshao', 'bao nhiêu', 'HSK1', 'Cơ bản'),
  ('hsk1_085', '怎么', 'zěnme', 'làm sao, thế nào', 'HSK1', 'Cơ bản'),
  ('hsk1_086', '什么', 'shénme', 'cái gì', 'HSK1', 'Cơ bản'),
  ('hsk1_087', '哪', 'nǎ', 'nào, ở đâu', 'HSK1', 'Cơ bản'),
  ('hsk1_088', '谁', 'shuí', 'ai', 'HSK1', 'Cơ bản'),
  ('hsk1_089', '这', 'zhè', 'này', 'HSK1', 'Cơ bản'),
  ('hsk1_090', '那', 'nà', 'kia, đó', 'HSK1', 'Cơ bản'),
  ('hsk1_091', '都', 'dōu', 'đều, tất cả', 'HSK1', 'Cơ bản'),
  ('hsk1_092', '和', 'hé', 'và, với', 'HSK1', 'Cơ bản'),
  ('hsk1_093', '在', 'zài', 'ở, đang', 'HSK1', 'Cơ bản'),
  ('hsk1_094', '的', 'de', 'của (trợ từ sở hữu)', 'HSK1', 'Cơ bản'),
  ('hsk1_095', '了', 'le', 'rồi (trợ từ hoàn thành)', 'HSK1', 'Cơ bản'),
  ('hsk1_096', '一', 'yī', 'một', 'HSK1', 'Cơ bản'),
  ('hsk1_097', '二', 'èr', 'hai', 'HSK1', 'Cơ bản'),
  ('hsk1_098', '三', 'sān', 'ba', 'HSK1', 'Cơ bản'),
  ('hsk1_099', '四', 'sì', 'bốn', 'HSK1', 'Cơ bản'),
  ('hsk1_100', '五', 'wǔ', 'năm (số)', 'HSK1', 'Cơ bản'),
  ('hsk1_101', '六', 'liù', 'sáu', 'HSK1', 'Cơ bản'),
  ('hsk1_102', '七', 'qī', 'bảy', 'HSK1', 'Cơ bản'),
  ('hsk1_103', '八', 'bā', 'tám', 'HSK1', 'Cơ bản'),
  ('hsk1_104', '九', 'jiǔ', 'chín', 'HSK1', 'Cơ bản'),
  ('hsk1_105', '十', 'shí', 'mười', 'HSK1', 'Cơ bản'),
  ('hsk2_001', '因为', 'yīnwèi', 'vì, bởi vì', 'HSK2', 'Cơ bản'),
  ('hsk2_002', '所以', 'suǒyǐ', 'nên, vì vậy', 'HSK2', 'Cơ bản'),
  ('hsk2_003', '但是', 'dànshì', 'nhưng', 'HSK2', 'Cơ bản'),
  ('hsk2_004', '虽然', 'suīrán', 'tuy rằng, mặc dù', 'HSK2', 'Cơ bản'),
  ('hsk2_005', '一起', 'yìqǐ', 'cùng nhau', 'HSK2', 'Cơ bản'),
  ('hsk2_006', '可能', 'kěnéng', 'có thể, khả năng', 'HSK2', 'Cơ bản'),
  ('hsk2_007', '需要', 'xūyào', 'cần', 'HSK2', 'Cơ bản'),
  ('hsk2_008', '觉得', 'juéde', 'cảm thấy, nghĩ rằng', 'HSK2', 'Cơ bản'),
  ('hsk2_009', '希望', 'xīwàng', 'hy vọng', 'HSK2', 'Cơ bản'),
  ('hsk2_010', '开始', 'kāishǐ', 'bắt đầu', 'HSK2', 'Cơ bản'),
  ('hsk2_011', '准备', 'zhǔnbèi', 'chuẩn bị', 'HSK2', 'Cơ bản'),
  ('hsk2_012', '考试', 'kǎoshì', 'kỳ thi, thi cử', 'HSK2', 'Cơ bản'),
  ('hsk2_013', '问题', 'wèntí', 'câu hỏi, vấn đề', 'HSK2', 'Cơ bản'),
  ('hsk2_014', '意思', 'yìsi', 'ý nghĩa', 'HSK2', 'Cơ bản'),
  ('hsk2_015', '生日', 'shēngrì', 'sinh nhật', 'HSK2', 'Cơ bản'),
  ('hsk2_016', '礼物', 'lǐwù', 'món quà', 'HSK2', 'Cơ bản'),
  ('hsk2_017', '给', 'gěi', 'cho, đưa cho', 'HSK2', 'Cơ bản'),
  ('hsk2_018', '帮助', 'bāngzhù', 'giúp đỡ', 'HSK2', 'Cơ bản'),
  ('hsk2_019', '努力', 'nǔlì', 'nỗ lực, cố gắng', 'HSK2', 'Cơ bản'),
  ('hsk2_020', '认真', 'rènzhēn', 'nghiêm túc, cẩn thận', 'HSK2', 'Cơ bản'),
  ('hsk2_021', '着急', 'zháojí', 'lo lắng, vội vàng', 'HSK2', 'Cơ bản'),
  ('hsk2_022', '担心', 'dānxīn', 'lo lắng', 'HSK2', 'Cơ bản'),
  ('hsk2_023', '累', 'lèi', 'mệt', 'HSK2', 'Cơ bản'),
  ('hsk2_024', '休息', 'xiūxi', 'nghỉ ngơi', 'HSK2', 'Cơ bản'),
  ('hsk2_025', '锻炼', 'duànliàn', 'rèn luyện, tập thể dục', 'HSK2', 'Cơ bản'),
  ('hsk2_026', '身体', 'shēntǐ', 'cơ thể, sức khỏe', 'HSK2', 'Cơ bản'),
  ('hsk2_027', '健康', 'jiànkāng', 'khỏe mạnh, sức khỏe', 'HSK2', 'Cơ bản'),
  ('hsk2_028', '感冒', 'gǎnmào', 'cảm lạnh, cảm cúm', 'HSK2', 'Cơ bản'),
  ('hsk2_029', '药', 'yào', 'thuốc', 'HSK2', 'Cơ bản'),
  ('hsk2_030', '超市', 'chāoshì', 'siêu thị', 'HSK2', 'Cơ bản'),
  ('hsk2_031', '东西', 'dōngxi', 'đồ vật, thứ gì đó', 'HSK2', 'Cơ bản'),
  ('hsk2_032', '便宜', 'piányi', 'rẻ', 'HSK2', 'Cơ bản'),
  ('hsk2_033', '贵', 'guì', 'đắt', 'HSK2', 'Cơ bản'),
  ('hsk2_034', '快', 'kuài', 'nhanh', 'HSK2', 'Cơ bản'),
  ('hsk2_035', '慢', 'màn', 'chậm', 'HSK2', 'Cơ bản'),
  ('hsk2_036', '早', 'zǎo', 'sớm', 'HSK2', 'Cơ bản'),
  ('hsk2_037', '晚', 'wǎn', 'muộn, tối', 'HSK2', 'Cơ bản'),
  ('hsk2_038', '新', 'xīn', 'mới', 'HSK2', 'Cơ bản'),
  ('hsk2_039', '旧', 'jiù', 'cũ', 'HSK2', 'Cơ bản'),
  ('hsk2_040', '难', 'nán', 'khó', 'HSK2', 'Cơ bản'),
  ('hsk2_041', '容易', 'róngyì', 'dễ dàng', 'HSK2', 'Cơ bản'),
  ('hsk2_042', '清楚', 'qīngchu', 'rõ ràng', 'HSK2', 'Cơ bản'),
  ('hsk2_043', '干净', 'gānjìng', 'sạch sẽ', 'HSK2', 'Cơ bản'),
  ('hsk2_044', '安静', 'ānjìng', 'yên tĩnh', 'HSK2', 'Cơ bản'),
  ('hsk2_045', '热闹', 'rènao', 'nhộn nhịp, sầm uất', 'HSK2', 'Cơ bản'),
  ('hsk2_046', '公共汽车', 'gōnggòng qìchē', 'xe buýt', 'HSK2', 'Cơ bản'),
  ('hsk2_047', '自行车', 'zìxíngchē', 'xe đạp', 'HSK2', 'Cơ bản'),
  ('hsk2_048', '地铁', 'dìtiě', 'tàu điện ngầm', 'HSK2', 'Cơ bản'),
  ('hsk2_049', '方便', 'fāngbiàn', 'tiện lợi', 'HSK2', 'Cơ bản'),
  ('hsk2_050', '附近', 'fùjìn', 'gần đây, lân cận', 'HSK2', 'Cơ bản'),
  ('hsk2_051', '地方', 'dìfang', 'nơi chốn', 'HSK2', 'Cơ bản'),
  ('hsk2_052', '旅游', 'lǚyóu', 'du lịch', 'HSK2', 'Cơ bản'),
  ('hsk2_053', '照片', 'zhàopiàn', 'tấm ảnh', 'HSK2', 'Cơ bản'),
  ('hsk2_054', '唱歌', 'chànggē', 'hát', 'HSK2', 'Cơ bản'),
  ('hsk2_055', '跳舞', 'tiàowǔ', 'nhảy múa', 'HSK2', 'Cơ bản'),
  ('hsk2_056', '游戏', 'yóuxì', 'trò chơi', 'HSK2', 'Cơ bản'),
  ('hsk2_057', '孩子', 'háizi', 'đứa trẻ, con cái', 'HSK2', 'Cơ bản'),
  ('hsk2_058', '先生', 'xiānsheng', 'ngài, anh, ông', 'HSK2', 'Cơ bản'),
  ('hsk2_059', '小姐', 'xiǎojiě', 'cô, tiểu thư', 'HSK2', 'Cơ bản'),
  ('hsk2_060', '服务员', 'fúwùyuán', 'nhân viên phục vụ', 'HSK2', 'Cơ bản'),
  ('hsk2_061', '面条', 'miàntiáo', 'mì sợi', 'HSK2', 'Cơ bản'),
  ('hsk2_062', '鸡蛋', 'jīdàn', 'quả trứng gà', 'HSK2', 'Cơ bản'),
  ('hsk2_063', '牛奶', 'niúnǎi', 'sữa bò', 'HSK2', 'Cơ bản'),
  ('hsk2_064', '西瓜', 'xīguā', 'dưa hấu', 'HSK2', 'Cơ bản'),
  ('hsk2_065', '青菜', 'qīngcài', 'rau xanh', 'HSK2', 'Cơ bản'),
  ('hsk2_066', '羊肉', 'yángròu', 'thịt cừu', 'HSK2', 'Cơ bản'),
  ('hsk2_067', '鱼', 'yú', 'con cá', 'HSK2', 'Cơ bản'),
  ('hsk2_068', '杯子', 'bēizi', 'cái cốc', 'HSK2', 'Cơ bản'),
  ('hsk2_069', '碗', 'wǎn', 'cái bát', 'HSK2', 'Cơ bản'),
  ('hsk2_070', '盘子', 'pánzi', 'cái đĩa', 'HSK2', 'Cơ bản'),
  ('hsk2_071', '筷子', 'kuàizi', 'đũa', 'HSK2', 'Cơ bản'),
  ('hsk2_072', '房间', 'fángjiān', 'căn phòng', 'HSK2', 'Cơ bản'),
  ('hsk2_073', '厨房', 'chúfáng', 'nhà bếp', 'HSK2', 'Cơ bản'),
  ('hsk2_074', '门', 'mén', 'cửa ra vào', 'HSK2', 'Cơ bản'),
  ('hsk2_075', '窗户', 'chuānghu', 'cửa sổ', 'HSK2', 'Cơ bản'),
  ('hsk2_076', '桌子', 'zhuōzi', 'cái bàn', 'HSK2', 'Cơ bản'),
  ('hsk2_077', '椅子', 'yǐzi', 'cái ghế', 'HSK2', 'Cơ bản'),
  ('hsk2_078', '床', 'chuáng', 'giường', 'HSK2', 'Cơ bản'),
  ('hsk2_079', '颜色', 'yánsè', 'màu sắc', 'HSK2', 'Cơ bản'),
  ('hsk2_080', '红色', 'hóngsè', 'màu đỏ', 'HSK2', 'Cơ bản'),
  ('hsk2_081', '白色', 'báisè', 'màu trắng', 'HSK2', 'Cơ bản'),
  ('hsk2_082', '黑色', 'hēisè', 'màu đen', 'HSK2', 'Cơ bản'),
  ('hsk2_083', '眼睛', 'yǎnjing', 'con mắt', 'HSK2', 'Cơ bản'),
  ('hsk2_084', '个子', 'gèzi', 'chiều cao (dáng người)', 'HSK2', 'Cơ bản'),
  ('hsk2_085', '高', 'gāo', 'cao', 'HSK2', 'Cơ bản'),
  ('hsk2_086', '矮', 'ǎi', 'thấp, lùn', 'HSK2', 'Cơ bản'),
  ('hsk2_087', '长', 'cháng', 'dài', 'HSK2', 'Cơ bản'),
  ('hsk2_088', '短', 'duǎn', 'ngắn', 'HSK2', 'Cơ bản'),
  ('hsk2_089', '胖', 'pàng', 'béo', 'HSK2', 'Cơ bản'),
  ('hsk2_090', '瘦', 'shòu', 'ốm, gầy', 'HSK2', 'Cơ bản'),
  ('hsk2_091', '黑', 'hēi', 'đen', 'HSK2', 'Cơ bản'),
  ('hsk2_092', '亮', 'liàng', 'sáng', 'HSK2', 'Cơ bản'),
  ('hsk2_093', '远', 'yuǎn', 'xa', 'HSK2', 'Cơ bản'),
  ('hsk2_094', '近', 'jìn', 'gần', 'HSK2', 'Cơ bản'),
  ('hsk2_095', '左边', 'zuǒbian', 'bên trái', 'HSK2', 'Cơ bản'),
  ('hsk2_096', '右边', 'yòubian', 'bên phải', 'HSK2', 'Cơ bản'),
  ('hsk2_097', '前面', 'qiánmiàn', 'phía trước', 'HSK2', 'Cơ bản'),
  ('hsk2_098', '后面', 'hòumiàn', 'phía sau', 'HSK2', 'Cơ bản'),
  ('hsk2_099', '旁边', 'pángbiān', 'bên cạnh', 'HSK2', 'Cơ bản'),
  ('hsk2_100', '跟', 'gēn', 'với, theo', 'HSK2', 'Cơ bản'),
  ('hsk2_101', '向', 'xiàng', 'hướng về, về phía', 'HSK2', 'Cơ bản'),
  ('hsk2_102', '从', 'cóng', 'từ', 'HSK2', 'Cơ bản'),
  ('hsk2_103', '对', 'duì', 'đúng, với', 'HSK2', 'Cơ bản'),
  ('hsk2_104', '错', 'cuò', 'sai, lỗi', 'HSK2', 'Cơ bản'),
  ('hsk2_105', '必须', 'bìxū', 'phải, bắt buộc', 'HSK2', 'Cơ bản'),
  ('hsk2_106', '应该', 'yīnggāi', 'nên, phải', 'HSK2', 'Cơ bản'),
  ('hsk2_107', '选择', 'xuǎnzé', 'lựa chọn, chọn', 'HSK2', 'Cơ bản'),
  ('hsk2_108', '决定', 'juédìng', 'quyết định', 'HSK2', 'Cơ bản'),
  ('hsk2_109', '打算', 'dǎsuàn', 'dự định, định', 'HSK2', 'Cơ bản'),
  ('hsk2_110', '知道', 'zhīdào', 'biết', 'HSK2', 'Cơ bản'),
  ('hsk2_111', '相信', 'xiāngxìn', 'tin, tin tưởng', 'HSK2', 'Cơ bản'),
  ('hsk2_112', '成功', 'chénggōng', 'thành công', 'HSK2', 'Cơ bản'),
  ('hsk2_113', '生日快乐', 'shēngrì kuàilè', 'chúc mừng sinh nhật', 'HSK2', 'Cơ bản'),
  ('hsk2_114', '快乐', 'kuàilè', 'vui vẻ, hạnh phúc', 'HSK2', 'Cơ bản'),
  ('hsk2_115', '可爱', 'kě''ài', 'dễ thương, đáng yêu', 'HSK2', 'Cơ bản'),
  ('hsk2_116', '有意思', 'yǒu yìsi', 'thú vị, hay', 'HSK2', 'Cơ bản'),
  ('hsk2_117', '一直', 'yìzhí', 'liên tục, suốt', 'HSK2', 'Cơ bản'),
  ('hsk2_118', '一边...一边', 'yìbiān...yìbiān', 'vừa... vừa...', 'HSK2', 'Cơ bản'),
  ('hsk2_119', '越来越', 'yuèláiyuè', 'ngày càng', 'HSK2', 'Cơ bản'),
  ('hsk2_120', '过', 'guò', 'đã từng (kinh nghiệm)', 'HSK2', 'Cơ bản')
ON CONFLICT (id) DO UPDATE SET
  hanzi = EXCLUDED.hanzi,
  pinyin = EXCLUDED.pinyin,
  meaning = EXCLUDED.meaning,
  level = EXCLUDED.level;

-- Vocabulary Examples (225 items)
INSERT INTO public.vocabulary_examples (vocab_id, example_hanzi, example_pinyin, example_meaning, order_index) VALUES
  ('hsk1_001', '你好！', 'Nǐ hǎo!', 'Xin chào bạn!', 1),
  ('hsk1_002', '我是学生。', 'Wǒ shì xuésheng.', 'Tôi là học sinh.', 1),
  ('hsk1_003', '他是我的老师。', 'Tā shì wǒ de lǎoshī.', 'Thầy ấy là giáo viên của tôi.', 1),
  ('hsk1_004', '她是中国人。', 'Tā shì Zhōngguórén.', 'Cô ấy là người Trung Quốc.', 1),
  ('hsk1_005', '今天天气很好。', 'Jīntiān tiānqì hěn hǎo.', 'Hôm nay thời tiết rất tốt.', 1),
  ('hsk1_006', '谢谢你的帮助。', 'Xièxie nǐ de bāngzhù.', 'Cảm ơn sự giúp đỡ của bạn.', 1),
  ('hsk1_007', '不用谢，不客气！', 'Bú yòng xiè, bú kèqi!', 'Không cần cảm ơn, đừng khách sáo!', 1),
  ('hsk1_008', '明天再见！', 'Míngtiān zàijiàn!', 'Ngày mai gặp lại nhé!', 1),
  ('hsk1_009', '明天你去学校吗？', 'Míngtiān nǐ qù xuéxiào ma?', 'Ngày mai bạn có đi học không?', 1),
  ('hsk1_010', '今天是星期一。', 'Jīntiān shì xīngqīyī.', 'Hôm nay là thứ hai.', 1),
  ('hsk1_011', '你想吃什么？', 'Nǐ xiǎng chī shénme?', 'Bạn muốn ăn gì?', 1),
  ('hsk1_012', '我想喝茶。', 'Wǒ xiǎng hē chá.', 'Tôi muốn uống trà.', 1),
  ('hsk1_013', '请喝水。', 'Qǐng hē shuǐ.', 'Xin mời uống nước.', 1),
  ('hsk1_014', '中国茶很好喝。', 'Zhōngguó chá hěn hǎohē.', 'Trà Trung Quốc rất ngon.', 1),
  ('hsk1_015', '这个苹果很大。', 'Zhè ge píngguǒ hěn dà.', 'Quả táo này rất to.', 1),
  ('hsk1_016', '我喜欢吃米饭。', 'Wǒ xǐhuan chī mǐfàn.', 'Tôi thích ăn cơm.', 1),
  ('hsk1_017', '我喜欢学汉语。', 'Wǒ xǐhuan xué Hànyǔ.', 'Tôi thích học tiếng Trung.', 1),
  ('hsk1_018', '汉语不难。', 'Hànyǔ bù nán.', 'Tiếng Trung không khó.', 1),
  ('hsk1_019', '我们的学校很大。', 'Wǒmen de xuéxiào hěn dà.', 'Trường của chúng tôi rất to.', 1),
  ('hsk1_020', '王老师在学校。', 'Wáng lǎoshī zài xuéxiào.', 'Thầy Vương đang ở trường.', 1),
  ('hsk1_021', '他是我的好朋友。', 'Tā shì wǒ de hǎo péngyou.', 'Cậu ấy là bạn tốt của tôi.', 1),
  ('hsk1_022', '我家在北京。', 'Wǒ jiā zài Běijīng.', 'Nhà tôi ở Bắc Kinh.', 1),
  ('hsk1_023', '爸爸在看书。', 'Bàba zài kàn shū.', 'Bố đang đọc sách.', 1),
  ('hsk1_024', '妈妈在做饭。', 'Māma zài zuò fàn.', 'Mẹ đang nấu cơm.', 1),
  ('hsk1_025', '我在看电影。', 'Wǒ zài kàn diànyǐng.', 'Tôi đang xem phim.', 1),
  ('hsk1_026', '你听，这是什么声音？', 'Nǐ tīng, zhè shì shénme shēngyīn?', 'Bạn nghe xem, đây là âm thanh gì?', 1),
  ('hsk1_027', '请再说一遍。', 'Qǐng zài shuō yí biàn.', 'Xin hãy nói lại một lần nữa.', 1),
  ('hsk1_028', '跟我一起读。', 'Gēn wǒ yìqǐ dú.', 'Hãy đọc cùng với tôi.', 1),
  ('hsk1_029', '你会写汉字吗？', 'Nǐ huì xiě hànzì ma?', 'Bạn biết viết chữ Hán không?', 1),
  ('hsk1_030', '这个多少钱？', 'Zhè ge duōshao qián?', 'Cái này bao nhiêu tiền?', 1),
  ('hsk1_031', '我是越南人。', 'Wǒ shì Yuènánrén.', 'Tôi là người Việt Nam.', 1),
  ('hsk1_032', '我有一个哥哥。', 'Wǒ yǒu yí ge gēge.', 'Tôi có một người anh trai.', 1),
  ('hsk1_033', '这个房子很大。', 'Zhè ge fángzi hěn dà.', 'Căn nhà này rất to.', 1),
  ('hsk1_034', '我的猫很小。', 'Wǒ de māo hěn xiǎo.', 'Con mèo của tôi rất nhỏ.', 1),
  ('hsk1_035', '中国人口很多。', 'Zhōngguó rénkǒu hěn duō.', 'Dân số Trung Quốc rất đông.', 1),
  ('hsk1_036', '今天人很少。', 'Jīntiān rén hěn shǎo.', 'Hôm nay ít người quá.', 1),
  ('hsk1_037', '书在桌子上。', 'Shū zài zhuōzi shàng.', 'Sách ở trên bàn.', 1),
  ('hsk1_038', '椅子在桌子下面。', 'Yǐzi zài zhuōzi xiàmiàn.', 'Ghế ở dưới bàn.', 1),
  ('hsk1_039', '中间的那个人是我爸爸。', 'Zhōngjiān de nàge rén shì wǒ bàba.', 'Người ở giữa là bố tôi.', 1),
  ('hsk1_040', '这里的人很多。', 'Zhèlǐ de rén hěn duō.', 'Ở đây có rất nhiều người.', 1),
  ('hsk1_041', '这本书很有意思。', 'Zhè běn shū hěn yǒu yìsi.', 'Quyển sách này rất thú vị.', 1),
  ('hsk1_042', '我的猫很可爱。', 'Wǒ de māo hěn kě''ài.', 'Con mèo của tôi rất dễ thương.', 1),
  ('hsk1_043', '他家的狗很大。', 'Tā jiā de gǒu hěn dà.', 'Con chó nhà cậu ấy rất to.', 1),
  ('hsk1_044', '我们去看电影吧。', 'Wǒmen qù kàn diànyǐng ba.', 'Chúng ta đi xem phim đi.', 1),
  ('hsk1_045', '爸爸在看电视。', 'Bàba zài kàn diànshì.', 'Bố đang xem tivi.', 1),
  ('hsk1_046', '我用电脑学习汉语。', 'Wǒ yòng diànnǎo xuéxí Hànyǔ.', 'Tôi dùng máy tính học tiếng Trung.', 1),
  ('hsk1_047', '你的手机号码是多少？', 'Nǐ de shǒujī hàomǎ shì duōshao?', 'Số điện thoại của bạn là bao nhiêu?', 1),
  ('hsk1_048', '他是一个大学生。', 'Tā shì yí ge dàxuésheng.', 'Cậu ấy là sinh viên đại học.', 1),
  ('hsk1_049', '我妈妈是医生。', 'Wǒ māma shì yīsheng.', 'Mẹ tôi là bác sĩ.', 1),
  ('hsk1_050', '我在北京工作。', 'Wǒ zài Běijīng gōngzuò.', 'Tôi làm việc ở Bắc Kinh.', 1),
  ('hsk1_051', '星期天你去哪儿？', 'Xīngqītiān nǐ qù nǎr?', 'Chủ nhật bạn đi đâu?', 1),
  ('hsk1_052', '请来我家玩。', 'Qǐng lái wǒ jiā wán.', 'Hãy đến nhà tôi chơi.', 1),
  ('hsk1_053', '我们坐出租车去吧。', 'Wǒmen zuò chūzūchē qù ba.', 'Đi bằng taxi nhé.', 1),
  ('hsk1_054', '我想买一本书。', 'Wǒ xiǎng mǎi yì běn shū.', 'Tôi muốn mua một quyển sách.', 1),
  ('hsk1_055', '你做什么工作？', 'Nǐ zuò shénme gōngzuò?', 'Bạn làm công việc gì?', 1),
  ('hsk1_056', '他会说汉语。', 'Tā huì shuō Hànyǔ.', 'Anh ấy biết nói tiếng Trung.', 1),
  ('hsk1_057', '明天你能来吗？', 'Míngtiān nǐ néng lái ma?', 'Ngày mai bạn đến được không?', 1),
  ('hsk1_058', '我很想去中国。', 'Wǒ hěn xiǎng qù Zhōngguó.', 'Tôi rất muốn đi Trung Quốc.', 1),
  ('hsk1_059', '很高兴认识你。', 'Hěn gāoxìng rènshi nǐ.', 'Rất vui được làm quen với bạn.', 1),
  ('hsk1_060', '你叫什么名字？', 'Nǐ jiào shénme míngzi?', 'Bạn tên là gì?', 1),
  ('hsk1_061', '你今年多大了？', 'Nǐ jīnnián duō dà le?', 'Năm nay bạn bao nhiêu tuổi?', 1),
  ('hsk1_062', '明年我打算去留学。', 'Míngnián wǒ dǎsuàn qù liúxué.', 'Năm sau tôi định đi du học.', 1),
  ('hsk1_063', '现在是十二月。', 'Xiànzài shì shí''èryuè.', 'Bây giờ là tháng mười hai.', 1),
  ('hsk1_064', '今天是十月一日。', 'Jīntiān shì shíyuè yī rì.', 'Hôm nay là ngày 1/10.', 1),
  ('hsk1_065', '星期六我们去爬山吧。', 'Xīngqīliù wǒmen qù páshān ba.', 'Thứ bảy chúng ta đi leo núi nhé.', 1),
  ('hsk1_066', '现在几点了？', 'Xiànzài jǐ diǎn le?', 'Bây giờ mấy giờ rồi?', 1),
  ('hsk1_067', '等十分钟，好吗？', 'Děng shí fēnzhōng, hǎo ma?', 'Chờ 10 phút được không?', 1),
  ('hsk1_068', '我早上七点起床。', 'Wǒ zǎoshang qī diǎn qǐchuáng.', 'Sáng tôi dậy lúc 7 giờ.', 1),
  ('hsk1_069', '晚上我学习汉语。', 'Wǎnshang wǒ xuéxí Hànyǔ.', 'Buổi tối tôi học tiếng Trung.', 1),
  ('hsk1_070', '这家饭馆的菜很好吃。', 'Zhè jiā fànguǎn de cài hěn hǎochī.', 'Món ăn nhà hàng này rất ngon.', 1),
  ('hsk1_071', '商店九点开门。', 'Shāngdiàn jiǔ diǎn kāimén.', 'Cửa hàng mở cửa lúc 9 giờ.', 1),
  ('hsk1_072', '他在医院工作。', 'Tā zài yīyuàn gōngzuò.', 'Anh ấy làm việc ở bệnh viện.', 1),
  ('hsk1_073', '我们坐火车去上海。', 'Wǒmen zuò huǒchē qù Shànghǎi.', 'Chúng ta đi Thượng Hải bằng tàu.', 1),
  ('hsk1_074', '飞机十点起飞。', 'Fēijī shí diǎn qǐfēi.', 'Máy bay cất cánh lúc 10 giờ.', 1),
  ('hsk1_075', '出租车来了！', 'Chūzūchē lái le!', 'Taxi đến rồi!', 1),
  ('hsk1_076', '今天天气怎么样？', 'Jīntiān tiānqì zěnmeyàng?', 'Hôm nay thời tiết thế nào?', 1),
  ('hsk1_077', '外面在下雨。', 'Wàimiàn zài xiàyǔ.', 'Bên ngoài đang mưa.', 1),
  ('hsk1_078', '夏天很热。', 'Xiàtiān hěn rè.', 'Mùa hè rất nóng.', 1),
  ('hsk1_079', '冬天很冷。', 'Dōngtiān hěn lěng.', 'Mùa đông rất lạnh.', 1),
  ('hsk1_080', '我非常高兴。', 'Wǒ fēicháng gāoxìng.', 'Tôi rất vui.', 1),
  ('hsk1_081', '对不起，我来晚了。', 'Duìbuqǐ, wǒ lái wǎn le.', 'Xin lỗi, tôi đến muộn.', 1),
  ('hsk1_082', '没关系，慢慢来。', 'Méi guānxi, mànmàn lái.', 'Không sao, cứ từ từ.', 1),
  ('hsk1_083', '请进！', 'Qǐng jìn!', 'Mời vào!', 1),
  ('hsk1_084', '你们班有多少学生？', 'Nǐmen bān yǒu duōshao xuésheng?', 'Lớp bạn có bao nhiêu học sinh?', 1),
  ('hsk1_085', '这个字怎么读？', 'Zhè ge zì zěnme dú?', 'Chữ này đọc như thế nào?', 1),
  ('hsk1_086', '你说什么？', 'Nǐ shuō shénme?', 'Bạn nói gì vậy?', 1),
  ('hsk1_087', '你是哪里人？', 'Nǐ shì nǎlǐ rén?', 'Bạn là người ở đâu?', 1),
  ('hsk1_088', '那是谁的书？', 'Nà shì shuí de shū?', 'Đó là sách của ai?', 1),
  ('hsk1_089', '这是我的书包。', 'Zhè shì wǒ de shūbāo.', 'Đây là cặp sách của tôi.', 1),
  ('hsk1_090', '那个人是我的朋友。', 'Nàge rén shì wǒ de péngyou.', 'Người kia là bạn của tôi.', 1),
  ('hsk1_091', '我们都喜欢熊猫。', 'Wǒmen dōu xǐhuan xióngmāo.', 'Chúng tôi đều thích gấu trúc.', 1),
  ('hsk1_092', '我和妈妈在家。', 'Wǒ hé māma zài jiā.', 'Tôi và mẹ ở nhà.', 1),
  ('hsk1_093', '他在学校吗？', 'Tā zài xuéxiào ma?', 'Cậu ấy đang ở trường à?', 1),
  ('hsk1_094', '这是老师的书。', 'Zhè shì lǎoshī de shū.', 'Đây là sách của giáo viên.', 1),
  ('hsk1_095', '我吃了三个苹果。', 'Wǒ chī le sān ge píngguǒ.', 'Tôi đã ăn ba quả táo.', 1),
  ('hsk1_096', '我要一杯水。', 'Wǒ yào yì bēi shuǐ.', 'Cho tôi một ly nước.', 1),
  ('hsk1_097', '我有两个孩子。', 'Wǒ yǒu liǎng ge háizi.', 'Tôi có hai đứa con.', 1),
  ('hsk1_098', '三加三等于六。', 'Sān jiā sān děngyú liù.', 'Ba cộng ba bằng sáu.', 1),
  ('hsk1_099', '现在四点。', 'Xiànzài sì diǎn.', 'Bây giờ là 4 giờ.', 1),
  ('hsk1_100', '我们五个人去吃饭。', 'Wǒmen wǔ ge rén qù chīfàn.', 'Năm người chúng tôi đi ăn.', 1),
  ('hsk1_101', '他六点起床。', 'Tā liù diǎn qǐchuáng.', 'Cậu ấy dậy lúc 6 giờ.', 1),
  ('hsk1_102', '七月我去中国。', 'Qīyuè wǒ qù Zhōngguó.', 'Tháng bảy tôi đi Trung Quốc.', 1),
  ('hsk1_103', '八点上课。', 'Bā diǎn shàngkè.', '8 giờ bắt đầu học.', 1),
  ('hsk1_104', '九月天气很好。', 'Jiǔyuè tiānqì hěn hǎo.', 'Tháng chín thời tiết rất đẹp.', 1),
  ('hsk1_105', '我有十本书。', 'Wǒ yǒu shí běn shū.', 'Tôi có mười quyển sách.', 1),
  ('hsk2_001', '因为我生病了，所以没来。', 'Yīnwèi wǒ shēngbìng le, suǒyǐ méi lái.', 'Vì tôi ốm nên không đến được.', 1),
  ('hsk2_002', '下雨了，所以我们不去公园了。', 'Xiàyǔ le, suǒyǐ wǒmen bú qù gōngyuán le.', 'Trời mưa nên chúng ta không đi công viên nữa.', 1),
  ('hsk2_003', '汉字很难，但是很有意思。', 'Hànzì hěn nán, dànshì hěn yǒu yìsi.', 'Chữ Hán khó nhưng rất thú vị.', 1),
  ('hsk2_004', '虽然他很忙，但是每天都学习。', 'Suīrán tā hěn máng, dànshì měitiān dōu xuéxí.', 'Tuy cậu ấy rất bận nhưng vẫn học mỗi ngày.', 1),
  ('hsk2_005', '我们一起去吃饭吧。', 'Wǒmen yìqǐ qù chīfàn ba.', 'Chúng ta cùng đi ăn nhé.', 1),
  ('hsk2_006', '明天可能会下雨。', 'Míngtiān kěnéng huì xiàyǔ.', 'Ngày mai có lẽ sẽ mưa.', 1),
  ('hsk2_007', '你需要帮助吗？', 'Nǐ xūyào bāngzhù ma?', 'Bạn cần giúp đỡ không?', 1),
  ('hsk2_008', '我觉得这个菜很好吃。', 'Wǒ juéde zhè ge cài hěn hǎochī.', 'Tôi thấy món này rất ngon.', 1),
  ('hsk2_009', '我希望能去中国留学。', 'Wǒ xīwàng néng qù Zhōngguó liúxué.', 'Tôi hy vọng được đi du học Trung Quốc.', 1),
  ('hsk2_010', '我们开始上课吧。', 'Wǒmen kāishǐ shàngkè ba.', 'Chúng ta bắt đầu học bài nhé.', 1),
  ('hsk2_011', '我在准备考试。', 'Wǒ zài zhǔnbèi kǎoshì.', 'Tôi đang chuẩn bị thi.', 1),
  ('hsk2_012', '下个月有汉语考试。', 'Xià ge yuè yǒu Hànyǔ kǎoshì.', 'Tháng sau có kỳ thi tiếng Trung.', 1),
  ('hsk2_013', '你有什么问题？', 'Nǐ yǒu shénme wèntí?', 'Bạn có câu hỏi gì không?', 1),
  ('hsk2_014', '这个词是什么意思？', 'Zhè ge cí shì shénme yìsi?', 'Từ này nghĩa là gì?', 1),
  ('hsk2_015', '今天是我妈妈的生日。', 'Jīntiān shì wǒ māma de shēngrì.', 'Hôm nay là sinh nhật mẹ tôi.', 1),
  ('hsk2_016', '这是我给你的生日礼物。', 'Zhè shì wǒ gěi nǐ de shēngrì lǐwù.', 'Đây là món quà sinh nhật tặng bạn.', 1),
  ('hsk2_017', '请给我一杯水。', 'Qǐng gěi wǒ yì bēi shuǐ.', 'Xin cho tôi một ly nước.', 1),
  ('hsk2_018', '谢谢你帮助我。', 'Xièxie nǐ bāngzhù wǒ.', 'Cảm ơn bạn đã giúp tôi.', 1),
  ('hsk2_019', '你要努力学习！', 'Nǐ yào nǔlì xuéxí!', 'Bạn phải cố gắng học tập!', 1),
  ('hsk2_020', '他学习很认真。', 'Tā xuéxí hěn rènzhēn.', 'Cậu ấy học rất nghiêm túc.', 1),
  ('hsk2_021', '别着急，慢慢说。', 'Bié zháojí, mànmàn shuō.', 'Đừng lo, cứ nói chậm thôi.', 1),
  ('hsk2_022', '妈妈很担心我。', 'Māma hěn dānxīn wǒ.', 'Mẹ rất lo lắng cho tôi.', 1),
  ('hsk2_023', '今天工作了一天，我很累。', 'Jīntiān gōngzuò le yì tiān, wǒ hěn lèi.', 'Hôm nay làm việc cả ngày, tôi mệt lắm.', 1),
  ('hsk2_024', '我们休息一下吧。', 'Wǒmen xiūxi yíxià ba.', 'Chúng ta nghỉ một chút nhé.', 1),
  ('hsk2_025', '我每天早上都锻炼身体。', 'Wǒ měitiān zǎoshang dōu duànliàn shēntǐ.', 'Sáng nào tôi cũng tập thể dục.', 1),
  ('hsk2_026', '祝你身体健康！', 'Zhù nǐ shēntǐ jiànkāng!', 'Chúc bạn sức khỏe!', 1),
  ('hsk2_027', '多运动对身体好。', 'Duō yùndòng duì shēntǐ hǎo.', 'Tập thể dục nhiều tốt cho cơ thể.', 1),
  ('hsk2_028', '我感冒了，不能上班。', 'Wǒ gǎnmào le, bù néng shàngbān.', 'Tôi bị cảm nên không đi làm được.', 1),
  ('hsk2_029', '记得按时吃药。', 'Jìde ànshí chī yào.', 'Nhớ uống thuốc đúng giờ.', 1),
  ('hsk2_030', '我们去超市买东西吧。', 'Wǒmen qù chāoshì mǎi dōngxi ba.', 'Chúng ta đi siêu thị mua đồ đi.', 1),
  ('hsk2_031', '这是我的东西。', 'Zhè shì wǒ de dōngxi.', 'Đây là đồ của tôi.', 1),
  ('hsk2_032', '这个东西很便宜。', 'Zhè ge dōngxi hěn piányi.', 'Cái này rẻ lắm.', 1),
  ('hsk2_033', '这个手机太贵了。', 'Zhè ge shǒujī tài guì le.', 'Chiếc điện thoại này đắt quá.', 1),
  ('hsk2_034', '火车很快。', 'Huǒchē hěn kuài.', 'Tàu chạy rất nhanh.', 1),
  ('hsk2_035', '请你慢一点说。', 'Qǐng nǐ màn yìdiǎn shuō.', 'Bạn vui lòng nói chậm chút.', 1),
  ('hsk2_036', '明天请早点来。', 'Míngtiān qǐng zǎodiǎn lái.', 'Mai hãy đến sớm chút.', 1),
  ('hsk2_037', '对不起，我来晚了。', 'Duìbuqǐ, wǒ lái wǎn le.', 'Xin lỗi, tôi đến muộn rồi.', 1),
  ('hsk2_038', '我买了一辆新车。', 'Wǒ mǎi le yí liàng xīn chē.', 'Tôi đã mua một chiếc xe mới.', 1),
  ('hsk2_039', '这本书是旧的。', 'Zhè běn shū shì jiù de.', 'Quyển sách này là cũ.', 1),
  ('hsk2_040', '汉语语法不太难。', 'Hànyǔ yǔfǎ bú tài nán.', 'Ngữ pháp tiếng Trung không quá khó.', 1),
  ('hsk2_041', '这个问题很容易。', 'Zhè ge wèntí hěn róngyì.', 'Câu hỏi này rất dễ.', 1),
  ('hsk2_042', '你说得不清楚。', 'Nǐ shuō de bù qīngchu.', 'Bạn nói chưa rõ ràng.', 1),
  ('hsk2_043', '这个房间很干净。', 'Zhè ge fángjiān hěn gānjìng.', 'Căn phòng này sạch sẽ lắm.', 1),
  ('hsk2_044', '图书馆里很安静。', 'Túshūguǎn lǐ hěn ānjìng.', 'Trong thư viện rất yên tĩnh.', 1),
  ('hsk2_045', '过年的时候街上很热闹。', 'Guònián de shíhou jiēshang hěn rènao.', 'Dịp Tết đường phố rất nhộn nhịp.', 1),
  ('hsk2_046', '我可以坐公共汽车去学校。', 'Wǒ kěyǐ zuò gōnggòng qìchē qù xuéxiào.', 'Tôi có thể đi xe buýt đến trường.', 1),
  ('hsk2_047', '他骑自行车上班。', 'Tā qí zìxíngchē shàngbān.', 'Cậu ấy đi làm bằng xe đạp.', 1),
  ('hsk2_048', '坐地铁又快又方便。', 'Zuò dìtiě yòu kuài yòu fāngbiàn.', 'Đi tàu điện vừa nhanh vừa tiện.', 1),
  ('hsk2_049', '这里购物很方便。', 'Zhèlǐ gòuwù hěn fāngbiàn.', 'Ở đây đi mua sắm rất tiện.', 1),
  ('hsk2_050', '学校附近有一个超市。', 'Xuéxiào fùjìn yǒu yí ge chāoshì.', 'Gần trường có một siêu thị.', 1),
  ('hsk2_051', '这是一个美丽的地方。', 'Zhè shì yí ge měilì de dìfang.', 'Đây là một nơi rất đẹp.', 1),
  ('hsk2_052', '我喜欢旅游。', 'Wǒ xǐhuan lǚyóu.', 'Tôi thích du lịch.', 1),
  ('hsk2_053', '我们一起照张相吧。', 'Wǒmen yìqǐ zhào zhāng xiàng ba.', 'Chúng ta chụp chung một tấm ảnh nhé.', 1),
  ('hsk2_054', '她唱歌唱得很好听。', 'Tā chànggē chàng de hěn hǎotīng.', 'Cô ấy hát rất hay.', 1),
  ('hsk2_055', '你喜欢跳舞吗？', 'Nǐ xǐhuan tiàowǔ ma?', 'Bạn thích nhảy múa không?', 1),
  ('hsk2_056', '孩子们在玩游戏。', 'Háizimen zài wán yóuxì.', 'Các đứa trẻ đang chơi trò chơi.', 1),
  ('hsk2_057', '她的孩子今年三岁。', 'Tā de háizi jīnnián sān suì.', 'Con của chị ấy năm nay 3 tuổi.', 1),
  ('hsk2_058', '王先生是我的老师。', 'Wáng xiānsheng shì wǒ de lǎoshī.', 'Ông Vương là giáo viên của tôi.', 1),
  ('hsk2_059', '小姐，请问洗手间在哪里？', 'Xiǎojiě, qǐngwèn xǐshǒujiān zài nǎlǐ?', 'Cô ơi, cho hỏi nhà vệ sinh ở đâu?', 1),
  ('hsk2_060', '服务员，点菜！', 'Fúwùyuán, diǎn cài!', 'Nhân viên ơi, gọi món!', 1),
  ('hsk2_061', '我想吃一碗面条。', 'Wǒ xiǎng chī yì wǎn miàntiáo.', 'Tôi muốn ăn một tô mì.', 1),
  ('hsk2_062', '早上我吃了一个鸡蛋。', 'Zǎoshang wǒ chī le yí ge jīdàn.', 'Sáng tôi đã ăn một quả trứng.', 1),
  ('hsk2_063', '每天喝牛奶对身体好。', 'Měitiān hē niúnǎi duì shēntǐ hǎo.', 'Uống sữa mỗi ngày tốt cho sức khỏe.', 1),
  ('hsk2_064', '夏天吃西瓜最舒服。', 'Xiàtiān chī xīguā zuì shūfu.', 'Mùa hè ăn dưa hấu là thích nhất.', 1),
  ('hsk2_065', '多吃青菜有好处。', 'Duō chī qīngcài yǒu hǎochù.', 'Ăn nhiều rau xanh có lợi.', 1),
  ('hsk2_066', '我不吃羊肉。', 'Wǒ bù chī yángròu.', 'Tôi không ăn thịt cừu.', 1),
  ('hsk2_067', '这条鱼很新鲜。', 'Zhè tiáo yú hěn xīnxiān.', 'Con cá này rất tươi.', 1),
  ('hsk2_068', '桌子上有一个杯子。', 'Zhuōzi shang yǒu yí ge bēizi.', 'Trên bàn có một cái cốc.', 1),
  ('hsk2_069', '请给我一个碗。', 'Qǐng gěi wǒ yí ge wǎn.', 'Xin cho tôi một cái bát.', 1),
  ('hsk2_070', '把菜放到盘子里。', 'Bǎ cài fàng dào pánzi lǐ.', 'Cho thức ăn vào đĩa.', 1),
  ('hsk2_071', '我会用筷子吃饭。', 'Wǒ huì yòng kuàizi chīfàn.', 'Tôi biết dùng đũa để ăn.', 1),
  ('hsk2_072', '我的房间朝南。', 'Wǒ de fángjiān cháo nán.', 'Phòng của tôi hướng nam.', 1),
  ('hsk2_073', '妈妈在厨房做饭。', 'Māma zài chúfáng zuòfàn.', 'Mẹ đang nấu ăn trong bếp.', 1),
  ('hsk2_074', '请关门。', 'Qǐng guānmén.', 'Làm ơn đóng cửa.', 1),
  ('hsk2_075', '打开窗户透透气吧。', 'Dǎkāi chuānghu tòutouqì ba.', 'Mở cửa sổ cho thoáng khí đi.', 1),
  ('hsk2_076', '书在桌子上。', 'Shū zài zhuōzi shang.', 'Sách ở trên bàn.', 1),
  ('hsk2_077', '这把椅子很舒服。', 'Zhè bǎ yǐzi hěn shūfu.', 'Cái ghế này rất thoải mái.', 1),
  ('hsk2_078', '他躺在床上看书。', 'Tā tǎng zài chuáng shang kànshū.', 'Cậu ấy nằm trên giường đọc sách.', 1),
  ('hsk2_079', '你最喜欢什么颜色？', 'Nǐ zuì xǐhuan shénme yánsè?', 'Bạn thích màu nào nhất?', 1),
  ('hsk2_080', '中国人喜欢红色。', 'Zhōngguórén xǐhuan hóngsè.', 'Người Trung Quốc thích màu đỏ.', 1),
  ('hsk2_081', '她穿了一件白色的裙子。', 'Tā chuān le yí jiàn báisè de qúnzi.', 'Cô ấy mặc một chiếc váy trắng.', 1),
  ('hsk2_082', '他的头发是黑色的。', 'Tā de tóufa shì hēisè de.', 'Tóc của anh ấy màu đen.', 1),
  ('hsk2_083', '她的眼睛很大。', 'Tā de yǎnjing hěn dà.', 'Đôi mắt của cô ấy rất to.', 1),
  ('hsk2_084', '他个子很高。', 'Tā gèzi hěn gāo.', 'Cậu ấy dáng người cao.', 1),
  ('hsk2_085', '这座山很高。', 'Zhè zuò shān hěn gāo.', 'Ngọn núi này rất cao.', 1),
  ('hsk2_086', '弟弟比哥哥矮。', 'Dìdi bǐ gēge ǎi.', 'Em trai thấp hơn anh trai.', 1),
  ('hsk2_087', '这条路很长。', 'Zhè tiáo lù hěn cháng.', 'Con đường này rất dài.', 1),
  ('hsk2_088', '冬天白天很短。', 'Dōngtiān báitiān hěn duǎn.', 'Mùa đông ban ngày rất ngắn.', 1),
  ('hsk2_089', '这只熊猫很胖。', 'Zhè zhī xióngmāo hěn pàng.', 'Chú gấu trúc này rất béo.', 1),
  ('hsk2_090', '她越来越瘦了。', 'Tā yuèláiyuè shòu le.', 'Cô ấy ngày càng gầy đi.', 1),
  ('hsk2_091', '天黑了，回家吧。', 'Tiān hēi le, huíjiā ba.', 'Trời tối rồi, về nhà thôi.', 1),
  ('hsk2_092', '教室里很亮。', 'Jiàoshì lǐ hěn liàng.', 'Trong lớp học rất sáng.', 1),
  ('hsk2_093', '机场离这儿很远。', 'Jīchǎng lí zhèr hěn yuǎn.', 'Sân bay cách đây rất xa.', 1),
  ('hsk2_094', '我家离学校很近。', 'Wǒ jiā lí xuéxiào hěn jìn.', 'Nhà tôi gần trường lắm.', 1),
  ('hsk2_095', '银行在邮局的左边。', 'Yínháng zài yóujú de zuǒbian.', 'Ngân hàng ở bên trái bưu điện.', 1),
  ('hsk2_096', '往右拐就是医院。', 'Wǎng yòu guǎi jiùshì yīyuàn.', 'Rẽ phải là đến bệnh viện.', 1),
  ('hsk2_097', '车站在前面。', 'Chēzhàn zài qiánmiàn.', 'Ga nằm ở phía trước.', 1),
  ('hsk2_098', '学校后面有一个公园。', 'Xuéxiào hòumiàn yǒu yí ge gōngyuán.', 'Sau trường có một công viên.', 1),
  ('hsk2_099', '超市旁边是一家饭馆。', 'Chāoshì pángbiān shì yì jiā fànguǎn.', 'Bên cạnh siêu thị là một nhà hàng.', 1),
  ('hsk2_100', '请跟我来。', 'Qǐng gēn wǒ lái.', 'Xin hãy đi theo tôi.', 1),
  ('hsk2_101', '向前走一百米。', 'Xiàng qián zǒu yìbǎi mǐ.', 'Đi thẳng về phía trước 100 mét.', 1),
  ('hsk2_102', '我从越南来。', 'Wǒ cóng Yuènán lái.', 'Tôi đến từ Việt Nam.', 1),
  ('hsk2_103', '你说得对。', 'Nǐ shuō de duì.', 'Bạn nói đúng.', 1),
  ('hsk2_104', '这道题做错了。', 'Zhè dào tí zuò cuò le.', 'Câu này làm sai rồi.', 1),
  ('hsk2_105', '我们必须努力工作。', 'Wǒmen bìxū nǔlì gōngzuò.', 'Chúng ta phải làm việc chăm chỉ.', 1),
  ('hsk2_106', '你应该多休息。', 'Nǐ yīnggāi duō xiūxi.', 'Bạn nên nghỉ ngơi nhiều hơn.', 1),
  ('hsk2_107', '你来选择吧。', 'Nǐ lái xuǎnzé ba.', 'Bạn cứ chọn đi.', 1),
  ('hsk2_108', '我决定去中国留学。', 'Wǒ juédìng qù Zhōngguó liúxué.', 'Tôi quyết định đi du học Trung Quốc.', 1),
  ('hsk2_109', '你打算什么时候回国？', 'Nǐ dǎsuàn shénme shíhou huí guó?', 'Bạn định khi nào về nước?', 1),
  ('hsk2_110', '我不知道他在哪儿。', 'Wǒ bù zhīdào tā zài nǎr.', 'Tôi không biết cậu ấy ở đâu.', 1),
  ('hsk2_111', '我相信你会成功。', 'Wǒ xiāngxìn nǐ huì chénggōng.', 'Tôi tin bạn sẽ thành công.', 1),
  ('hsk2_112', '考试成功了！', 'Kǎoshì chénggōng le!', 'Thi đỗ rồi!', 1),
  ('hsk2_113', '祝你生日快乐！', 'Zhù nǐ shēngrì kuàilè!', 'Chúc bạn sinh nhật vui vẻ!', 1),
  ('hsk2_114', '新年快乐！', 'Xīnnián kuàilè!', 'Chúc mừng năm mới!', 1),
  ('hsk2_115', '熊猫非常可爱。', 'Xióngmāo fēicháng kě''ài.', 'Gấu trúc rất dễ thương.', 1),
  ('hsk2_116', '这部电影很有意思。', 'Zhè bù diànyǐng hěn yǒu yìsi.', 'Bộ phim này rất thú vị.', 1),
  ('hsk2_117', '他一直在学习。', 'Tā yìzhí zài xuéxí.', 'Cậu ấy học liên tục.', 1),
  ('hsk2_118', '他一边听音乐一边跑步。', 'Tā yìbiān tīng yīnyuè yìbiān pǎobù.', 'Cậu ấy vừa nghe nhạc vừa chạy bộ.', 1),
  ('hsk2_119', '天气越来越冷了。', 'Tiānqì yuèláiyuè lěng le.', 'Thời tiết ngày càng lạnh.', 1),
  ('hsk2_120', '我去过北京。', 'Wǒ qù guo Běijīng.', 'Tôi đã từng đến Bắc Kinh.', 1)
ON CONFLICT DO NOTHING;

