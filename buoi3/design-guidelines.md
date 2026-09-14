# Design Guidelines — Gia sư từ vựng

**Nguồn:** `project-overview-prd.md`  
**Trạng thái:** Draft  
**Ngày:** 2026-08-21  

## 1. Design direction

- **Hướng được khuyến nghị:** Giao diện học tập thân thiện, sáng sủa và rõ ràng; Mobile-first nhưng responsive đầy đủ trên Web.
- **Ba tính từ định hướng:** Thân thiện — Rõ ràng — Tạo động lực.
- **Vì sao phù hợp:** Người dùng chính là người mới học tiếng Trung. Họ cần nhìn thấy việc phải làm ngay, bắt đầu học nhanh và luôn hiểu mình đang ở bước nào.
- **Điều cần tránh:** Dashboard quá nhiều thông tin, quá nhiều CTA, màu sắc rối, decoration làm mất tập trung, hoặc tính năng ngoài MVP.
- **Giả định thiết kế:** Panda là điểm nhận diện giúp giao diện thân thiện nhưng không được chiếm sự chú ý hơn nội dung học.

### Thông tin user cung cấp

- Mobile App ưu tiên và Web App responsive.
- Khi mở sản phẩm: xem tổng quan hôm nay → bắt đầu học từ mới.
- Cảm giác: thân thiện, rõ ràng, tạo động lực.
- Visual: xanh navy + xanh lá, nền sáng, icon bo tròn, panda.
- Ngôn ngữ: tiếng Việt.
- Accessibility: tương phản tốt, không dùng màu làm tín hiệu duy nhất, touch target phù hợp mobile, keyboard focus rõ trên web, hỗ trợ reduced motion.

### Đề xuất của coach

- Duy trì một core flow thống nhất: Tổng quan → Học từ mới → Kiểm tra → Ôn SRS → Thống kê.
- Mỗi vùng quyết định chỉ có một primary CTA.
- Mobile ưu tiên tốc độ thao tác; Web tận dụng không gian rộng hơn cho thống kê và nội dung phụ.
- Học là nội dung chính; thống kê chỉ hỗ trợ người dùng hiểu tiến độ.

### Giả định cần kiểm chứng

- Người dùng muốn bắt đầu phiên học trực tiếp từ tổng quan hôm nay.
- SRS là cách phù hợp để quyết định thời điểm ôn lại từ.
- Panda tạo cảm giác thân thiện mà không làm giảm tập trung.

## 2. UX principles

1. **Vào học nhanh:** Người dùng phải hiểu việc cần làm ngay khi mở sản phẩm.
2. **Một quyết định chính mỗi màn hình:** Không để nhiều CTA cạnh tranh.
3. **Luôn biết mình đang ở đâu:** Progress và feedback phải rõ.
4. **Phản hồi ngay sau thao tác:** Đúng, sai, hoàn thành hoặc lỗi đều phải dễ hiểu.
5. **Không làm người mới bị ngợp:** Chỉ hiển thị thông tin cần thiết cho bước hiện tại.

## 3. Information architecture

- **Khu vực chính:**
  - Tổng quan hôm nay
  - Học từ mới
  - Kiểm tra
  - Ôn lại bằng SRS
  - Thống kê
- **Quan hệ điều hướng:** Tổng quan là điểm vào chính; phiên học dẫn sang kiểm tra; kết quả kiểm tra dẫn đến nội dung cần ôn; thống kê phản ánh tiến độ.
- **Nội dung ưu tiên:** Việc cần làm hôm nay → CTA bắt đầu học → nội dung học → feedback → tiến độ.

## 4. Core user flow

1. **Entry:** Người dùng mở sản phẩm và xem tổng quan hôm nay.
2. **Primary action:** Chọn “Bắt đầu học”.
3. **System feedback:** Hệ thống hiển thị từ vựng HSK 1–2 và tiến trình.
4. **Result:** Người dùng hoàn thành học và làm bài kiểm tra.
5. **Next useful action:** Ôn lại các từ cần củng cố bằng SRS và xem thống kê.

## 5. Screens and states

| Màn hình | Mục đích | Nội dung chính | Trạng thái bắt buộc |
|---|---|---|---|
| Tổng quan hôm nay | Cho biết việc cần làm | Tiến độ, nội dung hôm nay, CTA | default, loading, empty, error |
| Học từ mới | Học từ vựng HSK 1–2 | Vocabulary card, tiến trình, thao tác tiếp tục | default, loading, error, success |
| Kiểm tra | Kiểm tra khả năng nhớ | Câu hỏi, đáp án, tiến trình, feedback | default, validation, success, error |
| Ôn lại SRS | Củng cố từ cần nhớ | Từ cần ôn, tiến trình, feedback | default, loading, success, error |
| Thống kê | Theo dõi tiến độ | Tiến độ và kết quả học | loading, empty, error, populated |

## 6. Component inventory

