import React from "react";
import type { GuestMessage } from "../../store/guestStore";

type MessageBubbleProps = {
  message: GuestMessage;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } text-sm`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${
          isUser
            ? "bg-[#FFECAA] text-neutral-900"
            : "bg-[#DCEBFF] text-neutral-900"
        }`}
      >
        <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
          {isUser ? "You" : "PracticallyZero"}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
};
