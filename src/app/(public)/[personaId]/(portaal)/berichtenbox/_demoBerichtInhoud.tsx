import {
  ActionGroup,
  Button,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import type { BerichtenboxVariant } from "@/app/(private)/instellingen/_featureFlags";
import type { DemoBericht } from "@/demo";
import { formatDatum } from "./_formatDatum";
import PdfVoorbeeld from "./_pdfVoorbeeld";
import UitvalBlok from "./_uitvalBlok";

const PDF = "/voorbeeld-bijlage.pdf";
const TEKST = "/voorbeeld-bijlage.txt";

/**
 * Kop, gegevens, tekst en bijlagen van een demo-bericht. De variant van de
 * Berichtenbox A/B/C-test bepaalt wat er extra bij staat: B toont het bericht
 * als pdf, C geeft uitleg en directe acties.
 */
const DemoBerichtInhoud = ({
  bericht,
  variant = "a",
}: {
  bericht: DemoBericht;
  variant?: BerichtenboxVariant;
}) => {
  const inhoud =
    variant === "c" && bericht.variantCInhoud
      ? bericht.variantCInhoud
      : bericht.inhoud;

  return (
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
        {inhoud.map((alinea) => (
          <Paragraph key={alinea}>{alinea}</Paragraph>
        ))}

        {variant === "c" && bericht.acties && (
          <section
            aria-labelledby="wat-kunt-u-doen"
            className="rhc-message-actions"
          >
            <Heading level={2} id="wat-kunt-u-doen">
              Wat kunt u doen?
            </Heading>
            {bericht.actiesUitleg && (
              <Paragraph>{bericht.actiesUitleg}</Paragraph>
            )}
            {/* Vaste role: ActionGroup telt de knoppen anders op de server dan
                in de browser, en dat geeft een hydration-fout. */}
            <ActionGroup role="group">
              {bericht.acties.map((actie) => (
                <Button
                  key={actie.label}
                  type="button"
                  appearance={
                    actie.primair
                      ? "primary-action-button"
                      : "secondary-action-button"
                  }
                >
                  {actie.label}
                </Button>
              ))}
            </ActionGroup>
          </section>
        )}

        {variant === "b" && <PdfVoorbeeld pdf={PDF} tekst={TEKST} />}

        {variant === "c" && (
          <Paragraph>
            <a
              href={PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="utrecht-link utrecht-link--html-a"
            >
              Open origineel bericht
              <VisuallyHidden> (opent in een nieuw tabblad)</VisuallyHidden>
            </a>
          </Paragraph>
        )}

        {bericht.heeftBijlage && (
          <section aria-labelledby="bijlagen">
            <Heading level={2} id="bijlagen">
              Bijlage
            </Heading>
            <UnorderedList>
              <UnorderedListItem>
                <a href={PDF} className="utrecht-link utrecht-link--html-a">
                  Bijlage bij dit bericht (pdf)
                </a>
              </UnorderedListItem>
              <UnorderedListItem>
                <a href={TEKST} className="utrecht-link utrecht-link--html-a">
                  Bijlage als tekstbestand (txt)
                </a>
              </UnorderedListItem>
            </UnorderedList>
          </section>
        )}
      </UitvalBlok>
    </>
  );
};

export default DemoBerichtInhoud;
