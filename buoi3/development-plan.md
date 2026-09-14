# Development Plan — Gia sư từ vựng (Panda Lingua)

**Nguồn:** `project-overview-prd.md`, `design-guidelines.md`, `stitch_custom_interface_design/DESIGN.md`  
**Trạng thái:** Discovery Complete & Ready for Execution  
**Ngày:** 2026-08-21  

## 1. Mục tiêu triển khai

- **MVP cần giao:** Ứng dụng Web App responsive (Mobile-first và Desktop max-width 1200px) giúp người mới học tiếng Trung học từ vựng HSK 1–2 theo luồng 5 bước khép kín:
  $$\text{Tổng quan hôm nay} \longrightarrow \text{Học từ mới} \longrightarrow \text{Kiểm tra} \longrightarrow \text{Ôn lại bằng SRS} \longrightarrow \text{Thống kê}$$
- **Core user flow:** Mở ứng dụng, xem nhiệm vụ hôm nay, bấm "Bắt đầu học ngay", lướt thẻ từ kèm phát âm và ví dụ, làm bài kiểm tra trắc nghiệm 4 lựa chọn, lật thẻ flashcard 3D đánh giá SRS (Khó/Vừa/Dễ), và xem bảng thống kê trực quan.
- **Điều kiện hoàn tất:** Chạy mượt mà, phản hồi tức thì dưới 100ms, hỗ trợ âm thanh Web Speech Synthesis zh-CN, lưu trữ tiến độ tự động trên LocalStorage, không có lỗi console.

## 2. Ràng buộc và nguyên tắc kỹ thuật

- Bám sát phạm vi MVP: từ vựng HSK 1–2, luồng học 5 bước, không thêm tính năng ngoài PRD.
- Thiết kế chuẩn Design Tokens: màu chủ đạo Navy `#173B6C`, Xanh lá `#4CAF7D`, nền sáng `#F7FAF8`, bo tròn 12–16px, linh vật Panda thân thiện.
- Đảm bảo tính khả dụng (Accessibility): tương phản màu cao, touch target $\ge 44\text{px}$, không dùng màu làm tín hiệu duy nhất, hỗ trợ bàn phím.
- Phát âm tiếng Trung bản ngữ chuẩn (`zh-CN`) không phụ thuộc server bên ngoài.
- Dữ liệu được lưu trữ an toàn, có cơ chế reset/khôi phục khi cần.

## 3. Kết quả Repository Discovery Gate (Đã hoàn thành)

- [x] **Đọc và đối soát ba tài liệu dự án & Infographic gốc:** Đã xác nhận đầy đủ mục tiêu, nỗi đau, luồng 5 bước và các màn hình tương ứng.
- [x] **Xác định Stack kỹ thuật:**
  - **Môi trường:** Web Standard SPA (HTML5, TailwindCSS / Custom CSS Tokens, Vanilla JS ES Modules).
  - **Cơ chế âm thanh:** Web Speech Synthesis API (`window.speechSynthesis`, `lang: "zh-CN"`).
  - **Dữ liệu từ vựng:** Module `src/data/hsk-vocab.js` chứa trọn vẹn bộ từ vựng HSK 1 & HSK 2 chuẩn (Hán tự, Pinyin, Nghĩa tiếng Việt, Câu ví dụ, Cấp độ).
  - **Lưu trữ:** `localStorage` với các khóa quản lý state: `panda_vocab_progress`, `panda_vocab_sessions`, `panda_vocab_stats`.
- [x] **Xác định các module thành phần:**
  - `src/data/hsk-vocab.js` (Data layer)
  - `src/services/srs.js` (SRS Algorithm domain logic)
  - `src/services/storage.js` (Data persistence & State manager)
  - `src/services/tts.js` (Audio Speech Synthesis service)
  - `src/components/overview.js` (Screen 1: Overview)
  - `src/components/learn.js` (Screen 2: Vocabulary Learning)
  - `src/components/quiz.js` (Screen 3: Quiz & Feedback)
  - `src/components/srs-review.js` (Screen 4: SRS 3D Flip Card)
  - `src/components/stats.js` (Screen 5: Statistics & 7-Day Chart)
  - `src/components/navigation.js` (Mobile Bottom Bar & Desktop Sidebar)
  - `index.html` & `src/main.js` (Application root & Router)

