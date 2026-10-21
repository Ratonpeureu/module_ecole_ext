import React from "react";
import { optClasses, optMatieresClasse, optPeriodes } from "../../utils/options";
import { LoadPicker } from "./LoadPicker";

interface P {
  anneeId: string;
  value: string;
  onChange: (v: string) => void;
}

export function ClassePicker({ anneeId, value, onChange }: P) {
  return (
    <LoadPicker
      label="Classe"
      value={value}
      onChange={onChange}
      load={optClasses(anneeId)}
      loadKey={anneeId}
      placeholder="Choisir une classe"
      searchable
    />
  );
}

export function PeriodePicker({ anneeId, value, onChange }: P) {
  return (
    <LoadPicker
      label="Période"
      value={value}
      onChange={onChange}
      load={optPeriodes(anneeId)}
      loadKey={anneeId}
      placeholder="Choisir une période"
      width="sm:w-52"
    />
  );
}

export function MatiereClassePicker({
  classeId,
  value,
  onChange
}: {
  classeId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <LoadPicker
      label="Matière"
      value={value}
      onChange={onChange}
      load={optMatieresClasse(classeId)}
      loadKey={classeId}
      placeholder={classeId ? "Choisir une matière" : "Choisissez une classe"}
    />
  );
}