# Panda Lingua — AG4C Requirements Traceability Matrix

> Trạng thái tách riêng: **D** Designed · **I** Implemented · **V** Verified. Không suy ra I/V từ D.

| ID | Tiêu chí AG4C | Feature/Artifact | Test & Evidence | D | I | V |
|---|---|---|---|:---:|:---:|:---:|
| P-01 | Web mở không trắng/crash | AppShell | Production smoke; console log | ✅ | ✅ | ⬜ |
| P-02 | Responsive PC/mobile | UI Design System | Screenshot 375/768/1024/1440; no overflow | ✅ | ⚠️ | ⬜ |
| P-03 | Tiêu đề/nội dung/CTA rõ | Home F03 | 5-second comprehension test | ✅ | ✅ | ⬜ |
| P-04 | Hiểu đối tượng/vấn đề | Home/README | User test question | ✅ | ⚠️ | ⬜ |
| P-05 | Thiết kế không mặc định | Design tokens/components | Visual review/token audit | ✅ | ✅ | ⬜ |
| P-06 | Ít nhất một form hoạt động | Auth F02/Feedback F12 | Valid submit E2E | ✅ | ⬜ | ⬜ |
| P-07 | Form validation | Auth/Feedback | Invalid/empty input tests | ✅ | ⬜ | ⬜ |
| T-01 | Database ghi | Progress/Quiz repository | Insert/upsert evidence | ✅ | ⚠️ | ⬜ |
| T-02 | Database đọc/hiển thị | Home/Stats/Library | Seed→fetch→render E2E | ✅ | ⚠️ | ⬜ |
| T-03 | Persist refresh/reopen | Local + Supabase | F5/cross-device test | ✅ | ✅ local | ⬜ |
| T-04 | Security Rules không mở | RLS matrix | Account A/B CRUD denial | ✅ | ⬜ | ⬜ |
| T-05 | API credentials không lộ | Edge Functions/env | Secret pattern scan/bundle inspect | ✅ | ⚠️ | ⬜ |
| T-06 | URL deploy thật | Production | Open unrelated device/browser | ✅ | ⬜ | ⬜ |
| T-07 | Kết nối ngoài | Telegram F11 | Trigger→phone notification | ✅ | ⬜ | ⬜ |
| R-01 | Docs `.md` trong repo | Blueprint/specs | Link/existence check | ✅ | ✅ | ✅ |
| R-02 | Demo rõ | Demo script/slide | Rehearsal ≤5 minutes | ✅ | ⬜ | ⬜ |
| R-03 | Trả lời BGK | FAQ/architecture | Mock Q&A | ✅ | ⬜ | ⬜ |
| R-04 | Luồng chính hợp lý | Daily loop | New-user usability test | ✅ | ✅ | ⬜ |
| B-01 | UI/UX vượt trội | Flip/audio/motion/states | Visual/a11y review | ✅ | ⚠️ | ⬜ |
| B-02 | 2+ integrations | Telegram + AI | Two live E2E proofs | ✅ | ⬜ | ⬜ |
| B-03 | Edge cases tốt | State catalog | Loading/empty/error test suite | ✅ | ⚠️ | ⬜ |
| B-04 | Sáng tạo ngoài giáo trình | SRS + Pinyin-first + AI | Demo and spec evidence | ✅ | ⚠️ | ⬜ |

## Evidence Pack cần thu khi triển khai

1. URL production và timestamp.
2. Video/screenshot core flow mobile và desktop.
3. Supabase rows sau write/read.
4. RLS A/B test logs.
5. Bundle/secret scan output.
6. Telegram delivery screenshot và Edge log request ID.
7. AI output + fallback/quota evidence.
8. Lighthouse reports.
9. Automated test summary.
10. Demo rehearsal checklist.