---

## 4. Chi tiết Kiến trúc & Data Model

### 4.1. Data Entities

| Entity | Schema & Thuộc tính chính | Mục đích & Ràng buộc |
|---|---|---|
| **VocabularyItem** | `id` (string), `hanzi` (string), `pinyin` (string), `meaning` (string), `level` ('HSK1' \| 'HSK2'), `example` ({ hanzi, pinyin, meaning }) | Định danh từ vựng HSK 1–2 |
| **LearningProgress** | `vocabId` (string), `status` ('new' \| 'learning' \| 'mastered'), `repetition` (number), `easeFactor` (number), `interval` (days), `nextReviewAt` (ISO timestamp), `lastReviewedAt` (ISO timestamp) | Phục vụ thuật toán Spaced Repetition (SRS) |
| **QuizAttempt** | `id` (string), `vocabId` (string), `selectedAnswer` (string), `isCorrect` (boolean), `createdAt` (ISO timestamp) | Lưu vết kết quả kiểm tra |
| **DailyStats** | `streakDays` (number), `totalLearned` (number), `retentionRate` (number), `weeklyHistory` (array of { day: string, count: number }) | Dữ liệu thống kê tiến độ |

### 4.2. Thuật toán Spaced Repetition (SRS)

Dựa trên nguyên lý SM-2 tinh gọn:
- **Khó (Again / Hard):**
  - $\text{repetition} = 0$
  - $\text{interval} = 0\text{ ngày}$ (ôn lại ngay trong ngày)
  - $\text{easeFactor} = \max(1.3, \text{easeFactor} - 0.2)$
- **Vừa (Good):**
  - $\text{repetition} = \text{repetition} + 1$
  - Nếu $\text{repetition} == 1 \implies \text{interval} = 1\text{ ngày}$; Nếu $\text{repetition} == 2 \implies \text{interval} = 3\text{ ngày}$; Nếu $\text{repetition} > 2 \implies \text{interval} = \text{round}(\text{interval} \times \text{easeFactor})$
- **Dễ (Easy):**
  - $\text{repetition} = \text{repetition} + 1$
  - $\text{easeFactor} = \text{easeFactor} + 0.15$
  - $\text{interval} = \max(3, \text{round}(\text{interval} \times \text{easeFactor} \times 1.3))$

---

## 5. Bản đồ các Phase triển khai (Cập nhật chuẩn AG4C v2 — 7 Buổi)

### Giai đoạn 1: UI/UX Foundation & Core Loop (Buổi 1 – Buổi 3)
- [x] **Phase 0 — Repository Discovery & Baseline:** Phân tích tài liệu, PRD, Design Guidelines và bộ token thiết kế.
- [x] **Phase 1 — Project Foundation & Vocabulary Data Layer:** Xây dựng `src/data/hsk-vocab.js` (300 từ HSK 1 & 2 chuẩn), storage service, Web Speech API audio `zh-CN`.
- [x] **Phase 2 — Core Domain Logic (SRS & Quiz Engine):** Xây dựng `src/services/srs.js` (thuật toán SM-2 tinh gọn), sinh câu hỏi trắc nghiệm, tính toán streak và retention.
- [x] **Phase 3 — UI Components & 5-Step Core Flow:** Triển khai 5 màn hình chuẩn (Overview, Learn, Quiz, SRS Review, Stats), Desktop Sidebar & Mobile Bottom Navigation, xuất bản bản chạy độc lập `Panda-Lingua-Gia-Su-Tu-Vung-v2.html`.

### Giai đoạn 2: Cloud Database, Auth & Security (Buổi 4 – Buổi 5)
- [x] **Phase 4A — Database Schema & Data Persistence (Buổi 4):** Thiết lập `supabase/schema.sql`, hỗ trợ lưu tiến độ học tập (`user_vocab_progress`), lịch sử ôn tập (`srs_review_logs`), và phiên kiểm tra (`quiz_sessions`).
- [ ] **Phase 4B — Full Supabase Data Binding:** Nối hoàn toàn dữ liệu giao diện với Supabase thay vì chỉ LocalStorage mặc định; đảm bảo dữ liệu ghi nhận và đọc lại chính xác sau khi F5.
- [ ] **Phase 5A — User Authentication (Buổi 5):** Thêm màn hình Đăng ký / Đăng nhập (Email/Password hoặc Google OAuth) qua Supabase Auth; quản lý hồ sơ học viên độc lập.
- [ ] **Phase 5B — Row Level Security (RLS) & Security Hardening:** Bật RLS cho tất cả các bảng dữ liệu cá nhân (`user_vocab_progress`, `srs_review_logs`), kiểm tra chính sách `auth.uid() = user_id`; bảo mật API keys trong `.env`.
- [ ] **Phase 5C — Production Deployment:** Đưa ứng dụng lên Internet với URL công khai (Vercel / Netlify / Cloudflare Pages) có thể truy cập mượt mà từ thiết bị di động.

