import React, { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
  loading: boolean;
};

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, loading }) => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim() || loading) return;
    onSend(value);
    setValue("");
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="flex items-end gap-3 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2 shadow-sm">
        <textarea
          className="flex-1 resize-none bg-transparent border-none outline-none text-sm leading-relaxed max-h-[160px] min-h-[44px] py-1 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          placeholder="Ask any. Write detailed if you want detailed stupidity"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-neutral-50 text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800"
        >

          {loading ? "…" : ">"}
        </button>
      </div>
    </div>
  );
};
