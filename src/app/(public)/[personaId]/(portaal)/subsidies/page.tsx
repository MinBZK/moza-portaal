import Link from "next/link";
import { Alert, Heading, Icon, Paragraph } from "@/components/rhc";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import { getDemoSubsidies } from "@/demo";
import { getFlagsFromServerCookie } from "@/app/actions";
import { getActievePersona } from "@/app/(public)/_persona";
import { RelevantItem } from "../bewaard/_bewaarActies";
import SubsidieActies, { bewaarItemVan } from "./_subsidieActies";
import SubsidieGegevens from "./_subsidieGegevens";

const PER_PAGINA = 5;

const SubsidiesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) => {
  const [flags, persona, { pagina }] = await Promise.all([
    getFlagsFromServerCookie(),
    getActievePersona(),
    searchParams,
  ]);

  // Zoals in moza-poc: eerst de subsidies voor dit bedrijf, dan die voor de branche.
  const ids = [
    ...new Set([
      ...(persona?.homepageSubsidies ?? []),
      ...(persona?.subsidies ?? []),
    ]),
  ];
  const subsidies = await getDemoSubsidies(ids);
  const totaalPaginas = Math.max(1, Math.ceil(subsidies.length / PER_PAGINA));
  const huidigePagina = Math.min(
    Math.max(1, Number(pagina) || 1),
    totaalPaginas,
  );
  const opPagina = subsidies.slice(
    (huidigePagina - 1) * PER_PAGINA,
    huidigePagina * PER_PAGINA,
  );

  return (
    <>
      <Heading level={1}>Subsidies en financiering</Heading>

      <Alert type="info">
        <Paragraph>
          Subsidies en financiering waar u mogelijk voor in aanmerking komt,
          geselecteerd op basis van uw bedrijfsprofiel. Door items te bewaren of
          als niet relevant te markeren helpt u ons de aanbevelingen te
          verbeteren.
        </Paragraph>
      </Alert>

      {subsidies.length === 0 && (
        <Paragraph>
          Er zijn nu geen subsidies of financieringen voor uw bedrijf.
        </Paragraph>
      )}

      {opPagina.map((subsidie) => (
        <RelevantItem key={subsidie.id} item={bewaarItemVan(subsidie)}>
          <article className="mox-card" aria-labelledby={`kop-${subsidie.id}`}>
            <Heading level={2} id={`kop-${subsidie.id}`}>
              <Link
                href={`/subsidies/${subsidie.id}`}
                className="utrecht-link utrecht-link--html-a"
              >
                {subsidie.titel}
                <Icon icon="chevron-right" />
              </Link>
            </Heading>
            <Paragraph>{subsidie.samenvatting}</Paragraph>
            <SubsidieGegevens subsidie={subsidie} />
            <SubsidieActies subsidie={subsidie} delen={flags.mox_delen} />
          </article>
        </RelevantItem>
      ))}

      {totaalPaginas > 1 && (
        <PageNumberNavigation
          page={huidigePagina}
          totalPages={totaalPaginas}
          maxVisiblePages={5}
        />
      )}
    </>
  );
};

export default SubsidiesPage;
