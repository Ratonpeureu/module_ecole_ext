import React, { useState } from "react";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";
import { errorMessage } from "../../utils/errors";
import { Button } from "../ui/Button";

interface AsyncButtonProps {
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "subtle" | "danger";
  size?: "sm" | "md";
  iconOnly?: boolean;
  onClick: () => Promise<unknown>;
  successMessage?: string;
  disabled?: boolean;
}

export function AsyncButton({
  label,
  icon,
  variant = "secondary",
  size = "md",
  iconOnly,
  onClick,
  successMessage,
  disabled,
}: AsyncButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await onClick();
      if (successMessage) toast.success(successMessage);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      iconOnly={iconOnly}
      loading={busy}
      disabled={disabled}
      aria-busy={busy}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}