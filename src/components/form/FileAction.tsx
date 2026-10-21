import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";
import { errorMessage } from "../../utils/errors";
import { Button } from "../ui/Button";

interface FileActionProps {
  label: string;
  icon?: LucideIcon;
  accept?: string;
  size?: "sm" | "md";
  onFile: (file: File) => Promise<unknown>;
  onDone?: () => void;
  successMessage?: string;
}

export function FileAction({
  label,
  icon,
  accept,
  size = "sm",
  onFile,
  onDone,
  successMessage = "Fichier envoyé",
}: FileActionProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    try {
      await onFile(f);
      toast.success(successMessage);
      onDone?.();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" tabIndex={-1} aria-hidden onChange={handleChange} />
      <Button size={size} icon={icon} loading={busy} aria-busy={busy} onClick={() => ref.current?.click()}>
        {label}
      </Button>
    </>
  );
}