### Giai đoạn 3: External Integrations & Demo Day Polish (Buổi 6 – Buổi 7)
- [ ] **Phase 6A — Telegram Notification via Edge Function (Buổi 6):** Tạo Supabase Edge Function kết nối Telegram Bot qua `@BotFather`, tự động gửi thông báo khi:
  - Hoàn thành phiên học 20 từ vựng trong ngày.
  - Đạt cột mốc chuỗi học liên tục (Streak $\ge 3, 5, 7$ ngày).
  - Nhắc nhở danh sách từ đến hạn ôn tập SRS vào khung giờ cố định.
- [ ] **Phase 6B — AI Context & Mnemonic Coach (Bonus Connection):** Tích hợp Z.ai / LLM API đóng vai trò "Gia sư Panda thông minh", giải thích chiết tự Hán tự, mẹo nhớ bộ thủ, và đặt câu ví dụ tùy biến theo ngữ cảnh học viên.
- [ ] **Phase 7 — Polish, Edge Cases & Demo Day Preparation (Buổi 7):**
  - Xử lý triệt để loading skeleton, empty state (khi hết từ cần ôn trong ngày), và thông báo lỗi thân thiện.
  - Tối ưu micro-interactions, hiệu ứng lật thẻ 3D, âm thanh thưởng khi hoàn thành bài quiz.
  - Hoàn thiện bộ tài liệu dự án (`README.md`, `PRD`, `Architecture`) và chuẩn bị slide thuyết trình 5 trang cho Demo Day.

---

## 6. Đối chiếu Barem Chấm Điểm AG4C v2 (Target: 10.0 + Bonus)

| Hạng mục | Trọng số | Tiêu chí chi tiết | Hiện trạng | Kế hoạch hoàn thiện |
|---|---|---|---|---|
| **Product (Sản phẩm)** | **40% (4.0đ)** | • Giao diện không lỗi, không crash (0.5đ)<br>• Responsive PC + Mobile (1.0đ)<br>• Bố cục: Tiêu đề, nội dung, CTA rõ ràng (0.5đ)<br>• Nội dung: Hiểu rõ đối tượng & vấn đề (0.5đ)<br>• Thiết kế: Màu sắc/font có chủ đích (0.5đ)<br>• Form: Ít nhất 1 form hoạt động (0.5đ)<br>• Validation: Báo lỗi khi nhập sai/thiếu (0.5đ) | **3.5 / 4.0đ** (Giao diện, layout, SRS flow đã hoàn thiện tốt; cần bổ sung form Auth & Feedback có validation chặt chẽ) | Hoàn thiện form đăng nhập/đăng ký và form tùy chỉnh mục tiêu học tập có validation visual. |
| **Tech (Kỹ thuật)** | **40% (4.5đ)** | • DB - Ghi: Lưu dữ liệu thành công vào DB (1.0đ)<br>• DB - Đọc: Đọc và hiển thị lại đúng (0.5đ)<br>• Persist: Tồn tại sau khi F5/refresh (0.5đ)<br>• Security Rules: RLS không mở tự do (0.5đ)<br>• API Keys: Không lộ trong code frontend (0.5đ)<br>• Deploy: Có URL thật trên Internet (0.5đ)<br>• Kết nối ngoài: Ít nhất 1 dịch vụ (Telegram/AI/...) (1.0đ) | **2.0 / 4.5đ** (Đã có schema Supabase & LocalStorage persist; chưa kích hoạt live RLS, chưa deploy URL thật, chưa nối Edge Function Telegram) | Kết nối live Supabase Auth + RLS, deploy Vercel, viết Edge Function gửi Telegram thông báo tiến độ. |
| **Report (Tài liệu & Demo)** | **20% (2.0đ)** | • Docs: Có file `.md` mô tả dự án trong repo (0.5đ)<br>• Demo: Trình bày rõ ràng luồng chính (0.5đ)<br>• Trả lời: Trả lời tự tin câu hỏi BGK (0.5đ)<br>• Luồng chính: Hợp lý, user mới dễ dùng (0.5đ) | **1.5 / 2.0đ** (Đã có PRD, Design Guidelines, Development Plan; cần kịch bản demo 5 slide chuẩn Buổi 7) | Soạn bộ tài liệu kịch bản demo 5 phút và slide Demo Day theo chuẩn Buổi 7. |
| **Bonus (Điểm cộng)** | **Cộng thêm** | • UI/UX vượt trội (Animation, 3D flip card, micro-interaction)<br>• 2+ loại kết nối ngoài (Telegram Bot + AI Gia sư Z.ai)<br>• Edge cases: Loading, empty state xử lý mượt<br>• Sáng tạo: Thuật toán SRS SM-2 chuẩn hóa HSK kết hợp Web Speech audio | **Tiềm năng tối đa** | Kích hoạt hiệu ứng âm thanh, xử lý empty state, tích hợp cả Telegram + AI Mnemonic Coach. |

