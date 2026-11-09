"use client";

import Link from "next/link";
import {
  ActionGroup,
  Alert,
  Heading,
  Paragraph,
  OrderedList,
  OrderedListItem,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { situatieVan, type TaakId, type VanzelfId } from "../_route";
import { useAannemen, zaakVan } from "../_useAannemen";
import { datumNL } from "../_werkgever";

const BESLUIT = {
  gemeente:
    "Bij het besluit ziet u dezelfde berekening als vooraf, met de loonwaarde die de gemeente heeft vastgesteld.",
  wajong:
    "Bij het besluit ziet u dezelfde berekening als vooraf, met het percentage dat UWV heeft vastgesteld.",
} as const;

/** Wat er gebeurt bij een regeling zonder aanvraag van de werkgever. */
const ZONDER_AANVRAAG: Record<
  VanzelfId | TaakId,
  (voornaam: string) => string
> = {
  lkv: () =>
    "U zet in de loonaangifte het vakje loonkostenvoordeel aan. Een aparte aanvraag is niet nodig.",
  nrp: (voornaam) =>
    `Wordt ${voornaam} ziek? Meld dat bij UWV. UWV betaalt u dan ziekengeld.`,
  doelgroepverklaring: (voornaam) =>
    `${voornaam} vraagt binnen drie maanden na de start een doelgroepverklaring aan bij UWV. Zonder die verklaring krijgt u geen loonkostenvoordeel.`,
  vz_wajong: (voornaam) =>
    `${voornaam} vraagt een jobcoach of een aangepaste werkplek zelf aan bij UWV.`,
  vz_wia: (voornaam) =>
    `${voornaam} vraagt een jobcoach of een aangepaste werkplek zelf aan bij UWV.`,
  pp: (voornaam) =>
    `${voornaam} vraagt de gemeente om toestemming voor de proefplaatsing.`,
};

/** Organisatie en datum komen uit de zaak van de situatie. */
const Verstuurd = ({
  perSituatie,
}: {
  perSituatie: Record<"gemeente" | "wajong" | "wia", DemoAannemen>;
}) => {
  const { staat } = useAannemen();
  if (!staat) return null;
  const situatie =
    situatieVan(staat.antwoorden.doelgroepen) === "wajong"
      ? "wajong"
      : "gemeente";
  const { kandidaat, zaak } = perSituatie[situatie];
  const stand = zaakVan(staat, situatie);
  const organisatie =
    situatie === "wajong" ? "UWV" : `de gemeente ${kandidaat.gemeente}`;

  // Dossier ingediend zonder iets te versturen.
  if (!stand.ingediend && staat.afgerond) {
    const wia = situatieVan(staat.antwoorden.doelgroepen) === "wia";
    const { voornaam } = perSituatie[wia ? "wia" : situatie].kandidaat;
    const gekozen = (Object.keys(ZONDER_AANVRAAG) as (VanzelfId | TaakId)[])
      .filter((id) => staat.gecontroleerd[id])
      .map((id) => ZONDER_AANVRAAG[id](voornaam));
    return (
      <>
        <Heading level={1}>Bedankt, uw dossier is ingediend</Heading>
        <Alert type="ok">
          <Paragraph>
            U hoeft niets te versturen. Hieronder staat wat er nu gebeurt.
          </Paragraph>
        </Alert>
        <div className="rhc-mox-card rhc-mox-row-gap">
          <section
            className="rhc-mox-row-gap"
            aria-labelledby="wat-er-nu-gebeurt"
          >
            <Heading level={2} id="wat-er-nu-gebeurt">
              Wat er nu gebeurt
            </Heading>
            <OrderedList>
              {gekozen.map((tekst) => (
                <OrderedListItem key={tekst}>{tekst}</OrderedListItem>
              ))}
            </OrderedList>
          </section>
          <ActionGroup>
            {wia && (
              <Link
                href={perSituatie.wia.zaak.url}
                className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
              >
                Bekijk uw dossier bij Lopende zaken
              </Link>
            )}
            <Link
              href="/personeel"
              className="utrecht-link utrecht-link--html-a"
            >
              Terug naar Personeel en rollen
            </Link>
          </ActionGroup>
        </div>
      </>
    );
  }

  if (!stand.ingediend)
    return (
      <>
        <Heading level={1}>Nog niets ingediend</Heading>
        <Paragraph>
          U hebt uw dossier nog niet ingediend. Controleer uw gegevens en kies{" "}
          <strong>Dossier indienen</strong>.
        </Paragraph>
        <Paragraph>
          <Link
            href="/personeel/iemand-aannemen/concept-aanvraag"
            className="utrecht-link utrecht-link--html-a"
          >
            Naar de aanvraag
          </Link>
        </Paragraph>
      </>
    );

  // Het onderwerp van het indienen; een gemeente-zaak zonder loonkostensubsidie
  // heet "Aanvraag bij de gemeente voor …".
  const titel = stand.onderwerp ?? zaak.onderwerp;
  const klein = titel[0].toLowerCase() + titel.slice(1);
  const onderwerp = klein.startsWith("aanvraag ")
    ? klein.slice("aanvraag ".length)
    : klein;
  return (
    <>
      <Heading level={1}>Bedankt, uw aanvraag is verstuurd</Heading>
      <Alert type="ok">
        <Paragraph>
          De aanvraag {onderwerp} is verstuurd naar {organisatie}
          {stand.verstuurdOp && ` op ${datumNL(stand.verstuurdOp)}`}.
        </Paragraph>
      </Alert>
      {/* Eén witte kaart; de secties blijven, elk met een eigen kop. */}
      <div className="rhc-mox-card rhc-mox-row-gap">
        <section
          className="rhc-mox-row-gap"
          aria-labelledby="wat-er-nu-gebeurt"
        >
          <Heading level={2} id="wat-er-nu-gebeurt">
            Wat er nu gebeurt
          </Heading>
          <OrderedList>
            <OrderedListItem>
              U krijgt een ontvangstbevestiging met het zaaknummer in uw{" "}
              <Link
                href="/berichtenbox"
                className="utrecht-link utrecht-link--html-a"
              >
                berichtenbox
              </Link>
              .
            </OrderedListItem>
            <OrderedListItem>
              {situatie === "wajong" ? "UWV" : "De gemeente"} beoordeelt uw
              aanvraag. Is er iets nodig, dan neemt{" "}
              {situatie === "wajong" ? "UWV" : "de gemeente"} contact met u op.
            </OrderedListItem>
            <OrderedListItem>
              U krijgt het besluit in uw berichtenbox. {BESLUIT[situatie]}
            </OrderedListItem>
          </OrderedList>
        </section>
        <section className="rhc-mox-row-gap" aria-labelledby="uw-dossier">
          <Heading level={2} id="uw-dossier">
            Uw dossier
          </Heading>
          <Paragraph>
            In uw dossier bij Lopende zaken ziet u elke stap van{" "}
            {situatie === "wajong" ? "UWV" : "de gemeente"}, met datum en
            afzender, tot en met het besluit.
          </Paragraph>
          <ActionGroup>
            <Link
              href={zaak.url}
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            >
              Bekijk uw dossier bij Lopende zaken
            </Link>
            <Link
              href="/personeel"
              className="utrecht-link utrecht-link--html-a"
            >
              Terug naar Personeel en rollen
            </Link>
          </ActionGroup>
        </section>
      </div>
    </>
  );
};

export default Verstuurd;
