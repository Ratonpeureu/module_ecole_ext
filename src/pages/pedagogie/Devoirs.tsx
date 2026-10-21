import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ListChecksIcon, NotebookPenIcon, PlusIcon, SchoolIcon, SendIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { creerDevoir } from "../../lib/api_ecole";
import { PageHeader } from "../../components/layout/PageHeader";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { EASE_OUT, PageStage, Reveal } from "../../components/ui/Motion";
import { FormAction } from "../../components/form/FormAction";
import { devoirFields } from "../../data/fields/pedagogie";

const COLOR = "#B146C2";

const ETAPES: {icon: LucideIcon;title: string;text: string;}[] = [
{ icon: SchoolIcon, title: "Classe et matière", text: "Choisissez la classe, puis la matière concernée." },
{ icon: ListChecksIcon, title: "Consignes et échéance", text: "Rédigez les consignes, la date de remise et joignez un lien si besoin." },
{ icon: SendIcon, title: "Transmission", text: "Le devoir est transmis aux élèves de la classe et à leurs familles." }];

export function Devoirs() {
  const reduce = useReducedMotion();

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={NotebookPenIcon} color={COLOR} title="Devoirs" subtitle="Travail à faire à la maison" />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <section className="ecole_m-card overflow-hidden" aria-labelledby="devoir-title">
              <div className="grid lg:grid-cols-[1.1fr_1fr]">
                <div className="flex flex-col justify-center gap-5 p-6 md:p-8">
                  <span
                  className="grid h-14 w-14 place-items-center rounded-2xl"
                  style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
                    <NotebookPenIcon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <h2 id="devoir-title" className="text-[22px] font-semibold leading-tight tracking-tight">Donner un devoir</h2>
                    <p className="ecole_m-muted max-w-md text-[14px] leading-relaxed">
                      Le devoir est transmis aux élèves de la classe et à leurs familles.
                    </p>
                  </div>
                  <div>
                    <FormAction
                    label="Nouveau devoir"
                    icon={PlusIcon}
                    variant="primary"
                    fields={devoirFields(anneeId)}
                    modalSize="lg"
                    onSubmit={creerDevoir}
                    successMessage="Devoir publié"
                    showResult />
                  </div>
                </div>

                <div
                className="border-t border-[var(--em-border)] p-6 md:p-8 lg:border-l lg:border-t-0"
                style={{ background: `color-mix(in srgb, ${COLOR} 4%, transparent)` }}>
                  <h3 className="ecole_m-muted mb-5 text-[13px] font-medium">Comment ça se passe</h3>
                  <ol className="relative space-y-6">
                    <span
                    className="absolute bottom-4 left-[17px] top-4 w-px bg-[var(--em-border)]"
                    aria-hidden="true" />
                    {ETAPES.map((e, i) =>
                  <motion.li
                    key={e.title}
                    className="relative flex gap-4"
                    initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.24, ease: EASE_OUT, delay: reduce ? 0 : 0.12 + i * 0.06 }}>
                        <span
                      className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-[var(--em-surface,white)] text-[13px] font-semibold"
                      style={{ borderColor: `color-mix(in srgb, ${COLOR} 40%, transparent)`, color: COLOR }}>
                          {i + 1}
                        </span>
                        <div className="pt-1">
                          <p className="flex items-center gap-2 text-[14px] font-semibold">
                            <e.icon className="h-4 w-4" style={{ color: COLOR }} aria-hidden="true" />
                            {e.title}
                          </p>
                          <p className="ecole_m-muted mt-1 text-[13px] leading-relaxed">{e.text}</p>
                        </div>
                      </motion.li>
                  )}
                  </ol>
                </div>
              </div>
            </section>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}