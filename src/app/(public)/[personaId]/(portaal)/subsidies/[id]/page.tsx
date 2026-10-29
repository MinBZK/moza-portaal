import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heading, Icon, Paragraph } from "@/components/rhc";
import { getDemoSubsidieById } from "@/demo";
import { getFlagsFromServerCookie } from "@/app/actions";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import { RelevantItem } from "@/components/save/saveActions";
import SubsidieActies, {
  assistentLink,
  bewaarItemVan,
} from "../_subsidieActies";
import SubsidieGegevens from "../_subsidieGegevens";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const subsidie = await getDemoSubsidieById((await params).id);
  return {
    title: `${subsidie?.titel ?? "Subsidie"} - Subsidies en financiering`,
  };
};

const SubsidiePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [subsidie, flags] = await Promise.all([
    getDemoSubsidieById(id),
    getFlagsFromServerCookie(),
  ]);
  if (!subsidie) notFound();

  return (
    <>
      <HuidigeKruimel
        pad={`/subsidies/${subsidie.id}`}
        label={subsidie.titel}
      />
      <Heading level={1}>{subsidie.titel}</Heading>
      <Paragraph>
        <Link href="/subsidies" className="utrecht-link utrecht-link--html-a">
          <Icon icon="chevron-left" />
          Terug naar Subsidies en financiering
        </Link>
      </Paragraph>

      <RelevantItem item={bewaarItemVan(subsidie)}>
        <section className="rhc-mox-card" aria-label={subsidie.titel}>
          <Paragraph purpose="lead">{subsidie.samenvatting}</Paragraph>
          <SubsidieGegevens subsidie={subsidie} />

          {subsidie.alinea.map((tekst) => (
            <Paragraph key={tekst}>{tekst}</Paragraph>
          ))}

          <Heading level={2}>Vragen over deze subsidie</Heading>
          <Paragraph>
            <Link
              href={assistentLink(subsidie)}
              className="utrecht-link utrecht-link--html-a"
            >
              Vraag aan de digitale assistent
            </Link>
            . Bijvoorbeeld: komt u in aanmerking voor deze subsidie, en wat moet
            u doen vóór de aanvraagperiode sluit?
          </Paragraph>

          <SubsidieActies subsidie={subsidie} delen={flags.mox_delen} />

          <Paragraph>
            <a
              href={subsidie.href}
              rel="external"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            >
              {subsidie.websiteLabel}
              <Icon icon="externe-link" />
            </a>
          </Paragraph>
        </section>
      </RelevantItem>
    </>
  );
};

export default SubsidiePage;
