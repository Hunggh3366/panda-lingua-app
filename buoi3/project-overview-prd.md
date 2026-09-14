# Project Overview & PRD — Gia sư từ vựng

**Trạng thái:** Hoàn thiện (Approved)  
**Ngày:** 2026-08-21  
**Phiên bản:** MVP 1.0  

## 1. Tổng quan sản phẩm

- **Tên sản phẩm:** Gia sư từ vựng (Panda Lingua)
- **Mô tả một câu:** Ứng dụng trợ lý học tiếng Trung giúp người mới bắt đầu xây nền tảng từ vựng HSK 1–2 vững chắc mỗi ngày thông qua luồng học từ mới, làm bài kiểm tra, ôn tập bằng thuật toán Spaced Repetition (SRS) và theo dõi tiến độ cá nhân hóa.
- **Đối tượng người dùng:** Người mới học tiếng Trung, bao gồm học sinh, sinh viên và người đi làm bận rộn cần phương pháp học nhanh, ngắn gọn và ghi nhớ lâu.
- **Nền tảng:** Mobile App (ưu tiên trải nghiệm chạm tay) và Web App responsive mượt mà trên desktop/tablet.
- **Hành động quan trọng nhất (North Star Action):** Bắt đầu học và hoàn thành phiên học từ vựng trong ngày.

## 2. Câu định vị MVP

> **Gia sư từ vựng** là trợ lý học tiếng Trung dành cho **người mới học** giúp họ **xây nền từ vựng HSK 1–2 vững chắc mỗi ngày** bằng việc **học từ mới**, **ôn tập đúng thời điểm bằng SRS** và **theo dõi tiến độ cá nhân hóa**.

## 3. Người dùng và bối cảnh

- **Người dùng chính:**
  - *Học sinh / Sinh viên:* Cần tích lũy từ vựng để chuẩn bị thi HSK 1, HSK 2 hoặc phục vụ môn ngoại ngữ 2 ở trường.
  - *Người đi làm:* Có ít thời gian (10–15 phút/ngày), cần học từ vựng thực tế, dễ ứng dụng và có hệ thống nhắc ôn tự động để không bị quên sau giờ làm.
- **Tình huống sử dụng:** Tranh thủ học vào các khoảng thời gian rảnh rỗi hằng ngày (buổi sáng, giờ nghỉ trưa, trên xe buýt, hoặc buổi tối trước khi ngủ) trên điện thoại hoặc máy tính.
- **Động lực:** Xây dựng nền tảng từ vựng nhanh, phát âm chuẩn, nhớ sâu để tự tin giao tiếp cơ bản và vượt qua kỳ thi chuẩn HSK.
- **Rào cản đã xác thực:** Khối lượng chữ Hán phức tạp, thanh điệu pinyin dễ nhầm lẫn, học hôm trước hôm sau quên nếu không có lộ trình nhắc ôn khoa học.

## 4. Vấn đề cần giải quyết

- **Nỗi đau chính:** 
  1. Người học thường nhanh quên từ mới sau khi học do không có kế hoạch ôn tập lặp lại đúng lúc.
  2. Thiếu lộ trình ôn tập khoa học, việc ghi nhớ phụ thuộc vào ý chí hoặc ghi chú rời rạc.
  3. Việc theo dõi tiến độ, mức độ ghi nhớ và hệ thống hóa từ vựng còn rời rạc, khó thấy được sự tiến bộ để duy trì động lực.
- **Cách làm hiện tại:** 
  - Tự ghi chép vào sổ tay hoặc dùng thẻ flashcard giấy truyền thống.
  - Học qua các ứng dụng chung chung không chuyên sâu cho từ vựng HSK hoặc có quá nhiều tính năng phức tạp gây xao nhãng.
- **Vì sao cách hiện tại chưa tốt:**
  - Thiếu thuật toán Spaced Repetition tự động tính toán thời điểm sắp quên (theo đường cong lãng quên Ebbinghaus) để đưa từ ra ôn tập.
  - Không có âm thanh phát âm bản xứ chuẩn tích hợp ngay trong thẻ từ và ví dụ.
  - Không đo lường được tỷ lệ ghi nhớ thực tế (%) và chuỗi ngày học liên tục (Streak).
- **Bằng chứng:** Khảo sát từ infographic đặc tả sản phẩm và hành vi người học tiếng Trung mới bắt đầu cho thấy hơn 75% người học từ bỏ ở giai đoạn đầu do quá tải chữ Hán và mau quên.

## 5. Job To Be Done

