"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionSection,
  ActionGroup,
  Alert,
  Button,
  DataSummary,
  DataSummaryItem,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  Heading,
  OrderedList,
  OrderedListItem,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import StickyInfoBox from "@/components/StickyInfoBox";
import ProgressBar from "@/components/ProgressBar";
import type { DemoAannemen } from "@/demo";
import basis from "../_basisfeiten.json";
import { Aanname, duurTekst, KorteBalans, LkvVoorbehoud } from "../_balans";
import type { PaneelId, TaakId, VanzelfId } from "../_route";
import { routeVoor } from "../_route";
import Stappen from "../_stappen";
import { loonkostenPerJaar } from "../_engine";
import { balansRegels, invoerVoor, type Feiten } from "../_uitkomsten";
import { useUitkomsten } from "../_useUitkomsten";
import Waarom from "../_waarom";
import {
  onderMinimumloon,
  useAannemen,
  uurloonTekst,
  type AannemenStaat,
} from "../_useAannemen";
import { nieuweZaakStand, zaakAanmaken } from "../_zaakStart";
import { datumNL, euro, type Werkgever } from "../_werkgever";

type Gegeven = { label: string; waarde: string; bron: string };

const Gegevens = ({ rijen }: { rijen: Gegeven[] }) => (
  <DataSummary appearance="column">
    {rijen.map((r) => (
      <DataSummaryItem
        key={r.label}
        itemKey={r.label}
        itemValue={`${r.waarde} · ${r.bron}`}
      />
    ))}
  </DataSummary>
);

const NAAM: Record<PaneelId, string> = {
  lks: "Loonkostensubsidie",
  ld: "Loondispensatie",
  jc: "Jobcoaching",
  wpa: "Werkplekaanpassing",
};

const TAAK: Record<TaakId, string> = {
  doelgroepverklaring: "Doelgroepverklaring aanvragen",
  vz_wajong: "Jobcoach of werkplekaanpassing aanvragen",
  vz_wia: "Jobcoach of werkplekaanpassing aanvragen",
  pp: "Proefplaats: toestemming vragen aan de gemeente",
};

const ORGANISATIE = { gemeente: "Naar de gemeente", uwv: "Naar UWV" } as const;

const VRAGEN =
  "/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt";
const GEGEVENS = "/personeel/iemand-aannemen/gegevens";

/** Wat de organisatie zelf beoordeelt voordat die beslist; de aanvraag levert dat niet. */
const Beoordeling = ({
  id,
  titel,
  children,
}: {
  id: string;
  titel: string;
  children: ReactNode;
}) => (
  <section className="rhc-mox-highlight rhc-mox-row-gap" aria-labelledby={id}>
    <Heading level={4} id={id}>
      {titel}
    </Heading>
    {children}
  </section>
);

/** Eén regeling als tegel in het overzicht. */
type Tegel = {
  id: string;
  naam: string;
  wie: string;
  wet: string;
  wat: string;
  bedrag?: number;
  status?: string;
  /** Het anker van het onderdeel op de pagina. */
  doel: string;
  paneel?: PaneelId;
};

