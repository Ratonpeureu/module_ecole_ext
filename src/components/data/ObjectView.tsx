import React from "react";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import { downloadBase64 } from "@/lib/api";
import type { Row } from "../../types/ui";
import { humanize, isHiddenKey, resolveUrl, valueLabel } from "../../utils/format";
import { buttonClasses } from "../ui/Button";
import { CellValue } from "./CellValue";
import { DataTable } from "./DataTable";

interface ObjectViewProps {
  data: unknown;
  hide?: string[];
}

const isImageKey = (k: string) => /photo|signature|image|thumbnail|apercu|logo/.test(k) && !/nb_|_ids?$|photos_ids/.test(k);
const isB64Key = (k: string) => k.endsWith("_b64");

function isComplex(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  if (Array.isArray(v)) return v.some((x) => x !== null && typeof x === "object");
  return true;
}

function toImgSrc(k: string, v: string): string {
  if (isB64Key(k) && !v.startsWith("data:")) return `data:image/png;base64,${v}`;
  return resolveUrl(v);
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[8px] bg-[#F9F9F9] px-3 py-2.5 text-[13px] text-[#5D5D5D]">{children}</p>;
}

export function ObjectView({ data, hide = [] }: ObjectViewProps) {
  if (data === null || data === undefined) return <Muted>Aucune information.</Muted>;
  if (typeof data !== "object") return <p className="text-[14px] text-[#1A1A1A]">{valueLabel(String(data))}</p>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <Muted>Aucun élément.</Muted>;
    if (data.every((x) => x && typeof x === "object" && !Array.isArray(x))) {
      return (
        <div className="overflow-hidden rounded-[10px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <DataTable rows={data as Row[]} compact />
        </div>
      );
    }
    return <CellValue k="liste" v={data} />;
  }

  const entries = Object.entries(data as Row).filter(([k]) => !hide.includes(k) && !isHiddenKey(k));
  const images = entries.filter(([k, v]) => isImageKey(k) && typeof v === "string" && v !== "" && !k.endsWith("pdf_b64"));
  const files = entries.filter(([k, v]) => isB64Key(k) && !isImageKey(k) && typeof v === "string" && v !== "");
  const simple = entries.filter(([k, v]) => !isComplex(v) && !isImageKey(k) && !isB64Key(k));
  const complex = entries.filter(([k, v]) => isComplex(v) && !isB64Key(k));

  return (
    <div className="space-y-5">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map(([k, v]) => (
            <figure key={k} className="w-28">
              <div className="overflow-hidden rounded-[10px] border border-black/[0.07] bg-[#F3F3F3] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <img src={toImgSrc(k, String(v))} alt={humanize(k)} className="aspect-square w-full object-cover" />
              </div>
              <figcaption className="mt-1.5 truncate text-center text-[12px] font-medium text-[#5D5D5D]">{humanize(k)}</figcaption>
            </figure>
          ))}
        </div>
      )}

      {simple.length > 0 && (
        <dl className="grid gap-px overflow-hidden rounded-[10px] border border-black/[0.07] bg-black/[0.05] sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
          {simple.map(([k, v]) => (
            <div key={k} className="min-w-0 bg-white px-4 py-3">
              <dt className="text-[11.5px] font-medium text-[#5D5D5D]">{humanize(k)}</dt>
              <dd className="mt-1 break-words text-[13.5px] font-medium text-[#1A1A1A]">
                <CellValue k={k} v={v} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map(([k, v]) => (
            <button
              key={k}
              type="button"
              className={buttonClasses({ variant: "secondary", size: "sm", className: "group" })}
              onClick={() =>
                downloadBase64(
                  String(v),
                  `${humanize(k)}${k.includes("pdf") ? ".pdf" : ""}`,
                  k.includes("pdf") ? "application/pdf" : "application/octet-stream"
                )
              }>
              <FileTextIcon className="h-4 w-4 text-[var(--em-accent,#0067C0)]" aria-hidden="true" />
              {humanize(k)}
              <DownloadIcon className="h-3.5 w-3.5 text-[#8A8A8A] transition-transform duration-150 ease-out group-hover:translate-y-0.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {complex.map(([k, v]) => (
        <section key={k} className="space-y-3 border-t border-black/[0.06] pt-4">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-[3px] rounded-full bg-[var(--em-accent,#0067C0)]" aria-hidden="true" />
            <h4 className="text-[13.5px] font-semibold text-[#1A1A1A]">{humanize(k)}</h4>
            {Array.isArray(v) && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1.5 text-[11px] font-semibold tabular-nums text-[#5D5D5D]">
                {v.length}
              </span>
            )}
          </div>
          <ObjectView data={v} />
        </section>
      ))}
    </div>
  );
}