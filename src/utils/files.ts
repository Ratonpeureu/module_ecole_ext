import { triggerBlobDownload } from "@/lib/api";
import type { FichierBinaire } from "../lib/api_ecole";

export function saveFile(f: FichierBinaire): void {
  triggerBlobDownload(f.blob, f.filename);
}

export function openFile(f: FichierBinaire): void {
  const url = URL.createObjectURL(f.blob);
  const w = window.open(url, "_blank", "noopener");
  if (!w) triggerBlobDownload(f.blob, f.filename);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}