import {
  DataSummary,
  DataSummaryItem,
  Heading,
  OrderedList,
  OrderedListItem,
  Paragraph,
} from "@/components/rhc";
import { getDemoIemandAannemen } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Verstuur from "./_verstuur";
import Stappen from "../_stappen";
import { datumNL, vul, werkgeverVan } from "../_werkgever";

const Bevestigd = ({ tekst }: { tekst: string }) => (
  <Paragraph className="mox-hiring-confirmed">✓ {tekst}</Paragraph>
);

/** Stap 4: het omgekeerde formulier. Alles ingevuld uit bevestigde bronnen. */
const ConceptAanvraagPage = async () => {
  const [aannemen, organisatie] = await Promise.all([
    getDemoIemandAannemen(),
    getActieveOrganisatie(),
  ]);
  const w = werkgeverVan(organisatie);
  const { kandidaat, dienstverband, zaak, berekeningLks } = aannemen;
  const overheid = aannemen.bronnen.filter(
    (b) => b.id === "gemeente" || b.id === "uwv",
  );

  return (
    <>
      <Heading level={1}>Concept-aanvraag loonkostensubsidie</Heading>
      <Stappen huidige={4} />

      <Verstuur zaak={zaak} />

      <section className="mox-card rhc-row-gap">
        <Paragraph>
          Aanvraag van loonkostensubsidie bij de gemeente Lansingerland voor{" "}
          {kandidaat.voornaam} {kandidaat.achternaam}. Alles is ingevuld uit de
          bronnen die u heeft bevestigd; u hoeft niets over te typen. Controleer
          en verstuur.
        </Paragraph>
        <DataSummary appearance="column">
          <DataSummaryItem
            itemKey="Aan"
            itemValue="College van burgemeester en wethouders van Lansingerland"
          />
          <DataSummaryItem
            itemKey="Op grond van"
            itemValue="Artikel 10d, tweede lid, van de Participatiewet (aanvraag binnen zes maanden na de eerste werkdag)"
          />
          <DataSummaryItem
            itemKey="Termijn"
            itemValue={`Uiterlijk 31 maart 2027 (zes maanden na ${datumNL(dienstverband.aanvang)})`}
          />
        </DataSummary>
      </section>

      <section className="mox-card rhc-row-gap" aria-labelledby="werkgever">
        <Heading level={2} id="werkgever">
          Werkgever
        </Heading>
        <DataSummary appearance="column">
          <DataSummaryItem
            itemKey="Onderneming"
            itemValue={[w.onderneming, w.rechtsvorm].filter(Boolean).join(", ")}
          />
          <DataSummaryItem itemKey="KVK-nummer" itemValue={w.kvkNummer} />
          <DataSummaryItem itemKey="Vestiging" itemValue={w.vestiging} />
          <DataSummaryItem
            itemKey="Loonheffingennummer"
            itemValue={w.loonheffingennummer}
          />
          <DataSummaryItem
            itemKey="Rekeningnummer voor de subsidie"
            itemValue={w.iban}
          />
        </DataSummary>
        <Bevestigd tekst="Uit het Handelsregister (KVK) en uw bedrijfsgegevens, bevestigd op 7 september 2026" />
      </section>

      <section className="mox-card rhc-row-gap" aria-labelledby="werknemer">
        <Heading level={2} id="werknemer">
          Werknemer
        </Heading>
        <DataSummary appearance="column">
          <DataSummaryItem
            itemKey="Naam"
            itemValue={`${kandidaat.voornaam} ${kandidaat.achternaam}`}
          />
          <DataSummaryItem
            itemKey="Geboortedatum"
            itemValue={datumNL(kandidaat.geboortedatum)}
          />
          <DataSummaryItem
            itemKey="Woonplaats"
            itemValue={`${kandidaat.woonplaats}, gemeente ${kandidaat.gemeente}`}
          />
          <DataSummaryItem
            itemKey="BSN"
            itemValue={`${kandidaat.bsnMasker} (gaat mee, staat niet op het scherm)`}
          />
          <DataSummaryItem
            itemKey="Toestemming"
            itemValue={`Gegeven op ${datumNL(kandidaat.toestemmingOp)}`}
          />
        </DataSummary>
      </section>

      <section
        className="mox-card rhc-row-gap"
        aria-labelledby="dienstbetrekking"
      >
        <Heading level={2} id="dienstbetrekking">
          Dienstbetrekking
        </Heading>
        <DataSummary appearance="column">
          <DataSummaryItem
            itemKey="Functie"
            itemValue={dienstverband.functie}
          />
          <DataSummaryItem
            itemKey="Eerste werkdag"
            itemValue={datumNL(dienstverband.aanvang)}
          />
          <DataSummaryItem
            itemKey="Uren per week"
            itemValue={String(dienstverband.urenPerWeek)}
          />
          <DataSummaryItem
            itemKey="Loon"
            itemValue={dienstverband.uurloonLabel}
          />
          <DataSummaryItem
            itemKey="Soort contract"
            itemValue={dienstverband.soort}
          />
        </DataSummary>
        <Bevestigd tekst="Uw eigen opgave, bevestigd op 7 september 2026" />
      </section>

      <section className="mox-card rhc-row-gap" aria-labelledby="overheid-weet">
        <Heading level={2} id="overheid-weet">
          Wat de gemeente en UWV al weten
        </Heading>
        <Paragraph>
          Deze gegevens hoeft u niet aan te leveren; ze staan hier zodat u ziet
          waarop de aanvraag rust.
        </Paragraph>
        {overheid.map((b) => (
          <section key={b.id} aria-labelledby={`weet-${b.id}`}>
            <Heading level={3} id={`weet-${b.id}`}>
              {b.organisatie} · {b.register}, opgehaald op{" "}
              {datumNL(b.opgehaald)}
            </Heading>
            <DataSummary appearance="column">
              {b.gegevens.map((g) => (
                <DataSummaryItem
                  key={g.parameter}
                  itemKey={g.vraag}
                  itemValue={`${vul(g.waarde, w)} (${g.grond})`}
                />
              ))}
            </DataSummary>
          </section>
        ))}
        <Bevestigd tekst="Bevestigd op 7 september 2026" />
      </section>

      <section className="mox-card rhc-row-gap" aria-labelledby="berekening">
        <Heading level={2} id="berekening">
          Berekening vooraf
        </Heading>
        <Paragraph>
          Zo rekent de gemeente straks, met dezelfde regels. De loonwaarde van
          60 procent is een voorbeeld; de gemeente meet die op de werkplek na uw
          aanvraag.
        </Paragraph>
        <DataSummary appearance="column">
          {berekeningLks.stappen.map((s) => (
            <DataSummaryItem
              key={s.parameter}
              itemKey={`${s.label} (${s.grond})`}
              itemValue={s.waarde}
            />
          ))}
        </DataSummary>
      </section>

      <section className="mox-card rhc-row-gap" aria-labelledby="daarna">
        <Heading level={2} id="daarna">
          Wat er na het versturen gebeurt
        </Heading>
        <OrderedList>
          <OrderedListItem>
            De gemeente bevestigt de ontvangst met een zaaknummer in uw
            Berichtenbox.
          </OrderedListItem>
          <OrderedListItem>
            Een arbeidsdeskundige meet de loonwaarde van {kandidaat.voornaam} op
            de werkplek.
          </OrderedListItem>
          <OrderedListItem>
            Het college stelt de loonwaarde vast en neemt het besluit over de
            subsidie. Bij het besluit ziet u deze berekening terug.
          </OrderedListItem>
          <OrderedListItem>
            De subsidie wordt maandelijks betaald, vanaf de eerste werkdag.
          </OrderedListItem>
        </OrderedList>
        <Verstuur zaak={zaak} knop />
      </section>
    </>
  );
};

export default ConceptAanvraagPage;
