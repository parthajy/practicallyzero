import React, { useEffect, useRef, useState } from "react";
import type { GuestMessage } from "../../store/guestStore";

type MessageListProps = {
  messages: GuestMessage[];
  loading: boolean;
  brainFart: string | null;
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  brainFart,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  // Auto-scroll to bottom whenever message count or brainfart changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, loading, brainFart]);

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    } catch {
      alert("Clipboard is acting dumb. Copy it manually.");
    }
  };

  const handleShare = (id: string, content: string) => {
    // keep it short-ish for X
    const maxLen = 240;
    const trimmed =
      content.length > maxLen ? content.slice(0, maxLen - 3) + "..." : content;

    const text = `I asked PracticallyZero (artificial stupidity) a question and this is what it said:\n\n"${trimmed}"\n\nhttps://practicallyzero.com`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
    setSharedId(id);
    setTimeout(() => {
      setSharedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  if (!messages.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
        Ask anything. I’ll answer with maximum confidence and minimum accuracy.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full px-4 py-4 flex flex-col gap-3 overflow-y-auto bg-white dark:bg-neutral-900"
    >
      {messages.map((m, index) => {
        const isUser = m.role === "user";
        const isAi = m.role === "ai";

        // Alternate alignment purely by index
        const alignClass = index % 2 === 0 ? "justify-start" : "justify-end";

        // Alternate bubble background: light gray vs white
        const bubbleBg =
          index % 2 === 0
            ? "bg-neutral-50 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
            : "bg-white text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100";

        const metaColor = isUser
          ? "text-neutral-400 dark:text-neutral-500"
          : "text-neutral-500 dark:text-neutral-400";

        return (
          <div key={m.id} className={`flex ${alignClass}`}>
            <div className="max-w-[80%] flex flex-col gap-1">
              {/* Label + actions */}
              <div className="flex items-center gap-2">
                <span className={`text-[11px] ${metaColor}`}>
                  {isUser ? "You" : "PracticallyZero"}
                </span>

                {isAi && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                    >
                      {copiedId === m.id ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(m.id, m.content)}
                      className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                    >
                      {sharedId === m.id ? "Opened" : "Share"}
                    </button>
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${bubbleBg}`}
              >
                {m.content}
              </div>
            </div>
          </div>
        );
      })}

            {/* BrainFarts™ as in-chat "AI thoughts" bubble */}
      {loading && brainFart && (
        <div className="flex justify-end">
          <div className="max-w-[80%] flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                PracticallyZero is thinking…
              </span>
            </div>
            <div className="rounded-2xl px-3 py-2 text-sm bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 italic">
              {brainFart}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