/** Een antwoord uit stap 1 of 2, met een link om het te wijzigen. */
const Antwoord = ({
  label,
  waarde,
  href,
}: {
  label: string;
  waarde: string;
  href: string;
}) => (
  <div className="rhc-data-summary__item">
    <dt className="rhc-data-summary__item-key">{label}</dt>
    <dd className="rhc-data-summary__item-value">
      {waarde}{" "}
      <Link
        href={href}
        className="utrecht-link utrecht-link--html-a"
        aria-label={`Wijzigen: ${label.toLowerCase()}`}
      >
        Wijzigen
      </Link>
    </dd>
  </div>
);

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
  const { werkBij } = useAannemen();
  const [fout, setFout] = useState(false);
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
  const aantal = paneelIds.filter((id) => g[id]).length;
  const regelingen =
    paneelIds.length +
    route.vanzelf.length +
    route.taken.filter((t) => t !== "doelgroepverklaring").length;
  const lkv = uitkomsten.regels.find((r) => r.id === "lkv");
  const ld = uitkomsten.regels.find((r) => r.id === "ld");
  const nrp = uitkomsten.overige.find((o) => o.id === "nrp");

  const kies = (deel: typeof k) => werkBij({ keuzes: { ...k, ...deel } });

  const mist = (id: PaneelId) =>
    (id === "jc" && !k.jc) || (id === "wpa" && !k.wpa);

  const status = (id: PaneelId) =>
    g[id] ? "gecontroleerd" : mist(id) ? "aanvullen" : "controleren";

  // De eerste aanvraag die nog niet gecontroleerd is, staat open; `omgezet`
  // houdt bij welke de gebruiker zelf open- of dichtklapte.
  const [omgezet, setOmgezet] = useState<PaneelId[]>([]);
  const [melding, setMelding] = useState("");
  const actief = paneelIds.find((id) => !g[id]);
  const isOpen = (id: PaneelId) => (id === actief) !== omgezet.includes(id);

  // Na "Ik heb dit gecontroleerd" gaat de volgende aanvraag open.
  const controleer = (id: PaneelId, aanvinken: boolean) => {
    werkBij({ gecontroleerd: { ...g, [id]: aanvinken } });
    if (!aanvinken) return;
    const volgende = paneelIds.find((x) => x !== id && !g[x]);
    setOmgezet([]);
    setMelding(
      volgende
        ? `${NAAM[id]} is gecontroleerd. Controleer nu ${NAAM[volgende].toLowerCase()}.`
        : "Alle aanvragen zijn gecontroleerd. U kunt ze nu versturen.",
    );
    const doel = volgende ? `paneel-${volgende}` : "versturen";
    requestAnimationFrame(() =>
      document
        .getElementById(doel)
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };
  const wissel = (id: PaneelId) =>
    setOmgezet((nu) =>
      nu.includes(id) ? nu.filter((x) => x !== id) : [...nu, id],
    );

  // Een gewone functie, geen component: een component in de render zou bij
  // elke wijziging opnieuw worden aangemaakt.
  const vinkje = (id: PaneelId) => (
    <FormFieldCheckboxOption
      label="Ik heb dit gecontroleerd"
      name={`ok-${id}`}
      checked={!!g[id]}
      onChange={(event) => controleer(id, event.target.checked)}
    />
  );

  const waarom = (wet: string, output: string, regeling: string) => {
    const i = invoer(wet, output);
    if (!i) return null;
    return (
      <Waarom
        invoer={i}
        antwoorden={a}
        regeling={regeling}
        kvk={werkgever.kvkNummer}
        labels={labels}
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
      bron: inRegister
        ? "UWV doelgroepregister"
        : situatie === "wajong" || situatie === "wia"
          ? "UWV"
          : "Basisregistratie Personen",
    },
  ];
  const situatieRij: Gegeven | null =
    situatie === "wajong"
      ? {
          label: "Wajong",
          waarde: vind("uwv", "heeft_wajong_arbeidsondersteuning_of_uitkering"),
          bron: "UWV",
        }
      : situatie === "wia"
        ? {
            label: "WIA-uitkering in de maand voor de start",
            waarde: vind("uwv", "had_wia_recht_maand_voor_aanvang"),
            bron: "UWV",
          }
        : inRegister
          ? {
              label: "In het doelgroepregister",
              waarde: vind("uwv", "is_arbeidsbeperkte"),
              bron: "UWV doelgroepregister",
            }
          : null;
  // Deelt de kandidaat alleen met de gemeente en UWV, dan ziet de werkgever
  // de waarde niet; de organisatie gebruikt hem wel bij de beoordeling.
  const verborgen = staat.delen === "uitvoerder";
  const verberg = (rij: Gegeven): Gegeven =>
    verborgen
      ? { ...rij, waarde: "Gedeeld met de gemeente en UWV, niet met u" }
      : rij;
  if (situatieRij) werknemerRijen.push(verberg(situatieRij));
  const woonplaatsRij: Gegeven = verberg({
    label: "Woonplaats werknemer",
    waarde:
      kandidaat.woonplaats === kandidaat.gemeente
        ? kandidaat.woonplaats
        : `${kandidaat.woonplaats}, gemeente ${kandidaat.gemeente}`,
    bron: "Basisregistratie Personen",
  });
  const dienstRijen: Gegeven[] = [
    { label: "Functie", waarde: dienstverband.functie, bron: "Uw opgave" },
    {
      label: "Eerste werkdag",
      waarde: datumNL(dienstverband.aanvang),
      bron: "Uw opgave",
    },
    { label: "Uren per week", waarde: String(a.uren), bron: "Uw antwoord" },
    { label: "Loon", waarde: uurloonTekst(a), bron: "Uw antwoord" },
  ];

  const balans = balansRegels(uitkomsten, loonkostenPerJaar(a));
  const bedragVan = (id: "lks" | "ld" | "lkv") =>
    balans.find((r) => r.id === id && r.status === "bedrag")?.bedrag;
  const gemeenteNaam = `Gemeente ${kandidaat.gemeente}`;
  const PANEEL_TEGEL: Record<PaneelId, { wie: string; wet: string }> = {
    lks: { wie: gemeenteNaam, wet: "Participatiewet, artikel 10d" },
    ld: { wie: "UWV", wet: "Wajong, artikel 2:20" },
    jc: { wie: gemeenteNaam, wet: "Participatiewet, artikel 10da" },
    wpa: { wie: gemeenteNaam, wet: "Participatiewet, artikel 10" },
  };
  const TAAK_TEGEL: Record<TaakId, { wie: string; wet: string }> = {
    doelgroepverklaring: {
      wie: "UWV",
      wet: "Wet tegemoetkomingen loondomein, artikel 2.7",
    },
    vz_wajong: { wie: "UWV", wet: "Wajong, artikel 2:22" },
    vz_wia: { wie: "UWV", wet: "Wet WIA, artikel 35" },
    pp: { wie: gemeenteNaam, wet: "Participatiewet, artikel 8a" },
  };
  const tegels: Tegel[] = [
    ...paneelIds.map((id) => ({
      id,
      naam: NAAM[id],
      ...PANEEL_TEGEL[id],
      wat: "U vraagt aan",
      bedrag: id === "lks" || id === "ld" ? bedragVan(id) : undefined,
      status: status(id),
      doel: `paneel-${id}`,
      paneel: id,
    })),
    ...route.vanzelf.map((id) =>
      id === "lkv"
        ? {
            id,
            naam: "Loonkostenvoordeel",
            wie: "Belastingdienst",
            wet:
              lkv?.categorie === "arbeidsgehandicapte_werknemer"
                ? "Wet tegemoetkomingen loondomein, artikel 2.9"
                : "Wet tegemoetkomingen loondomein, artikel 2.13",
            wat: "Via de loonaangifte",
            bedrag: bedragVan("lkv"),
            doel: "vanzelf-lkv",
          }
        : {
            id,
            naam: "No-riskpolis",
            wie: "UWV",
            wet: "Ziektewet, artikel 29b",
            wat: "Gaat vanzelf",
            doel: "vanzelf-nrp",
          },
    ),
    ...route.taken.map((id) => ({
      id,
      naam: TAAK[id],
      ...TAAK_TEGEL[id],
      wat: "Taak voor de werknemer",
      doel: `taak-${id}`,
    })),
  ];

  // Een tegel van een aanvraag klapt die aanvraag open en scrolt ernaartoe.
  const naarTegel = (tegel: Tegel) => {
    const id = tegel.paneel;
    if (id && !isOpen(id)) wissel(id);
    requestAnimationFrame(() =>
      document
        .getElementById(tegel.doel)
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const paneel = (id: PaneelId): ReactNode => {
    const kop = (note: string, kind: ReactNode) => (
      <AccordionSection
        key={id}
        id={`paneel-${id}`}
        headingLevel={3}
        label={`${NAAM[id]} · ${status(id)}`}
        // Het type eist `body`, de component rendert alleen `children`.
        body={null}
        expanded={isOpen(id)}
        onActivate={() => wissel(id)}
      >
        <div className="rhc-mox-stack">
          <Paragraph className="rhc-mox-small-text">{note}</Paragraph>
          {kind}
          {vinkje(id)}
        </div>
      </AccordionSection>
    );
    const gemeente = `Gemeente ${kandidaat.gemeente}, waar ${kandidaat.voornaam} woont`;
    const naam = `${kandidaat.voornaam} ${kandidaat.achternaam}`;

    if (id === "lks")
      return kop(
        gemeente,
        <>
          <Paragraph>
            U vraagt het college van burgemeester en wethouders van{" "}
            {kandidaat.gemeente} om loonkostensubsidie voor {naam}{" "}
            (Participatiewet, artikel 10d).
          </Paragraph>
          <Heading level={4}>Wat in de aanvraag staat</Heading>
          <Gegevens
            rijen={[
              ...werkgeverRijen,
              ...werknemerRijen,
              woonplaatsRij,
              ...dienstRijen,
            ]}
          />
          <Gegevens
            rijen={[
              ...(inRegister
                ? [
                    verberg({
                      label: "Regeling werknemer",
                      waarde: "Doelgroep banenafspraak",
                      bron: "UWV doelgroepregister",
                    }),
                  ]
                : []),
            ]}
          />
          <Paragraph>
            U vraagt de loonkostensubsidie aan uiterlijk zes maanden na de
            eerste werkdag ({datumNL(dienstverband.aanvang)}). Dat staat in de
            Participatiewet, artikel 10d lid 2.
          </Paragraph>
          <Beoordeling
            id="beoordeelt-lks"
            titel={`Wat de gemeente ${kandidaat.gemeente} zelf beoordeelt`}
          >
            <UnorderedList>
              <UnorderedListItem>
                <strong>Of {kandidaat.voornaam} bij de doelgroep hoort.</strong>{" "}
                Dat is zo als {kandidaat.voornaam} met een volledige baan niet
                het minimumloon kan verdienen (Participatiewet, artikel 10c).
              </UnorderedListItem>
              <UnorderedListItem>
                <strong>De loonwaarde.</strong> Dat is hoeveel het werk van{" "}
                {kandidaat.voornaam} waard is, in procenten van het minimumloon.{" "}
                {onderMinimumloon(a)
                  ? `U schatte ${a.loonwaarde} procent. De bedragen op deze pagina rekenen met die schatting. De gemeente stelt de loonwaarde vast; daarna weet u het precieze bedrag.`
                  : "U gaf aan dat er geen verminderde loonwaarde is. Dan is er geen loonkostensubsidie."}
              </UnorderedListItem>
            </UnorderedList>
            <Heading level={5}>Zo meet de gemeente de loonwaarde</Heading>
            <UnorderedList>
              <UnorderedListItem>
                Een deskundige komt op de werkplek. Die kijkt naar het werk dat{" "}
                {kandidaat.voornaam} doet en praat ook met u. De deskundige
                werkt met een vaste, beschreven methode (Besluit
                loonkostensubsidie Participatiewet, artikel 2).
              </UnorderedListItem>
              <UnorderedListItem>
                U kiest met de gemeente hoe het eerste half jaar gaat. Of de
                gemeente meet meteen. Of u krijgt eerst een vast bedrag: 50
                procent van het minimumloon. De gemeente meet dan in de vijfde
                maand van het dienstverband. Vanaf de zevende maand krijgt u de
                subsidie op basis van de gemeten loonwaarde (Participatiewet,
                artikel 10d lid 1 en lid 5).
              </UnorderedListItem>
              <UnorderedListItem>
                Had {kandidaat.voornaam} eerst een proefplaats bij u? Dan meet
                de gemeente tijdens de proefplaats. Het vaste bedrag kan dan
                niet.
              </UnorderedListItem>
              <UnorderedListItem>
                De gemeente meet de loonwaarde in principe één keer per jaar
                opnieuw.
              </UnorderedListItem>
            </UnorderedList>
            <Paragraph>
              <strong>Binnen acht weken</strong> na uw aanvraag krijgt u een
              brief van de gemeente. Daarin staat of u loonkostensubsidie krijgt
              en hoeveel.
            </Paragraph>
          </Beoordeling>
          {waarom(
            "participatiewet",
            "heeft_recht_op_lks",
            "Loonkostensubsidie",
          )}
        </>,
      );

    if (id === "ld")
      return kop(
        "UWV",
        <>
          <Paragraph>
            U vraagt UWV om loondispensatie voor {naam} (Wajong, artikel 2:20).
            Met loondispensatie mag u minder loon betalen dan het minimumloon.
          </Paragraph>
          <Heading level={4}>Wat in de aanvraag staat</Heading>
          <Gegevens
            rijen={[
              ...werkgeverRijen,
              ...werknemerRijen,
              ...dienstRijen,
              {
                label: "Percentage",
                waarde: `${a.loonwaarde} procent, uw schatting; UWV stelt dit vast`,
                bron: "Uw antwoord",
              },
              ...(ld?.aanspraakPerUur !== undefined
                ? [
                    {
                      label: "Aanspraak per uur",
                      waarde: `${euro(ld.aanspraakPerUur)}, het minimumloon maal het percentage`,
                      bron: "Volgt uit de wet",
                    },
                  ]
                : []),
            ]}
          />
          <div className="rhc-mox-small-text">
            Het percentage is een schatting.{" "}
            <InfoToggletip label="Toelichting bij het percentage">
              UWV stelt het percentage vast na een onderzoek op de werkplek. Dat
              kan hoger of lager uitvallen dan uw schatting. De aanspraak per
              uur verandert dan mee.
            </InfoToggletip>
          </div>
          <Paragraph>
            Loondispensatie geldt vanaf de eerste dag van de maand waarin u de
            aanvraag doet (Besluit loondispensatie Wajong, artikel 4). Vraagt u
            later aan, dan geldt de loondispensatie ook later.
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
            Begeleiding op de werkplek door een jobcoach. Hoort de werknemer bij
            de doelgroep loonkostensubsidie? Dan heeft de werknemer recht op
            deze begeleiding (Participatiewet 10da). U kunt de begeleiding voor
            de werknemer aanvragen bij de gemeente.
          </Paragraph>
          <Fieldset legend="Wilt u jobcoaching aanvragen?">
            <FormFieldRadio
              name="jc"
              value="ja"
              label="Ja, via de gemeente"
              checked={k.jc === "ja"}
              onChange={() => kies({ jc: "ja" })}
            />
            <FormFieldRadio
              name="jc"
              value="nee"
              label="Nee, niet nodig"
              checked={k.jc === "nee"}
              onChange={() => kies({ jc: "nee" })}
            />
          </Fieldset>
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
          beslist of de aanpassing nodig is (Participatiewet 10). De gemeente
          heeft daarvoor eigen regels.
        </Paragraph>
        <Fieldset legend="Is er een aanpassing nodig?">
          <FormFieldRadio
            name="wpa"
            value="ja"
            label="Ja, ik weet wat er nodig is"
            checked={k.wpa === "ja"}
            onChange={() => kies({ wpa: "ja" })}
          />
          <FormFieldRadio
            name="wpa"
            value="later"
            label="Weet ik nog niet, ik vraag het later aan"
            checked={k.wpa === "later"}
            onChange={() => kies({ wpa: "later" })}
          />
          <FormFieldRadio
            name="wpa"
            value="nee"
            label="Nee"
            checked={k.wpa === "nee"}
            onChange={() => kies({ wpa: "nee" })}
          />
        </Fieldset>
      </>,
    );
  };

  const taak = (id: TaakId): ReactNode => (
    <section
      className="rhc-mox-card rhc-mox-row-gap"
      aria-labelledby={`taak-${id}`}
      key={id}
    >
      <Heading level={3} id={`taak-${id}`}>
        {TAAK[id]}
      </Heading>
      {id === "doelgroepverklaring" && (
        <>
          <Paragraph>
            De werknemer vraagt de doelgroepverklaring zelf aan bij UWV, binnen
            drie maanden na de start. U bewaart de verklaring bij de
            loonadministratie. Zonder verklaring kunt u het loonkostenvoordeel
            niet krijgen (Wet tegemoetkomingen loondomein 2.7).
          </Paragraph>
        </>
      )}
      {id === "vz_wajong" && (
        <Paragraph>
          De werknemer vraagt een jobcoach of een aanpassing van de werkplek
          zelf aan bij UWV, als dat nodig is (Wajong 2:22). U kunt dit niet
          namens de werknemer aanvragen in dit portaal.
        </Paragraph>
      )}
      {id === "vz_wia" && (
        <Paragraph>
          De werknemer vraagt een jobcoach of een aanpassing van de werkplek
          zelf aan bij UWV, als dat nodig is (Wet WIA 35). U kunt dit niet
          namens de werknemer aanvragen in dit portaal. Duurt het dienstverband
          ten minste zes maanden, dan kunt u bij UWV zelf subsidie vragen voor
          de extra kosten van voorzieningen (Wet WIA 36). Daarvoor gelden meer
          voorwaarden. De kosten moeten bijvoorbeeld hoger zijn dan een
          drempelbedrag. UWV beslist of u de subsidie krijgt.
        </Paragraph>
      )}
      {/* De proefplaats ligt vóór de dienstbetrekking (Pwet 6 h) en de
          toestemming gaat naar de kandidaat (8a lid 2 d): geen deel van de
          aanvraag, die van een vaste eerste werkdag uitgaat. */}
      {id === "pp" && (
        <>
          <Paragraph>
            Een proefplaats is onbetaald werk bij u, vóór de eerste werkdag. De
            proefplaats duurt twee maanden. Verlengen kan met ten hoogste vier
            maanden (Participatiewet 8a). De gemeente geeft de toestemming aan
            de kandidaat, omdat de kandidaat bijstand krijgt. De gemeente heeft
            daarvoor eigen regels.
          </Paragraph>
          <Paragraph>
            Wilt u eerst een proefplaats? Dan vraagt de kandidaat de gemeente om
            toestemming, vóór de eerste werkdag. Dat gaat buiten deze aanvraag
            om. Of een proefplaats en loonkostensubsidie samen kunnen, staat nog
            niet vast.
          </Paragraph>
          {waarom(
            "participatiewet",
            "mag_proefplaatsing_aangaan",
            "Proefplaatsing",
          )}
        </>
      )}
    </section>
  );

  const vanzelf = (id: VanzelfId): ReactNode =>
    id === "lkv" ? (
      <section
        className="rhc-mox-card rhc-mox-row-gap"
        aria-labelledby="vanzelf-lkv"
        key={id}
      >
        <Heading level={3} id="vanzelf-lkv">
          Loonkostenvoordeel
        </Heading>
        {lkv && (
          <Paragraph purpose="lead">
            <strong>{euro(lkv.bedragPerJaar)}</strong>{" "}
            <small className="rhc-mox-small-text">per jaar</small>
          </Paragraph>
        )}
        {lkv?.aanname && <Aanname id={lkv.aanname} />}
        <LkvVoorbehoud categorie={lkv?.categorie} />
        <Paragraph>
          U vraagt het loonkostenvoordeel aan door in de loonaangifte het vakje
          loonkostenvoordeel aan te zetten; een aparte aanvraag is niet nodig.
          {lkv?.categorie === "arbeidsgehandicapte_werknemer" &&
            " Dat kan zodra u de doelgroepverklaring van de werknemer hebt."}{" "}
          De Belastingdienst rekent het na afloop van het jaar uit.
        </Paragraph>
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
            },
          ]}
        />
        {waarom(
          "wet_tegemoetkomingen_loondomein",
          "heeft_recht_op_lkv",
          "Loonkostenvoordeel",
        )}
      </section>
    ) : (
      <section
        className="rhc-mox-card rhc-mox-row-gap"
        aria-labelledby="vanzelf-nrp"
        key={id}
      >
        <Heading level={3} id="vanzelf-nrp">
          No-riskpolis
        </Heading>
        <Paragraph>
          Wordt de werknemer ziek? Dan betaalt u het loon door. UWV betaalt u
          ziekengeld voor de werknemer: 70 procent van het dagloon (Ziektewet
          29b). In de eerste 52 weken van de ziekte kunt u UWV vragen om het
          hele dagloon. Het ziekengeld is dan niet hoger dan het loon. U hoeft
          de no-riskpolis niet aan te vragen. {duurTekst(nrp?.duurJaren)} Bij
          ziekte meldt u de werknemer ziek bij UWV.
        </Paragraph>
        {waarom("ziektewet", "heeft_recht_op_no_risk_polis", "No-riskpolis")}
      </section>
    );

  // Zonder panelen is er niets te versturen. Bij WIA maakt "Uitsturen" de zaak
  // aan (de werknemer vraagt de verklaring aan); anders volgt het overzicht.
  const klaar = () => {
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
    router.push("/personeel/iemand-aannemen/overzicht");
  };

  const indienen = () => {
    if (aantal < paneelIds.length) {
      setFout(true);
      return;
    }
    setFout(false);
    router.push("/personeel/iemand-aannemen/versturen");
  };

  return (
    <>
      <Heading level={1}>
        Regelingen voor het aannemen van {kandidaat.voornaam}{" "}
        {kandidaat.achternaam}
      </Heading>
      <Stappen huidige={3} />
      <Paragraph role={bekend ? undefined : "status"}>
        {resultaat.fout
          ? "De berekening lukt nu niet. Laad de pagina opnieuw."
          : !bekend
            ? "Wij zoeken in de wet uit welke regelingen gelden…"
            : regelingen === 0
              ? "Bij deze antwoorden is er niets aan te vragen."
              : paneelIds.length === 0
                ? "U hoeft niets te versturen. Hieronder staat wat de werknemer aanvraagt en wat vanzelf gaat."
                : `Wij hebben ${paneelIds.length === 1 ? "de aanvraag" : `${paneelIds.length} aanvragen`} voor u ingevuld met gegevens die de overheid al heeft. Er is nog niets verstuurd.`}
      </Paragraph>

      {bekend && paneelIds.length > 0 && (
        <section
          className="rhc-mox-card rhc-mox-row-gap"
          aria-labelledby="zo-gaat-het"
        >
          <Heading level={2} id="zo-gaat-het">
            Zo gaat het
          </Heading>
          <OrderedList>
            <OrderedListItem>
              U controleert de aanvragen hieronder, één voor één. Klopt een
              antwoord niet? Kies dan <strong>Wijzigen</strong>.
            </OrderedListItem>
            <OrderedListItem>
              U verstuurt{" "}
              {route.panelen
                .map((p) =>
                  p.organisatie === "gemeente"
                    ? `de aanvraag naar de gemeente ${kandidaat.gemeente}`
                    : "de aanvraag naar UWV",
                )
                .join(" en ")}
              .
            </OrderedListItem>
            {paneelIds.includes("lks") && (
              <OrderedListItem>
                De gemeente {kandidaat.gemeente} laat de loonwaarde van{" "}
                {kandidaat.voornaam} meten op de werkplek. Hoe dat gaat, staat
                bij de loonkostensubsidie.
              </OrderedListItem>
            )}
            {paneelIds.includes("ld") && (
              <OrderedListItem>
                Een arbeidsdeskundige van UWV komt op de werkplek en stelt vast
                welk loon past bij het werk.
              </OrderedListItem>
            )}
            <OrderedListItem>
              Binnen acht weken na uw aanvraag krijgt u een brief met het
              besluit en het bedrag. De brief komt in uw berichtenbox.
            </OrderedListItem>
          </OrderedList>
        </section>
      )}

      {bekend && tegels.length > 0 && (
        <section className="rhc-mox-row-gap" aria-labelledby="overzicht">
          <Heading level={2} id="overzicht">
            Alle regelingen in één overzicht
          </Heading>
          <ul className="rhc-mox-tile-grid">
            {tegels.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.doel}`}
                  className="rhc-mox-tile"
                  onClick={(event) => {
                    event.preventDefault();
                    naarTegel(t);
                  }}
                >
                  <span className="rhc-mox-tile__title">{t.naam}</span>
                  <span className="rhc-mox-small-text">
                    {t.wie} · {t.wet}
                  </span>
                  {t.bedrag !== undefined && (
                    <span className="rhc-mox-tile__amount">
                      {euro(t.bedrag)} per jaar
                    </span>
                  )}
                  <span className="rhc-mox-tile__status rhc-mox-small-text">
                    {t.wat}
                    {t.status && ` · ${t.status}`}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {bekend && paneelIds.length > 0 && (
        <section
          className="rhc-mox-card rhc-mox-row-gap"
          aria-labelledby="uw-antwoorden"
        >
          <Heading level={2} id="uw-antwoorden">
            Uw antwoorden
          </Heading>
          <Paragraph>
            Hierop zijn de aanvragen gebaseerd. U kunt ze nog wijzigen. Wat u al
            hebt gecontroleerd, blijft bewaard.
          </Paragraph>
          <dl className="rhc-data-summary rhc-data-summary--column">
            <Antwoord
              label="Kandidaat"
              waarde={`${kandidaat.voornaam} ${kandidaat.achternaam}`}
              href={GEGEVENS}
            />
            <Antwoord
              label="Uren per week"
              waarde={String(a.uren)}
              href={VRAGEN}
            />
            <Antwoord label="Loon" waarde={uurloonTekst(a)} href={VRAGEN} />
            <Antwoord
              label="Loonwaarde, uw schatting"
              waarde={`${a.loonwaarde} procent`}
              href={VRAGEN}
            />
          </dl>
        </section>
      )}

      {paneelIds.length > 0 && (
        <div className="rhc-mox-stack rhc-mox-stack--sm">
          <Paragraph>
            Gecontroleerd: {aantal} van {paneelIds.length}
          </Paragraph>
          <ProgressBar
            label="Gecontroleerd"
            value={aantal}
            max={paneelIds.length}
            valueText={`${aantal} van ${paneelIds.length}`}
          />
          <Paragraph role="status" className="rhc-mox-small-text">
            {melding}
          </Paragraph>
        </div>
      )}

      {fout && aantal < paneelIds.length && (
        <Alert type="error">
          <Paragraph>
            Nog niet klaar om te versturen. Controleer eerst:
          </Paragraph>
          <UnorderedList>
            {paneelIds
              .filter((id) => !g[id])
              .map((id) => (
                <UnorderedListItem key={id}>
                  <a
                    href={`#paneel-${id}`}
                    className="utrecht-link utrecht-link--html-a"
                  >
                    {NAAM[id]}
                  </a>
                  {mist(id) && ": vul eerst aan wat ontbreekt"}
                </UnorderedListItem>
              ))}
          </UnorderedList>
        </Alert>
      )}

      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-t-8 rhc-mox-row-gap">
          {bekend &&
            route.panelen.map((groep) => (
              <section
                key={groep.organisatie}
                className="rhc-mox-row-gap"
                aria-labelledby={`naar-${groep.organisatie}`}
              >
                <Heading level={2} id={`naar-${groep.organisatie}`}>
                  {ORGANISATIE[groep.organisatie]}
                </Heading>
                <Accordion>{groep.ids.map(paneel)}</Accordion>
              </section>
            ))}

          {bekend && route.taken.length > 0 && (
            <section
              className="rhc-mox-row-gap"
              aria-labelledby="taken-werknemer"
            >
              <Heading level={2} id="taken-werknemer">
                Taken voor de werknemer
              </Heading>
              {route.taken.map(taak)}
            </section>
          )}

          {bekend && route.vanzelf.length > 0 && (
            <section className="rhc-mox-row-gap" aria-labelledby="vanzelf">
              <Heading level={2} id="vanzelf">
                Gaat vanzelf of via de loonaangifte
              </Heading>
              {route.vanzelf.map(vanzelf)}
            </section>
          )}

          {bekend && (
            <ActionGroup id="versturen">
              <Button
                appearance="primary-action-button"
                onClick={paneelIds.length > 0 ? indienen : klaar}
              >
                {paneelIds.length > 0
                  ? "Controleren en versturen"
                  : "Uitsturen"}
              </Button>
              <Link
                href="/personeel"
                className="utrecht-link utrecht-link--html-a"
              >
                Opslaan en later afronden
              </Link>
            </ActionGroup>
          )}
        </div>

        <div className="rhc-grid__cell rhc-grid__cell-t-4 rhc-mox-row-gap">
          <section className="rhc-mox-card" aria-labelledby="wie-ziet">
            <Heading level={2} id="wie-ziet">
              Wie deze aanvraag ziet
            </Heading>
            <Paragraph>
              Alleen u. Er is nog niets naar de gemeente of UWV gestuurd.
            </Paragraph>
            <Paragraph>
              Vraagt u bij een regeling om uitleg in gewone taal? Dan gaan de
              gegevens van die uitkomst naar de digitale assistent.
            </Paragraph>
            <Paragraph className="rhc-mox-small-text">
              Uw aanvraag is opgeslagen in deze browser. U kunt later verder.
            </Paragraph>
          </section>
          {/* Alleen de bedragen blijven staan; zo past het paneel op het scherm. */}
          <StickyInfoBox title="Wat dit u oplevert">
            <KorteBalans antwoorden={a} resultaat={resultaat} />
          </StickyInfoBox>
        </div>
      </div>
    </>
  );
};

export default Aanvraag;
