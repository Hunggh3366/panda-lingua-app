# MASTER DEVELOPMENT & UPGRADE PLAN — PANDA LINGUA (AG4C v2)

> **Dự án:** Panda Lingua — Gia sư từ vựng tiếng Trung HSK 1–2 với Spaced Repetition (SRS)  
> **Khung tham chiếu:** Khóa học *Vibecode For Everyone (AG4C v2)* — 7 Buổi học & Barem chấm điểm Final Project chính thức  
> **Mục tiêu:** Nâng cấp sản phẩm thành Web App hoàn chỉnh, đáp ứng 100% tiêu chí Barem (Mục tiêu: 10.0 điểm + Bonus), tối ưu UI/UX, tích hợp Supabase Auth/RLS, Edge Function Telegram và kết nối sức mạnh AI từ dự án Language Coach trước đây.

---

## I. TỔNG HỢP & PHÂN TÍCH CHUYÊN SÂU TỪ BỘ SLIDE KHÓA HỌC (BUỔI 1 → BUỔI 7)

Qua việc giải mã toàn bộ 7 buổi học và bảng tiêu chí đánh giá *BAREM_CHAM_DIEM_AG4C_v2_checkbox.xlsx*, khóa học được thiết kế theo một lộ trình tăng trưởng năng lực lập trình ứng dụng thực tế (Vibecoding Journey):

```
[Buổi 1: Giao diện] ──> [Buổi 2: Kế hoạch PRD] ──> [Buổi 3: Tương tác & Form]
                                                              │
                                                              ▼
[Buổi 7: Demo Day]  <── [Buổi 6: Kết nối ngoài] <── [Buổi 5: Auth, RLS & Deploy] <── [Buổi 4: Lưu Database]
```

### 1. Phân rã mục tiêu & kỹ thuật qua từng buổi học

| Buổi | Tên chủ đề | Trọng tâm sư phạm & Kỹ thuật | Sản phẩm đầu ra cần đạt |
|---|---|---|---|
| **Buổi 1** | Xây dựng giao diện đầu tiên | • Khái niệm Vibecoding (tạo sản phẩm bằng ngôn ngữ tự nhiên).<br>• Cấu trúc trang web: Bố cục, màu sắc, font chữ, responsive PC/Mobile cơ bản. | Giao diện Web chạy được trên trình duyệt, có màu sắc, font chữ có chủ đích, không lỗi trắng trang/crash. |
| **Buổi 2** | Đóng gói thành ý tưởng | • Kỹ năng viết bản vẽ trước khi code: `PRD`, `design-guidelines.md`, `development-plan.md`.<br>• Xác định rõ đối tượng, nỗi đau, JTBD, Core User Flow và phạm vi MVP (IN/OUT). | Bộ tài liệu quản trị sản phẩm chuẩn mực nằm trong repo dự án. |
| **Buổi 3** | Biến kế hoạch thành tương tác thật | • Chuyển nút bấm từ "chết" sang "sống" (Interaction).<br>• Xây dựng Form nhập liệu + Validation (báo lỗi khi nhập sai/thiếu, báo thành công khi nhập đúng).<br>• Micro-interactions và phản hồi thị giác/âm thanh. | 5 màn hình cốt lõi hoạt động mượt mà; các nút và form phản hồi tức thì dưới 100ms. |
| **Buổi 4** | Xây dựng tính năng "ghi nhớ" | • Chuyển từ tương tác sang dữ liệu bền vững: Tương tác → Dữ liệu → Lưu lại → Dùng lại.<br>• Tích hợp Database (Supabase/Firebase): Tạo bảng, ghi dữ liệu từ form, đọc dữ liệu hiển thị lại trên giao diện.<br>• Đảm bảo dữ liệu **Persist** (vẫn tồn tại sau khi refresh F5 hoặc mở lại trình duyệt). | Dữ liệu tiến độ học tập, điểm quiz và lịch ôn tập được lưu trữ bền vững vào Supabase. |
| **Buổi 5** | Backend, Bảo mật & Đưa lên Internet | • Xác thực người dùng (Auth): Đăng ký, đăng nhập qua Email/Password.<br>• Phân quyền dữ liệu bằng **Row Level Security (RLS)**: Chính sách `auth.uid() = user_id`, chặn truy cập chéo giữa các user.<br>• Bảo mật API Key/Credentials (dùng `.env`, không lộ trên frontend).<br>• Đưa app lên Internet: Deploy Vercel/Netlify với URL thật chạy được trên điện thoại. | Ứng dụng chạy online có URL thật, có đăng nhập và bảng dữ liệu được bảo vệ an toàn bằng RLS. |
| **Buổi 6** | Kết nối dịch vụ bên ngoài (API & Webhook) | • Giao tiếp hai chiều: App gửi yêu cầu sang hệ thống khác & Nhận phản hồi.<br>• Tích hợp **Telegram Bot** qua **Supabase Edge Functions** (giữ bí mật Token & Chat ID ở Secrets phía sau).<br>• Nối hành động quan trọng trong app với thông báo Telegram thời gian thực. | Khi hoàn thành một hành động cốt lõi trong app, điện thoại nhận ngay thông báo Telegram tương ứng. |
| **Buổi 7** | Tổng hợp, Hoàn thiện & Chuẩn bị Demo Day | • Kiểm tra 5 câu hỏi vàng trước Demo Day (Link chạy được? Người xem hiểu ngay? Luồng chính mượt mà? Nút/form phản hồi rõ? Dữ liệu mẫu dễ hiểu?).<br>• Bẫy lỗi thường gặp: Tràn ngang màn hình Mobile, mất dữ liệu sau submit, nút loading không phản hồi.<br>• Chuẩn bị slide Demo 5 trang: Bìa → Bài toán/Đối tượng → Giải pháp & Luồng chính → Kiến trúc kỹ thuật → Kế hoạch tương lai. | Sản phẩm đạt độ chín hoàn thiện, sẵn sàng bảo vệ và đạt điểm xuất sắc trước Hội đồng Giám khảo. |

