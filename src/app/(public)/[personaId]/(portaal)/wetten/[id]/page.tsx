import Link from "next/link";
import { notFound } from "next/navigation";
import { Heading, Icon, Paragraph } from "@/components/rhc";
import { getDemoWetById } from "@/demo";
import { getFlagsFromServerCookie } from "@/app/actions";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import { RelevantItem } from "@/components/save/saveActions";
import WetActies, { assistentLink, bewaarItemVan } from "../_wetActies";
import WetGegevens from "../_wetGegevens";

const WetPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const [wet, flags] = await Promise.all([
    getDemoWetById(id),
    getFlagsFromServerCookie(),
  ]);
  if (!wet) notFound();

  return (
    <>
      <HuidigeKruimel pad={`/wetten/${wet.id}`} label={wet.titel} />
      <Heading level={1}>{wet.titel}</Heading>
      <Paragraph>
        <Link href="/wetten" className="utrecht-link utrecht-link--html-a">
          <Icon icon="chevron-left" />
          Terug naar Wetten en regelgeving
        </Link>
      </Paragraph>

      <RelevantItem item={bewaarItemVan(wet)}>
        <section className="rhc-mox-card" aria-label={wet.titel}>
          <Paragraph purpose="lead">{wet.samenvatting}</Paragraph>
          <WetGegevens wet={wet} detail />

          {wet.alinea.map((tekst) => (
            <Paragraph key={tekst}>{tekst}</Paragraph>
          ))}

          <Heading level={2}>Vragen over deze regeling?</Heading>
          <Paragraph>
            <Link
              href={assistentLink(wet)}
              className="utrecht-link utrecht-link--html-a"
            >
              Aan digitale assistent vragen
            </Link>
            . Bijvoorbeeld: geldt deze regeling voor uw bedrijf, en wat moet u
            dan doen?
          </Paragraph>

          <WetActies wet={wet} delen={flags.mox_delen} />

          <Paragraph>
            <a
              href={wet.href}
              rel="external"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            >
              {wet.websiteLabel}
              <Icon icon="externe-link" />
            </a>
          </Paragraph>
        </section>
      </RelevantItem>
    </>
  );
};

export default WetPage;
