import React from "react";
import { BanknoteIcon, WalletCardsIcon } from "lucide-react";
import {
  enregistrerPaiement,
  enregistrerPaiementAvecCredit,
  getSituationFinanciereComplete,
  listerMouvementsCredit,
} from "../../lib/api_ecole";
import { useTick } from "../../hooks/useAsync";
import { paiementFields } from "../../data/fields/eleves";
import { AsyncBlock } from "../data/AsyncBlock";
import { MiniTable } from "../data/MiniTable";
import { StatGrid } from "../data/StatGrid";
import { EmptyState } from "../data/States";
import { FormAction } from "../form/FormAction";
import { Section } from "../layout/Section";
import { CommandBar, Stagger, StaggerItem } from "./EleveMotion";
import { arr, formatMoney, num } from "../../utils/format";

export function EleveFinance({ eleveId }: { eleveId: string }) {
  const [tick, bump] = useTick();

  return (
    <Stagger className="space-y-5">
      <StaggerItem>
        <CommandBar hint="Les montants sont répartis par le serveur sur les échéances">
          <FormAction
            label="Encaisser un paiement"
            icon={BanknoteIcon}
            size="sm"
            variant="primary"
            description="Le montant est réparti automatiquement sur les échéances dues."
            fields={paiementFields()}
            onSubmit={(b) => enregistrerPaiement({ ...b, eleve_id: eleveId })}
            successMessage="Paiement enregistré"
            showResult
            onDone={bump}
          />
          <FormAction
            label="Paiement avec avoir"
            icon={WalletCardsIcon}
            size="sm"
            description="Tout excédent est conservé comme avoir au profit de l'élève."
            fields={paiementFields()}
            onSubmit={(b) => enregistrerPaiementAvecCredit({ ...b, eleve_id: eleveId })}
            successMessage="Paiement enregistré"
            showResult
            onDone={bump}
          />
        </CommandBar>
      </StaggerItem>

      <AsyncBlock load={() => getSituationFinanciereComplete(eleveId)} deps={[eleveId, tick]}>
        {(s) => (
          <div className="space-y-5">
            <StaggerItem>
              <StatGrid
                items={[
                  { label: "Total dû", value: formatMoney(s.total_du_fcfa) },
                  { label: "Total payé", value: formatMoney(s.total_paye_fcfa), tone: "success" },
                  {
                    label: "Reste à payer",
                    value: formatMoney(s.solde_restant_fcfa),
                    tone: (num(s.solde_restant_fcfa) ?? 0) > 0 ? "danger" : "default",
                  },
                  { label: "Avoir disponible", value: formatMoney(s.solde_credit_fcfa), tone: "accent" },
                ]}
              />
            </StaggerItem>

            <StaggerItem>
              <Section title="Échéancier">
                {arr(s.echeances).length ? (
                  <MiniTable rows={arr(s.echeances)} />
                ) : (
                  <EmptyState compact title="Aucune échéance" />
                )}
              </Section>
            </StaggerItem>
          </div>
        )}
      </AsyncBlock>

      <StaggerItem>
        <Section title="Mouvements d'avoir">
          <AsyncBlock
            load={() => listerMouvementsCredit(eleveId)}
            deps={[eleveId, tick]}
            empty={<EmptyState compact title="Aucun mouvement" />}
          >
            {(rows) => <MiniTable rows={rows} />}
          </AsyncBlock>
        </Section>
      </StaggerItem>
    </Stagger>
  );
}