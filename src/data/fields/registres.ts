import type { FieldDef, OptionItem } from "../../types/ui";
import { anneeField, eleveField, enumField, F, req } from "../../utils/fieldBuilders";
import { fromEnum } from "../../utils/options";
import { STATUT_OVERRIDE, TYPE_REGISTRE } from "../registres";

export const synchroRegistresFields = (classes: OptionItem[]): FieldDef[] => [
  F.select("classe_id", "Classe", {
    options: classes,
    searchable: true,
    full: true,
    help: "Laissez vide pour toutes les classes actives de l'année active"
  }),
  F.multi("types", "Registres", {
    options: fromEnum(TYPE_REGISTRE),
    full: true,
    help: "Laissez vide pour tous les registres"
  }),
  F.bool("complet", "Synchronisation complète", {
    full: true,
    help: "Pris en compte par le registre des appels"
  })
];

export const synchroRegistreFields: FieldDef[] = [
  F.bool("complet", "Synchronisation complète", {
    full: true,
    help: "Pris en compte par le registre des appels"
  })
];

export const overrideEcheanceFields: FieldDef[] = [
  enumField("statut", "Statut manuel", fromEnum(STATUT_OVERRIDE), { ...req, full: true }),
  F.number("montant", "Montant payé (FCFA)", {
    ...req,
    min: 0,
    full: true,
    showIf: (v) => v.statut === "Partiel",
    help: "Strictement entre 0 et le montant net dû"
  }),
  F.area("motif", "Motif")
];

export const exportFinanceEleveFields = (anneeId: string): FieldDef[] => [
  eleveField({ full: true }),
  anneeField(anneeId, { help: "Laissez vide pour l'année active" })
];
