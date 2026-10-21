import { useRef } from 'react';

interface EmailCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  length?: number;
}

export function EmailCodeInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  length = 6,
}: EmailCodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const focusAt = (i: number) => {
    const t = refs.current[Math.max(0, Math.min(i, length - 1))];
    t?.focus();
    t?.select();
  };

  const handleChange = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return;
    const chars = value.split('');
    for (let k = 0; k < typed.length && i + k < length; k++) chars[i + k] = typed[k];
    commit(chars.join('').slice(0, length));
    focusAt(i + typed.length);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.split('');
      if (chars[i]) { chars[i] = ''; commit(chars.join('')); focusAt(i); }
      else { chars[i - 1] = ''; commit(chars.join('')); focusAt(i - 1); }
      return;
    }
    if (e.key === 'ArrowLeft') { e.preventDefault(); focusAt(i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusAt(i + 1); }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    commit(pasted);
    focusAt(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex gap-2" role="group" aria-label="Code de vérification">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={value[i] ?? ''}
          disabled={disabled}
          aria-label={`Chiffre ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className="h-14 w-12 rounded-md border bg-white text-center text-xl font-mono font-semibold text-[#1A1A1A] outline-none transition-colors focus:border-[var(--em-accent)] focus:ring-2 focus:ring-[var(--em-accent)]/20 disabled:bg-[#F3F3F3] disabled:text-[#8A8A8A]"
          style={{ borderColor: hasError ? 'var(--em-danger)' : 'var(--em-border)' }}
        />
      ))}
    </div>
  );
}