---

## II. PHÂN TẬP YÊU CẦU: CƠ BẢN — NÂNG CAO — MỞ RỘNG (THEO BAREM CHẤM ĐIỂM)

Barem chính thức chia thành 3 phần chính (10 điểm) + Điểm Bonus:
- **Phần 1: Giao diện, tương tác & tính năng sản phẩm (Product) — 40% (4.0 điểm)**
- **Phần 2: Kỹ thuật backend và dữ liệu (Tech) — 40% (4.5 điểm chuẩn hóa)**
- **Phần 3: Trình bày và tài liệu (Report) — 20% (2.0 điểm)**
- **Phần 4: Điểm cộng bổ sung (Bonus) — Dành cho danh hiệu Xuất sắc**

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 TIÊU CHUẨN XẾP LOẠI                     │
                  │   Chưa đạt (<7.0) · Đạt (7.0-7.9) · Tốt (8.0-8.9)        │
                  │              Xuất sắc (9.0 - 10.0 + Bonus)              │
                  └────────────────────────────┬────────────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
   [YÊU CẦU CƠ BẢN (P0)]             [YÊU CẦU NÂNG CAO (P1)]           [YÊU CẦU MỞ RỘNG (P2 - BONUS)]
   Ngưỡng Đạt: 7.0 - 7.9             Ngưỡng Tốt: 8.0 - 8.9             Ngưỡng Xuất sắc: 9.5 - 10+
   • Web mở không crash              • Đăng ký/Đăng nhập (Auth)        • UI/UX vượt trội (3D Flip, Audio)
   • Responsive PC + Mobile          • Phân quyền dữ liệu (RLS)        • 2+ Kết nối ngoài (Telegram + AI)
   • Bố cục rõ ràng, CTA nổi bật     • Deploy URL thật (Vercel)        • Pinyin-First Mode (Zero-base)
   • Có Form + Validation            • Nối 1 dịch vụ ngoài (Telegram)  • Xử lý Edge Cases hoàn hảo
   • DB Ghi, Đọc, Persist            • Xử lý Loading & Empty state     • Slide Demo 5 trang xuất sắc
