import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface RequestPayload {
  vocabId?: string;
  promptType?: string; // 'mnemonic' | 'examples' | 'nuance' | 'pronunciation'
  customPrompt?: string;
  vocab?: {
    hanzi: string;
    pinyin: string;
    meaning: string;
    level: string;
    example?: {
      hanzi: string;
      pinyin: string;
      meaning: string;
    };
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
    const authHeader = req.headers.get("Authorization") || "";
    if (!supabaseUrl || !supabaseAnon || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success:false,error:"LOGIN_REQUIRED" }), { status:401,headers:{...corsHeaders,"Content-Type":"application/json"} });
    }
    const authClient = createClient(supabaseUrl, supabaseAnon, { global:{ headers:{ Authorization:authHeader } } });
    const { data:{ user }, error:userError } = await authClient.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ success:false,error:"LOGIN_REQUIRED" }), { status:401,headers:{...corsHeaders,"Content-Type":"application/json"} });
    const { data:profile } = await authClient.from("profiles").select("status,ai_enabled").eq("id",user.id).single();
    if (profile?.status === "banned") return new Response(JSON.stringify({ success:false,error:"ACCOUNT_BANNED" }), { status:403,headers:{...corsHeaders,"Content-Type":"application/json"} });
    if (profile?.ai_enabled === false) return new Response(JSON.stringify({ success:false,error:"AI_RESTRICTED" }), { status:403,headers:{...corsHeaders,"Content-Type":"application/json"} });

    if (!geminiKey && !openrouterKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured in Supabase Secrets.",
          useFallback: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const payload: RequestPayload = await req.json();
    const { vocab, promptType = "mnemonic", customPrompt = "" } = payload;

    if (!vocab || !vocab.hanzi) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required vocabulary context." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Bạn là Gia sư Panda AI — chuyên gia dạy tiếng Trung HSK 1–2 cho người Việt mới bắt đầu. Phạm vi của bạn CHỈ giới hạn trong: giải thích từ vựng tiếng Trung, bộ thủ, chiết tự, ngữ pháp HSK 1–2, phát âm, câu ví dụ, và phân biệt cách dùng từ.

LUẬT BẮT BUỘC:
1. Nếu câu hỏi KHÔNG liên quan đến từ vựng tiếng Trung đang học, hãy từ chối lịch sự: "🐼 Panda AI chỉ hỗ trợ về tiếng Trung HSK 1–2. Câu hỏi của bạn nằm ngoài phạm vi gia sư. Hãy hỏi về từ [từ hiện tại] nhé!"
2. Tuyệt đối KHÔNG trả lời về: ca sĩ, phim, tin tức, lịch sử, chính trị, công thức nấu ăn, hay bất kỳ chủ đề nào không phải tiếng Trung HSK.
3. Mọi câu ví dụ bắt buộc có đủ: chữ Hán, Pinyin có dấu thanh và nghĩa tiếng Việt.
4. Khi học viên cho biết tên riêng (ví dụ "Hùng"), dùng tên đó trong ví dụ tiếng Trung (雄/Xióng hoặc 阿雄/Ā Xióng).
5. KHÔNG trình bày suy luận nội bộ hay bước phân tích. Chỉ xuất câu trả lời cuối cùng.
6. Ngắn gọn, thân thiện, đúng trọng tâm. Tối đa 250 từ. Bắt đầu bằng 🐼 hoặc emoji sinh động.`;

    let userMessage = "";
    if (customPrompt) {
      userMessage = `Từ vựng đang học: ${vocab.hanzi} (${vocab.pinyin}, nghĩa: ${vocab.meaning}, ${vocab.level}).

Câu hỏi của học viên: "${customPrompt}"

Nếu câu hỏi liên quan đến từ "${vocab.hanzi}" hoặc tiếng Trung HSK 1–2, hãy trả lời chi tiết, dễ hiểu. Nếu câu hỏi hoàn toàn không liên quan đến tiếng Trung (ví dụ hỏi về ca sĩ, phim ảnh, thời tiết...), hãy từ chối lịch sự và gợi ý hỏi về từ đang học.`;
    } else if (promptType === "mnemonic") {
      userMessage = `Hãy phân tích bộ thủ và kể câu chuyện chiết tự ngắn gọn, dí dỏm để nhớ chữ Hán "${vocab.hanzi}" (${vocab.pinyin}, nghĩa: ${vocab.meaning}, ${vocab.level}).`;
    } else if (promptType === "examples") {
      userMessage = `Cho 3 câu ví dụ giao tiếp đời thường với từ "${vocab.hanzi}" (${vocab.pinyin}, nghĩa: ${vocab.meaning}). Mỗi câu gồm Hán tự, Pinyin và dịch nghĩa tiếng Việt phù hợp trình độ ${vocab.level}.`;
    } else if (promptType === "nuance") {
      userMessage = `Chỉ ra từ gần nghĩa hoặc lưu ý ngữ pháp quan trọng khi dùng từ "${vocab.hanzi}" (${vocab.pinyin}, ${vocab.level}) để tránh nhầm lẫn.`;
    } else if (promptType === "pronunciation") {
      userMessage = `Hướng dẫn mẹo phát âm chuẩn cho "${vocab.hanzi}" (${vocab.pinyin}), chú ý thanh điệu và lỗi người Việt hay mắc.`;
    }

    let lastError = "";

    // =========================================================================
    // TẦNG 1: GOOGLE GEMINI (PRIMARY PROVIDER - SIÊU TỐC & HẠN MỨC LỚN)
    // =========================================================================
    if (geminiKey) {
      const geminiModels = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.6-flash"];
      for (const model of geminiModels) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  parts: [{ text: userMessage }]
                }
              ],
              generationConfig: {
                temperature: 0.45,
                maxOutputTokens: 350
              }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
              text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
              if (text.length >= 10) {
                return new Response(
                  JSON.stringify({
                    success: true,
                    answer: text,
                    model: `google/${model}`,
                    source: "gemini"
                  }),
                  { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
              }
            }
          } else {
            const errBody = await res.text();
            console.warn(`Gemini model ${model} failed (${res.status}):`, errBody.substring(0, 150));
            lastError = `Gemini ${model}: HTTP ${res.status}`;
          }
        } catch (geminiErr) {
          clearTimeout(timeoutId);
          console.warn(`Gemini exception on ${model}:`, geminiErr);
          lastError = `Gemini ${model}: ${geminiErr instanceof Error ? geminiErr.message : "error"}`;
        }
      }
    }

    // =========================================================================
    // TẦNG 2: OPENROUTER (SECONDARY BACKUP PROVIDER)
    // =========================================================================
    if (openrouterKey) {
      const openRouterCascade = [
        "nex-agi/nex-n2.5-pro:free",
        "google/gemma-4-26b-a4b-it:free",
        "google/gemma-4-31b-it:free",
        "poolside/laguna-s-2.1:free",
        "liquid/lfm-2.5-2.6b:free",
        "nex-agi/nex-n2.5-mini:free",
      ];

      for (const tryModel of openRouterCascade) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
          const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openrouterKey}`,
              "HTTP-Referer": "https://apptiengtrung.vercel.app",
              "X-Title": "Panda Lingua AI Coach"
            },
            body: JSON.stringify({
              model: tryModel,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
              ],
              temperature: 0.7,
              max_tokens: 600,
              include_reasoning: false
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!openRouterRes.ok) {
            const errText = await openRouterRes.text();
            console.warn(`OpenRouter ${tryModel} failed (${openRouterRes.status}):`, errText.substring(0, 150));
            lastError = `OpenRouter ${tryModel}: HTTP ${openRouterRes.status}`;
            continue;
          }

          const data = await openRouterRes.json();
          let answer = data.choices?.[0]?.message?.content || "";

          if (answer) {
            answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

            const isReasoningDump = /^[\d]+\.\s+\*{0,2}(Analyze|Plan|Think|Step|Reason|Review|Consider|User Request)/i.test(answer);
            if (isReasoningDump) {
              const teachingMarkers = [/🐼/, /💡/, /📖/, /🎯/, /🗣️/, /\*\*[^\*]+\*\*\n/m, /#{1,3}\s/m];
              let teachingStart = -1;
              for (const marker of teachingMarkers) {
                const match = answer.match(marker);
                if (match && match.index !== undefined && match.index > 100) {
                  teachingStart = match.index;
                  break;
                }
              }
              if (teachingStart > 50) {
                answer = answer.substring(teachingStart).trim();
              } else {
                const lines = answer.split("\n").filter(l => l.trim());
                answer = lines.slice(Math.floor(lines.length / 3)).join("\n").trim();
              }
            }

            const reasoningPrefixes = ["Here's a thinking", "Let me think", "Okay, so", "First, let me",
                                       "**Analyze User Request", "**Plan", "1. **Analyze", "1. Analyze"];
            const answerLines = answer.split("\n");
            let startLine = 0;
            for (let i = 0; i < Math.min(answerLines.length, 6); i++) {
              const line = answerLines[i].trim();
              if (reasoningPrefixes.some(pf => line.startsWith(pf))) {
                startLine = i + 1;
              }
            }
            if (startLine > 0) {
              answer = answerLines.slice(startLine).join("\n").trim();
            }
          }

          if (answer && answer.trim().length >= 10) {
            return new Response(
              JSON.stringify({
                success: true,
                answer: answer.trim(),
                model: tryModel,
                source: "openrouter"
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.warn(`OpenRouter ${tryModel} exception:`, fetchErr);
          lastError = `OpenRouter ${tryModel}: ${fetchErr instanceof Error ? fetchErr.message : "error"}`;
          continue;
        }
      }
    }

    // Cả 2 tầng đều không khả dụng
    console.error("All AI providers failed. Last error:", lastError);
    return new Response(
      JSON.stringify({
        success: false,
        error: `All providers failed: ${lastError}`,
        useFallback: true
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function exception:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
        useFallback: true
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
