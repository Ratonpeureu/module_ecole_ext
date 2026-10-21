import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftRightIcon,
  BriefcaseIcon,
  CalendarClockIcon,
  HistoryIcon,
  KeyRoundIcon,
  LineChartIcon,
  LinkIcon,
  PencilIcon,
  PowerIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  UnlinkIcon,
  UserRoundIcon,
  ShieldOffIcon,
} from "lucide-react";
import {
  affecterEnseignantMasse,
  changerEnseignant,
  genererCodeActivationEnseignant,
  getChargeHoraireEnseignant,
  getEdtEnseignant,
  getEnseignant,
  getIdentiteEnseignant,
  getParcoursEnseignant,
  getPhotoEnseignant,
  getStatsCumuleesEnseignant,
  getStatutAccesEnseignant,
  listerAffectationsEnseignant,
  listerCodesActivationEnseignant,
  modifierEnseignant,
  recalculerStatsEnseignant,
  retirerAffectationEnseignant,
  revoquerAccesEnseignant,
} from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { affectationFields, enseignantEditFields, portailFields } from "../../data/fields/personnel";
import { changerEnseignantFields, retirerEnseignantFields } from "../../data/fields/pedagogie";
import type { Row } from "../../types/ui";
import { AsyncBlock } from "../data/AsyncBlock";
import { EdtGrid } from "../data/EdtGrid";
import { MiniTable } from "../data/MiniTable";
import { ObjectView } from "../data/ObjectView";
import { StatGrid } from "../data/StatGrid";
import { EmptyState } from "../data/States";
import { AsyncButton } from "../form/AsyncButton";
import { ConfirmAction } from "../form/ConfirmAction";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { FluentTabs } from "../ui/FluentTabs";
import type { FluentTab } from "../ui/FluentTabs";
import { CommandBar, Stagger, StaggerItem } from "../eleves/EleveMotion";
import { formatNumber, fullName, initials, obj, str } from "../../utils/format";

