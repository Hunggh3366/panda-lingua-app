# Panda Lingua — UI Design System

> **Version:** 1.0 · **Stack:** Vite + Vanilla JS · **Mode:** Light-first  
> `[FACT]` Brand hiện tại: Navy, green, light background, Inter/Noto Sans SC.  
> `[RECOMMENDATION]` Claymorphism tiết chế chỉ cho learning cards.

## 1. Design Direction

**Thân thiện — Rõ ràng — Tạo động lực — Đáng tin.** Giao diện đủ vui để hỗ trợ thói quen, nhưng không trẻ con hóa người học trưởng thành.

### Quy tắc

- Nội dung học luôn nổi hơn mascot/decoration.
- Một primary CTA cho mỗi vùng quyết định.
- Không dùng màu là tín hiệu duy nhất.
- Không dùng emoji làm icon điều khiển; dùng SVG/Material Symbols thống nhất.
- Motion giải thích thay đổi trạng thái, không trang trí vô mục đích.

## 2. Tokens

### Color

| Token | Value | Use |
|---|---:|---|
| `--brand-900` | `#002550` | Heading, nav |
| `--brand-800` | `#173B6C` | Primary control |
| `--brand-700` | `#24558F` | Hover |
| `--green-700` | `#006C44` | Success text |
| `--green-500` | `#4CAF7D` | Progress/accent |
| `--green-100` | `#DDF8E9` | Success surface |
| `--surface-0` | `#FFFFFF` | Card |
| `--surface-50` | `#F7FAF8` | App background |
| `--surface-100` | `#EEF4F1` | Muted section |
| `--text-900` | `#17212B` | Body |
| `--text-600` | `#55636F` | Secondary |
| `--border-300` | `#DCE4E1` | Border |
| `--warning-700` | `#9A5A00` | Warning text |
| `--warning-100` | `#FFF1D6` | Warning surface |
| `--danger-700` | `#A83232` | Error |
| `--danger-100` | `#FDE7E7` | Error surface |
| `--focus` | `#7C3AED` | Focus ring, distinct |

Contrast phải được test ở final CSS; không dựa vào tên token.

### Typography

- UI/body: `Inter`, fallback `system-ui`.
- Hanzi: `Noto Sans SC`, fallback sans-serif.
- Pinyin: Inter Medium, line-height rộng; không uppercase.
- Display Hanzi: 48/56 mobile, 64/72 desktop.

| Style | Mobile | Desktop | Weight |
|---|---|---|---|
| Display | 32/40 | 40/48 | 800 |
| H1 | 28/36 | 36/44 | 800 |
| H2 | 22/30 | 28/36 | 700 |
| H3 | 18/26 | 20/28 | 700 |
| Body | 16/24 | 16/24 | 400 |
| Small | 14/20 | 14/20 | 400/600 |
| Caption | 12/16 | 12/16 | 500 |

### Spacing, radius, shadow

- Spacing: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- Radius: control 12; card 16; hero/learning 24; pill 999.
- Shadow card: `0 8px 24px rgba(0,37,80,.08)`.
- Pressed: translateY(1px), shadow giảm; không scale text.
- Content max-width: 1200px; learning column 720px; text 68ch.

## 3. Layout & Responsive

| Viewport | Navigation | Grid | Page padding |
|---|---|---|---|
| 375px | Bottom fixed | 1 column | 16px |
| 768px | Bottom hoặc compact rail | 2 columns | 24px |
| 1024px | Sidebar 248px | 8/4 grid | 32px |
| 1440px | Sidebar 264px | 12 columns | 40px |

- Bottom nav chừa `env(safe-area-inset-bottom)`.
- Không fixed width > viewport.
- Cards không ép chữ Hanzi/Pinyin xuống quá nhỏ.
- Modal mobile là bottom sheet; desktop centered dialog max 560px.

## 4. Component Specification

### Button

Variants: Primary, Secondary, Ghost, Destructive, Icon. Heights 48 default/44 compact; icon-only ≥44×44.

States: default, hover, active, focus-visible 3px, disabled, loading. Loading giữ nguyên width; spinner có accessible name.

### Input

