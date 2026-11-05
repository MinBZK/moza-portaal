import type { Metadata } from "next";
import Link from "next/link";
import {
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
import {
  getDemoIemandAannemenSituaties,
  getDemoPersoneelsonderwerpen,
} from "@/demo";
import {
  getActieveOrganisatie,
  getActievePersona,
  getIngelogdeNaam,
} from "@/app/(public)/_persona";
import { ExternalLink } from "@/app/(footer)/_article";
import PersoneelZaak from "./iemand-aannemen/_personeelZaak";

export const metadata: Metadata = { title: "Personeel en rollen" };

const EHERKENNING = "https://www.eherkenning.nl/";

const aantalTekst = (voltijd = 0, deeltijd = 0) =>
  voltijd + deeltijd === 0
    ? "Geen personeel"
    : `${voltijd + deeltijd}, waarvan ${voltijd} voltijd en ${deeltijd} deeltijd`;

/**
 * Personeel en rollen: het personeel van de onderneming, de onderwerpen over
 * personeel (alleen Iemand aannemen is uitgewerkt), en wie namens de
 * onderneming mag handelen.
 */
const PersoneelPage = async () => {
  const persona = await getActievePersona();
  const [situaties, onderwerpen, organisatie, naam] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getDemoPersoneelsonderwerpen(),
    getActieveOrganisatie(persona),
    getIngelogdeNaam(persona),
  ]);
  const onderneming = organisatie?.handelsnaam ?? "uw onderneming";

  return (
    <>
      <Heading level={1}>Personeel en rollen</Heading>

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

      <PersoneelZaak
        zaken={{
          gemeente: situaties.gemeente.zaak,
          wajong: situaties.wajong.zaak,
          wia: situaties.wia.zaak,
        }}
      />

      <Heading level={2}>Wat u kunt regelen</Heading>
      <ul className="rhc-grid rhc-mox-plain-list">
        {onderwerpen.map(({ id, titel, samenvatting, href }) => (
          <li
            key={id}
            className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-6"
          >
            <Heading level={3}>
              {href?.startsWith("http") ? (
                <ExternalLink href={href}>{titel}</ExternalLink>
              ) : href ? (
                <Link href={href} className="utrecht-link utrecht-link--html-a">
                  {titel}
                </Link>
              ) : (
                titel
              )}
            </Heading>
            <Paragraph>{samenvatting}</Paragraph>
          </li>
        ))}
      </ul>

      <section className="rhc-mox-card" aria-labelledby="rollen">
        <Heading level={2} id="rollen">
          Rollen en bevoegdheden
        </Heading>
        <DataSummary appearance="column" className="rhc-data-summary--columns">
          {naam && (
            <DataSummaryItem
              itemKey={naam}
              itemValue={
                organisatie?.functies ?? organisatie?.rol ?? "Onbekend"
              }
            />
          )}
          {organisatie?.rechtsvorm && (
            <DataSummaryItem
              itemKey="Rechtsvorm"
              itemValue={organisatie.rechtsvorm}
            />
          )}
        </DataSummary>
        <Paragraph className="rhc-mox-small-text">
          Uw functie komt uit het Handelsregister van de KVK.
        </Paragraph>
        <Paragraph>
          Wilt u dat een medewerker of uw boekhouder namens {onderneming} zaken
          regelt bij de overheid? Geef die dan een machtiging met eHerkenning.
        </Paragraph>
        <Paragraph>
          <ExternalLink href={EHERKENNING}>
            Machtigen met eHerkenning
          </ExternalLink>
        </Paragraph>
      </section>
    </>
  );
};

export default PersoneelPage;
