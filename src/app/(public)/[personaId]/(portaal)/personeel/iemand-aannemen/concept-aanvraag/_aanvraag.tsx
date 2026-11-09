"use client";

import LoadingStatus from "@/components/LoadingStatus";
import { focusAtTop } from "@/utils/focusAtTop";
import Link from "next/link";
import StepNavigation from "@/components/StepNavigation";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionSection,
  Alert,
  DataSummary,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import TextBadge, { type TextBadgeVariant } from "@/components/TextBadge";
import type { DemoAannemen } from "@/demo";
import basis from "../_basisfeiten.json";
import { Aanname, duurTekst } from "../_balans";
import type { PaneelId, TaakId, VanzelfId } from "../_route";
import { onderwerpVoor, overzichtTekst, routeVoor } from "../_route";
import Stappen, { TAAK_TITEL, terugNaar } from "../_stappen";
import { loonkostenPerJaar } from "../_engine";
import { balansRegels, invoerVoor, type Feiten } from "../_uitkomsten";
import { useUitkomsten } from "../_useUitkomsten";
import Waarom from "../_waarom";
import {
  useAannemen,
  type AannemenStaat,
  type RegelingId,
} from "../_useAannemen";
import { INGEDIEND_OP, nieuweZaakStand, zaakAanmaken } from "../_zaakStart";
import { datumNL, euroHeel, type Werkgever } from "../_werkgever";

type Gegeven = {
  label: string;
  waarde: string;
  bron: string;
  /** Waar de ondernemer dit antwoord kan aanpassen. */
  wijzig?: string;
};

/** De eigen opgave in stap 3: eerste werkdag en uren. */
const EIGEN_OPGAVE = "/personeel/iemand-aannemen/gegevens#eigen-opgave";

/** De gegevens in twee kolommen, met de bron als label onder de waarde. */
const Gegevens = ({ rijen }: { rijen: Gegeven[] }) => (
  <DataSummary appearance="column" className="rhc-data-summary--columns">
    {/* Zoals bij Bedrijfsgegevens: de waarde bevat een label, dus geen DataSummaryItem. */}
    {rijen.map((r) => (
      <div key={r.label} className="rhc-data-summary__item">
        <dt className="rhc-data-summary__item-key">{r.label}</dt>
        <dd className="rhc-data-summary__item-value">
          {r.waarde} <TextBadge>{r.bron}</TextBadge>
          {r.wijzig && (
            <Link
              href={r.wijzig}
              className="utrecht-link utrecht-link--html-a"
              aria-label={`Wijzigen: ${r.label.toLowerCase()}`}
            >
              Wijzigen
            </Link>
          )}
        </dd>
      </div>
    ))}
  </DataSummary>
);

const NAAM: Record<RegelingId, string> = {
  lks: "Loonkostensubsidie",
  ld: "Loondispensatie",
  jc: "Jobcoaching",
  wpa: "Werkplekaanpassing",
  lkv: "Loonkostenvoordeel",
  nrp: "No-riskpolis",
  doelgroepverklaring: "Doelgroepverklaring",
  vz_wajong: "Jobcoach of werkplekaanpassing",
  vz_wia: "Jobcoach of werkplekaanpassing",
  pp: "Proefplaats",
};

type Status = "aanvullen" | "controleren" | "gecontroleerd" | "gelezen";

const STATUS: Record<Status, { tekst: string; variant: TextBadgeVariant }> = {
  aanvullen: { tekst: "Aanvullen", variant: "warning" },
  controleren: { tekst: "Controleren", variant: "info" },
  gecontroleerd: { tekst: "Gecontroleerd", variant: "ok" },
  gelezen: { tekst: "Gelezen", variant: "ok" },
};

type Props = {
  perSituatie: Record<"gemeente" | "wajong" | "wia", DemoAannemen>;
  werkgever: Werkgever;
};