| Component | Trách nhiệm | Biến thể/state | Ghi chú accessibility |
|---|---|---|---|
| Header | Nhận diện và điều hướng | mobile, desktop | Semantic navigation |
| Today Summary | Tóm tắt việc học hôm nay | default, loading, empty | Không chỉ dùng màu |
| Primary CTA | Bắt đầu hành động chính | default, pressed, disabled, loading | Focus rõ, touch target đủ lớn |
| Vocabulary Card | Hiển thị từ vựng | default, revealed, completed | Nội dung có semantic structure |
| Progress Indicator | Hiển thị tiến độ | active, completed | Có text hỗ trợ |
| Quiz Option | Chọn đáp án | default, selected, correct, incorrect, disabled | Focus và selected rõ |
| Feedback Message | Phản hồi thao tác | success, error, info | Có text, không chỉ màu |
| SRS Review Card | Hiển thị nội dung ôn | default, revealed, completed | Dễ thao tác trên mobile |
| Stats Card | Hiển thị tiến độ | default, loading, empty | Không nhồi nhiều số |
| Navigation | Di chuyển khu vực chính | mobile, desktop | Keyboard focus rõ |
| Panda Illustration | Điểm nhận diện | default, success, empty | Không chứa thông tin quan trọng duy nhất |

## 7. Layout và responsive behavior

- **Mobile:** Một cột, nội dung học chiếm ưu tiên, CTA chính dễ chạm.
- **Tablet:** Mở rộng vùng nội dung nhưng giữ flow đơn giản.
- **Desktop:** Container có max-width; có thể bố trí nội dung chính và thông tin phụ cạnh nhau nếu không làm giảm tập trung.
- **Grid/container:** Spacing theo hệ thống thống nhất; nội dung không kéo quá rộng trên màn hình lớn.
- **Ưu tiên khi không đủ chỗ:** Nội dung học → CTA chính → tiến độ → thông tin phụ → decoration.
- **Responsive:** Không thay đổi logic core flow giữa Mobile và Web.

## 8. Design tokens

### Color

| Token | Giá trị đề xuất | Mục đích |
|---|---|---|
| `color-primary` | `#173B6C` | CTA và điểm nhấn chính |
| `color-primary-dark` | `#102B50` | Pressed/hover và nhấn mạnh |
| `color-secondary` | `#4CAF7D` | Tiến độ và trạng thái tích cực |
| `color-background` | `#F7FAF8` | Nền tổng thể |
| `color-surface` | `#FFFFFF` | Card và vùng nội dung |
| `color-text` | `#17212B` | Nội dung chính |
| `color-text-muted` | `#64717D` | Nội dung phụ |
| `color-danger` | `#C94A4A` | Lỗi |
| `color-border` | `#DCE4E1` | Viền |

### Typography

- **Font family:** Inter hoặc sans-serif dễ đọc tương đương.
- **Display/heading/body/label:** Phân cấp rõ; heading nổi bật, body dễ đọc, label ngắn.
- **Nguyên tắc độ dài dòng:** Câu ngắn, ưu tiên nội dung theo từng khối, tránh đoạn dài.

### Spacing, radius và elevation

- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 px.
- **Radius:** 8 px cho control nhỏ; 12–16 px cho card.
- **Border/elevation:** Border nhẹ và shadow nhẹ; tránh UI nặng.

## 9. Interaction và feedback

- **Primary action:** “Bắt đầu học”.
- **Hover/focus/pressed/disabled:** Có trạng thái trực quan; keyboard focus rõ trên Web.
- **Validation:** Hiển thị gần vị trí thao tác và nói cách sửa.
- **Loading:** Giữ layout ổn định, ưu tiên skeleton khi phù hợp.
- **Success:** Xác nhận ngắn và đưa bước tiếp theo.
- **Error và recovery:** Nêu vấn đề và cho phép thử lại.

## 10. Content và microcopy

- **Ngôn ngữ:** Tiếng Việt.
- **Tone:** Thân thiện, rõ ràng, tạo động lực.
- **Quy tắc label/button/error:** Dùng động từ rõ ràng; error nói vấn đề và cách xử lý; tránh thuật ngữ kỹ thuật.
- **Ví dụ copy chính:**
  - “Hôm nay bạn có bài học mới.”
  - “Bắt đầu học”
  - “Tiếp tục”
  - “Ôn lại”
  - “Bạn đã hoàn thành phiên học.”
  - “Xem thống kê”

## 11. Accessibility

- Tương phản màu tốt.
- Keyboard focus rõ trên Web.
- Heading và label có semantic structure.
- Không dùng màu sắc làm tín hiệu duy nhất.
- Touch target đủ lớn trên Mobile.
- Hỗ trợ reduced motion.
- Nội dung quan trọng không chỉ nằm trong illustration.

## 12. UI acceptance checklist

- [ ] Hành động chính nổi bật và chỉ có một primary CTA trong mỗi vùng quyết định.
- [ ] Mobile và desktop đều hoàn thành được core user flow.
- [ ] Loading, empty, error và success có cách hiển thị cụ thể.
- [ ] Quiz có validation và hướng phục hồi lỗi.
- [ ] Không dùng màu sắc làm tín hiệu duy nhất.
- [ ] UI không đưa thêm tính năng ngoài PRD.
- [ ] Core flow là Tổng quan → Học → Kiểm tra → Ôn SRS → Thống kê.
- [ ] Phạm vi nội dung là HSK 1–2.

