import {
  Heading,
  Paragraph,
  DataSummary,
  DataSummaryItem,
  ActionGroup,
  AccordionProvider,
  Link,
} from "@/components/rhc";
import {
  getDemoOndernemingsgegevens,
  getDemoOndernemingsonderdelen,
  getDemoOndernemingsvragen,
} from "@/demo";
import { getActievePersona } from "@/app/(public)/_persona";
import NextLink from "next/link";

// Zelfde knop-link als de tegels op Home.
const knopLink =
  "utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action";

const OndernemingsgegevensPage = async () => {
  const [gegevens, onderdelen, vragen] = await Promise.all([
    getActievePersona().then((persona) =>
      getDemoOndernemingsgegevens(persona?.bedrijf),
    ),
    getDemoOndernemingsonderdelen(),
    getDemoOndernemingsvragen(),
  ]);

  return (
    <>
      <Heading level={1}>Bedrijfsgegevens</Heading>
      <Paragraph>
        Dit weet de overheid over uw organisatie. De gegevens komen van de KVK
        en de Belastingdienst.
      </Paragraph>

      <div className="mox-card">
        <Heading level={2}>Algemeen</Heading>
        <DataSummary appearance="column" className="mox-data-summary--columns">
          {gegevens.map(({ label, waarde, href }) =>
            href ? (
              <div key={label} className="rhc-data-summary__item">
                <dt className="rhc-data-summary__item-key">{label}</dt>
                <dd className="rhc-data-summary__item-value">
                  <Link href={href}>{waarde}</Link>
                </dd>
              </div>
            ) : (
              <DataSummaryItem key={label} itemKey={label} itemValue={waarde} />
            ),
          )}
        </DataSummary>

        <Paragraph>
          Uw contactgegevens staan bij{" "}
          <Link inline href="/contactvoorkeuren">
            Contactvoorkeuren
          </Link>
          .
        </Paragraph>
      </div>

      <Heading level={2}>Meer over uw onderneming</Heading>
      <div className="rhc-grid">
        {onderdelen.map(({ id, titel, beschrijving, href }) => (
          <section
            key={id}
            className="mox-card rhc-grid__cell rhc-grid__cell-t-6"
            aria-labelledby={`onderdeel-${id}`}
          >
            <Heading level={3} id={`onderdeel-${id}`}>
              {titel}
            </Heading>
            <Paragraph>{beschrijving}</Paragraph>
            <ActionGroup>
              <NextLink href={href} className={knopLink}>
                Ga naar {titel}
              </NextLink>
            </ActionGroup>
          </section>
        ))}
      </div>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
          sections={vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: <Paragraph>{antwoord}</Paragraph>,
          }))}
        />
      </div>
    </>
  );
};

export default OndernemingsgegevensPage;