---

## 7. Definition of Done (DoD) Cấp độ Hoàn chỉnh

- [x] Toàn bộ 5 màn hình trong luồng cốt lõi hoạt động trơn tru (Overview -> Learn -> Quiz -> SRS -> Stats).
- [x] Phát âm tiếng Trung chuẩn bản ngữ `zh-CN` qua Web Speech Synthesis API.
- [x] Thuật toán SRS cập nhật đúng lịch ôn tập `nextReviewAt` theo SM-2 khi đánh giá Khó / Vừa / Dễ.
- [x] Trắc nghiệm 4 lựa chọn có feedback thị giác và lưu điểm.
- [ ] Người dùng có thể đăng nhập tài khoản cá nhân, bảo vệ tiến độ qua Supabase RLS.
- [ ] Có URL chạy trực tiếp trên Internet (Vercel) mở được trên điện thoại không lỗi.
- [ ] Gửi thông báo tự động về Telegram khi hoàn thành phiên học hoặc đạt chuỗi streak.
- [ ] Xử lý đầy đủ các trạng thái loading skeleton, empty state khi hết từ cần ôn, và thông báo lỗi.
- [ ] Bộ tài liệu hoàn chỉnh sẵn sàng cho buổi Demo Day.

---

## 8. Execution Backlog (WBS)

> Estimate là effort kỹ thuật, không phải lịch cam kết. `A` là vai trò chịu trách nhiệm cuối cho mỗi task.

