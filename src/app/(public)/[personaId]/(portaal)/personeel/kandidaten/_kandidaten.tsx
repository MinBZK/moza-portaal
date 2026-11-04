"use client";

import Link from "next/link";
import {
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import TextBadge from "@/components/TextBadge";
import type { DemoAannemen } from "@/demo";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import { situatieVan } from "../iemand-aannemen/_route";
import {
  kandidaatId,
  STANDAARD_ANTWOORDEN,
  statusTekst,
  useAannemen,
  zaakVan,
  type AannemenStaat,
} from "../iemand-aannemen/_useAannemen";
import { datumNL } from "../iemand-aannemen/_werkgever";

export type Situaties = Record<"gemeente" | "wajong" | "wia", DemoAannemen>;

type Gebeurtenis = {
  datum?: string;
  tekst: string;
  link?: { href: string; tekst: string };
};

type Kandidaat = {
  id: string;
  naam: string;
  geboren?: string;
  status: string;
  gekoppeld: boolean;
  code?: string;
  journaal: Gebeurtenis[];
};

/**
 * De kandidaten van de werkgever: de kandidaat uit de demo van de situatie
 * (gekoppeld, met toestemming) en de zelf toegevoegde kandidaten die nog
 * hun koppelcode moeten invoeren. Per kandidaat een journaal: wat er is
 * gebeurd, met de datum en een link naar de zaak.
 */
const kandidatenVan = (
  staat: AannemenStaat | null,
  situaties: Situaties,
  onderneming: string,
): Kandidaat[] => {
  const situatie = situatieVan(
    staat?.antwoorden.doelgroepen ?? STANDAARD_ANTWOORDEN.doelgroepen,
  );
  const s = situatie === "wajong" || situatie === "wia" ? situatie : "gemeente";
  const demo = situaties[s];
  const k = demo.kandidaat;
  const naam = `${k.voornaam} ${k.achternaam}`;
  const zaak = staat ? zaakVan(staat, s) : undefined;
  return [
    {
      id: kandidaatId(naam),
      naam,
      geboren: datumNL(k.geboortedatum),
      status: `Toestemming gegeven op ${datumNL(k.toestemmingOp)}`,
      gekoppeld: true,
      journaal: [
        {
          datum: k.toestemmingOp,
          tekst: `${k.voornaam} koppelde zich in MijnOverheid aan ${onderneming} en gaf toestemming om gegevens te delen voor de aanvraag "iemand aannemen".`,
        },
        ...(zaak?.ingediend
          ? [
              {
                datum: zaak.verstuurdOp,
                tekst: `U verstuurde de aanvraag: ${zaak.onderwerp ?? demo.zaak.onderwerp}. Stand: ${statusTekst(zaak, s)}.`,
                link: { href: demo.zaak.url, tekst: "Naar de zaak" },
              },
            ]
          : []),
      ],
    },
    ...(staat?.kandidatenNieuw ?? []).map((n) => ({
      id: kandidaatId(n.naam),
      naam: n.naam,
      geboren: n.geboortedatum || undefined,
      status: n.code
        ? `Koppelcode gegeven op ${datumNL(n.gevraagdOp)}`
        : `Toestemming gevraagd op ${datumNL(n.gevraagdOp)}`,
      gekoppeld: false,
      code: n.code,
      journaal: [
        {
          datum: n.gevraagdOp,
          tekst: n.code
            ? `U maakte koppelcode ${n.code} voor ${n.naam}.`
            : `U vroeg ${n.naam} om toestemming.`,
        },
      ],
    })),
  ];
};

const Status = ({ kandidaat }: { kandidaat: Kandidaat }) => (
  <TextBadge variant={kandidaat.gekoppeld ? "ok" : "warning"}>
    {kandidaat.gekoppeld ? "Gekoppeld" : "Wacht op de kandidaat"}
  </TextBadge>
);

/** Overzicht: alle kandidaten met hun stand, elk met een link naar het journaal. */
export const KandidatenLijst = ({
  situaties,
  onderneming,
}: {
  situaties: Situaties;
  onderneming: string;
}) => {
  const { staat } = useAannemen();
  const kandidaten = kandidatenVan(staat, situaties, onderneming);
  return (
    <>
      <Heading level={1}>Kandidaten</Heading>
      <Paragraph>
        Per kandidaat ziet u of die zich aan uw onderneming heeft gekoppeld en
        wat er met de aanvraag is gebeurd.
      </Paragraph>
      <UnorderedList>
        {kandidaten.map((k) => (
          <UnorderedListItem key={k.id}>
            <Link
              href={`/personeel/kandidaten/${k.id}`}
              className="utrecht-link utrecht-link--html-a"
            >
              {k.naam}
            </Link>{" "}
            <Status kandidaat={k} />
            <br />
            <span className="rhc-mox-small-text">
              {k.geboren ? `Geboren ${k.geboren}. ` : ""}
              {k.status}
            </span>
          </UnorderedListItem>
        ))}
      </UnorderedList>
    </>
  );
};

/** Eén kandidaat: de stand, de koppelcode als die nog nodig is, en het journaal. */
export const KandidaatPagina = ({
  id,
  situaties,
  onderneming,
}: {
  id: string;
  situaties: Situaties;
  onderneming: string;
}) => {
  const { staat } = useAannemen();
  // De opslag zit in de browser; tot die gelezen is, is er niets te tonen.
  if (!staat) return null;
  const k = kandidatenVan(staat, situaties, onderneming).find(
    (x) => x.id === id,
  );
  if (!k)
    return (
      <>
        <Heading level={1}>Kandidaat niet gevonden</Heading>
        <Paragraph>
          Deze kandidaat staat niet in uw lijst.{" "}
          <Link
            href="/personeel/kandidaten"
            className="utrecht-link utrecht-link--html-a"
          >
            Naar uw kandidaten
          </Link>
        </Paragraph>
      </>
    );
  const journaal = [...k.journaal].sort((a, b) =>
    (b.datum ?? "").localeCompare(a.datum ?? ""),
  );
  return (
    <>
      <HuidigeKruimel pad={`/personeel/kandidaten/${k.id}`} label={k.naam} />
      <Heading level={1}>{k.naam}</Heading>
      {k.geboren && <Paragraph>Geboren {k.geboren}</Paragraph>}
      <Paragraph>
        <Status kandidaat={k} /> {k.status}
      </Paragraph>
      {k.code && (
        <section
          className="rhc-mox-card rhc-mox-row-gap"
          aria-labelledby="code"
        >
          <Heading level={2} id="code">
            Koppelcode
          </Heading>
          <Paragraph>
            Geef {k.naam} deze code: <strong>{k.code}</strong>
          </Paragraph>
          <Paragraph>
            {k.naam} logt in op MijnOverheid met DigiD en voert de code in.
            Daarna kiest {k.naam} wat er met u wordt gedeeld. Pas dan halen wij
            gegevens op. In dit prototype gebeurt dat niet.
          </Paragraph>
        </section>
      )}
      <section className="rhc-mox-row-gap" aria-labelledby="journaal">
        <Heading level={2} id="journaal">
          Wat er is gebeurd
        </Heading>
        <ol className="rhc-mox-stack">
          {journaal.map((g) => (
            <li key={`${g.datum}-${g.tekst}`}>
              {g.datum && <strong>{datumNL(g.datum)}: </strong>}
              {g.tekst}
              {g.link && (
                <>
                  {" "}
                  <Link
                    href={g.link.href}
                    className="utrecht-link utrecht-link--html-a"
                  >
                    {g.link.tekst}
                  </Link>
                </>
              )}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
};
