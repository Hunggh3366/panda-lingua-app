// Supabase Edge Function: notify-telegram
// Follows AG4C v2 Buổi 6 & Technical Architecture Spec (Section 7)
// Sends learning completion & streak celebrations to Telegram Bot

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface NotificationPayload {
  eventType?: "new_user" | "session_completed" | "streak_milestone" | "daily_reminder" | "test";
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  schema?: string;
  record?: {
    id?: string;
    email?: string;
    display_name?: string;
    created_at?: string;
    raw_user_meta_data?: { name?: string };
  };
  userName?: string;
  userEmail?: string;
  wordsLearned?: number;
  streakDays?: number;
  accuracy?: number;
  nextReviewAt?: string;
  customMessage?: string;
}

const escapeHtml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!domain) return "Không có email";
  return `${name.slice(0, 2)}***@${domain}`;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const defaultChatId = Deno.env.get("TELEGRAM_CHAT_ID");
    const chatId = defaultChatId;

    if (!botToken || !defaultChatId) {
      return new Response(
        JSON.stringify({
          error: "Telegram server secrets are not fully configured.",
          status: "unconfigured"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: NotificationPayload = await req.json().catch(() => ({}));
    const isDatabaseInsert = payload.type === "INSERT" && payload.record;
    const eventType = payload.eventType || (isDatabaseInsert ? "new_user" : "session_completed");
    const record = payload.record || {};
    const rawName = payload.userName || record.display_name || record.raw_user_meta_data?.name || "Học viên Panda";
    const rawEmail = payload.userEmail || record.email || "";
    const user = escapeHtml(rawName);
    const email = escapeHtml(maskEmail(rawEmail));
    const streak = payload.streakDays || 1;
    const words = payload.wordsLearned || 8;
    const acc = payload.accuracy !== undefined ? `${payload.accuracy}%` : "100%";
    const dueTime = escapeHtml(payload.nextReviewAt || "Ngày mai");

    let telegramText = "";

    if (eventType === "new_user") {
      const createdAt = escapeHtml(record.created_at || new Date().toISOString());
      telegramText = `🐼 <b>[Panda Lingua] Có học viên mới!</b>\n\n` +
        `👤 Tên: <b>${user}</b>\n` +
        `📧 Email: <b>${email}</b>\n` +
        `🕒 Đăng ký lúc: <b>${createdAt}</b>\n\n` +
        `<a href="https://panda-chili.vercel.app">Mở Panda Lingua</a>`;
    } else if (eventType === "streak_milestone") {
      telegramText = `🐼 <b>[Panda Lingua] Chúc mừng ${user}!</b>\n\n` +
        `🔥 <b>Chuỗi học tập: ${streak} ngày liên tiếp!</b>\n` +
        `<i>Bạn đang giữ nhịp học tập xuất sắc!</i>\n\n` +
        `⏰ <i>Phiên ôn tập tiếp theo: ${dueTime}</i>\n` +
        `📲 <a href="https://panda-chili.vercel.app">Vào học ngay</a>`;
    } else if (eventType === "test") {
      telegramText = `🐼 <b>[Panda Lingua] Kết nối Telegram thành công!</b>\n\n` +
        `Hệ thống thông báo học viên mới đã sẵn sàng hoạt động. ✨`;
    } else {
      telegramText = `🐼 <b>[Panda Lingua] Báo cáo tiến độ học tập</b>\n\n` +
        `👤 Học viên: <b>${user}</b>\n` +
        `📚 Đã học xong: <b>${words} từ vựng mới</b>\n` +
        `🎯 Độ chính xác Quiz: <b>${acc}</b>\n` +
        `🔥 Chuỗi streak: <b>${streak} ngày</b>\n\n` +
        `⏰ Lần ôn tập SRS tiếp theo: <b>${dueTime}</b>`;
    }

    // 3. Send message via Telegram Bot API
    const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const tgResponse = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const tgData = await tgResponse.json();

    if (!tgResponse.ok || !tgData.ok) {
      return new Response(
        JSON.stringify({
          error: "Telegram API error",
          details: tgData.description || "Unknown error"
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Return success response
    return new Response(
      JSON.stringify({
        status: "success",
        deliveryId: `tg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        messageId: tgData.result?.message_id,
        sentAt: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
