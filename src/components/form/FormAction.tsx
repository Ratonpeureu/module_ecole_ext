import React, { useRef, useState } from "react";
import { LucideIcon } from "lucide-react";
import type { FieldDef, FormValues, Row } from "../../types/ui";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { SchemaForm } from "./SchemaForm";

interface FormActionProps {
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "subtle" | "danger";
  size?: "sm" | "md";
  iconOnly?: boolean;
  title?: string;
  description?: string;
  fields: FieldDef[];
  initial?: Row;
  onSubmit: (body: Row, values: FormValues) => Promise<unknown>;
  onDone?: (result: unknown) => void;
  submitLabel?: string;
  successMessage?: string;
  showResult?: boolean;
  modalSize?: "md" | "lg" | "xl";
  disabled?: boolean;
  renderResult?: (result: unknown) => React.ReactNode;
}

export function FormAction({
  label,
  icon,
  variant = "secondary",
  size = "md",
  iconOnly,
  title,
  description,
  fields,
  initial,
  onSubmit,
  onDone,
  submitLabel,
  successMessage,
  showResult,
  modalSize,
  disabled,
  renderResult,
}: FormActionProps) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const done = useRef<{ value: unknown } | null>(null);

  const close = () => {
    setOpen(false);
    if (done.current) {
      const r = done.current.value;
      done.current = null;
      onDone?.(r);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        icon={icon}
        iconOnly={iconOnly}
        disabled={disabled}
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
        onClick={() => {
          done.current = null;
          setKey((k) => k + 1);
          setOpen(true);
        }}
      >
        {label}
      </Button>

      <Modal open={open} onClose={close} title={title ?? label} description={description} icon={icon} size={modalSize}>
        <SchemaForm
          key={key}
          fields={fields}
          initial={initial}
          submitLabel={submitLabel}
          successMessage={successMessage}
          showResult={showResult}
          renderResult={renderResult}
          onCancel={close}
          onSubmit={async (b, v) => {
            const r = await onSubmit(b, v);
            done.current = { value: r };
            return r;
          }}
          onSuccess={() => close()}
        />
      </Modal>
    </>
  );
}