import React, { useEffect, useMemo, useState } from "react";
import { useGuestStore } from "../../store/guestStore";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ModeSelector } from "../controls/ModeSelector";
import { MODES } from "../../lib/modes";
import type { ModeKey } from "../../lib/modes";
import type { PlanType } from "../../store/userStore";
import type { GuestMessage } from "../../store/guestStore";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../lib/supabaseClient";
import { getRandomBrainFart } from "../../lib/brainfarts";

type ChatWindowProps = {
  plan: PlanType;
};

function detectLengthMode(
  userText: string,
  aiCount: number
): "auto" | "detailed" | "short_8th" {
  const lower = userText.toLowerCase();

  const detailedKeywords = [
    "detailed",
    "detail",
    "long",
    "in depth",
    "in-depth",
    "explain deeply",
  ];
  const wantsDetailed = detailedKeywords.some((k) => lower.includes(k));

  if (wantsDetailed) return "detailed";

  const nextIndex = aiCount + 1;
  if (nextIndex % 8 === 0) return "short_8th";

  return "auto";
}

// direct HTTP call to the edge function
async function callGenerateStupidAnswer(body: any) {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/generate-stupid-answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Edge HTTP ${res.status}: ${text}`);
  }

  return res.json() as Promise<{ answer?: string }>;
}

// Quick suggestion prompts per mode
function getQuickPrompts(mode: ModeKey): string[] {
  switch (mode) {
    case "classic":
      return [
        "Explain gravity.",
        "Give me life advice about work.",
        "How do I get rich quickly?",
      ];
    case "nonsense":
      return [
        "Describe the internet like a confused caveman.",
        "Explain Mondays using only cursed metaphors.",
        "What is sleep, but say it like a broken poet.",
      ];
    case "overconfident":
      return [
        "Explain black holes with extreme confidence and zero accuracy.",
        "Teach me investing like you know what you’re doing.",
        "Explain AI as if you built all of it.",
      ];
    case "broken":
      return [
        "Explain time but contradict yourself constantly.",
        "Tell me if I should quit my job using broken logic.",
        "Explain 2 + 2 in the most confusing way.",
      ];
    case "profanity":
      return [
        "Give me the rudest pep talk (keep it light).",
        "Why is my life like this? Answer badly.",
        "Roast my productivity without being hateful.",
      ];
    case "villain":
      return [
        "Give me a villain monologue about doing my laundry.",
        "Explain waking up early like an evil masterplan.",
        "Tell me why humans deserve chaos, dramatically.",
      ];
    case "grandma":
      return [
        "Give me cozy but terrible money advice.",
        "How should I pick a career, grandma style?",
        "Tell me how to be productive but wrong.",
      ];
    case "corporate":
      return [
        "Explain being fired using only corporate jargon.",
        "Give me a fake OKR for doing nothing.",
        "Describe burnout like a LinkedIn influencer.",
      ];
    case "ultra":
      return [
        "Explain reality at max chaos level.",
        "Tell me why everything is a simulation, stupidly.",
        "Give me the worst advice for a big decision.",
      ];
    default:
      return [
        "Explain gravity completely wrong.",
        "Give me terrible life advice about work.",
        "How do I get rich in the dumbest way?",
      ];
  }
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ plan }) => {
  const { hydrated, hydrate, threads, activeThreadId, newThread, addMessage } =
    useGuestStore();
  const [mode, setMode] = useState<ModeKey>("classic");
// fixed default chaos; we only read it for now
const [chaosLevel] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [controlsOpenMobile, setControlsOpenMobile] = useState(false);

  // BrainFarts™ state
  const [brainFart, setBrainFart] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const activeThread = activeThreadId ? threads[activeThreadId] : undefined;

  // auto create a thread if none
  useEffect(() => {
    if (hydrated && !activeThreadId) {
      newThread();
    }
  }, [hydrated, activeThreadId, newThread]);

  const aiMessagesCount = useMemo(
    () =>
      activeThread
        ? activeThread.messages.filter((m) => m.role === "ai").length
        : 0,
    [activeThread]
  );

  useMemo(
    () => MODES.find((m) => m.key === mode)?.label ?? "Classic Stupid",
    [mode]
  );

  // BrainFarts™ rotation while loading – now used in the conversation
  useEffect(() => {
    if (!loading) {
      setBrainFart(null);
      return;
    }

    setBrainFart((prev) => getRandomBrainFart(prev));

    const id = window.setInterval(() => {
      setBrainFart((prev) => getRandomBrainFart(prev));
    }, 1300);

    return () => {
      window.clearInterval(id);
    };
  }, [loading]);

  const handleSend = async (text: string) => {
    if (!activeThread) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();

    // user message
    const userMessage: GuestMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      mode,
      chaosLevel,
      createdAt: now,
    };
    addMessage(activeThread.id, userMessage);

    // prepare payload for edge function
    const threadMsgs = activeThread.messages;
    const openAiMessages = [
      ...threadMsgs.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: trimmed },
    ];

    const lengthMode = detectLengthMode(trimmed, aiMessagesCount);

    setLoading(true);
    console.log("[PZ] invoking generate-stupid-answer (raw fetch)", {
      mode,
      chaosLevel,
      lengthMode,
      plan,
      msgCount: openAiMessages.length,
    });

    try {
      const invokePromise = callGenerateStupidAnswer({
        messages: openAiMessages,
        mode,
        chaos_level: chaosLevel,
        plan,
        length_mode: lengthMode,
        answer_index: aiMessagesCount + 1,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Function timeout after 20s")),
          20000
        )
      );

      const data = (await Promise.race([
        invokePromise,
        timeoutPromise,
      ])) as { answer?: string };

      console.log("[PZ] function result", data);

      const answerText = data?.answer ?? "I forgot how to be stupid, sorry.";
      const aiMessage: GuestMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        content: answerText,
        mode,
        chaosLevel,
        answerIndex: aiMessagesCount + 1,
        createdAt: new Date().toISOString(),
      };
      addMessage(activeThread.id, aiMessage);
    } catch (e) {
      console.error("[PZ] invoke crashed/timeout", e);
      const errMsg: GuestMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        content:
          "My stupidity crashed or timed out. Try again in a bit.",
        mode,
        chaosLevel,
        answerIndex: aiMessagesCount + 1,
        createdAt: new Date().toISOString(),
      };
      addMessage(activeThread.id, errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!activeThread) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
        Initializing chaos…
      </div>
    );
  }

  const quickPrompts = getQuickPrompts(mode);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] min-h-0 overflow-hidden">
      {/* Controls row – modes + Try suggestions (no brainfarts here) */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex flex-col gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        {/* Mobile: small bar with hamburger */}
        <div className="flex items-center justify-between md:hidden">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Chaos controls
          </span>
          <button
            type="button"
            onClick={() => setControlsOpenMobile((v) => !v)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 text-lg"
          >
            <span className="sr-only">Toggle controls</span>
            <span>☰</span>
          </button>
        </div>

        {/* Desktop: always visible */}
        <div className="hidden md:flex md:flex-col md:gap-2">
          <ModeSelector mode={mode} onChange={setMode} plan={plan} />

          {/* Quick prompts */}
          {!loading && quickPrompts.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Try
              </span>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-[11px] text-neutral-600 dark:text-neutral-200 bg-white/80 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile: collapsible content */}
        {controlsOpenMobile && (
          <div className="mt-2 flex flex-col gap-2 md:hidden">
            <ModeSelector mode={mode} onChange={setMode} plan={plan} />

            {!loading && quickPrompts.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Try
                </span>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-[11px] text-neutral-600 dark:text-neutral-200 bg-white/80 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages + in-convo brainfarts */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-neutral-900">
        <MessageList
          messages={activeThread.messages}
          loading={loading}
          brainFart={brainFart}
        />
      </div>

      {/* Input – no top border line */}
      <div className="px-4 py-4 bg-white dark:bg-neutral-900">
        <ChatInput onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
};
