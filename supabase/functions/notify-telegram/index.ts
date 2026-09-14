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
  eventType: "session_completed" | "streak_milestone" | "daily_reminder" | "test";
  userName?: string;
  wordsLearned?: number;
  streakDays?: number;
  accuracy?: number;
  nextReviewAt?: string;
  customMessage?: string;
  targetChatId?: string; // Optional user-specific override
}

serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const defaultChatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken) {
      return new Response(
        JSON.stringify({
          error: "TELEGRAM_BOT_TOKEN is not configured on server secrets.",
          status: "unconfigured"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: NotificationPayload = await req.json().catch(() => ({}));
    const chatId = payload.targetChatId || defaultChatId;

    if (!chatId) {
      return new Response(
        JSON.stringify({
          error: "TELEGRAM_CHAT_ID is missing. Please provide chatId or configure server secret.",
          status: "missing_chat_id"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Format rich HTML message with Panda Lingua brand
    const user = payload.userName || "Học viên Panda";
    const streak = payload.streakDays || 1;
    const words = payload.wordsLearned || 8;
    const acc = payload.accuracy !== undefined ? `${payload.accuracy}%` : "100%";
    const dueTime = payload.nextReviewAt || "Ngày mai";

    let telegramText = "";

    if (payload.eventType === "streak_milestone") {
      telegramText = `🐼 <b>[Panda Lingua] Chúc mừng ${user}!</b>\n\n` +
        `🔥 <b>Chuỗi học tập: ${streak} ngày liên tiếp!</b>\n` +
        `<i>Bạn đang giữ nhịp học tập xuất sắc! Đừng để ngọn lửa lụi tàn nhé.</i>\n\n` +
        `⏰ <i>Phiên ôn tập tiếp theo: ${dueTime}</i>\n` +
        `📲 <a href="https://panda-lingua.vercel.app">Vào học ngay trên Panda Lingua</a>`;
    } else if (payload.eventType === "test") {
      telegramText = `🐼 <b>[Panda Lingua] Kiểm tra kết nối Telegram Bot thành công!</b>\n\n` +
        `Xin chào <b>${user}</b>,\n` +
        `Hệ thống thông báo tiến độ học tiếng Trung HSK 1–2 đã sẵn sàng hoạt động.\n\n` +
        `Chúc bạn học tập hăng say mỗi ngày! ✨`;
    } else {
      // Default: session_completed
      telegramText = `🐼 <b>[Panda Lingua] Báo cáo tiến độ học tập</b>\n\n` +
        `👤 Học viên: <b>${user}</b>\n` +
        `📚 Đã học xong: <b>${words} từ vựng mới</b>\n` +
        `🎯 Độ chính xác Quiz: <b>${acc}</b>\n` +
        `🔥 Chuỗi streak: <b>${streak} ngày</b>\n\n` +
        `⏰ Lần ôn tập SRS tiếp theo: <b>${dueTime}</b>\n\n` +
        `<i>"Học ăn, học nói, học tiếng Trung mỗi ngày!"</i> 🐼🎒`;
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
