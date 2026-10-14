import {
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@rijkshuisstijl-community/components-react";
import type { DemoBericht } from "@/demo";
import { formatDatum } from "./_formatDatum";
import UitvalBlok from "./_uitvalBlok";

/** Kop, gegevens, tekst en bijlagen van een demo-bericht. */
const DemoBerichtInhoud = ({ bericht }: { bericht: DemoBericht }) => (
  <>
    <Heading level={1}>{bericht.onderwerp}</Heading>

    <DataSummary appearance="column">
      <DataSummaryItem itemKey="Afzender" itemValue={bericht.afzender} />
      <DataSummaryItem
        itemKey="Ontvangen"
        itemValue={formatDatum(bericht.datum)}
      />
    </DataSummary>

    <UitvalBlok afzenderId={bericht.afzenderId}>
      {bericht.inhoud.map((alinea) => (
        <Paragraph key={alinea}>{alinea}</Paragraph>
      ))}

      {bericht.heeftBijlage && (
        <section aria-labelledby="bijlagen">
          <Heading level={2} id="bijlagen">
            Bijlage
          </Heading>
          <UnorderedList>
            <UnorderedListItem>
              <a
                href="/voorbeeld-bijlage.pdf"
                className="utrecht-link utrecht-link--html-a"
              >
                Bijlage bij dit bericht (pdf)
              </a>
            </UnorderedListItem>
            <UnorderedListItem>
              <a
                href="/voorbeeld-bijlage.txt"
                className="utrecht-link utrecht-link--html-a"
              >
                Bijlage als tekstbestand (txt)
              </a>
            </UnorderedListItem>
          </UnorderedList>
        </section>
      )}
    </UitvalBlok>
  </>
);

export default DemoBerichtInhoud;