Label luôn nhìn thấy; helper/error bên dưới; không dùng placeholder thay label. Error có icon + text + `aria-describedby`. Validate blur và submit; không validate từng ký tự với email.

### Daily Plan Card

- Eyebrow “Kế hoạch hôm nay”.
- Heading theo outcome.
- New/due/time chips.
- One primary CTA.
- Secondary text link “Tùy chỉnh”.
- Complete state thay CTA bằng “Luyện thêm”.

### Vocabulary Card

- Progress ở header.
- Hanzi/Pinyin/meaning có hierarchy rõ.
- Audio controls adjacent với content.
- Example tách bằng surface muted.
- Pinyin-first dùng reveal control có label.
- Loading skeleton giữ chiều cao tránh layout shift.

### Quiz Option

- Full-row button; A–D badge + text.
- Selected trước submit; Correct/Incorrect sau submit.
- Correct: green + check icon; Incorrect: danger + x icon; đáp án đúng vẫn được đánh dấu.
- Focus/keyboard đầy đủ.

### SRS Rating

Ba nút Hard/Good/Easy; label Việt + lịch kế tiếp (“Lại hôm nay”, “Sau 1 ngày”, “Sau 3 ngày”). Không chỉ dùng màu.

### Toast và Inline Alert

- Toast cho hành động không cần quyết định, auto-dismiss ≥5s và pause hover/focus.
- Inline alert cho sync/auth/data errors cần recovery.
- Không toast lỗi quan trọng rồi biến mất.

### Sync Status

`Đã đồng bộ`, `Đang đồng bộ`, `Đang học ngoại tuyến`, `Cần thử lại`. Icon + text; manual retry ở error.

## 5. Screen Layouts

### Onboarding

Single question/step, progress `1/4`, back, primary CTA bottom-sticky mobile. Không hỏi account trước giá trị.

### Home

Header greeting/sync → Daily Plan hero → quick stats 3 cards → HSK progress → weak words insight → optional coach tip.

### Learn

Top progress/exit → centered card → audio/reveal → example → sticky action footer. Exit mở confirm nếu có progress chưa lưu.

### Quiz

Question counter → prompt/audio → options → feedback panel → next CTA. Không hiện bảng điểm giữa các câu.

### Review

Due count → flip card → rating footer. Empty state có Panda illustration + next due time.

### Stats

Period tabs → KPI → activity chart → HSK progress → weak words action. Charts phải có text summary/table alternative.

### Library

Sticky search → filters → result count → responsive list. Mobile filter bottom sheet; desktop inline.

### Profile/Settings

Group theo Personal, Learning, Notification, Data & Privacy. Destructive zone cuối trang, visually separated.

## 6. Motion

- Hover/focus: 150–200ms.
- Page/card enter: 250–350ms.
- Flip card: 450–500ms.
- Success celebration: ≤900ms, không block CTA.
- `prefers-reduced-motion`: bỏ transform/parallax/confetti; giữ opacity instant/100ms.
- Không thêm GSAP ở bản hiện tại; CSS đủ và nhẹ.

## 7. Content Design

- Action labels cụ thể: “Bắt đầu học 10 từ”, không “Tiếp tục” nếu có thể nói rõ.
- Error gồm: chuyện gì xảy ra + dữ liệu có an toàn không + làm gì tiếp.
- Không shame: dùng “Chuỗi mới bắt đầu từ hôm nay”, không “Bạn đã làm mất streak”.
- AI label: “Gợi ý từ Panda AI — có thể cần kiểm tra lại”.

## 8. Accessibility Checklist

- Semantic landmarks, một H1/page.
- Skip link; logical tab order; visible focus.
- Inputs có label; icon buttons có accessible name.
- Dialog focus trap/return; Escape đóng nếu không mất dữ liệu.
- Live region cho quiz result và sync status.
- Contrast AA; zoom 200%; reflow 320px.
- Audio không autoplay mặc định; transcript/text equivalent.
- QA ở 375/768/1024/1440 và keyboard-only.

## 9. Anti-patterns

Không glass blur dày, dark mode vội, dashboard quá tải, mascot chiếm hero, màu neon, animation lặp vô hạn, chart không nhãn, modal lồng modal, CTA cạnh tranh, remote font là dependency bắt buộc để nội dung đọc được.
