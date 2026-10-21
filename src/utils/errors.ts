import { ApiError } from "@/lib/api";

interface DetailItem {
  message?: string;
  msg?: string;
  conflits?: DetailItem[];
  loc?: unknown[];
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const detail: unknown = e.data?.detail;
    if (Array.isArray(detail)) {
      const parts = (detail as DetailItem[]).map((d) => d?.msg ?? d?.message ?? "").filter(Boolean);
      if (parts.length) return parts.join("\n");
    }
    if (detail && typeof detail === "object") {
      const d = detail as {
        message?: string;
        suggestion?: string;
        conflits?: DetailItem[];
        details?: DetailItem[];
      };
      const parts: string[] = [];
      if (typeof d.message === "string") parts.push(d.message);
      const conflits = Array.isArray(d.conflits) ?
      d.conflits :
      Array.isArray(d.details) ?
      d.details.flatMap((x) => Array.isArray(x.conflits) ? x.conflits : []) :
      [];
      conflits.forEach((c) => {
        if (c && typeof c.message === "string") parts.push(`• ${c.message}`);
      });
      if (typeof d.suggestion === "string") parts.push(d.suggestion);
      if (parts.length) return parts.join("\n");
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return "Une erreur est survenue";
}