import React from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarXIcon, FileDownIcon, FileSpreadsheetIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { exporterFinanceEleve, getStatutRegistres, synchroRegistresEtAttendre } from "../lib/api_ecole";
import type { TypeRegistre } from "../types/ui";
import { useAsync } from "../hooks/useAsync";
import { useSchool } from "../contexts/SchoolContext";
import { ORDRE_REGISTRES } from "../data/registres";
import { exportFinanceEleveFields, synchroRegistresFields } from "../data/fields/registres";
import { PageHeader } from "../components/layout/PageHeader";
import { PageStage, Reveal, TabStage } from "../components/ui/Motion";
import { EmptyState } from "../components/data/States";
import { FormAction } from "../components/form/FormAction";
import { CommandBar } from "../components/eleves/EleveMotion";
import { RegistresMatrice } from "../components/registres/RegistresMatrice";
import { RegistreEditeur } from "../components/registres/RegistreEditeur";
import { saveFile } from "../utils/files";
import { str } from "../utils/format";

const COLOR = "#217346";

export function Registres() {
  const [params, setParams] = useSearchParams();
  const { anneeId } = useSchool();
  const { data, loading, error, reload } = useAsync(() => getStatutRegistres(), []);

  const classeId = params.get("classe") ?? "";
  const typeParam = params.get("type");
  const type = ORDRE_REGISTRES.find((t) => t === typeParam) ?? null;
  const enEdition = !!data?.annee && !!classeId && !!type && data.classes.some((c) => c.classe_id === classeId);

  const ouvrir = (c: string, t: TypeRegistre) => setParams({ classe: c, type: t });
  const fermer = () => setParams({});
  const optionsClasses = (data?.classes ?? []).map((c) => ({ value: c.classe_id, label: c.libelle }));

  return (
    <PageStage>
      <Reveal>
        <PageHeader
          icon={FileSpreadsheetIcon}
          color={COLOR}
          title="Registres"
          subtitle={data?.annee ? `Classeurs Excel des classes — ${data.annee}` : "Classeurs Excel des classes"}
        />
      </Reveal>
      <Reveal>
        {loading && !data ? (
          <div className="space-y-2" aria-busy="true" aria-label="Chargement des registres">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-black/[0.04]" />
            ))}
          </div>
        ) : error && !data ? (
          <div className="space-y-3">
            <EmptyState icon={TriangleAlertIcon} title="Impossible de charger les registres" text={error} />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={reload}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--em-accent)] px-3 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-90"
              >
                <RefreshCwIcon className="h-4 w-4" aria-hidden />
                Réessayer
              </button>
            </div>
          </div>
        ) : data && !data.annee ? (
          <EmptyState icon={CalendarXIcon} title="Aucune année scolaire active" text="Les registres sont tenus pour l'année scolaire active." />
        ) : data ? (
          <TabStage id={enEdition ? "editeur" : "apercu"}>
            {enEdition && type ? (
              <RegistreEditeur
                classeId={classeId}
                type={type}
                classes={data.classes}
                accent={COLOR}
                onChanger={ouvrir}
                onFermer={fermer}
                onStatutChange={reload}
              />
            ) : (
              <div className="space-y-4">
                <CommandBar hint="Les registres couvrent l'année scolaire active">
                  <FormAction
                    label="Synchroniser les registres"
                    icon={RefreshCwIcon}
                    size="sm"
                    variant="primary"
                    description="Recalcule les classeurs depuis la base. Une classe en échec ne bloque pas les autres."
                    fields={synchroRegistresFields(optionsClasses)}
                    submitLabel="Synchroniser"
                    successMessage="Synchronisation terminée"
                    showResult
                    onSubmit={(b) =>
                      synchroRegistresEtAttendre({
                        classe_id: str(b.classe_id) || undefined,
                        complet: b.complet === true,
                        types: Array.isArray(b.types) && b.types.length ? (b.types as TypeRegistre[]) : undefined
                      })
                    }
                    onDone={reload}
                  />
                  <FormAction
                    label="Exporter la finance d'un élève"
                    icon={FileDownIcon}
                    size="sm"
                    description="Fichier Excel calculé à la demande, jamais stocké."
                    fields={exportFinanceEleveFields(anneeId)}
                    submitLabel="Exporter"
                    successMessage="Export téléchargé"
                    onSubmit={async (b) => {
                      const f = await exporterFinanceEleve(str(b.eleve_id), str(b.annee_scolaire_id) || undefined);
                      saveFile(f);
                      return f.filename;
                    }}
                  />
                </CommandBar>
                <RegistresMatrice statut={data} onOuvrir={ouvrir} onActualiser={reload} />
              </div>
            )}
          </TabStage>
        ) : null}
      </Reveal>
    </PageStage>
  );
}
