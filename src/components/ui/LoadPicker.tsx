import React from "react";
import type { OptionItem, OptionLoader } from "../../types/ui";
import { PickerField } from "./PickerField";
import { Select } from "./Select";

interface LoadPickerProps {
  label: string;
  value: string;
  onChange: (value: string, option: OptionItem | null) => void;
  load?: OptionLoader;
  options?: OptionItem[];
  loadKey?: string;
  placeholder?: string;
  width?: string;
  clearable?: boolean;
  searchable?: boolean;
}

export function LoadPicker({ label, value, onChange, load, options, loadKey, placeholder, width, clearable, searchable }: LoadPickerProps) {
  return (
    <PickerField label={label} width={width}>
      <Select
        ariaLabel={label}
        value={value}
        onChange={(v, o) => onChange(String(v), o)}
        load={load ? (q) => load(q, {}) : undefined}
        options={options}
        loadKey={loadKey}
        placeholder={placeholder}
        clearable={clearable}
        searchable={searchable} />
      
    </PickerField>);

}