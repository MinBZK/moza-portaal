"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import InfoToggletip from "@/components/InfoToggletip";
import TextBadge from "@/components/TextBadge";
import { Heading, Paragraph, Separator } from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { BegripInfo, type BegripId } from "./_begrippen";
import { AANVRAGER, GEBRUIKT, type GegevenId } from "./_gegevensPerRegeling";
import {
  vraagEerderInDienst,
  type Antwoorden,
  type RegelingId,
} from "./_useAannemen";
import { datumNL, euro } from "./_werkgever";

type Bron = DemoAannemen["bronnen"][number];

/** Bronnen met gegevens over de kandidaat; de rest gaat over de werkgever. */
const OVER_KANDIDAAT: readonly string[] = ["uwv", "gemeente"];

/**
 * Over de kandidaat ziet de werkgever alleen het doelgroepregister: staat
 * erin, ja of nee, en loopt de registratie nog. Zo geeft UWV het ook in het
 * werkgeversportaal. Uitkering, bijstand en de grond van registratie zijn
 * gegevens over gezondheid en inkomen; die gebruiken de gemeente en UWV zelf
 * bij de beoordeling (AVG art. 5, 6 en 9).
 */
const REGISTER: readonly string[] = [
  "is_arbeidsbeperkte",
  "registratie_nog_niet_geeindigd",
];

export const zichtbaarVan = (bron: Bron) =>
  OVER_KANDIDAAT.includes(bron.id)
    ? bron.gegevens.filter((g) => REGISTER.includes(g.parameter))
    : bron.gegevens;

/** "UWV", "UWV en de gemeente": wie gegevens over de kandidaat heeft. */
const opsomming = (namen: string[]) =>
  namen.length < 2
    ? (namen[0] ?? "")
    : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;

/**
 * Wie in deze situatie gegevens over de kandidaat heeft, en hoe je dat
 * zegt: "UWV" of "UWV en de gemeente", met "kijkt" of "kijken".
 */
export const overKandidaat = (bronnen: Bron[], situatie: string) => {
  const lijst = bronnen.filter(
    (b) =>
      OVER_KANDIDAAT.includes(b.id) &&
      // Zonder aanvraag bij de gemeente kijkt de gemeente nergens naar.
      !(b.id === "gemeente" && situatie === "register"),
  );
  const meer = lijst.length > 1;
  return {
    meer,
    wie: opsomming(
      lijst.map((b) => (b.id === "gemeente" ? "de gemeente" : b.organisatie)),
    ),
    eigen: meer ? "hun eigen gegevens" : "de eigen gegevens",
    zietRegister: lijst.some((b) => zichtbaarVan(b).length > 0),
  };
};

/** Waar de ondernemer een eigen opgave wijzigt: onder de gekozen kandidaat in stap 1. */
const EIGEN_OPGAVE = "/personeel/iemand-aannemen/gegevens#eigen-opgave";
const KANDIDAAT_KIEZEN = "/personeel/iemand-aannemen/gegevens";
const VOORBEELDBEREKENING = "/personeel/iemand-aannemen/voorbeeldberekening";

const hoofdletter = (tekst: string) => tekst[0].toUpperCase() + tekst.slice(1);

/**
 * De waarde kort, de toelichting op een tweede regel: "Nog niet; dat doet u
 * …" en "1 fulltime … (loonaangifte augustus 2026)" worden twee regels.
 */
const splits = (waarde: string): { waarde: string; extra?: string } => {
  const puntkomma = waarde.indexOf("; ");
  if (puntkomma > 0)
    return {
      waarde: waarde.slice(0, puntkomma),
      extra: `${hoofdletter(waarde.slice(puntkomma + 2))}.`,
    };
  const haakjes = /^(.*) \((.*)\)$/.exec(waarde);
  if (haakjes) return { waarde: haakjes[1], extra: hoofdletter(haakjes[2]) };
  return { waarde };
};

/**
 * Waar een gegeven vandaan komt. Uit een register (KVK, UWV, Belastingdienst),
 * van de ondernemer zelf in stap 1, of een schatting uit de voorbeeldberekening
 * die de gemeente of UWV nog vaststelt.
 */
type Herkomst =
  | { soort: "register"; bron: Bron }
  | { soort: "opgave"; wijzig: string }
  | { soort: "schatting"; wijzig: string };

type Rij = {
  label: string;
  waarde: string;
  extra?: string;
  herkomst: Herkomst;
  /** Wat de ondernemer kan doen als een gegeven uit een register niet klopt. */
  klopt?: ReactNode;
  begrip?: BegripId;
  /** Hoe de wet de vraag stelt, achter een (i). */
  wet?: { vraag: string; wetsvraag: string; grond: string };
};

