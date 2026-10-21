import React, { useRef } from "react";
import { SearchIcon, XIcon } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchInput({ value, onChange, placeholder = "Rechercher…", label = "Rechercher" }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="group w-full sm:w-72">
      <label className="ecole_m-label transition-colors duration-150 group-focus-within:text-[var(--em-accent,#0067C0)]">{label}</label>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A] transition-colors duration-150 group-focus-within:text-[var(--em-accent,#0067C0)]"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="ecole_m-input pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-[4px] text-[#5D5D5D] outline-none transition-[background-color,color] duration-150 hover:bg-black/[0.06] hover:text-[#1A1A1A] focus-visible:ring-2 focus-visible:ring-[var(--em-accent,#0067C0)]">
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}