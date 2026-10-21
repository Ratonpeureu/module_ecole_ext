import React, { useState } from "react";
import { CalendarIcon, MessageSquareTextIcon, PenLineIcon, PlusIcon } from "lucide-react";
import { creerEvaluation, listerEleves, listerEvaluations, listerNotes, saisirAppreciation, saisirNote } from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { useLookup } from "../../hooks/useLookup";
import { PageHeader } from "../../components/layout/PageHeader";
import { ResourceView } from "../../components/layout/ResourceView";
import { WithAnnee } from "../../components/layout/WithAnnee";
import { ContextBar } from "../../components/layout/ContextBar";
import { Section } from "../../components/layout/Section";
import { ClassePicker, MatiereClassePicker, PeriodePicker } from "../../components/ui/ClassePicker";
import { PageStage, Reveal } from "../../components/ui/Motion";
import { AsyncBlock } from "../../components/data/AsyncBlock";
import { MiniTable } from "../../components/data/MiniTable";
import { EmptyState } from "../../components/data/States";
import { PersonCell } from "../../components/data/PersonCell";
import { FormAction } from "../../components/form/FormAction";
import { appreciationFields, evaluationFields, noteFields } from "../../data/fields/pedagogie";
import type { Row } from "../../types/ui";
import { formatDate, fullName, num, str } from "../../utils/format";

const COLOR = "#CA5010";

function Chip({ children }: {children: React.ReactNode;}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{ background: `color-mix(in srgb, ${COLOR} 12%, transparent)`, color: COLOR }}>
      {children}
    </span>);
}

function EvaluationNotes({ evaluation }: {evaluation: Row;}) {
  const id = str(evaluation.id);
  const [tick, bump] = useTick();
  const eleves = useLookup(() => listerEleves(), fullName);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {str(evaluation.date_evaluation) ?
        <Chip>
            <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(evaluation.date_evaluation)}
          </Chip> :
        null}
        {str(evaluation.note_max) ? <Chip>Sur {str(evaluation.note_max)}</Chip> : null}
        {str(evaluation.coefficient_evaluation) ? <Chip>Coef. {str(evaluation.coefficient_evaluation)}</Chip> : null}
      </div>

      <Section
        title="Notes"
        actions={
        <FormAction
          label="Saisir une note"
          icon={PenLineIcon}
          size="sm"
          variant="primary"
          fields={noteFields(num(evaluation.note_max) ?? undefined)}
          onSubmit={(b) => saisirNote({ ...b, evaluation_id: id })}
          successMessage="Note enregistrée"
          onDone={bump} />
        }>
        <AsyncBlock load={() => listerNotes(id)} deps={[id, tick]} empty={<EmptyState compact title="Aucune note saisie" />}>
          {(rows) =>
          <MiniTable
            rows={rows}
            columns={[
            { key: "eleve_id", label: "Élève", render: (r) => <PersonCell name={eleves.get(str(r.eleve_id)) ?? "Élève"} color={COLOR} /> },
            { key: "valeur_numerique", label: "Note" },
            { key: "absent" },
            { key: "commentaire" }]
            } />
          }
        </AsyncBlock>
      </Section>
    </div>);
}

export function Notes() {
  const [classeId, setClasseId] = useState("");
  const [mcId, setMcId] = useState("");
  const [periodeId, setPeriodeId] = useState("");
  const ready = !!mcId && !!periodeId;

  return (
    <PageStage>
      <Reveal>
        <PageHeader icon={PenLineIcon} color={COLOR} title="Notes" subtitle="Évaluations, notes et appréciations" />
      </Reveal>

      <Reveal>
        <WithAnnee>
          {(anneeId) =>
          <div className="space-y-4">
              <ContextBar
              icon={PenLineIcon}
              color={COLOR}
              title="Classe, matière et période"
              text="Choisissez d'abord la classe pour afficher ses matières."
              steps={[
              { label: "Classe", done: !!classeId },
              { label: "Matière", done: !!mcId },
              { label: "Période", done: !!periodeId }]
              }>
                <ClassePicker anneeId={anneeId} value={classeId} onChange={(v) => {setClasseId(v);setMcId("");}} />
                <MatiereClassePicker classeId={classeId} value={mcId} onChange={setMcId} />
                <PeriodePicker anneeId={anneeId} value={periodeId} onChange={setPeriodeId} />
              </ContextBar>

              <ResourceView
              load={() => listerEvaluations(mcId, periodeId)}
              deps={[mcId, periodeId]}
              enabled={ready}
              disabledState={<EmptyState icon={PenLineIcon} title="Choisissez une classe, une matière et une période" />}
              actions={(reload) =>
              ready ?
              <>
                      <FormAction
                  label="Appréciation"
                  icon={MessageSquareTextIcon}
                  fields={appreciationFields}
                  onSubmit={(b) => saisirAppreciation({ ...b, matiere_classe_id: mcId, periode_id: periodeId })}
                  successMessage="Appréciation enregistrée" />
                      <FormAction
                  label="Nouvelle évaluation"
                  icon={PlusIcon}
                  variant="primary"
                  fields={evaluationFields()}
                  onSubmit={(b) => creerEvaluation({ ...b, matiere_classe_id: mcId, periode_id: periodeId })}
                  successMessage="Évaluation créée"
                  onDone={reload} />
                    </> :
              null
              }
              columns={[
              { key: "libelle", render: (r) => <span className="font-medium">{str(r.libelle)}</span> },
              { key: "date_evaluation", label: "Date" },
              { key: "note_max", label: "Sur" },
              { key: "coefficient_evaluation", label: "Coef." },
              { key: "statut" }]
              }
              emptyTitle="Aucune évaluation"
              detailTitle={(r) => str(r.libelle)}
              renderDetail={(r) => <EvaluationNotes evaluation={r} />} />
            </div>
          }
        </WithAnnee>
      </Reveal>
    </PageStage>);
}