const HerkomstBadge = ({ herkomst }: { herkomst: Herkomst }) =>
  herkomst.soort === "register" ? (
    <TextBadge>
      <span className="rhc-visually-hidden">Bron: </span>
      {herkomst.bron.organisatie}
    </TextBadge>
  ) : herkomst.soort === "opgave" ? (
    <TextBadge variant="info" icon={false}>
      Uw opgave
    </TextBadge>
  ) : (
    <TextBadge variant="warning" icon={false}>
      Uw schatting
    </TextBadge>
  );

/**
 * Per gegeven: het label, de waarde met de herkomst als badge, eventueel een
 * tweede regel, en wat de ondernemer kan doen: Wijzigen bij een eigen opgave,
 * "Klopt dit niet?" bij een gegeven uit een register.
 */
const Rijen = ({ rijen }: { rijen: Rij[] }) => (
  <dl className="rhc-data-summary rhc-data-summary--column rhc-mox-summary-rows">
    {rijen.map((r) => (
      <div key={r.label} className="rhc-data-summary__item">
        <dt className="rhc-data-summary__item-key">
          {/* Een span: de dt is een flexbox, daarin valt de spatie weg. */}
          <span>
            {r.label}
            {r.begrip && (
              <>
                {" "}
                <BegripInfo id={r.begrip} />
              </>
            )}
          </span>
        </dt>
        <dd className="rhc-data-summary__item-value">
          <span>
            {r.waarde}
            {r.wet && (
              <>
                {" "}
                <InfoToggletip label={`Zo vraagt de wet het: ${r.wet.vraag}`}>
                  {`Zo vraagt de wet het: “${r.wet.wetsvraag}” (${r.wet.grond})`}
                </InfoToggletip>
              </>
            )}{" "}
            <HerkomstBadge herkomst={r.herkomst} />
          </span>
          {r.extra && <span className="rhc-mox-small-text">{r.extra}</span>}
          {r.herkomst.soort !== "register" && (
            <span className="rhc-mox-small-text">
              <Link
                href={r.herkomst.wijzig}
                className="utrecht-link utrecht-link--html-a"
                aria-label={`Wijzigen: ${r.label.toLowerCase()}`}
              >
                Wijzigen
              </Link>
            </span>
          )}
          {r.klopt && (
            <details className="rhc-mox-disclosure-link rhc-mox-small-text">
              <summary>Klopt dit niet?</summary>
              {r.klopt}
            </details>
          )}
        </dd>
      </div>
    ))}
  </dl>
);

type Context = {
  bronnen: Bron[];
  kandidaat: { voornaam: string; achternaam: string; bsnMasker: string };
  antwoorden: Antwoorden;
};