> Khi muốn học và tích lũy từ vựng tiếng Trung cơ bản, tôi muốn có một ứng dụng tinh gọn giúp tôi học từ mới kèm phát âm chuẩn, kiểm tra ngay khả năng ghi nhớ và tự động nhắc tôi ôn lại đúng thời điểm bằng SRS, để tôi xây nền tảng từ vựng HSK 1–2 vững chắc, nhớ lâu và thấy rõ sự tiến bộ mỗi ngày.

## 6. Giá trị sản phẩm

- **Giá trị cốt lõi:** Đóng gói trọn vẹn chu trình học tập khép kín 5 bước trong một giao diện thân thiện, rõ ràng, không gây ngợp:
  $$\text{Tổng quan hôm nay} \longrightarrow \text{Học từ mới} \longrightarrow \text{Kiểm tra} \longrightarrow \text{Ôn lại (SRS)} \longrightarrow \text{Thống kê}$$
- **Điểm khác biệt:**
  - Áp dụng thuật toán Spaced Repetition (SRS) tối ưu hóa cho từng từ vựng riêng lẻ dựa trên phản hồi của người học (Khó / Vừa / Dễ).
  - Trợ lý học tập Panda thông minh, thân thiện, tạo động lực liên tục.
  - Tích hợp giọng phát âm chuẩn tiếng Trung bản xứ (zh-CN) trực tiếp trên trình duyệt/thiết bị.
- **Giả định quan trọng nhất:** Người học duy trì được chuỗi học $\ge 5$ ngày liên tiếp khi luồng học ngắn gọn dưới 10 phút mỗi ngày và có phản hồi kết quả tức thì.

## 7. Core User Flow (5 bước cốt lõi)

```
[1. Mở ứng dụng] ──> Xem Tổng quan hôm nay (Số từ mới, số từ cần ôn SRS, chuỗi ngày)
        │
        ▼
[2. Học từ mới]  ──> Học thẻ từ (Hán tự, Pinyin, Nghĩa, Ví dụ, Phát âm audio zh-CN)
        │
        ▼
[3. Kiểm tra]    ──> Trắc nghiệm 4 lựa chọn (Chọn nghĩa/chữ đúng, nhận feedback âm thanh/màu sắc)
        │
        ▼
[4. Ôn lại SRS]  ──> Lật thẻ flashcard 3D, đánh giá mức độ nhớ (Khó / Vừa / Dễ)
        │
        ▼
[5. Thống kê]    ──> Xem tổng kết tiến độ HSK, biểu đồ ôn tập 7 ngày, hiệu suất ghi nhớ (%)
```

## 8. Yêu cầu chức năng (Functional Requirements)

### P0 — Bắt buộc cho MVP

- **FR-01 — Màn hình Tổng quan hôm nay:**
  - Hiển thị lời chào cá nhân hóa và linh vật Panda.
  - Hiển thị tổng quan số từ mới cần học hôm nay (ví dụ: 20 từ) và số từ đến hạn ôn tập SRS (ví dụ: 35 từ).
  - Nút Primary CTA nổi bật: **"Bắt đầu học ngay"** kích hoạt luồng học.
  - Quick Stats: Chuỗi học tập (Streak), Tổng từ đã thuộc, Số từ cần ôn, Độ chính xác (%).
  - Thanh tiến độ mục tiêu cấp độ HSK 1 & HSK 2.

- **FR-02 — Màn hình Học từ mới:**
  - Thẻ từ vựng lớn hiển thị Hán tự to rõ, phiên âm Pinyin có thanh điệu chuẩn.
  - Nút phát âm âm thanh (Audio) giọng đọc tiếng Trung chuẩn bản xứ (Web Speech API zh-CN).
  - Khu vực hiển thị nghĩa tiếng Việt chuẩn xác.
  - Câu ví dụ thực tế kèm Pinyin, dịch nghĩa tiếng Việt và nút nghe phát âm câu ví dụ.
  - Thanh tiến trình phiên học (ví dụ: `7/20 từ`).
  - Nút hành động chính: **"Tiếp tục"** để sang từ tiếp theo.

- **FR-03 — Màn hình Kiểm tra (Quiz):**
  - Câu hỏi trắc nghiệm tương tác với 4 phương án lựa chọn.
  - Phản hồi trực quan tức thì: viền xanh lá & icon check khi chọn đúng, viền đỏ khi chọn sai.
  - Thanh tiến độ câu hỏi (ví dụ: `Câu hỏi 3/20`).
  - Nút **"Tiếp tục"** chuyển sang câu tiếp theo và tự động ghi nhận kết quả vào cơ sở dữ liệu học tập.

