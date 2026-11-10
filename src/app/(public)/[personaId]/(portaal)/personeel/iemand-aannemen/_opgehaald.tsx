"use client";

import Link from "next/link";
import InfoToggletip from "@/components/InfoToggletip";
import { Heading, Separator } from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { BegripInfo, type BegripId } from "./_begrippen";
import { datumNL } from "./_werkgever";

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

type Rij = {
  label: string;
  waarde: string;
  /** Een tweede, kleinere regel onder de waarde, zoals het BSN. */
  extra?: string;
  /** Alleen bij opgehaalde gegevens: "UWV, opgehaald 7 september 2026". */
  bron?: string;
  /** Waar de ondernemer het kan wijzigen. */
  wijzig?: string;
  /** Een begrip met uitleg: de (i) staat naast de naam van het gegeven. */
  begrip?: BegripId;
  /** Hoe de wet de vraag stelt, achter een (i). */
  wet?: { vraag: string; wetsvraag: string; grond: string };
};

/** Waar de eigen opgave staat: onder de gekozen kandidaat in stap 1. */
const EIGEN_OPGAVE = "/personeel/iemand-aannemen/gegevens#eigen-opgave";

/** Korte namen voor gegevens die de overheid ophaalt. */
const LABEL: Record<string, string> = {
  kvk_nummer: "Bedrijfsgegevens",
  aantal_werknemers_loonaangifte: "Aantal werknemers",
};

/** Over de onderneming en de kandidaat samen. */
const BEIDE: readonly string[] = ["heeft_loonaangifte_verzoek_ingediend"];

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
 * Per gegeven één rij: het label, de waarde (met eventueel een tweede regel
 * en de bron), en rechts Wijzigen. De markup van de RHC DataSummary, omdat
 * de waarde een toggletip bevat.
 */
const Rijen = ({ rijen }: { rijen: Rij[] }) => (
  <dl className="rhc-data-summary rhc-data-summary--row rhc-mox-summary-rows">
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
            )}
          </span>
          {r.extra && <span className="rhc-mox-small-text">{r.extra}</span>}
          {r.bron && <span className="rhc-mox-small-text">Bron: {r.bron}</span>}
        </dd>
        {r.wijzig && (
          <dd className="rhc-data-summary__item-action">
            <Link
              href={r.wijzig}
              className="utrecht-link utrecht-link--html-a"
              aria-label={`Wijzigen: ${r.label.toLowerCase()}`}
            >
              Wijzigen
            </Link>
          </dd>
        )}
      </div>
    ))}
  </dl>
);

/**
 * Controleer: wat de aanvraag over de kandidaat en de onderneming zegt, met
 * per gegeven de bron. Geordend naar onderwerp, niet naar organisatie.
 * Controleren is lezen; kiezen gebeurt bij de regelingen eronder.
 */
const Controleer = ({
  bronnen,
  kandidaat,
  aanvang,
  uren,
  vraagEerder = false,
  eerderInDienst,
}: {
  bronnen: Bron[];
  kandidaat: {
    voornaam: string;
    achternaam: string;
    bsnMasker: string;
  };
  /** De eerste werkdag (jjjj-mm-dd) uit stap 1. */
  aanvang?: string;
  uren: number;
  /** Alleen bij WIA: de vraag of de kandidaat al eerder bij de werkgever werkte. */
  vraagEerder?: boolean;
  eerderInDienst?: boolean;
}) => {
  const bronTekst = (b: Bron) =>
    `${b.organisatie}, opgehaald ${datumNL(b.opgehaald)}`;
  const opgehaald = bronnen
    .filter((b) => b.id !== "eigen")
    .flatMap((b) => zichtbaarVan(b).map((g) => ({ b, g })));

  // Het doelgroepregister in één regel: staat erin sinds, en loopt nog.
  const register = opgehaald.find(
    ({ g }) => g.parameter === "is_arbeidsbeperkte",
  );
  const loopt = opgehaald.find(
    ({ g }) => g.parameter === "registratie_nog_niet_geeindigd",
  );
  const kandidaatRijen: Rij[] = [
    {
      label: "Naam",
      waarde: `${kandidaat.voornaam} ${kandidaat.achternaam}`,
      extra: `BSN ${kandidaat.bsnMasker}`,
      wijzig: "/personeel/iemand-aannemen/gegevens",
    },
    {
      label: "Eerste werkdag",
      waarde: aanvang ? datumNL(aanvang) : "Nog niet ingevuld",
      wijzig: EIGEN_OPGAVE,
    },
    {
      label: "Uren per week",
      waarde: `${uren} uur`,
      wijzig: EIGEN_OPGAVE,
    },
    ...(vraagEerder
      ? [
          {
            label: "Eerder bij u in dienst",
            waarde:
              eerderInDienst === undefined
                ? "Nog niet ingevuld"
                : eerderInDienst
                  ? "Ja"
                  : "Nee",
            extra: "In de zes maanden voor de eerste werkdag",
            wijzig: EIGEN_OPGAVE,
          },
        ]
      : []),
    ...(register
      ? [
          {
            label: "Doelgroepregister",
            begrip: "doelgroepregister" as const,
            waarde: register.g.waarde,
            extra: loopt?.g.waarde.startsWith("Ja")
              ? "De registratie loopt."
              : undefined,
            bron: bronTekst(register.b),
            wet: register.g,
          },
        ]
      : []),
  ];

  const rij = ({ b, g }: (typeof opgehaald)[number]): Rij => {
    const waarde = g.waarde.replace("{uren}", String(uren));
    return {
      label: LABEL[g.parameter] ?? g.vraag,
      ...splits(waarde),
      bron: bronTekst(b),
      wet: g,
    };
  };
  const overig = opgehaald.filter(({ g }) => !REGISTER.includes(g.parameter));
  const beideRijen = overig
    .filter(({ g }) => BEIDE.includes(g.parameter))
    .map((x) => ({
      ...rij(x),
      label: "Verzoek loonkostenvoordeel",
    }));

  const groep = (id: string, kop: string, rijen: Rij[]) =>
    rijen.length > 0 && (
      <section className="rhc-mox-summary-group" aria-labelledby={id}>
        <Heading level={3} id={id}>
          {kop}
        </Heading>
        <Rijen rijen={rijen} />
      </section>
    );

  return (
    <section className="rhc-mox-row-gap" aria-labelledby="controleer">
      <Separator></Separator>
      <Heading level={2} id="controleer">
        Controleer gegevens
      </Heading>
      {groep("controleer-kandidaat", "Kandidaat", kandidaatRijen)}
      {groep("controleer-beide", "Kandidaat en onderneming", beideRijen)}
    </section>
  );
};

export default Controleer;
