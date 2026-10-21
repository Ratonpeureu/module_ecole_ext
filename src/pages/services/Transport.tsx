import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangleIcon, BusIcon, MapIcon, PlusIcon, ScanLineIcon, TicketIcon } from "lucide-react";
import { creerAbonnementTransport, creerCircuit, creerVehicule, getAnomaliesTransport, listerCircuits, listerVehicules, pointerTransport } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { ContextBar } from "../../components/layout/ContextBar";
import { Tabs } from "../../components/ui/Tabs";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { FormAction } from "../../components/form/FormAction";
import { abonnementFields, circuitFields, pointageFields, vehiculeFields } from "../../data/fields/services";
import { str, todayISO } from "../../utils/format";

const COLOR = "#C19C00";

export function Transport() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "circuits";
  const [date, setDate] = useState(todayISO());

  const quick =
  <>
      <FormAction label="Abonner un élève" icon={TicketIcon} fields={abonnementFields()} onSubmit={creerAbonnementTransport} successMessage="Abonnement enregistré" />
      <FormAction label="Pointer" icon={ScanLineIcon} fields={pointageFields()} onSubmit={pointerTransport} successMessage="Pointage enregistré" />
    </>;

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={BusIcon} color={COLOR} title="Transport" subtitle="Véhicules, circuits, abonnements et pointage" actions={quick} />
      </Reveal>

      <Reveal>
        <Tabs
          tabs={[
          { id: "circuits", label: "Circuits", icon: MapIcon },
          { id: "vehicules", label: "Véhicules", icon: BusIcon },
          { id: "anomalies", label: "Anomalies", icon: AlertTriangleIcon }]
          }
          value={tab}
          onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <TabStage id={tab}>
          {tab === "circuits" &&
          <ResourceView
            load={listerCircuits}
            deps={[]}
            columns={[
            {
              key: "libelle",
              render: (r) =>
              <span className="flex min-w-0 items-center gap-3">
                      <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${COLOR} 16%, transparent)`, color: COLOR }}>
                        <MapIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="truncate font-medium">{str(r.libelle)}</span>
                    </span>
            },
            { key: "sens" },
            { key: "heure_depart", label: "Départ" }]
            }
            actions={(reload) =>
            <FormAction label="Nouveau circuit" icon={PlusIcon} variant="primary" fields={circuitFields} modalSize="lg" onSubmit={creerCircuit} successMessage="Circuit créé" onDone={reload} />
            }
            emptyTitle="Aucun circuit"
            emptyIcon={MapIcon}
            detailTitle={(r) => str(r.libelle)} />
          }

          {tab === "vehicules" &&
          <ResourceView
            load={listerVehicules}
            deps={[]}
            actions={(reload) =>
            <FormAction label="Nouveau véhicule" icon={PlusIcon} variant="primary" fields={vehiculeFields} onSubmit={creerVehicule} successMessage="Véhicule ajouté" onDone={reload} />
            }
            emptyTitle="Aucun véhicule"
            emptyIcon={BusIcon}
            detailTitle={(r) => str(r.immatriculation)} />
          }

          {tab === "anomalies" &&
          <>
              <ContextBar icon={AlertTriangleIcon} color={COLOR} title="Anomalies de pointage" text="Choisissez la date du trajet à contrôler.">
                <label className="w-full sm:w-48">
                  <span className="ecole_m-label">Date du trajet</span>
                  <input type="date" className="ecole_m-input" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
              </ContextBar>
              <ResourceView
              load={() => getAnomaliesTransport(date)}
              deps={[date]}
              enabled={!!date}
              emptyTitle="Aucune anomalie ce jour"
              detailTitle={() => "Anomalie"} />
            </>
          }
        </TabStage>
      </Reveal>
    </PageStage>);
}