```

### 1. Yêu cầu cơ bản (P0 — Bắt buộc phải có để đạt $\ge 7.0$ điểm)
1. **Giao diện & Trải nghiệm không crash:** Web tải mượt mà trên Chrome/Edge/Safari, không có lỗi console đỏ, không đơ lag.
2. **Responsive PC & Mobile:**
   - Trên Mobile: Giao diện tối ưu dùng một tay với Bottom Navigation Bar, touch target $\ge 44\text{px}$, không bị tràn ngang (horizontal scroll).
   - Trên Desktop: Tự động mở rộng sang Sidebar Navigation, tận dụng không gian hiển thị biểu đồ thống kê.
3. **Bố cục & Nội dung rõ ràng:** Tiêu đề, slogan, thông điệp người học hiểu ngay trong 5 giây đầu tiên ("Gia sư học từ vựng HSK 1-2 mỗi ngày").
4. **Form tương tác & Validation:** Có ít nhất 1 form hoạt động; kiểm tra dữ liệu đầu vào (báo lỗi viền đỏ khi bỏ trống/sai định dạng, báo trạng thái thành công).
5. **Dữ liệu Database (Ghi, Đọc, Persist):**
   - Dữ liệu kết quả quiz và điểm ôn tập lưu thành công vào Supabase.
   - Khi tải lại trang (F5), tiến độ học tập và streak vẫn giữ nguyên vẹn.
6. **Bảo mật cơ bản:** Không để lộ mật khẩu, API keys trong mã nguồn công khai; quản lý qua biến môi trường `.env`.
7. **Tài liệu dự án:** Có file `.md` mô tả dự án trong repo (`README.md`, `project-overview-prd.md`).

### 2. Yêu cầu nâng cao (P1 — Đưa sản phẩm lên mức Tốt $\ge 8.0 - 8.9$ điểm)
1. **Xác thực người dùng (Supabase Auth):**
   - Hỗ trợ học viên đăng ký tài khoản mới bằng Email/Mật khẩu hoặc Đăng nhập một chạm.
   - Hỗ trợ chế độ Guest (khách) mượt mà với tùy chọn đồng bộ lên Cloud khi đăng ký tài khoản.
2. **Bảo mật phân quyền Row Level Security (RLS):**
   - Kích hoạt RLS trên bảng `user_vocab_progress` và `srs_review_logs`.
   - Viết policy: `auth.uid() = user_id`, đảm bảo học viên A tuyệt đối không xem hoặc sửa được tiến độ học tập của học viên B.
3. **Deploy công khai với URL thật:**
   - Ứng dụng được triển khai trên Vercel / Cloudflare Pages / Netlify.
   - Mở thử nghiệm trên điện thoại thông qua QR code hoặc đường link trực tiếp.
4. **Kết nối dịch vụ bên ngoài qua Supabase Edge Function:**
   - Xây dựng Edge Function làm cầu nối an toàn.
   - Lưu trữ `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` trong Secrets của Supabase.
   - Gửi thông báo về Telegram khi học viên hoàn thành bài học 20 từ trong ngày.
5. **Xử lý trạng thái biên (Edge Cases & State Management):**
   - Loading State: Hiệu ứng Skeleton loader khi đang fetch dữ liệu.
   - Empty State: Màn hình động viên thân thiện khi đã ôn tập hết từ vựng trong ngày.
   - Error State: Thông báo lỗi lịch sự kèm nút thử lại khi mất mạng.

### 3. Yêu cầu mở rộng & Đột phá (P2 — Chinh phục điểm tối đa 10.0 + Bonus Giám khảo)
1. **Trải nghiệm UI/UX vượt trội (Wow Effect):**
   - Thẻ lật 3D (3D Interactive Flip Card) với hiệu ứng lật mượt mà khi học từ vựng và ôn tập SRS.
   - Tích hợp giọng phát âm chuẩn bản xứ Quan thoại (`zh-CN`) trực tiếp qua Web Speech API không độ trễ.
   - Âm thanh phản hồi (Haptic/Audio Feedback): Tiếng "ting" khi trả lời đúng quiz, hiệu ứng rung nhẹ khi chọn sai.
2. **Đa kết nối dịch vụ ngoài (2+ External Integrations):**
   - *Kết nối 1 (Telegram Bot Notification):* Báo cáo hoàn thành bài học, chúc mừng chuỗi ngày streak, nhắc giờ học buổi tối.
   - *Kết nối 2 (AI Context Coach via Z.ai API):* Tích hợp nút **"Hỏi gia sư Panda AI"**: Khi học viên gặp từ vựng khó nhớ, AI sẽ sinh ra câu chuyện chiết tự (mnemonic story), mẹo nhớ chữ Hán theo bộ thủ, và ví dụ ứng dụng thực tế theo đúng trình độ HSK 1–2.
   - *Kết nối 3 (Google Sheets Sync):* Tùy chọn xuất bảng tổng kết từ vựng đã học ra Google Sheet cá nhân của học viên.
3. **Tính năng độc đáo kết hợp giữa 2 dự án (Panda Lingua + Personal Language Coach):**
   - **Chế độ Pinyin-First Mode (Zero-base):** Bổ sung nút chuyển đổi cho người mới bắt đầu hoàn toàn: Ẩn bớt Hán tự phức tạp ở tuần đầu, tập trung vào Nghe - Nhìn Pinyin - Hiểu nghĩa, giúp học viên không bị "sốc chữ Hán".
   - **SRS SM-2 chuẩn hóa:** Thuật toán SuperMemo SM-2 tự động phân loại từ vựng thành 3 nhóm (Khó / Vừa / Dễ) và tính chính xác thời điểm lặp lại tối ưu.

---

## III. ĐỐI SOÁT HIỆN TRẠNG SẢN PHẨM & KHOẢNG TRỐNG CẦN HOÀN THIỆN

| Tiêu chí Barem | Điểm tối đa | Hiện trạng `apptiengtrung` | Khoảng trống & Nhiệm vụ cần làm |
|---|:---:|---|---|
| **1. Giao diện & Trình duyệt** | 0.5 | Đã hoàn thành (Chạy mượt trên Vite & Singlefile HTML) | Kiểm tra cross-browser trên Safari Mobile và Edge. |
| **2. Responsive PC & Mobile** | 1.0 | Đã hoàn thành (Bottom Nav + Sidebar Navigation) | Tinh chỉnh padding màn hình nhỏ (<360px), chặn overflow ngang. |
| **3. Bố cục & CTA** | 0.5 | Đã hoàn thành (Màn hình Overview rõ ràng, CTA Bắt đầu học) | Đảm bảo nút CTA nổi bật với micro-animation. |
| **4. Nội dung & Giá trị** | 0.5 | Đã hoàn thành (Rõ định vị HSK 1-2 cho người mới) | Bổ sung phần giới thiệu ngắn gọn lợi ích của thuật toán SRS. |
| **5. Thiết kế & Typography** | 0.5 | Đã hoàn thành (Tone xanh Navy + Xanh lá + Linh vật Panda) | Chuẩn hóa font Google Font (Be Vietnam Pro / Inter). |
| **6. Form tương tác** | 0.5 | Một phần (Quiz có form chọn; cài đặt Supabase có modal) | Bổ sung Form đăng nhập/đăng ký tài khoản và Form feedback/góp ý. |
| **7. Validation dữ liệu** | 0.5 | Một phần (Quiz có kiểm tra đúng sai; modal có kiểm tra URL) | Thêm thông báo validation trực quan (shake effect, viền đỏ, error text). |
| **8. Database - Ghi** | 1.0 | Một phần (Đã có schema Supabase; hiện chủ yếu ghi LocalStorage) | Nối lệnh ghi trực tiếp vào bảng `user_vocab_progress` trên Supabase. |
| **9. Database - Đọc** | 0.5 | Một phần (Đọc từ dataset tĩnh và LocalStorage) | Đọc danh sách từ cần ôn hôm nay trực tiếp từ câu truy vấn Supabase (`next_review_at <= NOW()`). |
| **10. Persist dữ liệu** | 0.5 | Đã hoàn thành (LocalStorage persist tốt) | Đảm bảo đồng bộ 2 chiều giữa LocalStorage và Supabase khi online. |
| **11. Security Rules (RLS)** | 0.5 | Chưa kích hoạt (Mới có script DDL trong `schema.sql`) | Viết lệnh kích hoạt RLS và tạo policy cụ thể trên Supabase Dashboard. |
| **12. Bảo mật API Keys** | 0.5 | Một phần (Có file `.env.example`) | Đảm bảo các credentials nhạy cảm không bị commit, kiểm tra `.gitignore`. |
| **13. Deploy URL thật** | 0.5 | Chưa deploy (Hiện đang chạy local `localhost:5173`) | **Cần deploy lên Vercel/Netlify ngay**, tạo URL công khai. |
| **14. Kết nối ngoài (1+ dịch vụ)** | 1.0 | Chưa có (Mới có Web Speech API trình duyệt) | **Xây dựng Edge Function gửi thông báo hoàn thành qua Telegram Bot**. |
| **15. Tài liệu Docs trong repo** | 0.5 | Đã có (`PRD`, `design-guidelines.md`, `development-plan.md`) | Bổ sung `README.md` hướng dẫn cài đặt và tổng quan dự án. |
| **16. Demo & Kịch bản thuyết trình** | 0.5 | Chưa có | Soạn kịch bản Demo 5 phút theo chuẩn Buổi 7. |
| **17. Trả lời phản biện BGK** | 0.5 | Sẵn sàng | Chuẩn bị tài liệu FAQ giải thích kiến trúc và thuật toán SRS. |
| **18. Luồng chính hợp lý** | 0.5 | Đã hoàn thành (Luồng 5 bước khép kín rất logic) | Tối ưu bước chuyển cảnh giữa Quiz và Ôn tập SRS. |
| **Bonus: UI/UX vượt trội** | +0.5 | Đã có thẻ 3D lật và âm thanh Web Speech | Thêm hiệu ứng âm thanh SFX và animation thưởng. |
| **Bonus: 2+ Kết nối ngoài** | +0.5 | Tiềm năng | Kết hợp Telegram Bot + AI Context Coach (Z.ai API). |
| **TỔNG ĐIỂM** | **10.0+** | **Chưa chấm chính thức — xem trạng thái D/I/V trong Traceability Matrix** | **Chỉ dự báo điểm sau khi đủ evidence và QC production** |

---

## IV. BẢN KẾ HOẠCH HÀNH ĐỘNG CHI TIẾT (WORK BREAKDOWN STRUCTURE)

### Giai đoạn 1: Hoàn thiện Form, Validation & Trải nghiệm UI/UX (P0)
- [ ] **Task 1.1 — Bổ sung Auth Modal & Form Validation:**
  - Tạo component đăng ký/đăng nhập (Email, Mật khẩu, Tên học viên).
  - Validation: Email đúng cú pháp, mật khẩu $\ge 6$ ký tự, hiển thị thông báo lỗi trực quan ngay dưới input.
- [ ] **Task 1.2 — Xử lý triệt để Loading, Empty & Error States:**
  - Khi chưa có từ đến hạn ôn SRS: Hiển thị minh họa Panda ôm cúp chúc mừng *"Bạn đã hoàn thành hết từ vựng hôm nay! Hãy quay lại vào ngày mai"*.
  - Khi đang tải dữ liệu: Hiển thị Skeleton card nhấp nháy êm dịu.
- [ ] **Task 1.3 — Tối ưu Responsive & Font chữ:**
  - Kiểm tra giao diện trên khung hình 375px (iPhone SE/Mini), đảm bảo không có thanh cuộn ngang.
  - Nhúng Google Font `Plus Jakarta Sans` hoặc `Be Vietnam Pro` để tăng tính hiện đại.

### Giai đoạn 2: Kích hoạt Live Supabase Auth & Row Level Security (P1)
- [ ] **Task 2.1 — Kết nối Supabase Client chính thức:**
  - Cấu hình file `.env` với `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
  - Thiết lập cơ chế tự động chuyển đổi: Nếu có mạng và đã đăng nhập → Lưu Cloud Supabase; Nếu chưa đăng nhập hoặc mất mạng → Lưu LocalStorage và xếp hàng đợi đồng bộ (Sync queue).
