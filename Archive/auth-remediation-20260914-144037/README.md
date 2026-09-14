# 🐼 Panda Lingua — Gia Sư Từ Vựng Tiếng Trung HSK 1–2

> **Học từ vựng mỗi ngày — Không bao giờ quên — Với gia sư AI luôn sẵn sàng**

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://panda-lingua.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![AG4C v2](https://img.shields.io/badge/Course-AG4C%20v2-blueviolet)](.)

---

## 🎯 Sản phẩm là gì?

**Panda Lingua** là ứng dụng web học từ vựng tiếng Trung Quốc chuẩn HSK 1–2 (225 từ), được thiết kế cho người mới bắt đầu hoàn toàn. Ứng dụng sử dụng thuật toán **Spaced Repetition (SRS) SM-2** để tối ưu hóa lịch ôn tập — đảm bảo bạn chỉ ôn đúng từ cần ôn, đúng thời điểm.

### Đối tượng người dùng
- Người Việt Nam mới bắt đầu học tiếng Trung, chưa biết đọc Hán tự
- Học sinh, sinh viên cần nền tảng từ vựng HSK 1–2 vững chắc
- Người đi làm muốn học 20 từ/ngày theo lịch trình khoa học

### Vấn đề giải quyết
| Nỗi đau | Giải pháp Panda Lingua |
|---|---|
| Học xong là quên ngay | Thuật toán SRS SM-2 nhắc ôn đúng lúc |
| Hán tự quá phức tạp | Thẻ từ song ngữ Hán–Pinyin–Việt |
| Không biết mình yếu từ nào | Dashboard thống kê trực quan |
| Không có ai giải thích ngay lúc học | Gia sư AI Panda sẵn sàng 24/7 |

---

## ✨ Tính năng chính

### 📚 Học từ vựng (Learn)
- 225 từ HSK 1–2 chia thành bộ từ 20 từ/ngày
- Thẻ từ song ngữ: Hán tự + Pinyin + Nghĩa tiếng Việt + Ví dụ câu
- Phát âm chuẩn bản xứ Quan thoại qua **Web Speech API** (zh-CN)
- Micro-animation mượt mà khi chuyển thẻ

### 🎯 Quiz trắc nghiệm (Quiz)
- 4 đáp án, phản hồi ngay lập tức
- Hiệu ứng âm thanh "ting" khi đúng, rung khi sai
- Tính điểm chính xác theo % và ghi nhận vào lịch sử

### 🃏 Ôn tập SRS (Spaced Repetition)
- Thẻ lật 3D với hiệu ứng CSS 3D Transform
- 3 nút đánh giá: **Khó 🔴** / **Vừa 🟡** / **Dễ 🟢**
- Thuật toán SM-2 tự tính ngày ôn tiếp theo

### 📊 Thống kê cá nhân (Stats)
- Biểu đồ hoạt động 7 ngày
- Tỷ lệ ghi nhớ, từ đã học, streak chuỗi ngày
- Phân bổ từ theo độ khó

### 🤖 Gia sư AI Panda
- 4 chip nhanh: **Chiết tự** · **Ví dụ** · **Phân biệt** · **Mẹo phát âm**
- Hỏi tự do bằng tiếng Việt
- Kiến trúc 2 tầng: Offline Fallback → OpenRouter Free API
- **Zero cost**: Dùng các model miễn phí (meta-llama/llama-3.1-8b-instruct:free, v.v.)

### 🔥 Streak TikTok Style
- Ngọn lửa nhảy múa khi đạt streak mới
- Card ăn mừng pop-up với animation
- Persist qua localStorage

### 📱 Telegram Notifications
- Edge Function Supabase gửi thông báo hoàn thành bài học
- Cấu hình Bot Token + Chat ID an toàn qua Supabase Secrets
- Test ngay trong Settings

---

## 🏗️ Kiến trúc kỹ thuật

```
┌─────────────────────────────────────────────────────────┐
│                    PANDA LINGUA                          │
│              Single-Page App (Vanilla JS)                │
├─────────────────────┬───────────────────────────────────┤
│   FRONTEND (SPA)    │         BACKEND SERVICES           │
│                     │                                    │
│  • index.html       │  ┌──── Supabase ────┐             │
│  • Vanilla JS ES6   │  │  • Auth (Email)   │             │
│  • CSS Variables    │  │  • PostgreSQL DB  │             │
│  • Web Speech API   │  │  • RLS Policies   │             │
│  • LocalStorage     │  │  • Edge Functions │             │
│                     │  └──────────────────┘             │
│                     │                                    │
│                     │  ┌─── External APIs ──┐           │
│                     │  │  • Telegram Bot    │           │
│                     │  │  • OpenRouter AI   │           │
│                     │  └────────────────────┘           │
└─────────────────────┴───────────────────────────────────┘
```

### Tech Stack
| Layer | Technology | Lý do chọn |
|---|---|---|
| Frontend | Vanilla JS + CSS | Zero dependency, cực nhanh |
| Build tool | Vite + vite-plugin-singlefile | Bundle thành 1 file HTML duy nhất |
| Database | Supabase PostgreSQL | Free tier, RLS built-in |
| Auth | Supabase Auth | Email/Password + Guest mode |
| Edge Function | Deno (Supabase) | Serverless, secrets an toàn |
| AI | OpenRouter (free models) | Zero cost cho demo |
| Deploy | Vercel | Free tier, tự động CI/CD |

