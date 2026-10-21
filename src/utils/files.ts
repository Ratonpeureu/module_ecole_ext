import { triggerBlobDownload } from "@/lib/api";
import type { FichierBinaire } from "../lib/api_ecole";
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

export async function saveFile(f: FichierBinaire): Promise<void> {
  const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
  
  if (isTauri) {
    try {
      // Ouvre la boîte de dialogue "Enregistrer sous..." de Windows/Linux
      const path = await save({
        defaultPath: f.filename,
      });
      if (path) {
        const arrayBuffer = await f.blob.arrayBuffer();
        await writeFile(path, new Uint8Array(arrayBuffer));
      }
    } catch (e) {
      console.error("Erreur lors de la sauvegarde Tauri:", e);
      // Fallback : on utilise la méthode web si ça plante
      triggerBlobDownload(f.blob, f.filename);
    }
  } else {
    // Sur le web normal, téléchargement classique
    triggerBlobDownload(f.blob, f.filename);
  }
}

export function openFile(f: FichierBinaire): void {
  const url = URL.createObjectURL(f.blob);
  const w = window.open(url, "_blank", "noopener");
  if (!w) triggerBlobDownload(f.blob, f.filename);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}