## 13. UI Spec Prompt — copy toàn bộ vào công cụ thiết kế

Bạn là một senior product designer. Hãy tạo UI mockup hoàn chỉnh cho sản phẩm **Gia sư từ vựng**.

### Bối cảnh sản phẩm

Gia sư từ vựng là sản phẩm dành cho người mới học tiếng Trung, gồm học sinh, sinh viên và người đi làm. MVP tập trung vào từ vựng HSK 1–2.

Core flow:

**Tổng quan hôm nay → Học từ mới → Kiểm tra → Ôn lại bằng SRS → Thống kê.**

Sản phẩm chạy trên **Mobile App và Web App responsive**, trong đó Mobile được ưu tiên.

### Mục tiêu trải nghiệm

Khi mở sản phẩm, người dùng phải nhanh chóng hiểu hôm nay cần làm gì và có thể bắt đầu học ngay.

Primary CTA:

**“Bắt đầu học”**

Cảm giác thương hiệu:

**Thân thiện — Rõ ràng — Tạo động lực.**

### Màn hình và trạng thái bắt buộc

1. **Tổng quan hôm nay**
   - Tiến độ và nội dung hôm nay.
   - CTA “Bắt đầu học”.
   - States: default, loading, empty, error.

2. **Học từ mới**
   - Từ vựng HSK 1–2.
   - Progress.
   - States: default, loading, error, success.

3. **Kiểm tra**
   - Câu hỏi, lựa chọn, progress.
   - Feedback đúng/sai.
   - States: default, validation, success, error.

4. **Ôn lại bằng SRS**
   - Các từ cần củng cố.
   - Progress và feedback.
   - States: default, loading, success, error.

5. **Thống kê**
   - Tiến độ và kết quả học.
   - States: loading, empty, error, populated.

### Component chính

Header, Today Summary, Primary CTA, Vocabulary Card, Progress Indicator, Quiz Option, Feedback Message, SRS Review Card, Stats Card, Navigation và Panda Illustration.

### Visual direction

- Nền sáng.
- Xanh navy làm màu chính.
- Xanh lá làm màu hỗ trợ.
- Icon bo tròn.
- Panda là điểm nhận diện.
- Phong cách thân thiện, rõ ràng, hiện đại và không quá “công nghệ”.

Design tokens:

- Primary `#173B6C`
- Primary dark `#102B50`
- Secondary `#4CAF7D`
- Background `#F7FAF8`
- Surface `#FFFFFF`
- Text `#17212B`
- Muted text `#64717D`
- Danger `#C94A4A`
- Border `#DCE4E1`
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 px
- Card radius: 12–16 px
- Font: Inter hoặc sans-serif dễ đọc tương đương

### Layout và responsive

**Mobile:** Một cột, ưu tiên nội dung học và CTA chính.

**Tablet:** Mở rộng vùng nội dung nhưng giữ flow đơn giản.

**Desktop:** Container có max-width; có thể đặt nội dung chính và thông tin phụ cạnh nhau khi phù hợp.

Khi thiếu không gian, ưu tiên:

**Nội dung học → CTA chính → tiến độ → thông tin phụ → decoration.**

### Tương tác

- “Bắt đầu học” mở phiên học.
- Quiz có selected/correct/incorrect/disabled states.
- Feedback rõ sau thao tác.
- Loading không làm layout nhảy.
- Error có hành động thử lại.
- Keyboard focus rõ trên Web.
- Touch target phù hợp Mobile.

### Nội dung mẫu

Dùng tiếng Việt.

- “Hôm nay bạn có bài học mới.”
- “Bắt đầu học”
- “Tiếp tục”
- “Ôn lại”
- “Bạn đã hoàn thành phiên học.”
- “Xem thống kê”

Có thể dùng dữ liệu từ vựng mẫu hợp lý thuộc HSK 1–2. Không bịa số liệu kinh doanh, testimonial hoặc dữ liệu người dùng thực tế.

### Accessibility

- Tương phản tốt.
- Keyboard focus rõ.
- Semantic headings và labels.
- Không dùng màu làm tín hiệu duy nhất.
- Touch target đủ lớn.
- Hỗ trợ reduced motion.
- Không đặt thông tin quan trọng chỉ trong illustration.

### Acceptance

- [ ] Người dùng hiểu việc cần làm khi mở sản phẩm.
- [ ] “Bắt đầu học” là primary CTA rõ ràng.
- [ ] Core flow hoàn chỉnh.
- [ ] Mobile và Web responsive hỗ trợ core flow.
- [ ] Có loading, empty, error và success states.
- [ ] Quiz có validation và feedback.
- [ ] Visual direction nhất quán với xanh navy + xanh lá + nền sáng + panda.
- [ ] Không thêm tính năng ngoài MVP.
- [ ] UI đủ rõ để developer triển khai.

Không thêm tính năng ngoài phạm vi MVP. Dùng dữ liệu giả hợp lý nhưng không bịa số liệu kinh doanh. Tạo mockup đủ chi tiết để một developer có thể triển khai.
