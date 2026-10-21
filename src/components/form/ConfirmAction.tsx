import React, { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CircleAlertIcon, CircleCheckIcon, CircleHelpIcon, TriangleAlertIcon, LucideIcon } from "lucide-react";
import { errorMessage } from "../../utils/errors";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { ObjectView } from "../data/ObjectView";

interface ConfirmActionProps {
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "subtle" | "danger";
  size?: "sm" | "md";
  iconOnly?: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  run: () => Promise<unknown>;
  onDone?: (result: unknown) => void;
  showResult?: boolean;
  successMessage?: string;
  renderResult?: (result: unknown) => React.ReactNode;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function ConfirmAction({
  label,
  icon,
  variant = "secondary",
  size = "md",
  iconOnly,
  title,
  message,
  confirmLabel = "Confirmer",
  danger,
  run,
  onDone,
  showResult,
  successMessage = "Action effectuée",
  renderResult,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ value: unknown } | null>(null);
  const reduce = useReducedMotion();

  const close = () => {
    if (busy) return;
    setOpen(false);
    if (result) {
      onDone?.(result.value);
      setResult(null);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await run();
      toast.success(successMessage);
      if (showResult) setResult({ value: r });
      else {
        setOpen(false);
        onDone?.(r);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const Glyph = danger ? TriangleAlertIcon : CircleHelpIcon;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        icon={icon}
        iconOnly={iconOnly}
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
        onClick={() => {
          setError(null);
          setResult(null);
          setOpen(true);
        }}
      >
        {label}
      </Button>

      <Modal open={open} onClose={close} title={title ?? label} icon={icon}>
        <AnimatePresence mode="wait" initial={false}>
          {result ? (
            <motion.div
              key="result"
              className="space-y-5"
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              <div className="flex items-center gap-3 rounded-lg border border-[var(--em-success)]/20 bg-[var(--em-success-soft)] px-4 py-3 text-[var(--em-success)]">
                <motion.span
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: EASE_OUT, delay: 0.06 }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--em-success)] text-white"
                >
                  <CircleCheckIcon className="h-4.5 w-4.5" aria-hidden />
                </motion.span>
                <span className="font-semibold">{successMessage}</span>
              </div>

              {renderResult ? renderResult(result.value) : <ObjectView data={result.value} />}

              <div className="flex justify-end border-t border-[var(--em-border)] pt-4">
                <Button variant="primary" onClick={close}>
                  Terminer
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: EASE_OUT }}
            >
              <div className="flex items-start gap-4">
                <motion.span
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                    danger
                      ? "bg-[var(--em-danger-soft)] text-[var(--em-danger)]"
                      : "bg-[var(--em-accent-soft)] text-[var(--em-accent)]"
                  }`}
                  aria-hidden
                >
                  <Glyph className="h-5 w-5" />
                </motion.span>
                <p className="pt-2 text-[14px] leading-relaxed">{message}</p>
              </div>

              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    key="error"
                    role="alert"
                    initial={{ opacity: 0, y: reduce ? 0 : -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="flex gap-3 whitespace-pre-line rounded-lg border border-[#f0c6c1] bg-[var(--em-danger-soft)] px-4 py-3 text-[13.5px] text-[var(--em-danger)]"
                  >
                    <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end gap-2 border-t border-[var(--em-border)] pt-4">
                <Button variant="secondary" onClick={close} disabled={busy}>
                  Annuler
                </Button>
                <Button variant={danger ? "danger" : "primary"} onClick={confirm} loading={busy}>
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
}