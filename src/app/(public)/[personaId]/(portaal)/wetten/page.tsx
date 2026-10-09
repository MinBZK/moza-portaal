import Link from "next/link";
import { Alert, Heading, Icon, Paragraph } from "@/components/rhc";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import { getDemoWetten } from "@/demo";
import { getFlagsFromServerCookie } from "@/app/actions";
import { getActievePersona } from "@/app/(public)/_persona";
import { RelevantItem } from "../bewaard/_bewaarActies";
import WetActies, { bewaarItemVan } from "./_wetActies";
import WetGegevens from "./_wetGegevens";

const PER_PAGINA = 5;

const WettenPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) => {
  const [flags, persona, { pagina }] = await Promise.all([
    getFlagsFromServerCookie(),
    getActievePersona(),
    searchParams,
  ]);

  // Zoals in moza-poc: eerst de regels voor dit bedrijf, dan die voor de branche.
  const ids = [
    ...new Set([
      ...(persona?.homepageRegelgeving ?? []),
      ...(persona?.regelgeving ?? []),
    ]),
  ];
  const wetten = await getDemoWetten(ids);
  const totaalPaginas = Math.max(1, Math.ceil(wetten.length / PER_PAGINA));
  const huidigePagina = Math.min(
    Math.max(1, Number(pagina) || 1),
    totaalPaginas,
  );
  const opPagina = wetten.slice(
    (huidigePagina - 1) * PER_PAGINA,
    huidigePagina * PER_PAGINA,
  );

  return (
    <>
      <Heading level={1}>Wetten en regelgeving</Heading>

      <Alert type="info">
        <Paragraph>
          Wetten en regelgeving die mogelijk betrekking hebben op uw bedrijf of
          branche, geselecteerd op basis van uw bedrijfsprofiel. Door items te
          bewaren of als niet relevant te markeren helpt u ons de aanbevelingen
          te verbeteren.
        </Paragraph>
      </Alert>

      {wetten.length === 0 && (
        <Paragraph>Er zijn nu geen wetten of regels voor uw bedrijf.</Paragraph>
      )}

      {opPagina.map((wet) => (
        <RelevantItem key={wet.id} item={bewaarItemVan(wet)}>
          <article className="mox-card" aria-labelledby={`kop-${wet.id}`}>
            <Heading level={2} id={`kop-${wet.id}`}>
              <Link
                href={`/wetten/${wet.id}`}
                className="utrecht-link utrecht-link--html-a"
              >
                {wet.titel}
                <Icon icon="chevron-right" />
              </Link>
            </Heading>
            <Paragraph>{wet.samenvatting}</Paragraph>
            <WetGegevens wet={wet} />
            <WetActies wet={wet} delen={flags.mox_delen} />
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

export default WettenPage;
