import { notFound } from "next/navigation";
import {
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@rijkshuisstijl-community/components-react";
import { getDemoBerichtById, getDemoBerichten } from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import BerichtDetail from "../_berichtDetail";
import { formatDatum } from "../_formatDatum";

const BerichtPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const [bericht, berichten] = await Promise.all([
    getDemoBerichtById(id),
    getDemoBerichten(),
  ]);

  if (!bericht) notFound();

  return (
    <>
      <HuidigeKruimel pad={`/inbox/${bericht.id}`} label={bericht.onderwerp} />
      <BerichtDetail berichten={berichten} berichtId={bericht.id}>
        <Heading level={1}>{bericht.onderwerp}</Heading>

        <DataSummary appearance="column">
          <DataSummaryItem itemKey="Afzender" itemValue={bericht.afzender} />
          <DataSummaryItem
            itemKey="Ontvangen"
            itemValue={formatDatum(bericht.datum)}
          />
        </DataSummary>

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
      </BerichtDetail>
    </>
  );
};

export default BerichtPage;