- **FR-04 — Màn hình Ôn tập SRS (Spaced Repetition):**
  - Thẻ tương tác lật 3D (Interactive Flip Card): Mặt trước hiển thị chữ Hán to, mặt sau hiển thị Pinyin, nghĩa và nút phát âm.
  - 3 nút đánh giá mức độ ghi nhớ:
    - **Khó (Hard):** Lặp lại ngay trong phiên (0 ngày) — giảm hệ số dễ.
    - **Vừa (Good):** Ôn lại sau 1 ngày — duy trì hệ số.
    - **Dễ (Easy):** Ôn lại sau 3 ngày — tăng hệ số ghi nhớ.
  - Tính toán và lưu trữ ngày ôn tiếp theo (`nextReviewAt`) cho từng từ.

- **FR-05 — Màn hình Thống kê (Statistics):**
  - Bảng tổng hợp các chỉ số quan trọng: Từ đã thuộc, Số ngày học liên tiếp (Streak), Hiệu suất ghi nhớ (Retention Rate %).
  - Biểu đồ cột tương tác thể hiện số lượng từ ôn tập trong 7 ngày qua (T2 → CN).
  - Linh vật Panda với thông điệp khích lệ tinh thần học tập.

- **FR-06 — Responsive & Đa nền tảng:**
  - Giao diện Mobile-first với Bottom Navigation Bar tiện lợi khi dùng một tay.
  - Giao diện Desktop tự động mở rộng với Sidebar Drawer Navigation và vùng hiển thị tối đa 1200px.

- **FR-07 — Xử lý trạng thái (States):**
  - Đầy đủ các trạng thái `default`, `loading`, `empty` (khi đã hoàn thành hết bài trong ngày), `success` (khi hoàn thành phiên) và `error` (thông báo thân thiện).

## 9. Phạm vi (Scope)

### IN — Trong phạm vi MVP
- Toàn bộ 5 màn hình cốt lõi theo thiết kế Stitch.
- Bộ dữ liệu từ vựng HSK 1 (150 từ) và HSK 2 (150 từ) chuẩn có phát âm audio.
- Thuật toán lặp lại ngắt quãng SRS 3 mức độ.
- Hệ thống tính toán Streak và thống kê 7 ngày.
- Cơ chế lưu trữ tiến độ tự động trên LocalStorage trình duyệt.

### OUT — Chưa làm trong MVP
- Nội dung mở rộng lên HSK 3–6.
- Đăng ký tài khoản mạng xã hội phức tạp / thanh toán nạp tiền.
- Chế độ thi đấu PvP / bảng xếp hạng toàn cầu.

## 10. Tiêu chí thành công & Đo lường (Success Criteria)

| Tiêu chí thành công | Cách kiểm chứng | Chỉ số mục tiêu MVP |
|---|---|---|
| Người dùng bắt đầu học ngay | Quan sát hành vi mở ứng dụng | $\ge 90\%$ người dùng bấm CTA "Bắt đầu học ngay" trong 5 giây đầu |
| Tỷ lệ hoàn thành phiên học | Đo lường tỷ lệ đi hết 5 bước | $\ge 80\%$ hoàn thành trọn vẹn Học $\rightarrow$ Kiểm tra $\rightarrow$ Ôn SRS |
| Hiệu quả ghi nhớ với SRS | Tỷ lệ trả lời đúng câu hỏi kiểm tra sau khi ôn | $\ge 85\%$ độ chính xác sau 3 vòng ôn |
| Duy trì thói quen học tập | Theo dõi chỉ số Streak liên tục | Trung bình $\ge 5$ ngày học liên tiếp |
| Tốc độ và trải nghiệm mượt | Tốc độ tải trang và phản hồi UI | Điểm Google Lighthouse $\ge 95/100$, thời gian phản hồi $< 100\text{ms}$ |

## 11. Các câu hỏi còn mở & Quyết định chốt

- [x] **Nguồn dữ liệu từ vựng:** Sử dụng bộ từ vựng chuẩn HSK 1 & HSK 2 của Hanban/CTI được chuẩn hóa cấu trúc JSON gồm: id, hanzi, pinyin, meaning, example (hanzi + pinyin + meaning), level.
- [x] **Quy tắc SRS cụ thể:** Mô hình 3 mức độ (0 ngày / 1 ngày / 3 ngày) kết hợp trọng số ease factor $EF = 2.5$, cập nhật theo công thức rút gọn của SuperMemo SM-2.
- [x] **Tài khoản người dùng:** Giai đoạn MVP sử dụng LocalStorage ID để không tạo rào cản đăng nhập cho người học mới; hỗ trợ nút Backup / Reset dữ liệu trong cài đặt.
- [x] **Lưu trữ dữ liệu:** Tự động đồng bộ hóa vào `localStorage` của trình duyệt với cơ chế validation JSON schema an toàn.
- [x] **Công nghệ phát âm:** Sử dụng Web Speech Synthesis API với giọng chuẩn tiếng Quan thoại (`zh-CN`), không phụ thuộc server media bên ngoài.
