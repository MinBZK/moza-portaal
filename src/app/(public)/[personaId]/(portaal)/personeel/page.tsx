import type { Metadata } from "next";
import Link from "next/link";
import {
  ActionGroup,
  DataSummary,
  DataSummaryItem,
  Heading,
  Icon,
  OrderedList,
  OrderedListItem,
  Paragraph,
} from "@/components/rhc";
import { getDemoIemandAannemenSituaties } from "@/demo";
import {
  getActieveOrganisatie,
  getActievePersona,
} from "@/app/(public)/_persona";
import { ExternalLink } from "@/app/(footer)/_article";
import PersoneelZaak from "./iemand-aannemen/_personeelZaak";
import { STAPPEN, TAAK_TITEL } from "./iemand-aannemen/_stappen";

export const metadata: Metadata = { title: "Personeel en rollen" };

const ONDERNEMERSPLEIN_AANNEMEN =
  "https://ondernemersplein.overheid.nl/personeel/aannemen/stappenplan-personeel-aannemen/";
const BELASTINGDIENST_LOON =
  "https://www.belastingdienst.nl/wps/wcm/connect/nl/personeel-en-loon/personeel-en-loon";

const aantalTekst = (voltijd = 0, deeltijd = 0) =>
  voltijd + deeltijd === 0
    ? "Geen personeel"
    : `${voltijd + deeltijd}, waarvan ${voltijd} voltijd en ${deeltijd} deeltijd`;

/**
 * Personeel en rollen: het personeel van de onderneming, wat de ondernemer
 * daarvoor kan regelen (met de ingang naar Iemand aannemen).
 */
const PersoneelPage = async () => {
  const persona = await getActievePersona();
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(persona),
  ]);

  return (
    <>
      <Heading level={1}>Personeel en rollen</Heading>

      <PersoneelZaak
        zaken={{
          gemeente: situaties.gemeente.zaak,
          wajong: situaties.wajong.zaak,
          wia: situaties.wia.zaak,
        }}
      />

      <Heading level={2}>Wat u kunt regelen</Heading>
      <section className="rhc-mox-card" aria-labelledby="iemand-aannemen">
        <Heading level={3} id="iemand-aannemen">
          {TAAK_TITEL}
        </Heading>
        <Paragraph>
          Neemt u iemand aan die niet zelfstandig het minimumloon kan verdienen?
          Bijvoorbeeld omdat die in het doelgroepregister staat of een uitkering
          heeft. Dan ziet u vooraf welke regelingen voor u kunnen gelden en wat
          ze opleveren. Wij gebruiken daarvoor wat de overheid al van u en van
          de kandidaat weet.
        </Paragraph>
        <Paragraph>Dit gaat in {STAPPEN.length} stappen:</Paragraph>
        <OrderedList>
          {STAPPEN.map((stap) => (
            <OrderedListItem key={stap.name}>{stap.name}</OrderedListItem>
          ))}
        </OrderedList>
        <Paragraph>
          U vult alleen in wat de overheid nog niet weet. Wij versturen niets
          zonder dat u dat zelf doet.
        </Paragraph>
        <ActionGroup>
          <Link
            href={STAPPEN[0].href}
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Begin met de {STAPPEN[0].name.toLowerCase()}
            <Icon icon="chevron-right" />
          </Link>
        </ActionGroup>
      </section>

      <div className="rhc-grid">
        <section
          className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-6"
          aria-labelledby="ziekte-verlof"
        >
          <Heading level={3} id="ziekte-verlof">
            Ziekte en verlof
          </Heading>
          <Paragraph>
            Een werknemer ziek melden, en zien welk verlof uw personeel kan
            opnemen.
          </Paragraph>
          <ActionGroup>
            <Link
              href="/verzuim-en-verlof"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
            >
              Naar Ziekte en verlof
            </Link>
          </ActionGroup>
        </section>
        <section
          className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-6"
          aria-labelledby="loon"
        >
          <Heading level={3} id="loon">
            Loon en loonaangifte
          </Heading>
          <Paragraph>
            Elke maand of elke vier weken doet u loonaangifte bij de
            Belastingdienst. Daar leest u ook wat u moet regelen voor het loon.
          </Paragraph>
          <Paragraph>
            <ExternalLink href={BELASTINGDIENST_LOON}>
              Personeel en loon bij de Belastingdienst
            </ExternalLink>
          </Paragraph>
        </section>
        <section
          className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-6"
          aria-labelledby="aannemen-algemeen"
        >
          <Heading level={3} id="aannemen-algemeen">
            Personeel aannemen
          </Heading>
          <Paragraph>
            Neemt u voor het eerst iemand aan? Lees welke stappen u moet zetten,
            van contract tot loonheffingennummer.
          </Paragraph>
          <Paragraph>
            <ExternalLink href={ONDERNEMERSPLEIN_AANNEMEN}>
              Stappenplan personeel aannemen op Ondernemersplein
            </ExternalLink>
          </Paragraph>
        </section>
      </div>

      <section className="rhc-mox-card" aria-labelledby="uw-personeel">
        <Heading level={2} id="uw-personeel">
          Uw personeel
        </Heading>
        <DataSummary appearance="column" className="rhc-data-summary--columns">
          <DataSummaryItem
            itemKey="Werkzame personen"
            itemValue={aantalTekst(
              organisatie?.werkzamePersonenFulltime,
              organisatie?.werkzamePersonenParttime,
            )}
          />
          <DataSummaryItem
            itemKey="Loonheffingennummer"
            itemValue={organisatie?.loonheffingennummer || "Nog niet bekend"}
          />
        </DataSummary>
        <Paragraph className="rhc-mox-small-text">
          Het aantal werkzame personen komt uit het Handelsregister van de Kamer
          van Koophandel (KVK). Het loonheffingennummer komt van de
          Belastingdienst.
        </Paragraph>
      </section>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
          headingLevel={3}
          sections={vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: antwoord,
          }))}
        />
      </div>
    </>
  );
};

export default PersoneelPage;