/**
 * De vooringevulde aanvraag volgt de route van de situatie: per organisatie
 * de panelen voor wat de werkgever zelf indient (met de gegevens en hun bron,
 * "Waarom deze uitkomst?" en een vinkje "gecontroleerd"), daaronder de taken
 * voor de werknemer en wat vanzelf of via de loonaangifte gaat. Rechts wat
 * het oplevert, live uit de engine. Indienen kan pas als alle panelen
 * gecontroleerd zijn; zonder panelen is er niets te versturen.
 */
const Aanvraag = (props: Props) => {
  const { staat } = useAannemen();
  // De inhoud rekent met de engine; dat mag pas als de opslag gelezen is.
  if (!staat) return null;
  return <AanvraagInhoud {...props} staat={staat} />;
};

const AanvraagInhoud = ({
  perSituatie,
  werkgever,
  staat,
}: Props & { staat: AannemenStaat }) => {
  const router = useRouter();
  const { werkBij, werkZaakBij } = useAannemen();
  const [fout, setFout] = useState(false);
  const [bevestigd, setBevestigd] = useState(false);
  const [bevestigFout, setBevestigFout] = useState(false);
  const a = staat.antwoorden;
  const g = staat.gecontroleerd;
  const k = staat.keuzes;

  const resultaat = useUitkomsten(a);
  const { uitkomsten, bekend } = resultaat;
  const route = useMemo(
    () => routeVoor(a.doelgroepen, uitkomsten),
    [a.doelgroepen, uitkomsten],
  );
  const invoeren = useMemo(() => invoerVoor(a, basis as Feiten), [a]);
  const invoer = (wet: string, output: string) =>
    invoeren.find((i) => i.wet === wet && i.output === output);

  const { situatie } = route;
  const { kandidaat, dienstverband, labels, bronnen } =
    perSituatie[
      situatie === "wajong" || situatie === "wia" ? situatie : "gemeente"
    ];
  const vind = (bronId: string, parameter: string) =>
    bronnen
      .find((b) => b.id === bronId)
      ?.gegevens.find((x) => x.parameter === parameter)?.waarde ?? "";

  const paneelIds = route.panelen.flatMap((p) => p.ids);
  // Alle regelingen in één lijst: eerst wat u indient, dan wat vanzelf gaat,
  // dan de taken van de werknemer.
  const rijIds: RegelingId[] = [...paneelIds, ...route.vanzelf, ...route.taken];
  const lkv = uitkomsten.regels.find((r) => r.id === "lkv");
  const nrp = uitkomsten.overige.find((o) => o.id === "nrp");

  const isPaneel = (id: RegelingId): id is PaneelId =>
    (paneelIds as RegelingId[]).includes(id);
  const mist = (id: RegelingId) =>
    (id === "jc" && !k.jc) || (id === "wpa" && !k.wpa);
  // Wat nog een keuze in stap 3 mist, is niet klaar, ook niet met een vinkje.
  const klaarMet = (id: RegelingId) => !!g[id] && !mist(id);
  const aantal = rijIds.filter(klaarMet).length;

  const status = (id: RegelingId): Status =>
    mist(id)
      ? "aanvullen"
      : g[id]
        ? isPaneel(id)
          ? "gecontroleerd"
          : "gelezen"
        : "controleren";

  // Welke regelingen openstaan. Zolang de gebruiker niets open- of
  // dichtklapte, staat de eerste die nog niet gecontroleerd is open.
  const [open, setOpen] = useState<string[] | null>(null);
  const [_, setMelding] = useState("");
  const eerste = rijIds.find((id) => !klaarMet(id));
  const openIds: string[] = open ?? (eerste ? [eerste] : []);
  const isOpen = (id: string) => openIds.includes(id);
  const wissel = (id: string) =>
    setOpen(isOpen(id) ? openIds.filter((x) => x !== id) : [...openIds, id]);

  // Het vinkje legt vast, klapt deze regeling dicht en de volgende die nog
  // niet klaar is open.
  const controleer = (id: RegelingId, aanvinken: boolean) => {
    const volgende = aanvinken
      ? rijIds.slice(rijIds.indexOf(id) + 1).find((x) => !klaarMet(x))
      : undefined;
    // With a next one: only that one open, and the focus on its heading, so
    // it is not lost in the panel that closes, at the top of the screen. The text above the list says
    // this will happen (WCAG 3.2.2).
    setOpen(volgende ? [volgende] : openIds);
    if (volgende)
      requestAnimationFrame(() =>
        focusAtTop(
          document.querySelector<HTMLElement>(
            `#paneel-${volgende} .utrecht-accordion__button`,
          ),
          // The panels open and close in 250 ms (rhc.css).
          { waitMs: 260 },
        ),
      );
    werkBij({ gecontroleerd: { ...g, [id]: aanvinken } });
    const wat = isPaneel(id) ? "gecontroleerd" : "gelezen";
    setMelding(
      aanvinken ? `${NAAM[id]} is ${wat}.` : `${NAAM[id]} is nog niet ${wat}.`,
    );
  };
  // Een gewone functie, geen component: een component in de render zou bij
  // elke wijziging opnieuw worden aangemaakt.
  // Zonder keuze valt er niets te controleren: eerst kiezen in stap 3.
  const vinkje = (id: RegelingId) =>
    mist(id) ? null : (
      <FormFieldCheckboxOption
        label={
          isPaneel(id) ? "Ik heb dit gecontroleerd en het klopt" : "Gelezen"
        }
        name={`ok-${id}`}
        checked={!!g[id]}
        onChange={(event) => controleer(id, event.target.checked)}
      />
    );

  const waarom = (
    wet: string,
    output: string,
    regeling: string,
    voorAf?: ReactNode,
  ) => {
    const i = invoer(wet, output);
    if (!i) return null;
    return (
      <Waarom
        invoer={i}
        antwoorden={a}
        regeling={regeling}
        kvk={werkgever.kvkNummer}
        labels={labels}
        voorAf={voorAf}
      />
    );
  };

  const werkgeverRijen: Gegeven[] = [
    {
      label: "Werkgever",
      waarde: `${werkgever.onderneming}, KVK ${werkgever.kvkNummer}`,
      bron: "KVK Handelsregister",
    },
  ];
  // Gegevens uit het doelgroepregister alleen als het register bij de antwoorden hoort.
  const inRegister = a.doelgroepen.includes("register");
  const werknemerRijen: Gegeven[] = [
    {
      label: "Werknemer",
      waarde: `${kandidaat.voornaam} ${kandidaat.achternaam}`,
      bron: "Basisregistratie Personen",
    },
  ];
  // Uitkeringsgegevens ziet de werkgever niet; die controleert UWV zelf.
  const situatieRij: Gegeven | null = inRegister
    ? {
        label: "In het doelgroepregister",
        waarde: vind("uwv", "is_arbeidsbeperkte"),
        bron: "UWV doelgroepregister",
      }
    : null;
  if (situatieRij) werknemerRijen.push(situatieRij);
  const woonplaatsRij: Gegeven = {
    label: "Woonplaats werknemer",
    waarde:
      kandidaat.woonplaats === kandidaat.gemeente
        ? kandidaat.woonplaats
        : `${kandidaat.woonplaats}, gemeente ${kandidaat.gemeente}`,
    bron: "Basisregistratie Personen",
  };
  const dienstRijen: Gegeven[] = [
    {
      label: "Eerste werkdag",
      waarde: datumNL(a.aanvang ?? dienstverband.aanvang),
      bron: "Uw opgave",
      wijzig: EIGEN_OPGAVE,
    },
    {
      label: "Uren per week",
      waarde: String(a.uren),
      bron: "Uw antwoord",
      wijzig: EIGEN_OPGAVE,
    },
  ];

  const balans = balansRegels(uitkomsten, loonkostenPerJaar(a));
  const bedragVan = (id: "lks" | "ld" | "lkv") =>
    balans.find((r) => r.id === id && r.status === "bedrag")?.bedrag;
  // Wat niet geldt bij deze antwoorden, los onder de lijst.
  const geldtNiet = balans.filter((r) => r.status === "geldt_niet");

  // Eén sectie per regeling: de status en wie de regeling uitvoert bovenaan,
  // dan de inhoud, dan het vinkje.
  const rij = (id: RegelingId, wie: string, kind: ReactNode) => (
    <AccordionSection
      key={id}
      id={`paneel-${id}`}
      headingLevel={3}
      label={`${NAAM[id]}, ${STATUS[status(id)].tekst.toLowerCase()}`}
      // Het type eist `body`, de component rendert alleen `children`.
      body={null}
      expanded={isOpen(id)}
      onActivate={() => wissel(id)}
    >
      <div className="rhc-mox-stack">
        <Paragraph className="rhc-mox-small-text">{wie}</Paragraph>
        {kind}
        {vinkje(id)}
      </div>
    </AccordionSection>
  );

  const voorbeeldbedrag = (id: "lks" | "ld" | "lkv") => {
    const bedrag = bedragVan(id);
    return bedrag === undefined ? null : (
      <Paragraph>
        Voorbeeldbedrag: <strong>{euroHeel(bedrag)}</strong> per jaar.
      </Paragraph>
    );
  };

  const paneel = (id: PaneelId): ReactNode => {
    const kop = (note: string, kind: ReactNode) => rij(id, note, kind);
    const gemeente = `Gemeente ${kandidaat.gemeente}, waar ${kandidaat.voornaam} woont`;

    if (id === "lks")
      return kop(
        gemeente,
        <>
          <Paragraph>
            U vraagt de gemeente {kandidaat.gemeente} om loonkostensubsidie
            (Participatiewet, artikel 10d).
          </Paragraph>
          {voorbeeldbedrag("lks")}
          <Gegevens
            rijen={[
              ...werkgeverRijen,
              ...werknemerRijen,
              woonplaatsRij,
              ...dienstRijen,
            ]}
          />
          <Paragraph>
            Vraag aan binnen zes maanden na de eerste werkdag (Participatiewet,
            artikel 10d lid 2).
          </Paragraph>
          {waarom(
            "participatiewet",
            "heeft_recht_op_lks",
            "Loonkostensubsidie",
            <>
              <Heading level={5}>
                Hoe de gemeente {kandidaat.gemeente} beslist
              </Heading>
              <UnorderedList>
                <UnorderedListItem>
                  De gemeente beoordeelt of {kandidaat.voornaam} met een
                  volledige baan het minimumloon niet kan verdienen
                  (Participatiewet, artikel 10c).
                </UnorderedListItem>
                <UnorderedListItem>
                  Een deskundige meet de loonwaarde op de werkplek (Besluit
                  loonkostensubsidie Participatiewet, artikel 2). Daarna weet u
                  het precieze bedrag.
                </UnorderedListItem>
                <UnorderedListItem>
                  U krijgt een brief met het besluit. Is {kandidaat.voornaam} al
                  begonnen? Dan binnen acht weken (Algemene wet bestuursrecht,
                  artikel 4:13). Anders binnen vijf weken na de meting
                  (Participatiewet, artikel 10d lid 12).
                </UnorderedListItem>
              </UnorderedList>
            </>,
          )}
        </>,
      );

    if (id === "ld")
      return kop(
        "UWV",
        <>
          <Paragraph>
            U vraagt UWV om loondispensatie: u betaalt minder loon dan het
            minimumloon (Wajong, artikel 2:20).
          </Paragraph>
          {voorbeeldbedrag("ld")}
          <Gegevens
            rijen={[...werkgeverRijen, ...werknemerRijen, ...dienstRijen]}
          />
          <Paragraph>
            Loondispensatie geldt vanaf de maand waarin u aanvraagt (Besluit
            loondispensatie Wajong, artikel 4). UWV stelt het percentage vast en
            beslist binnen acht weken.
          </Paragraph>
          {waarom(
            "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten",
            "heeft_recht_op_loondispensatie",
            "Loondispensatie",
          )}
        </>,
      );

    if (id === "jc")
      return kop(
        gemeente,
        <>
          <Paragraph>
            Begeleiding op de werkplek door een jobcoach. De werknemer heeft
            daar recht op (Participatiewet, artikel 10da).
          </Paragraph>
          <Gegevens
            rijen={[
              {
                label: "Jobcoaching aanvragen",
                waarde:
                  k.jc === "ja"
                    ? "Ja, via de gemeente"
                    : k.jc === "nee"
                      ? "Nee, niet nodig"
                      : "Nog niet gekozen",
                bron: "Uw opgave",
                wijzig: EIGEN_OPGAVE,
              },
            ]}
          />
          {waarom(
            "participatiewet",
            "heeft_aanspraak_op_begeleiding_op_de_werkplek",
            "Jobcoaching",
          )}
        </>,
      );

    return kop(
      gemeente,
      <>
        <Paragraph>
          Vergoeding voor een aangepaste werkplek of een hulpmiddel. De gemeente
          beslist of dat nodig is (Participatiewet, artikel 10).
        </Paragraph>
        <Gegevens
          rijen={[
            {
              label: "Aanpassing van de werkplek",
              waarde:
                k.wpa === "ja"
                  ? "Ja, ik weet wat er nodig is"
                  : k.wpa === "later"
                    ? "Weet ik nog niet, ik vraag het later aan"
                    : k.wpa === "nee"
                      ? "Nee"
                      : "Nog niet gekozen",
              bron: "Uw opgave",
              wijzig: EIGEN_OPGAVE,
            },
          ]}
        />
      </>,
    );
  };

  const TAAK_WIE: Record<TaakId, string> = {
    doelgroepverklaring: "De werknemer vraagt aan bij UWV",
    vz_wajong: "De werknemer vraagt aan bij UWV",
    vz_wia: "De werknemer vraagt aan bij UWV",
    pp: `De kandidaat vraagt toestemming aan de gemeente ${kandidaat.gemeente}`,
  };

  const taak = (id: TaakId): ReactNode =>
    rij(
      id,
      TAAK_WIE[id],
      <>
        {id === "doelgroepverklaring" && (
          <Paragraph>
            De werknemer vraagt de doelgroepverklaring aan bij UWV, binnen drie
            maanden na de start. Zonder verklaring geen loonkostenvoordeel (Wet
            tegemoetkomingen loondomein, artikel 2.7).
          </Paragraph>
        )}
        {id === "vz_wajong" && (
          <Paragraph>
            De werknemer vraagt een jobcoach of een aangepaste werkplek zelf aan
            bij UWV (Wajong, artikel 2:22).
          </Paragraph>
        )}
        {id === "vz_wia" && (
          <Paragraph>
            De werknemer vraagt een jobcoach of een aangepaste werkplek zelf aan
            bij UWV (Wet WIA, artikel 35). Voor extra kosten kunt u zelf
            subsidie vragen bij UWV (Wet WIA, artikel 36).
          </Paragraph>
        )}
        {/* De proefplaats ligt vóór de dienstbetrekking (Pwet 6 h) en de
            toestemming gaat naar de kandidaat (8a lid 2 d): geen deel van de
            aanvraag, die van een vaste eerste werkdag uitgaat. */}
        {id === "pp" && (
          <>
            <Paragraph>
              Onbetaald werk bij u vóór de eerste werkdag, twee maanden
              (Participatiewet, artikel 8a). De kandidaat vraagt de gemeente om
              toestemming; dat gaat buiten deze aanvraag om.
            </Paragraph>
            {waarom(
              "participatiewet",
              "mag_proefplaatsing_aangaan",
              "Proefplaatsing",
            )}
          </>
        )}
      </>,
    );

  const vanzelf = (id: VanzelfId): ReactNode =>
    id === "lkv"
      ? rij(
          id,
          "Belastingdienst, via de loonaangifte",
          <>
            <Paragraph>
              U zet het vakje loonkostenvoordeel aan in de loonaangifte; een
              aparte aanvraag is niet nodig (Wet tegemoetkomingen loondomein).
            </Paragraph>
            {voorbeeldbedrag("lkv")}
            {lkv?.aanname && <Aanname id={lkv.aanname} />}
            <Gegevens
              rijen={[
                {
                  label: "Loonheffingennummer",
                  waarde: werkgever.loonheffingennummer,
                  bron: "Belastingdienst",
                },
                {
                  label: "Verloonde uren per jaar",
                  waarde: `${a.uren * 52} (${a.uren} uur per week)`,
                  bron: "Uw antwoord",
                  wijzig: EIGEN_OPGAVE,
                },
              ]}
            />
            {waarom(
              "wet_tegemoetkomingen_loondomein",
              "heeft_recht_op_lkv",
              "Loonkostenvoordeel",
            )}
          </>,
        )
      : rij(
          id,
          "UWV, geen aanvraag nodig",
          <>
            <Paragraph>
              U hoeft niets aan te vragen. Wordt de werknemer ziek, dan meldt u
              dat bij UWV en betaalt UWV u ziekengeld (Ziektewet, artikel 29b).{" "}
              {duurTekst(nrp?.duurJaren)}
            </Paragraph>
            {waarom(
              "ziektewet",
              "heeft_recht_op_no_risk_polis",
              "No-riskpolis",
            )}
          </>,
        );

  // Zonder panelen is er niets te versturen. Bij WIA maakt "Klaar" de zaak
  // aan (de werknemer vraagt de verklaring aan); anders volgt het overzicht.
  // De samenvatting van wat ontbreekt krijgt de focus, zodat die wordt voorgelezen.
  const toonFout = () => {
    setFout(true);
    requestAnimationFrame(() =>
      document.getElementById("fout-samenvatting")?.focus(),
    );
  };

  const klaar = () => {
    // Ook zonder aanvraag: eerst alles gelezen, net als bij versturen.
    if (aantal < rijIds.length) {
      toonFout();
      return;
    }
    setFout(false);
    if (route.zaak === "wia") {
      werkBij({
        zaken: {
          ...staat.zaken,
          wia:
            staat.zaken.wia ??
            nieuweZaakStand("wacht", a, perSituatie.wia.zaak.onderwerp),
        },
        taken: {
          ...staat.taken,
          doelgroepverklaring: staat.taken.doelgroepverklaring ?? "open",
        },
      });
      zaakAanmaken(
        "wia",
        perSituatie.wia.zaak,
        "Wacht op de aanvraag van de werknemer",
      );
      router.push(perSituatie.wia.zaak.url);
      return;
    }
    router.push("/personeel");
  };

  // Versturen staat onderaan deze stap: wat erheen gaat, naar wie, en de
  // bevestiging. Geen aparte pagina en geen nieuwe berekening.
  const uwv = situatie === "wajong";
  const demo = perSituatie[uwv ? "wajong" : "gemeente"];
  const naarWie = uwv ? "UWV" : `de gemeente ${kandidaat.gemeente}`;
  const bestaand = staat.zaken[situatie];
  const verstuurt = [
    paneelIds.includes("lks") && "loonkostensubsidie",
    paneelIds.includes("ld") && "loondispensatie",
    paneelIds.includes("jc") && k.jc === "ja" && "jobcoaching",
    paneelIds.includes("wpa") && k.wpa === "ja" && "werkplekaanpassing",
  ].filter((x): x is string => !!x);
  const opsomming =
    verstuurt.length < 2
      ? (verstuurt[0] ?? "")
      : `${verstuurt.slice(0, -1).join(", ")} en ${verstuurt.at(-1)}`;

  const indienen = () => {
    if (aantal < rijIds.length) {
      toonFout();
      return;
    }
    setFout(false);
    if (!bevestigd) {
      setBevestigFout(true);
      document.querySelector<HTMLInputElement>("#bevestiging input")?.focus();
      return;
    }
    const onderwerp = onderwerpVoor(
      situatie,
      demo.zaak.onderwerp,
      `${kandidaat.voornaam} ${kandidaat.achternaam}`,
      uitkomsten,
    );
    // De zaak begint bij ontvangst; "indicatie" van de gemeente ligt ervoor.
    const eersteFase = (
      demo.fasen.find((f) => f.id === "ontvangst") ?? demo.fasen[0]
    ).id;
    werkZaakBij(
      situatie,
      nieuweZaakStand(eersteFase, a, onderwerp, INGEDIEND_OP),
    );
    zaakAanmaken(situatie, demo.zaak, "In behandeling", onderwerp);
    router.push("/personeel/iemand-aannemen/verstuurd");
  };

  // Via de stappenbalk kan stap 4 open gaan zonder gekozen kandidaat of eerste
  // werkdag, zoals na een andere situatie in stap 2. Dan is er niemand met
  // toestemming om voor aan te vragen: eerst terug naar stap 3.
  if (
    bekend &&
    route.zaak !== null &&
    !bestaand?.ingediend &&
    (staat.kandidaat !== kandidaat.bsnMasker || !a.aanvang)
  )
    return (
      <>
        <Heading level={1}>{TAAK_TITEL}</Heading>
        <div className="rhc-mox-card">
          <Stappen huidige={4} />
          <Paragraph>
            Kies eerst in stap 3 wie u wilt aannemen en vul de eerste werkdag
            in. Daarna controleert u hier de aanvraag.
          </Paragraph>
          <StepNavigation
            back="/personeel/iemand-aannemen/gegevens"
            backLabel={terugNaar(3)}
          />
        </div>
      </>
    );

  return (
    <>
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <div className="rhc-mox-card">
        <Stappen huidige={4} />
        {!bekend && !resultaat.fout ? (
          <LoadingStatus>
            Wij zoeken in de wet uit welke regelingen gelden…
          </LoadingStatus>
        ) : (
          <Paragraph>
            {resultaat.fout
              ? "De berekening lukt nu niet. Laad de pagina opnieuw."
              : rijIds.length === 0
                ? "Bij deze antwoorden is er niets aan te vragen."
                : paneelIds.length === 0
                  ? overzichtTekst(route)
                  : "Controleer per regeling de gegevens en vul aan wat ontbreekt."}
          </Paragraph>
        )}
        {paneelIds.length > 0 && (
          <Paragraph className="rhc-mox-small-text">
            Alleen u ziet deze aanvraag. Er gaat pas iets naar de gemeente of
            UWV als u verstuurt.
          </Paragraph>
        )}

        {bekend && rijIds.length > 0 && (
          <section className="rhc-mox-row-gap" aria-labelledby="regelingen">
            <Heading level={2} id="regelingen">
              Regelingen
            </Heading>
            <Paragraph>
              Vinkt u een regeling aan, dan gaat de volgende open.
            </Paragraph>
            {/* <div className="rhc-mox-stack rhc-mox-stack--sm">
              <Paragraph>
                Gecontroleerd of gelezen: {aantal} van {rijIds.length}
              </Paragraph>
              <ProgressBar
                label="Gecontroleerd of gelezen"
                value={aantal}
                max={rijIds.length}
                valueText={`${aantal} van ${rijIds.length}`}
              />
              <Paragraph role="status" className="rhc-mox-small-text">
                {melding}
              </Paragraph>
            </div> */}

            {fout && aantal < rijIds.length && (
              <div id="fout-samenvatting" tabIndex={-1}>
                <Alert type="error">
                  <Paragraph>
                    {paneelIds.length > 0
                      ? "Nog niet klaar om te versturen. Controleer eerst:"
                      : "Nog niet klaar. Lees eerst:"}
                  </Paragraph>
                  <UnorderedList>
                    {rijIds
                      .filter((id) => !klaarMet(id))
                      .map((id) => (
                        <UnorderedListItem key={id}>
                          <a
                            href={`#paneel-${id}`}
                            className="utrecht-link utrecht-link--html-a"
                          >
                            {NAAM[id]}
                          </a>
                          {mist(id) && ": kies dit eerst in stap 3"}
                        </UnorderedListItem>
                      ))}
                  </UnorderedList>
                </Alert>
              </div>
            )}

            <Accordion>
              {paneelIds.map(paneel)}
              {route.vanzelf.map(vanzelf)}
              {route.taken.map(taak)}
            </Accordion>
          </section>
        )}

        {bekend && geldtNiet.length > 0 && (
          <section className="rhc-mox-row-gap" aria-labelledby="geldt-niet">
            <Heading level={2} id="geldt-niet">
              Geldt niet bij uw antwoorden
            </Heading>
            <UnorderedList>
              {geldtNiet.map((r) => (
                <UnorderedListItem key={r.id}>{NAAM[r.id]}</UnorderedListItem>
              ))}
            </UnorderedList>
          </section>
        )}

        {bekend && paneelIds.length > 0 && bestaand?.ingediend && (
          <Alert type="info">
            <Paragraph>
              U hebt deze aanvraag al verstuurd
              {bestaand.verstuurdOp
                ? ` op ${datumNL(bestaand.verstuurdOp)}`
                : ""}
              . U volgt de aanvraag in Lopende zaken.
            </Paragraph>
          </Alert>
        )}

        {bekend &&
          paneelIds.length > 0 &&
          !bestaand?.ingediend &&
          verstuurt.length > 0 && (
            <section className="rhc-mox-row-gap" aria-labelledby="versturen">
              <Heading level={2} id="versturen">
                Versturen
              </Heading>
              <Paragraph>
                U verstuurt de aanvraag {opsomming} naar {naarWie}.{" "}
                {uwv ? "UWV" : "De gemeente"} beslist. U krijgt een
                ontvangstbevestiging met zaaknummer in uw berichtenbox en volgt
                de zaak bij Lopende zaken.
              </Paragraph>
              <FormFieldCheckboxOption
                id="bevestiging"
                invalid={bevestigFout && !bevestigd}
                errorMessage={
                  bevestigFout && !bevestigd
                    ? "U hebt nog niet bevestigd dat u alles naar waarheid hebt ingevuld."
                    : undefined
                }
                label="Ik heb alles naar waarheid ingevuld."
                name="bevestiging"
                checked={bevestigd}
                onChange={(event) => setBevestigd(event.target.checked)}
              />
            </section>
          )}

        {bekend && (
          <StepNavigation
            back="/personeel/iemand-aannemen/gegevens"
            backLabel={terugNaar(3)}
            later="/personeel"
            next={
              paneelIds.length > 0 && bestaand?.ingediend
                ? { label: "Bekijk de zaak", href: demo.zaak.url }
                : paneelIds.length > 0 && verstuurt.length > 0
                  ? {
                      label: `Versturen naar ${uwv ? "UWV" : `gemeente ${kandidaat.gemeente}`}`,
                      onClick: indienen,
                      final: true,
                      sends: true,
                    }
                  : // Niets te versturen: hier rondt de ondernemer af.
                    { label: "Klaar", onClick: klaar, final: true }
            }
          />
        )}
      </div>
    </>
  );
};

export default Aanvraag;