| ID | Task có thể giao | A | Estimate | Dependency | Output / Acceptance |
|---|---|---|---:|---|---|
| M1-01 | Tách design tokens/build-time CSS khỏi cấu hình rải rác | Frontend | 4h | — | Tokens dùng xuyên app; build không phụ thuộc Tailwind CDN |
| M1-02 | Xây primitives Button/Input/Alert/Modal/Toast | Frontend | 6h | M1-01 | Đủ states, focus, disabled/loading; Story/demo page |
| M1-03 | Xây onboarding 4 bước và daily preferences | Frontend | 8h | M1-02 | Reload/back không mất input; validation PASS |
| M1-04 | Chuẩn hóa Home và daily plan | Frontend | 6h | M1-03 | New/due/time lấy từ state thật; không hardcode demo |
| M1-05 | Bổ sung loading/empty/error/success cho 5 core screens | Frontend | 8h | M1-02 | State catalog được kiểm thử |
| M1-06 | Accessibility/responsive pass | Frontend QA | 6h | M1-03..05 | 375/768/1024/1440, keyboard, contrast, reduced motion PASS |
| M2-01 | Versioned schema migration: profiles/session/sync fields | Backend | 8h | Backup | Forward + rollback SQL; seed intact |
| M2-02 | Supabase Auth email/password/forgot password | Fullstack | 8h | M2-01 | Auth E2E PASS; session refresh PASS |
| M2-03 | Chuyển cloud user ID sang `auth.uid()` | Backend | 6h | M2-02 | Không dùng guest ID cho cloud personal tables |
| M2-04 | RLS policies toàn bộ personal tables | Security | 6h | M2-03 | Account A/B SELECT/INSERT/UPDATE/DELETE tests PASS |
| M2-05 | Guest→Account migration có preview/idempotency | Fullstack | 10h | M2-03 | Retry không duplicate; local backup được giữ |
| M3-01 | Repository abstraction và structured mutation results | Fullstack | 8h | M2 | Component không gọi DB trực tiếp; lỗi không chỉ console.warn |
| M3-02 | Offline sync queue/retry/conflict handling | Fullstack | 12h | M3-01 | Offline→online sync không mất/trùng dữ liệu |
| M3-03 | Learning session persistence/resume | Fullstack | 8h | M3-01 | Reload giữa phiên resume đúng item |
| M3-04 | Unit tests SRS, streak, quiz distractor | QA/Dev | 8h | M3-01 | Boundary/timezone/test suite PASS |
| M3-05 | Vocabulary Library search/filter | Frontend | 8h | M3-01 | Hanzi/Pinyin/Việt không dấu; filters/empty PASS |
| M4-01 | Notification preferences + Telegram test setup | Fullstack | 5h | M2 | Opt-in, test message, no secrets client |
| M4-02 | Edge Function `notify-telegram` | Backend | 8h | M4-01 | JWT/schema/idempotency/rate-limit; delivery log |
| M4-03 | Edge Function `generate-mnemonic` | Backend | 10h | M2 | Z.ai schema/cache/quota/timeout/fallback PASS |
| M4-04 | AI Coach card UI | Frontend | 6h | M4-03 | Loading/error/result/a11y states PASS |
| M5-01 | CSP/env/secret/dependency hardening | Security | 6h | M1–M4 | Bundle secret scan PASS; CSP không phá app |
| M5-02 | Staging + production deployment | DevOps | 5h | M5-01 | URL mở từ máy khác; smoke test PASS |
| M5-03 | E2E/performance/accessibility test | QA | 10h | M5-02 | Core/auth/offline/integrations + Lighthouse targets |
| M5-04 | README, Demo 5 slide, FAQ, evidence pack | Product | 8h | M5-03 | Rehearsal ≤5 phút; traceability 100% |

### Milestone Gates

- **M1 UX Foundation:** M1-01..06 PASS.
- **M2 Cloud Identity:** M2-01..05 PASS, đặc biệt RLS A/B.
- **M3 Learning Reliability:** M3-01..05 PASS.
- **M4 Integrations:** Telegram + AI không làm hỏng core loop.
- **M5 Production:** URL, security, test và demo evidence PASS.

## 9. Risk Register

| Risk | P/I | Mitigation | Trigger/Escalation |
|---|---|---|---|
| Schema hiện tại dùng guest `TEXT user_id`, xung đột Auth UUID | H/H | Migration versioned + backup + staging test | Dừng production migration nếu row mapping không đủ |
| Cloud/local merge hiện tại ghi đè mù | H/H | Repository + operation ID + conflict rules | Sync mismatch → needs-attention, không tự overwrite |
| Tailwind CDN/CSP gây rủi ro production | M/H | Build-time CSS trước deploy | Bundle/network test fail → block release |
| TTS phụ thuộc browser/voice | H/M | Capability detection + fallback | Không có zh-CN → text/Pinyin + guidance |
| AI latency/cost/hallucination | M/M | Cache, quota, schema validate, fallback, AI label | Timeout/quota → nội dung chuẩn |
| Telegram failure | M/L | Async non-blocking, delivery log | Không rollback learning completion |
| Scope creep HSK3-6/voice realtime | H/H | P0/P1/P2 gates | Không đưa vào sprint trước M5 |

## 10. Canonical Design Documents

- `FULL_PRODUCT_UI_UX_BLUEPRINT.md`
- `UI_DESIGN_SYSTEM.md`
- `UX_FLOW_AND_STATE_SPEC.md`
- `TECHNICAL_ARCHITECTURE_AND_DATA_SPEC.md`
- `AG4C_REQUIREMENTS_TRACEABILITY_MATRIX.md`
- `BLUEPRINT_QC_REPORT.md`

