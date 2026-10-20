import Link from "next/link";
import {
  DataSummary,
  DataSummaryItem,
  Heading,
  OrderedList,
  OrderedListItem,
  Paragraph,
} from "@/components/rhc";
import { getDemoIemandAannemen, getDemoIemandAannemenTraces } from "@/demo";
import Regelingen from "./_regelingen";
import Stappen from "../_stappen";
import { datumNL } from "../_werkgever";

/** Stap 3: per regeling de uitkomst, het bedrag, de grond en waarom. */
const WatHetOplevertPage = async () => {
  const [aannemen, traces] = await Promise.all([
    getDemoIemandAannemen(),
    getDemoIemandAannemenTraces(),
  ]);
  const { kandidaat, dienstverband } = aannemen;
  return (
    <>
      <Heading level={1}>
        Wat het oplevert als u {kandidaat.voornaam} aanneemt
      </Heading>
      <Stappen huidige={3} />

      <section className="mox-card rhc-row-gap" aria-labelledby="samenvatting">
        <Heading level={2} id="samenvatting">
          Samenvatting
        </Heading>
        <Paragraph>
          {kandidaat.voornaam} {kandidaat.achternaam},{" "}
          {dienstverband.urenPerWeek} uur per week tegen het minimumloon, vanaf{" "}
          {datumNL(dienstverband.aanvang)}. Berekend met de wetsversie van 1
          juli 2026 en de gegevens die u heeft bevestigd.
        </Paragraph>
        <DataSummary appearance="column">
          <DataSummaryItem
            itemKey="Loonkostensubsidie van de gemeente"
            itemValue="€ 897,41 per maand na vaststelling van de loonwaarde (voorbeeld bij 60 procent)"
          />
          <DataSummaryItem
            itemKey="Loonkostenvoordeel via de loonaangifte"
            itemValue="€ 1.680,64 per jaar"
          />
          <DataSummaryItem
            itemKey="No-riskpolis bij ziekte"
            itemValue="Geldt, zonder aanvraag"
          />
          <DataSummaryItem
            itemKey="Begeleiding op de werkplek"
            itemValue="Aanspraak, aanvragen als u wilt"
          />
        </DataSummary>
        <Paragraph>
          Dit is geen besluit. De gemeente, UWV en de Belastingdienst beslissen
          na uw aanvraag met dezelfde regels; u ziet de berekening dan terug bij
          het besluit.
        </Paragraph>
      </section>

      <Regelingen
        regelingen={aannemen.regelingen}
        traces={traces}
        labels={aannemen.labels}
      />

      <section className="mox-card rhc-row-gap" aria-labelledby="wat-nu">
        <Heading level={2} id="wat-nu">
          Wat u nu kunt doen
        </Heading>
        <OrderedList>
          <OrderedListItem>
            <Link
              href="/personeel/iemand-aannemen/concept-aanvraag"
              className="utrecht-link utrecht-link--html-a"
            >
              Bekijk de concept-aanvraag loonkostensubsidie
            </Link>{" "}
            en verstuur hem naar de gemeente, binnen zes maanden na de eerste
            werkdag.
          </OrderedListItem>
          <OrderedListItem>
            Zet in de eerste loonaangifte na de start het vakje
            loonkostenvoordeel aan. De Belastingdienst rekent het na afloop van
            het jaar uit.
          </OrderedListItem>
          <OrderedListItem>
            Wilt u een jobcoach? Vraag begeleiding op de werkplek aan bij de
            gemeente.
          </OrderedListItem>
        </OrderedList>
      </section>
    </>
  );
};

export default WatHetOplevertPage;