---

## 🚀 Hướng dẫn chạy local

### Yêu cầu
- Node.js 18+
- npm 9+

### Cài đặt

```bash
# 1. Clone repo
git clone https://github.com/your-username/panda-lingua.git
cd panda-lingua

# 2. Cài dependencies
npm install

# 3. Tạo file .env từ template
cp .env.example .env
# Điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào .env

# 4. Chạy dev server
npm run dev
# → http://localhost:5173
```

### Build production

```bash
npm run build
# → dist/index.html (single HTML file, không cần server)
```

### Preview production build

```bash
npm run preview
# → http://localhost:4173
```

---

## 🗄️ Cấu trúc thư mục

```
apptiengtrung/
├── index.html                    # App chính (Single-file SPA)
├── package.json                  # Dependencies & scripts
├── vite.config.mjs               # Build config (singlefile plugin)
├── vercel.json                   # Deploy config (SPA routing)
├── .env.example                  # Template biến môi trường
├── dist/                         # Production build
│   └── index.html
├── supabase/
│   └── functions/
│       └── notify-telegram/      # Edge Function gửi Telegram
│           └── index.ts
├── buoi3/                        # Tài liệu sản phẩm
│   ├── project-overview-prd.md  # Product Requirements Document
│   ├── design-guidelines.md     # Design system & UI guidelines
│   └── development-plan.md      # WBS & timeline
├── scripts/
│   └── seed-supabase.js         # Script seed dữ liệu từ vựng
└── docs/                        # Tài liệu kiến trúc
    ├── FULL_PRODUCT_UI_UX_BLUEPRINT.md
    ├── TECHNICAL_ARCHITECTURE_AND_DATA_SPEC.md
    ├── UI_DESIGN_SYSTEM.md
    ├── UX_FLOW_AND_STATE_SPEC.md
    └── AG4C_REQUIREMENTS_TRACEABILITY_MATRIX.md
```

---

## 🗃️ Database Schema (Supabase)

```sql
-- Bảng tiến độ từ vựng của học viên
CREATE TABLE public.user_vocab_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,          -- auth.uid() hoặc guest-uuid
  vocab_id        TEXT NOT NULL,          -- Mã từ vựng (vd: "HSK1_001")
  repetitions     INT  DEFAULT 0,         -- Số lần đã ôn
  easiness_factor REAL DEFAULT 2.5,       -- SM-2 E-factor
  interval_days   INT  DEFAULT 1,         -- Khoảng cách ôn (ngày)
  next_review_at  TIMESTAMPTZ,            -- Lịch ôn tiếp theo
  last_quality    INT,                    -- Chất lượng lần cuối (0-5)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: Học viên chỉ xem dữ liệu của mình
ALTER TABLE public.user_vocab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own vocab progress"
ON public.user_vocab_progress
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
```

---

## 🔐 Biến môi trường

Xem file [`.env.example`](./.env.example) để biết đầy đủ các biến cần thiết.

| Biến | Mô tả | Bắt buộc |
|---|---|---|
| `VITE_SUPABASE_URL` | Project URL từ Supabase Dashboard | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Anon Key từ Supabase Dashboard | ✅ |
| `VITE_OPENROUTER_API_KEY` | API key từ openrouter.ai (free) | Tùy chọn |

> ⚠️ **Không commit file `.env`**. File này đã được thêm vào `.gitignore`.

### Supabase Secrets (Edge Functions)
Cài đặt trong Supabase Dashboard → Project Settings → Edge Functions → Secrets:
- `TELEGRAM_BOT_TOKEN` — Token từ @BotFather
- `TELEGRAM_CHAT_ID` — Chat ID của bạn

---

## 📋 Tài liệu liên quan

| Tài liệu | Mô tả |
|---|---|
| [`buoi3/project-overview-prd.md`](./buoi3/project-overview-prd.md) | Product Requirements Document |
| [`buoi3/design-guidelines.md`](./buoi3/design-guidelines.md) | Hệ thống thiết kế & UI guidelines |
| [`buoi3/development-plan.md`](./buoi3/development-plan.md) | Kế hoạch phát triển & WBS |
| [`FULL_PRODUCT_UI_UX_BLUEPRINT.md`](./FULL_PRODUCT_UI_UX_BLUEPRINT.md) | Blueprint UX đầy đủ |
| [`TECHNICAL_ARCHITECTURE_AND_DATA_SPEC.md`](./TECHNICAL_ARCHITECTURE_AND_DATA_SPEC.md) | Kiến trúc kỹ thuật |

---

## 🎓 Về dự án

Dự án được phát triển trong khuôn khổ **Vibecode For Everyone (AG4C v2)** — Khóa học lập trình ứng dụng thực tế bằng phương pháp Vibecoding.

**Tác giả:** Hà Mạnh Hùng  
**Khóa học:** AG4C v2 — MindX Technology School  
**Demo URL:** [https://panda-lingua.vercel.app](https://panda-lingua.vercel.app) *(sau khi deploy)*

---

*Made with 🐼 by Hà Mạnh Hùng — AG4C v2 Final Project*
