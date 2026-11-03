import { Heading, Paragraph } from "@/components/rhc";
const About = () => (
  <>
    <Heading level={1}>Wat is MijnOverheid Zakelijk</Heading>
    <div className="rhc-mox-card">
      <Paragraph>
        <strong>Elk uur minder aan gedoe, is een uur meer ondernemen.</strong>{" "}
        Daar is MijnOverheid Zakelijk (MOZa) voor.
      </Paragraph>

      <section className="rhc-mox-stack" aria-labelledby="onze-missie">
        <Heading level={2} id="onze-missie">
          Onze missie
        </Heading>
        <Paragraph>
          <strong>Makkelijk zakendoen met de overheid.</strong> Samen met
          overheidsorganisaties zorgen we dat ondernemers dat kunnen.
        </Paragraph>
        <Paragraph>
          Alles wat we doen, toetsen we aan één vraag: zorgt dit ervoor dat de
          ondernemer makkelijker zaken kan doen met de overheid?
        </Paragraph>
      </section>

      <section className="rhc-mox-stack" aria-labelledby="onze-opdracht">
        <Heading level={2} id="onze-opdracht">
          Onze opdracht
        </Heading>
        <Paragraph>
          Ondernemers als één overheid overzicht geven, en tijdig informeren
          over wat voor hen relevant is. Zo geven we invulling aan onze missie.
          Veertien overheidsorganisaties spraken dit samen af in de
          intentieverklaring die ze in mei 2026 hebben getekend.
        </Paragraph>
        <Paragraph>
          <a href="https://www.mijnoverheidzakelijk.nl/" rel="external">
            Lees meer informatie over MijnOverheid Zakelijk op onze
            informatiesite
          </a>
          .
        </Paragraph>
      </section>
    </div>
  </>
);

export default About;
