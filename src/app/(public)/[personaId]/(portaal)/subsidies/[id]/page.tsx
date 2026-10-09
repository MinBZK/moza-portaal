import Link from "next/link";
import { notFound } from "next/navigation";
import { Heading, Icon, Paragraph } from "@/components/rhc";
import { getDemoSubsidieById } from "@/demo";
import { getFlagsFromServerCookie } from "@/app/actions";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import { RelevantItem } from "../../bewaard/_bewaarActies";
import SubsidieActies, {
  assistentLink,
  bewaarItemVan,
} from "../_subsidieActies";
import SubsidieGegevens from "../_subsidieGegevens";

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
          Terug naar Subsidies en financiering
        </Link>
      </Paragraph>

      <RelevantItem item={bewaarItemVan(subsidie)}>
        <section className="mox-card" aria-label={subsidie.titel}>
          <Paragraph purpose="lead">{subsidie.samenvatting}</Paragraph>
          <SubsidieGegevens subsidie={subsidie} />

          {subsidie.alinea.map((tekst) => (
            <Paragraph key={tekst}>{tekst}</Paragraph>
          ))}

          <Heading level={2}>Vragen over deze regeling?</Heading>
          <Paragraph>
            <Link
              href={assistentLink(subsidie)}
              className="utrecht-link utrecht-link--html-a"
            >
              De digitale assistent zoekt voor u uit
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