- [ ] **Task 2.2 — Thực thi Migration RLS trên Supabase:**
  - Chạy lệnh kích hoạt RLS trên bảng `user_vocab_progress`:
    ```sql
    ALTER TABLE public.user_vocab_progress ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only access their own vocab progress"
    ON public.user_vocab_progress
    FOR ALL
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);
    ```
- [ ] **Task 2.3 — Kiểm thử bảo mật (Security Test):**
  - Đăng nhập bằng 2 tài khoản thử nghiệm khác nhau, xác nhận dữ liệu của tài khoản A không bao giờ xuất hiện ở tài khoản B.

### Giai đoạn 3: Triển khai Đưa ứng dụng lên Internet (Deploy Vercel) (P0)
- [ ] **Task 3.1 — Chuẩn bị cấu hình Deploy:**
  - Tạo file cấu hình `vercel.json` định tuyến SPA chuẩn xác.
  - Đảm bảo lệnh `npm run build` tạo ra thư mục `dist` sạch sẽ, không có lỗi TypeScript/ESLint.
- [ ] **Task 3.2 — Đưa lên Vercel:**
  - Triển khai ứng dụng lên Vercel để lấy URL thật (vd: `https://panda-lingua.vercel.app`).
  - Cấu hình Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) trên Vercel Dashboard.
  - Quét mã QR kiểm tra trực tiếp trên điện thoại thông minh.

