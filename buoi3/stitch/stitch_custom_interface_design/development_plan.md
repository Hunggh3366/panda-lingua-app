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

## 5. Bản đồ các Phase triển khai

- [x] **Phase 0 — Repository discovery và baseline:** Đã hoàn thành, phân tích tài liệu và cấu trúc repo.
- [ ] **Phase 1 — Project Foundation & Vocabulary Data Layer:** Xây dựng `src/data/hsk-vocab.js` với 300 từ HSK 1 & HSK 2 chuẩn, service lưu trữ `src/services/storage.js`, service âm thanh `src/services/tts.js`.
- [ ] **Phase 2 — Core Domain Logic (SRS & Quiz Engine):** Xây dựng `src/services/srs.js`, logic sinh câu hỏi trắc nghiệm ngẫu nhiên từ dataset, tính toán streak và retention.
- [ ] **Phase 3 — UI Components & 5-Step Core Flow:** Triển khai 5 màn hình chuẩn theo design token và mã nguồn Stitch:
  1. `overview.js`: Chào hỏi Panda, thẻ bài học hôm nay, quick stats.
  2. `learn.js`: Flashcard học từ, phát âm âm thanh, câu ví dụ minh họa.
  3. `quiz.js`: Trắc nghiệm 4 lựa chọn, hiệu ứng chọn đúng/sai, âm thanh phản hồi.
  4. `srs-review.js`: Thẻ lật 3D, 3 nút đánh giá Khó/Vừa/Dễ.
  5. `stats.js`: Biểu đồ cột 7 ngày có animation, % ghi nhớ, phân tích HSK 1 & 2.
- [ ] **Phase 4 — Navigation, Responsive & Polish:** Tích hợp Desktop Sidebar Navigation & Mobile Bottom Navigation Bar, transitions mượt mà giữa các màn hình, responsive 100% trên mọi kích thước màn hình.
- [ ] **Phase 5 — Testing, Verification & Walkthrough:** Kiểm tra toàn bộ luồng học từ đầu đến cuối, kiểm tra lưu trữ local storage và phát âm.

---

## 6. Definition of Done (DoD)

- [ ] Toàn bộ 5 màn hình trong luồng cốt lõi hoạt động trơn tru.
- [ ] Phát âm tiếng Trung giọng chuẩn hoạt động khi bấm icon loa.
- [ ] Thuật toán SRS cập nhật đúng lịch ôn tập `nextReviewAt` khi đánh giá Khó / Vừa / Dễ.
- [ ] Quiz sinh câu hỏi tự động, chấm điểm chính xác và có phản hồi thị giác rõ ràng.
- [ ] Thống kê cập nhật tức thời chuỗi ngày streak và biểu đồ 7 ngày.
- [ ] Giao diện tương thích hoàn hảo trên cả điện thoại (Mobile) và máy tính (Desktop/Tablet).
