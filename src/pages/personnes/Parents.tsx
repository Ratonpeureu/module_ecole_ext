import React, { useState } from "react";
import { KeyRoundIcon, LinkIcon, MailPlusIcon, TicketIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import {
  creerCompteParent,
  genererCodeActivationParent,
  genererCodeEnveloppeParent,
  getCodeEnveloppeParent,
  getParent,
  lierEnfantParent,
  lierParentEleve,
  listerCodesEnveloppeParent,
  listerEnfantsParent,
  listerParents } from
"../../lib/api_ecole";
import { useDebounced, useTick } from "../../hooks/useAsync";
import { ModuleHero } from "../../components/layout/ModuleHero";
import { ResourceView } from "../../components/layout/ResourceView";
import { Section } from "../../components/layout/Section";
import { SearchInput } from "../../components/ui/SearchInput";
import { AsyncBlock } from "../../components/data/AsyncBlock";
import { MiniTable } from "../../components/data/MiniTable";
import { ObjectView } from "../../components/data/ObjectView";
import { EmptyState } from "../../components/data/States";
import { FormAction } from "../../components/form/FormAction";
import { codeActivationFields, lierEnfantFields, parentCreateFields, relationFields } from "../../data/fields/personnel";
import { F } from "../../utils/fieldBuilders";
import { fullName, initials, str } from "../../utils/format";

const COLOR = "#C239B3";

function ParentDetail({ parentId }: {parentId: string;}) {
  const [tick, bump] = useTick();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--em-border)] p-4">
        <AsyncBlock load={() => getParent(parentId)} deps={[parentId]}>
          {(p) => <ObjectView data={p} hide={["nom", "prenom"]} />}
        </AsyncBlock>
      </div>

      <Section
        title="Enfants"
        actions={
        <>
            <FormAction label="Rattacher par code" icon={KeyRoundIcon} size="sm" fields={lierEnfantFields} onSubmit={(b) => lierEnfantParent(parentId, b)} successMessage="Enfant rattaché" showResult onDone={bump} />
            <FormAction label="Rattacher un élève" icon={LinkIcon} size="sm" fields={relationFields} onSubmit={(b) => lierParentEleve(parentId, b)} successMessage="Élève rattaché" onDone={bump} />
          </>
        }>
        <AsyncBlock load={() => listerEnfantsParent(parentId)} deps={[parentId, tick]} empty={<EmptyState compact title="Aucun enfant rattaché" />}>
          {(rows) =>
          <div className="overflow-hidden rounded-lg border border-[var(--em-border)]">
              <MiniTable rows={rows} rowKey={(r, i) => str(r.eleve_id) || String(i)} />
            </div>
          }
        </AsyncBlock>
      </Section>

      <Section
        title="Code d'activation du compte"
        description="Code à remettre sous enveloppe au parent pour activer son accès."
        actions={
        <FormAction
          label="Générer un code"
          icon={TicketIcon}
          size="sm"
          fields={[F.bool("force_nouveau", "Remplacer le code existant")]}
          onSubmit={(b) => genererCodeEnveloppeParent(parentId, b.force_nouveau === true)}
          successMessage="Code généré"
          showResult
          onDone={bump} />
        }>
        <div className="space-y-4">
          <AsyncBlock load={() => getCodeEnveloppeParent(parentId)} deps={[parentId, tick]} isEmpty={(d) => !d}>
            {(c) =>
            <div className="space-y-3">
                {str(c.code) &&
              <div className="rounded-xl border border-dashed border-[var(--em-accent)] bg-[var(--em-accent-soft)] px-4 py-5 text-center">
                    <p className="ecole_m-muted mb-1 text-[12px]">Code à remettre au parent</p>
                    <p className="select-all font-mono text-[24px] font-semibold tracking-[0.25em] text-[var(--em-accent)]">{str(c.code)}</p>
                  </div>
              }
                <ObjectView data={c} hide={["code"]} />
              </div>
            }
          </AsyncBlock>

          <AsyncBlock load={() => listerCodesEnveloppeParent(parentId)} deps={[parentId, tick]} empty={<></>}>
            {(rows) =>
            <div>
                <p className="ecole_m-muted mb-2 text-[12px] font-medium">Historique des codes</p>
                <div className="overflow-hidden rounded-lg border border-[var(--em-border)]">
                  <MiniTable rows={rows} />
                </div>
              </div>
            }
          </AsyncBlock>
        </div>
      </Section>
    </div>);
}

export function Parents() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q);

  return (
    <div className="space-y-6">
      <ModuleHero icon={UsersIcon} color={COLOR} title="Parents" subtitle="Comptes des familles et liens avec les élèves" />

      <ResourceView
        load={() => listerParents(dq || undefined)}
        deps={[dq]}
        columns={[
        {
          key: "nom",
          label: "Parent",
          render: (r) =>
          <span className="flex items-center gap-3">
                <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
              style={{ background: `color-mix(in srgb, ${COLOR} 14%, transparent)`, color: COLOR }}>
                  {initials(fullName(r))}
                </span>
                <span className="font-medium">{fullName(r)}</span>
              </span>
        },
        { key: "telephone" },
        { key: "email" },
        { key: "actif" }]
        }
        toolbar={<SearchInput value={q} onChange={setQ} placeholder="Nom, téléphone ou e-mail" />}
        actions={(reload) =>
        <>
            <FormAction label="Code d'activation libre" icon={MailPlusIcon} fields={codeActivationFields} onSubmit={genererCodeActivationParent} successMessage="Code généré" showResult />
            <FormAction label="Nouveau parent" icon={UserPlusIcon} variant="primary" fields={parentCreateFields} onSubmit={creerCompteParent} successMessage="Compte créé" showResult onDone={reload} />
          </>
        }
        emptyTitle="Aucun parent"
        emptyIcon={UsersIcon}
        detailTitle={fullName}
        detailSubtitle={(r) => str(r.telephone)}
        renderDetail={(r) => <ParentDetail parentId={str(r.id)} />} />
    </div>);
}