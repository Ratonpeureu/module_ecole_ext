import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, LoaderCircleIcon, SearchIcon, XIcon } from "lucide-react";
import type { OptionItem } from "../../types/ui";
import { errorMessage } from "../../utils/errors";

interface SelectProps {
  value: string | string[];
  onChange: (value: string | string[], option: OptionItem | null) => void;
  options?: OptionItem[];
  load?: (query: string) => Promise<OptionItem[]>;
  loadKey?: string;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  invalid?: boolean;
  compact?: boolean;
  id?: string;
  ariaLabel?: string;
}

interface Pos {
  left: number;
  top: number;
  width: number;
  up: boolean;
  maxH: number;
}

export function Select({
  value,
  onChange,
  options,
  load,
  loadKey = "",
  multiple = false,
  searchable,
  placeholder = "Sélectionner…",
  disabled,
  clearable,
  invalid,
  compact,
  id,
  ariaLabel
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<OptionItem[]>(options ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);
  const labels = useRef(new Map<string, OptionItem>());
  const trigRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef(load);
  loadRef.current = load;
  const listId = useId();
  const hasLoad = !!load;
  const isSearch = searchable ?? (hasLoad || (options?.length ?? 0) > 8);

  const selected = multiple ?
  Array.isArray(value) ?
  value :
  [] :
  typeof value === "string" && value ?
  [value] :
  [];

  useEffect(() => {
    if (options) setItems(options);
  }, [options]);

  useEffect(() => {
    if (!hasLoad) return;
    let alive = true;
    setLoading(true);
    setError(null);
    const t = window.setTimeout(
      () => {
        const fn = loadRef.current;
        if (!fn) return;
        fn(query).
        then((r) => {
          if (alive) setItems(r);
        }).
        catch((e: unknown) => {
          if (alive) {
            setError(errorMessage(e));
            setItems([]);
          }
        }).
        finally(() => {
          if (alive) setLoading(false);
        });
      },
      query ? 250 : 0
    );
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [hasLoad, loadKey, query]);

  items.forEach((i) => labels.current.set(i.value, i));

  const shown =
  !hasLoad && isSearch && query ?
  items.filter((i) => `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(query.toLowerCase())) :
  items;

  const place = useCallback(() => {
    const el = trigRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 240 && above > below;
    setPos({
      left: Math.min(r.left, window.innerWidth - Math.max(r.width, 240) - 8),
      top: up ? r.top - 4 : r.bottom + 4,
      width: Math.max(r.width, 240),
      up,
      maxH: Math.max(160, Math.min(340, up ? above : below))
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onMove = (e: Event) => {
      if (popRef.current && e.target instanceof Node && popRef.current.contains(e.target)) return;
      place();
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (trigRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    trigRef.current?.focus();
  };

  const pick = (o: OptionItem) => {
    labels.current.set(o.value, o);
    if (multiple) {
      const next = selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value];
      onChange(next, o);
    } else {
      onChange(o.value, o);
      close();
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) pick(shown[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  const labelOf = (v: string) => labels.current.get(v)?.label ?? (loading ? "Chargement…" : v);

  return (
    <>
      <div
        ref={trigRef}
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-invalid={invalid}
        aria-label={ariaLabel}
        data-open={open}
        data-filled={selected.length > 0}
        className={`ecole_m-select ${multiple ? "ecole_m-select--multi" : ""} ${compact ? "ecole_m-select--compact" : ""} ${
        disabled ? "pointer-events-none opacity-60" : ""}`
        }
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          } else if (e.key === "Escape") setOpen(false);else
          if (open) onListKey(e);
        }}>
        
        {selected.length === 0 ?
        <span className="ecole_m-faint truncate">{placeholder}</span> :
        multiple ?
        selected.map((v) =>
        <span key={v} className="ecole_m-chip">
              <span className="truncate">{labelOf(v)}</span>
              <span
            role="button"
            tabIndex={-1}
            aria-label={`Retirer ${labelOf(v)}`}
            className="-mr-1 grid h-4 w-4 place-items-center rounded hover:bg-black/10"
            onClick={(e) => {
              e.stopPropagation();
              onChange(
                selected.filter((x) => x !== v),
                null
              );
            }}>
            
                <XIcon className="h-3 w-3" />
              </span>
            </span>
        ) :

        <span className="truncate">{labelOf(selected[0])}</span>
        }
        {clearable && !multiple && selected.length > 0 &&
        <span
          role="button"
          tabIndex={-1}
          aria-label="Effacer la sélection"
          className="absolute right-8 grid h-5 w-5 place-items-center rounded hover:bg-black/5"
          onClick={(e) => {
            e.stopPropagation();
            onChange("", null);
          }}>
          
            <XIcon className="h-3.5 w-3.5" />
          </span>
        }
      </div>
      {createPortal(
        <AnimatePresence>
          {open && pos &&
          <motion.div
            ref={popRef}
            className="ecole_m"
            style={{
              position: "fixed",
              left: pos.left,
              width: pos.width,
              zIndex: 90,
              ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top })
            }}
            initial={{ opacity: 0, y: pos.up ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}>
            
              <div className="ecole_m-menu flex flex-col" style={{ maxHeight: pos.maxH }}>
                {isSearch &&
              <div className="relative mb-1 shrink-0">
                    <SearchIcon className="ecole_m-faint pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onListKey}
                  placeholder="Rechercher…"
                  aria-label="Rechercher"
                  className="ecole_m-input pl-8" />
                
                  </div>
              }
                <div
                role="listbox"
                id={listId}
                aria-multiselectable={multiple}
                tabIndex={-1}
                onKeyDown={onListKey}
                className="ecole_m-scroll min-h-0 flex-1 overflow-y-auto">
                
                  {loading ?
                <div className="ecole_m-muted flex items-center gap-2 px-3 py-3 text-[13px]">
                      <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                      Chargement…
                    </div> :
                error ?
                <div className="px-3 py-3 text-[13px] text-[var(--em-danger)]">{error}</div> :
                shown.length === 0 ?
                <div className="ecole_m-muted px-3 py-3 text-[13px]">Aucun résultat</div> :

                shown.map((o, i) => {
                  const sel = selected.includes(o.value);
                  return (
                    <button
                      type="button"
                      key={o.value}
                      role="option"
                      aria-selected={sel}
                      data-active={i === active}
                      className="ecole_m-option"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pick(o)}>
                      
                          {multiple &&
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                        sel ? "border-[var(--em-accent)] bg-[var(--em-accent)] text-white" : "border-[#8b95a3] bg-white"}`
                        }>
                        
                              {sel && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                            </span>
                      }
                          <span className="min-w-0 flex-1 truncate">{o.label}</span>
                          {o.hint && <span className="ecole_m-faint shrink-0 text-[12px]">{o.hint}</span>}
                        </button>);

                })
                }
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>,
        document.body
      )}
    </>);

}