### Giai đoạn 4: Kết nối Dịch vụ bên ngoài qua Edge Function (P1 & P2)
- [ ] **Task 4.1 — Thiết lập Telegram Bot qua BotFather:**
  - Tạo Bot mới `@PandaLinguaLearningBot` bằng BotFather, lấy `TELEGRAM_BOT_TOKEN`.
  - Tạo group hoặc chat cá nhân, lấy `TELEGRAM_CHAT_ID`.
  - Lưu trữ cả 2 thông số vào Supabase Secrets (an toàn 100%, không lộ ra ngoài).
- [ ] **Task 4.2 — Viết Supabase Edge Function `notify-telegram`:**
  - Nhận payload từ app: Tên học viên, số từ đã học, chuỗi ngày streak, thời gian hoàn thành.
  - Định dạng tin nhắn Telegram HTML sinh động có linh vật Panda:
    ```
    🐼 [Panda Lingua] Chúc mừng học viên Hà Mạnh Hùng!
    🔥 Chuỗi học tập: 5 ngày liên tiếp!
    📚 Vừa hoàn thành xuất sắc phiên học 20 từ vựng HSK 1.
    🎯 Độ chính xác Quiz: 95%
    ⏰ Lần ôn tập SRS tiếp theo: 20:00 ngày mai.
    ```
