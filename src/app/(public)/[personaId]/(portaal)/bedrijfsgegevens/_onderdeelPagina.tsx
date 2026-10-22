import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  AccordionProvider,
  Heading,
  Icon,
  Link,
  Paragraph,
} from "@/components/rhc";
import {
  getDemoBedrijfsdetails,
  getDemoBedrijfsonderdeel,
  getDemoPersona,
  type DemoBedrijfsdetails,
} from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";

export type OnderdeelPaginaProps = {
  params: Promise<{ personaId: string }>;
};

/**
 * Gedeelde opbouw van de pagina's achter Bedrijfsgegevens, zoals in moza-poc:
 * titel, terug-link, een kaart met de gegevens van de persona en veelgestelde
 * vragen.
 */
const OnderdeelPagina = async ({
  id,
  params,
  inhoud,
}: OnderdeelPaginaProps & {
  id: string;
  inhoud: (details: DemoBedrijfsdetails) => ReactNode;
}) => {
  const [onderdeel, persona] = await Promise.all([
    getDemoBedrijfsonderdeel(id),
    params.then(({ personaId }) => getDemoPersona(personaId)),
  ]);
  if (!onderdeel || !persona) notFound();
  const organisatie = await getActieveOrganisatie(persona);
  if (!organisatie) notFound();
  const details = await getDemoBedrijfsdetails(organisatie);

  return (
    <>
      <Heading level={1}>{onderdeel.titel}</Heading>
      <Paragraph>
        <Link href="/bedrijfsgegevens">
          <Icon icon="chevron-left" />
          Terug naar Bedrijfsgegevens
        </Link>
      </Paragraph>

      <section className="rhc-mox-card" aria-labelledby="onderdeel-kop">
        <Heading level={2} id="onderdeel-kop">
          {onderdeel.kop}
        </Heading>
        <Paragraph>{onderdeel.intro}</Paragraph>
        {inhoud(details)}
        <Paragraph>
          Bron: <Link href="https://www.kvk.nl/">KVK</Link>
        </Paragraph>
      </section>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
          headingLevel={3}
          sections={onderdeel.vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: <Paragraph>{antwoord}</Paragraph>,
          }))}
        />
      </div>
    </>
  );
};

export default OnderdeelPagina;
