import React from "react";

interface PickerFieldProps {
  label: string;
  children: React.ReactNode;
  width?: string;
}

export function PickerField({ label, children, width = "sm:w-64" }: PickerFieldProps) {
  return (
    <div className={`group w-full ${width}`}>
      <span className="ecole_m-label transition-colors duration-150 group-focus-within:text-[var(--em-accent,#0067C0)]">{label}</span>
      {children}
    </div>
  );
}