/** Per gegeven een rij met de waarde en de herkomst; wat er niet is, valt weg. */
const maakRijen = (
  ids: GegevenId[],
  { bronnen, kandidaat, antwoorden: a }: Context,
  regeling?: RegelingId,
): Rij[] => {
  const gegeven = (bronId: Bron["id"], parameter: string) => {
    const b = bronnen.find((x) => x.id === bronId);
    const g = b && zichtbaarVan(b).find((x) => x.parameter === parameter);
    return b && g ? { b, g } : undefined;
  };
  const register = gegeven("uwv", "is_arbeidsbeperkte");
  const loopt = gegeven("uwv", "registratie_nog_niet_geeindigd");
  const kvk = gegeven("kvk", "kvk_nummer");
  const verzoek = gegeven(
    "belastingdienst",
    "heeft_loonaangifte_verzoek_ingediend",
  );
  const { voornaam } = kandidaat;

  const rijVoor = (gebruikt: GegevenId): Rij | undefined => {
    switch (gebruikt) {
      case "werkgever": {
        if (!kvk) return undefined;
        // De naam op de eerste regel, KVK-nummer en adres eronder.
        const [naam, ...rest] = kvk.g.waarde.split(", ");
        return {
          label: "Werkgever",
          waarde: naam,
          extra: rest.join(" · "),
          herkomst: { soort: "register", bron: kvk.b },
          klopt: (
            <Paragraph>
              Deze gegevens komen uit het Handelsregister. Geef een wijziging
              door aan de KVK. Daarna gebruikt de aanvraag de nieuwe gegevens.{" "}
              <Link
                href="/bedrijfsgegevens"
                className="utrecht-link utrecht-link--html-a"
              >
                Bekijk uw bedrijfsgegevens
              </Link>
            </Paragraph>
          ),
        };
      }
      case "kandidaat":
        return {
          label: "Kandidaat",
          waarde: `${voornaam} ${kandidaat.achternaam}`,
          extra: `BSN ${kandidaat.bsnMasker}`,
          herkomst: { soort: "opgave", wijzig: KANDIDAAT_KIEZEN },
        };
      case "aanvang":
        return {
          label: "Eerste werkdag",
          waarde: a.aanvang ? datumNL(a.aanvang) : "Nog niet ingevuld",
          herkomst: { soort: "opgave", wijzig: EIGEN_OPGAVE },
        };
      case "uren":
        return {
          label: "Uren per week",
          waarde: `${a.uren} uur`,
          herkomst: { soort: "opgave", wijzig: EIGEN_OPGAVE },
        };
      case "uurloon":
        return {
          label: "Bruto uurloon",
          waarde: euro(a.uurloon),
          herkomst: { soort: "opgave", wijzig: VOORBEELDBEREKENING },
        };
      case "loonwaarde":
        return {
          label: "Loonwaarde",
          waarde: `${a.loonwaarde} procent`,
          extra:
            regeling === "ld"
              ? "UWV stelt vast hoeveel minder de werknemer kan."
              : "De gemeente meet de loonwaarde op de werkplek.",
          herkomst: { soort: "schatting", wijzig: VOORBEELDBEREKENING },
        };
      case "register":
        if (!register) return undefined;
        return {
          label: "Doelgroepregister",
          begrip: "doelgroepregister",
          waarde: register.g.waarde,
          extra: loopt?.g.waarde.startsWith("Ja")
            ? "De registratie loopt."
            : undefined,
          herkomst: { soort: "register", bron: register.b },
          wet: register.g,
          klopt: (
            <Paragraph>
              Dit gegeven gaat over {voornaam}. Alleen {voornaam} kan UWV vragen
              het aan te passen.
            </Paragraph>
          ),
        };
      case "eerder":
        if (!vraagEerderInDienst(a)) return undefined;
        return {
          label: "Eerder bij u in dienst",
          waarde:
            a.eerderInDienst === undefined
              ? "Nog niet ingevuld"
              : a.eerderInDienst
                ? "Ja"
                : "Nee",
          extra: "In de zes maanden voor de eerste werkdag",
          herkomst: { soort: "opgave", wijzig: EIGEN_OPGAVE },
        };
      case "verzoekLkv":
        if (!verzoek) return undefined;
        return {
          label: "Verzoek in de loonaangifte",
          ...splits(verzoek.g.waarde),
          herkomst: { soort: "register", bron: verzoek.b },
          wet: verzoek.g,
          klopt: (
            <Paragraph>
              Dit staat in uw loonaangifte. Klopt het niet? Pas het aan in uw
              volgende loonaangifte bij de Belastingdienst.
            </Paragraph>
          ),
        };
    }
  };

  return ids.map(rijVoor).filter((r): r is Rij => r !== undefined);
};

/** "Opgehaald op …": de registers geven hun gegevens op één dag. */
const Opgehaald = ({ rijen }: { rijen: Rij[] }) => {
  const r = rijen.find((x) => x.herkomst.soort === "register");
  return r?.herkomst.soort === "register" ? (
    <Paragraph className="rhc-mox-small-text">
      Opgehaald op {datumNL(r.herkomst.bron.opgehaald)}.
    </Paragraph>
  ) : null;
};

/**
 * De gegevens die een regeling gebruikt, op de kaart van die regeling, met
 * per gegeven de herkomst (GEBRUIKT in _gegevensPerRegeling.ts).
 */
export const GebruikteGegevens = ({
  id,
  ...context
}: Context & { id: RegelingId }) => {
  const rijen = maakRijen(
    GEBRUIKT[id].map((x) => x.id),
    context,
    id,
  );
  if (rijen.length === 0) return null;
  return (
    <section
      className="rhc-mox-summary-group"
      aria-labelledby={`gegevens-${id}`}
    >
      <Heading level={4} id={`gegevens-${id}`}>
        Gebruikte gegevens
      </Heading>
      <Rijen rijen={rijen} />
      <Opgehaald rijen={rijen} />
    </section>
  );
};

/** Wie aanvraagt en voor wie: één keer, onder de regelingen. */
export const AanvragerEnKandidaat = (context: Context) => {
  const rijen = maakRijen(AANVRAGER, context);
  return (
    <section className="rhc-mox-row-gap" aria-labelledby="aanvrager">
      <Separator></Separator>
      <Heading level={2} id="aanvrager">
        Aanvrager en kandidaat
      </Heading>
      <Rijen rijen={rijen} />
      <Opgehaald rijen={rijen} />
    </section>
  );
};