- [ ] **Task 4.3 — Tích hợp Trợ lý Gia sư AI (Z.ai API) (Điểm Bonus):**
  - Tạo nút *"Giải nghĩa cùng Gia sư AI"* trong thẻ từ vựng.
  - Gọi mô hình `glm-4.5-flash` của Z.ai (kế thừa từ dự án Language Coach) để trả về:
    + Câu chuyện chiết tự chữ Hán (Mnemonic).
    + 1 câu hội thoại thực tế có từ vựng đó.
    + Gợi ý cách phát âm đúng thanh điệu.

### Giai đoạn 5: Đóng gói Tài liệu & Chuẩn bị Demo Day (P0 & P1)
- [ ] **Task 5.1 — Hoàn thiện file `README.md` dự án:**
  - Tổng quan sản phẩm, link demo online, công nghệ sử dụng, cấu trúc thư mục, hướng dẫn chạy local.
- [ ] **Task 5.2 — Thiết kế Slide thuyết trình Demo Day 5 trang (Chuẩn Buổi 7):**
  - *Slide 1 — Bìa:* Tên sản phẩm, slogan, logo Panda, tên tác giả.
  - *Slide 2 — Bài toán:* Nỗi đau người học tiếng Trung (quá tải Hán tự, nhanh quên) & Giải pháp Panda Lingua.
  - *Slide 3 — Trải nghiệm cốt lõi:* Luồng 5 bước khép kín (Overview → Learn → Quiz → SRS 3D → Stats).
  - *Slide 4 — Kiến trúc kỹ thuật:* Frontend SPA + Supabase Database & Auth/RLS + Edge Function Telegram + AI Engine.
  - *Slide 5 — Tương lai & Mở rộng:* Kết hợp sâu với hệ sinh thái Personal Language Coach (Luyện nói giọng chuẩn, Pinyin-first, đàm thoại phản xạ).
