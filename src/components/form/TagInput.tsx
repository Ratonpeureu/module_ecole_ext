import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function TagInput({ id, value, onChange, placeholder = "Saisir puis Entrée" }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const t = draft.trim().replace(/,$/, "");
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex min-h-[36px] w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] px-2 py-1 shadow-[inset_0_-1px_0_rgba(0,0,0,0.22)] transition-[box-shadow,background-color] duration-150 hover:bg-[var(--em-surface-2)] focus-within:bg-[var(--em-surface,#ffffff)] focus-within:shadow-[inset_0_-2px_0_var(--em-accent)]"
    >
      <AnimatePresence initial={false}>
        {value.map((t) => (
          <motion.span
            key={t}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--em-accent-soft)] py-0.5 pl-2 pr-1 text-[12.5px] font-medium text-[var(--em-accent)]"
          >
            {t}
            <button
              type="button"
              aria-label={`Retirer ${t}`}
              className="grid h-4 w-4 place-items-center rounded transition-colors duration-150 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--em-accent)]"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((x) => x !== t));
              }}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        ref={inputRef}
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent py-1 text-[14px] outline-none placeholder:text-[var(--em-text-3)]"
      />
    </div>
  );
}