const MODULE_COLOR = "#8764B8";
const MODULE_SOFT = "#efe9f7";
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function Photo({ id, name }: { id: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    let u: string | null = null;
    getPhotoEnseignant(id)
      .then((f) => {
        if (!alive || !f.mimeType.startsWith("image/")) return;
        u = URL.createObjectURL(f.blob);
        setUrl(u);
      })
      .catch(() => setUrl(null));
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [id]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24, ease: EASE_OUT }}
      className="-mt-10 shrink-0 rounded-full bg-[var(--em-surface,#ffffff)] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {url ? (
          <motion.img
            key="photo"
            src={url}
            alt={name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <span
            key="initiales"
            className="grid h-20 w-20 place-items-center rounded-full text-[24px] font-semibold"
            style={{ backgroundColor: MODULE_SOFT, color: MODULE_COLOR }}
          >
            {initials(name)}
          </span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const TABS: FluentTab[] = [
  { id: "profil", label: "Profil", icon: UserRoundIcon },
  { id: "affectations", label: "Affectations", icon: BriefcaseIcon },
  { id: "charge", label: "Charge & planning", icon: CalendarClockIcon },
  { id: "parcours", label: "Parcours", icon: LineChartIcon },
  { id: "portail", label: "Accès portail", icon: KeyRoundIcon },
];

export function EnseignantDetail({
  enseignant,
  anneeId,
  onChanged,
}: {
  enseignant: Row;
  anneeId: string;
  onChanged: () => void;
}) {
  const id = str(enseignant.id);
  const name = fullName(enseignant);
  const [tab, setTab] = useState("profil");
  const [tick, bump] = useTick();
  const [historique, setHistorique] = useState(false);
  const reduce = useReducedMotion();

  const refresh = () => {
    bump();
    onChanged();
  };

  const subtitle = str(enseignant.specialite_principale) || str(enseignant.poste);

  return (
    <div className="space-y-5">
      {/* ── En-tête ───────────────────────────────────────────── */}
      <header className="overflow-hidden rounded-xl border border-[var(--em-border)] bg-[var(--em-surface,#ffffff)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20" style={{ backgroundColor: MODULE_SOFT }} aria-hidden />
        <div className="flex items-end gap-4 px-5 pb-5">
          <Photo id={id} name={name} />
          <div className="min-w-0 pb-0.5">
            <h2 className="truncate text-[20px] font-semibold leading-tight">{name}</h2>
            {subtitle && (
              <p className="mt-1 truncate text-[13px] font-medium" style={{ color: MODULE_COLOR }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-10 -mx-1 px-1 py-1 backdrop-blur-md">
        <FluentTabs
          tabs={TABS}
          value={tab}
          onChange={setTab}
          idPrefix="enseignant"
          label="Dossier de l'enseignant"
          accent={MODULE_COLOR}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          id={`enseignant-panel-${tab}`}
          aria-labelledby={`enseignant-tab-${tab}`}
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -4 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {/* ── Profil ──────────────────────────────────────────── */}
          {tab === "profil" && (
            <AsyncBlock load={() => getEnseignant(id)} deps={[id, tick]}>
              {(e) => (
                <Stagger className="space-y-5">
                  <StaggerItem>
                    <CommandBar>
                      <FormAction
                        label="Modifier"
                        icon={PencilIcon}
                        size="sm"
                        fields={enseignantEditFields}
                        initial={e}
                        modalSize="lg"
                        onSubmit={(b) => modifierEnseignant(id, b)}
                        successMessage="Fiche mise à jour"
                        onDone={refresh}
                      />
                      {Number(e.actif) === 1 ? (
                        <ConfirmAction
                          label="Désactiver"
                          icon={PowerIcon}
                          size="sm"
                          danger
                          message="Ses affectations en cours seront clôturées."
                          run={() => modifierEnseignant(id, { actif: 0 })}
                          successMessage="Enseignant désactivé"
                          showResult
                          onDone={refresh}
                        />
                      ) : (
                        <ConfirmAction
                          label="Réactiver"
                          icon={PowerIcon}
                          size="sm"
                          message="L'enseignant sera de nouveau actif."
                          run={() => modifierEnseignant(id, { actif: 1 })}
                          successMessage="Enseignant réactivé"
                          onDone={refresh}
                        />
                      )}
                    </CommandBar>
                  </StaggerItem>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <StaggerItem>
                      <Section title="Identité pédagogique">
                        <AsyncBlock load={() => getIdentiteEnseignant(id, anneeId)} deps={[id, anneeId, tick]}>
                          {(d) => <ObjectView data={d} />}
                        </AsyncBlock>
                      </Section>
                    </StaggerItem>
                    <StaggerItem>
                      <Section title="Fiche">
                        <ObjectView data={e} hide={["nom", "prenom", "photo_b64"]} />
                      </Section>
                    </StaggerItem>
                  </div>
                </Stagger>
              )}
            </AsyncBlock>
          )}

          {/* ── Affectations ────────────────────────────────────── */}
          {tab === "affectations" && (
            <Stagger className="space-y-5">
              <StaggerItem>
                <CommandBar>
                  <FormAction
                    label="Confier des matières"
                    icon={LinkIcon}
                    size="sm"
                    variant="primary"
                    fields={affectationFields(anneeId)}
                    onSubmit={(b) => affecterEnseignantMasse(id, b)}
                    successMessage="Matières confiées"
                    showResult
                    onDone={refresh}
                  />
                  <span className="mx-1 hidden h-5 w-px bg-[var(--em-border)] sm:block" aria-hidden />
                  <label className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors duration-150 hover:bg-black/[0.04]">
                    <HistoryIcon className="ecole_m-muted h-4 w-4" aria-hidden />
                    <span>Afficher l'historique</span>
                    <input
                      type="checkbox"
                      className="ecole_m-switch"
                      checked={historique}
                      onChange={(e) => setHistorique(e.target.checked)}
                    />
                  </label>
                </CommandBar>
              </StaggerItem>

              <StaggerItem>
                <Section title={historique ? "Toutes les affectations" : "Affectations en cours"}>
                  <AsyncBlock
                    load={() =>
                      listerAffectationsEnseignant(id, { annee_scolaire_id: anneeId, inclure_historique: historique })
                    }
                    deps={[id, anneeId, historique, tick]}
                    empty={<EmptyState compact title="Aucune affectation" />}
                  >
                    {(rows) => (
                      <MiniTable
                        rows={rows}
                        rowKey={(r, i) => str(r.affectation_id) || String(i)}
                        columns={[
                          { key: "matiere" },
                          { key: "classe_libelle", label: "Classe" },
                          { key: "coefficient" },
                          { key: "volume_horaire_hebdo", label: "Heures / sem." },
                          { key: "date_debut" },
                          { key: "statut" },
                        ]}
                        rowActions={(r) =>
                          str(r.statut) === "actif" ? (
                            <div className="flex items-center gap-0.5">
                              <FormAction
                                label="Remplacer l'enseignant"
                                icon={ArrowLeftRightIcon}
                                iconOnly
                                size="sm"
                                variant="subtle"
                                fields={changerEnseignantFields()}
                                onSubmit={(b) => changerEnseignant(str(r.matiere_classe_id), b)}
                                successMessage="Enseignant remplacé"
                                onDone={refresh}
                              />
                              <FormAction
                                label="Retirer l'affectation"
                                icon={UnlinkIcon}
                                iconOnly
                                size="sm"
                                variant="subtle"
                                fields={retirerEnseignantFields()}
                                onSubmit={(b) =>
                                  retirerAffectationEnseignant(str(r.matiere_classe_id), {
                                    date_fin: str(b.date_fin) || undefined,
                                    motif: str(b.motif) || undefined,
                                  })
                                }
                                successMessage="Affectation retirée"
                                showResult
                                onDone={refresh}
                              />
                            </div>
                          ) : null
                        }
                      />
                    )}
                  </AsyncBlock>
                </Section>
              </StaggerItem>
            </Stagger>
          )}

          {/* ── Charge & planning ───────────────────────────────── */}
          {tab === "charge" && (
            <Stagger className="space-y-5">
              <AsyncBlock load={() => getChargeHoraireEnseignant(id, anneeId)} deps={[id, anneeId]}>
                {(c) => (
                  <div className="space-y-5">
                    <StaggerItem>
                      <StatGrid
                        items={[
                          { label: "Heures par semaine", value: formatNumber(c.total_heures_hebdo_reelles), tone: "accent" },
                          { label: "Prévu au contrat", value: formatNumber(c.volume_horaire_contractuel) },
                          { label: "Écart", value: formatNumber(c.ecart_vs_contrat) },
                          { label: "Classes", value: formatNumber(c.nb_classes) },
                          { label: "Matières", value: formatNumber(c.nb_matieres) },
                        ]}
                      />
                    </StaggerItem>

                    {str(c.alerte_charge) && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: EASE_OUT, delay: 0.08 }}
                        className="flex items-start gap-3 rounded-lg border border-[var(--em-warning)]/25 bg-[var(--em-warning-soft)] px-4 py-3 text-[13.5px] text-[var(--em-warning)]"
                      >
                        <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <p>{str(c.alerte_charge)}</p>
                      </motion.div>
                    )}

                    <StaggerItem>
                      <Section title="Répartition par classe">
                        <ObjectView data={{ detail_par_classe: c.detail_par_classe }} />
                      </Section>
                    </StaggerItem>
                  </div>
                )}
              </AsyncBlock>

              <StaggerItem>
                <AsyncBlock load={() => getEdtEnseignant(id)} deps={[id]}>
                  {(d) => (
                    <Section
                      title="Emploi du temps"
                      actions={
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
                          style={{ backgroundColor: MODULE_SOFT, color: MODULE_COLOR }}
                        >
                          <CalendarClockIcon className="h-3.5 w-3.5" aria-hidden />
                          {formatNumber(d.total_heures_semaine)} heure(s) par semaine
                        </span>
                      }
                    >
                      <div className="overflow-x-auto">
                        <EdtGrid grille={obj(d.grille)} />
                      </div>
                    </Section>
                  )}
                </AsyncBlock>
              </StaggerItem>
            </Stagger>
          )}

          {/* ── Parcours ────────────────────────────────────────── */}
          {tab === "parcours" && (
            <Stagger className="space-y-5">
              <StaggerItem>
                <CommandBar hint="Les statistiques sont calculées par le serveur">
                  <AsyncButton
                    label="Recalculer les statistiques de l'année"
                    icon={RefreshCwIcon}
                    size="sm"
                    successMessage="Statistiques mises à jour"
                    onClick={async () => {
                      await recalculerStatsEnseignant(id, anneeId);
                      bump();
                    }}
                  />
                </CommandBar>
              </StaggerItem>

              <div className="grid gap-5 xl:grid-cols-2">
                <StaggerItem>
                  <Section title="Statistiques cumulées">
                    <AsyncBlock load={() => getStatsCumuleesEnseignant(id)} deps={[id, tick]} isEmpty={(d) => !d}>
                      {(d) => <ObjectView data={d} />}
                    </AsyncBlock>
                  </Section>
                </StaggerItem>
                <StaggerItem>
                  <Section title="Parcours">
                    <AsyncBlock load={() => getParcoursEnseignant(id)} deps={[id, tick]} isEmpty={(d) => !d}>
                      {(d) => <ObjectView data={d} />}
                    </AsyncBlock>
                  </Section>
                </StaggerItem>
              </div>
            </Stagger>
          )}


          {/* ── Accès portail ───────────────────────────────────── */}
          {tab === "portail" && (
            <Stagger className="space-y-5">
              <StaggerItem>
                <CommandBar>
                  <FormAction
                    label="Générer un code d'activation"
                    icon={KeyRoundIcon}
                    size="sm"
                    variant="primary"
                    fields={portailFields}
                    onSubmit={(b) => genererCodeActivationEnseignant(id, b.force_nouveau === true)}
                    successMessage="Code d'activation généré"
                    showResult
                    onDone={refresh}
                  />
                  <ConfirmAction
                    label="Révoquer l'accès"
                    icon={ShieldOffIcon}
                    size="sm"
                    danger
                    message="L'enseignant n'aura plus accès au portail de cet établissement."
                    run={() => revoquerAccesEnseignant(id)}
                    successMessage="Accès révoqué"
                    showResult
                    onDone={refresh}
                  />
                </CommandBar>
              </StaggerItem>

              <div className="grid gap-5 xl:grid-cols-2">
                <StaggerItem>
                  <Section title="Statut de l'accès">
                    <AsyncBlock load={() => getStatutAccesEnseignant(id)} deps={[id, tick]}>
                      {(d) => <ObjectView data={d} />}
                    </AsyncBlock>
                  </Section>
                </StaggerItem>
                <StaggerItem>
                  <Section title="Historique des codes">
                    <AsyncBlock
                      load={() => listerCodesActivationEnseignant(id)}
                      deps={[id, tick]}
                      empty={<EmptyState compact title="Aucun code généré" />}
                    >
                      {(rows) => <ObjectView data={{ codes: rows }} />}
                    </AsyncBlock>
                  </Section>
                </StaggerItem>
              </div>
            </Stagger>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}