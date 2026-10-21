import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BellRingIcon, ClipboardPlusIcon, HeartPulseIcon, ShieldPlusIcon, StethoscopeIcon, SyringeIcon } from "lucide-react";
import { creerProtocoleUrgence, enregistrerVisiteInfirmerie, getVaccinationsARelancer, listerVisitesInfirmerie, notifierUrgenceSante } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { ContextBar } from "../../components/layout/ContextBar";
import { Tabs } from "../../components/ui/Tabs";
import { LoadPicker } from "../../components/ui/LoadPicker";
import { PageStage, Reveal, TabStage } from "../../components/ui/Motion";
import { FormAction } from "../../components/form/FormAction";
import { protocoleFields, urgenceFields, visiteFields } from "../../data/fields/eleves";
import { optEleves } from "../../utils/options";

const COLOR = "#D13438";

export function Infirmerie() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "visites";
  const [eleveId, setEleveId] = useState("");
  const [jours, setJours] = useState("30");

  return (
    <PageStage>
      <Reveal>
        <PageHeader
          icon={HeartPulseIcon}
          color={COLOR}
          title="Infirmerie"
          subtitle="Visites, protocoles d'urgence et vaccinations"
          actions={
          <>
              <FormAction label="Protocole d'urgence" icon={ShieldPlusIcon} fields={protocoleFields(true)} modalSize="lg" onSubmit={creerProtocoleUrgence} successMessage="Protocole enregistré" />
              <FormAction label="Alerte santé" icon={BellRingIcon} variant="danger" fields={urgenceFields(true)} onSubmit={notifierUrgenceSante} successMessage="Alerte envoyée" showResult />
            </>
          } />
      </Reveal>

      <Reveal>
        <Tabs
          tabs={[
          { id: "visites", label: "Visites", icon: StethoscopeIcon },
          { id: "vaccins", label: "Vaccins à relancer", icon: SyringeIcon }]
          }
          value={tab}
          onChange={(t) => setParams({ tab: t })} />
      </Reveal>

      <Reveal>
        <TabStage id={tab}>
          {tab === "visites" ?
          <>
              <ContextBar icon={StethoscopeIcon} color={COLOR} title="Registre des visites" text="Affichez toutes les visites ou celles d'un seul élève.">
                <LoadPicker label="Élève" value={eleveId} onChange={setEleveId} load={optEleves} searchable clearable placeholder="Tous les élèves" width="sm:w-80" />
              </ContextBar>
              <ResourceView
              load={() => listerVisitesInfirmerie(eleveId || undefined)}
              deps={[eleveId]}
              actions={(reload) =>
              <FormAction label="Nouvelle visite" icon={ClipboardPlusIcon} variant="primary" fields={visiteFields(true)} modalSize="lg" onSubmit={enregistrerVisiteInfirmerie} successMessage="Visite enregistrée" onDone={reload} />
              }
              emptyTitle="Aucune visite"
              detailTitle={() => "Visite à l'infirmerie"} />
            </> :

          <>
              <ContextBar icon={SyringeIcon} color={COLOR} title="Vaccinations à relancer" text="Vaccins dont l'échéance arrive dans le nombre de jours indiqué.">
                <label className="w-full sm:w-48">
                  <span className="ecole_m-label">Échéance sous (jours)</span>
                  <input type="number" min={1} className="ecole_m-input" value={jours} onChange={(e) => setJours(e.target.value)} />
                </label>
              </ContextBar>
              <ResourceView
              load={() => getVaccinationsARelancer(Number(jours) || undefined)}
              deps={[jours]}
              emptyTitle="Aucun vaccin à relancer"
              detailTitle={() => "Vaccination"} />
            </>
          }
        </TabStage>
      </Reveal>
    </PageStage>);
}