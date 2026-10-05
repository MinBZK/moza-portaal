import {
  Heading,
  Paragraph,
  DataSummary,
  DataSummaryItem,
  NavigationList,
  NavigationListItem,
  AccordionProvider,
  Separator,
  Link,
} from "@rijkshuisstijl-community/components-react";
import {
  getDemoOndernemingsgegevens,
  getDemoOndernemingsonderdelen,
  getDemoOndernemingsvragen,
} from "@/demo";

const OndernemingsgegevensPage = async () => {
  const [gegevens, onderdelen, vragen] = await Promise.all([
    getDemoOndernemingsgegevens(),
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

      <div className="rhc-card-as-link__content">
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

      <div className="rhc-card-as-link__content">
        <Heading level={2}>Meer over uw onderneming</Heading>
        <NavigationList className="mox-navigation-list--no-start-icon">
          {onderdelen.map(({ id, titel, beschrijving, href }) => (
            <NavigationListItem
              key={id}
              description={beschrijving}
              href={href}
              icon={null}
              label={titel}
            />
          ))}
        </NavigationList>
      </div>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <AccordionProvider
        sections={vragen.map(({ vraag, antwoord }) => ({
          label: vraag,
          body: <Paragraph>{antwoord}</Paragraph>,
        }))}
      />
    </>
  );
};

export default OndernemingsgegevensPage;