- [ ] **Task 5.3 — Chuẩn bị kịch bản Demo 5 phút:**
  - Chuẩn bị sẵn 1 tài khoản test đã có dữ liệu đẹp (Streak 5 ngày, biểu đồ tuần đầy đủ).
  - Thao tác trực tiếp: Học 1 từ mới → Nghe phát âm → Làm quiz trắc nghiệm → Lật thẻ 3D đánh giá SRS → Nhận tin nhắn thông báo trên điện thoại.

---

## V. ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE CHO BẢN NÂNG CẤP)

Một sản phẩm được coi là hoàn thiện và sẵn sàng **được chấm theo barem** khi:
1. **URL Production sống:** Mở được trên bất kỳ thiết bị nào qua đường link Internet công khai.
2. **Luồng học 5 bước mượt mà:** Người mới bắt đầu có thể đi trọn vẹn từ lúc mở app đến khi xem bảng thống kê trong vòng 3 phút mà không gặp bất kỳ điểm nghẽn nào.
3. **Dữ liệu được bảo vệ:** Đăng nhập an toàn, dữ liệu cá nhân hóa tách biệt qua Supabase RLS.
4. **Thông báo Telegram hoạt động:** Tin nhắn gửi về điện thoại ngay sau khi hoàn thành phiên học.
5. **Tài liệu và Slide sẵn sàng:** Đầy đủ tài liệu Markdown trong repo và slide thuyết trình Demo Day.

> [!IMPORTANT]
> “Có thiết kế” không đồng nghĩa “đã triển khai” hoặc “đã xác minh”. Dùng `AG4C_REQUIREMENTS_TRACEABILITY_MATRIX.md` làm nguồn trạng thái D/I/V và `BLUEPRINT_QC_REPORT.md` làm quality gate cho bộ thiết kế.

## VI. BỘ TÀI LIỆU CANONICAL

1. `FULL_PRODUCT_UI_UX_BLUEPRINT.md` — Product scope, journeys, chức năng, rules và DoD.
2. `UI_DESIGN_SYSTEM.md` — Tokens, components, layouts, responsive và accessibility.
3. `UX_FLOW_AND_STATE_SPEC.md` — State machines, recovery, edge cases và microcopy.
4. `TECHNICAL_ARCHITECTURE_AND_DATA_SPEC.md` — Data model, RLS, sync, Edge Functions và security.
5. `AG4C_REQUIREMENTS_TRACEABILITY_MATRIX.md` — Mapping barem → feature → test → evidence.
6. `buoi3/development-plan.md` — WBS, estimate, dependency, milestone và risks.
