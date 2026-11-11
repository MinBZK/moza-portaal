"use client";

import Card from "@/components/Card";
import TextBadge from "@/components/TextBadge";
import LoadingStatus from "@/components/LoadingStatus";
import StepNavigation from "@/components/StepNavigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionSection,
  Alert,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import basis from "../_basisfeiten.json";
import { Aanname, duurTekst } from "../_balans";
import type { PaneelId, TaakId, VanzelfId } from "../_route";
import { onderwerpVoor, overzichtTekst, routeVoor } from "../_route";
import { BEGRIP, BEGRIPPEN, NAAM } from "../_begrippen";
import Controleer from "../_opgehaald";
import Stappen, { TAAK_TITEL, terugNaar } from "../_stappen";
import { loonkostenPerJaar } from "../_engine";
import { balansRegels, invoerVoor, type Feiten } from "../_uitkomsten";
import { useUitkomsten } from "../_useUitkomsten";
import Waarom from "../_waarom";
import {
  isIngediend,
  useAannemen,
  vraagEerderInDienst,
  type AannemenStaat,
  type RegelingId,
} from "../_useAannemen";
import AlIngediend from "../_alIngediend";
import { INGEDIEND_OP, nieuweZaakStand, zaakAanmaken } from "../_zaakStart";
import { euroHeel, type Werkgever } from "../_werkgever";
import SourceLinks, { type Source } from "@/components/SourceLinks";
import { BRON } from "../_wetsbronnen";

type Props = {
  perSituatie: Record<"gemeente" | "wajong" | "wia", DemoAannemen>;
  werkgever: Werkgever;
};

/**
 * De vooringevulde aanvraag volgt de route van de situatie: een kaart per
 * regeling, eerst wat de werkgever zelf indient, dan wat vanzelf of via de
 * loonaangifte gaat en de taken van de werknemer. Met iets om te versturen
 * kiest de ondernemer de regelingen met een vinkje; zonder panelen is er
 * niets te versturen en tonen de kaarten wat er geldt, met Afronden.
 */
/**
 * Wanneer een regeling wel geldt, voor de lijst met regelingen die bij deze
 * antwoorden niet gelden. Zelfde strekking als de (i) in de voorbeeldberekening.
 */
const ALLEEN_VOOR: Partial<Record<RegelingId, string>> = {
  lks: "Alleen voor een werknemer die bij de gemeente hoort en het minimumloon niet kan verdienen (Participatiewet, artikel 10d).",
  ld: "Alleen voor een werknemer met een Wajong-uitkering die ten minste 25 procent minder kan dan gebruikelijk (Wajong, artikel 2:20).",
  lkv: "Alleen voor een werknemer uit de doelgroep banenafspraak of met een doelgroepverklaring (Wet tegemoetkomingen loondomein, artikelen 2.6 en 2.10).",
  nrp: "Alleen voor bepaalde werknemers, bijvoorbeeld met een Wajong- of WIA-uitkering, uit de doelgroep banenafspraak of in beschut werk (Ziektewet, artikel 29b).",
  pp: "Alleen voor een kandidaat met bijstand van de gemeente (Participatiewet, artikel 8a).",
  jc: "Alleen voor een werknemer die bij de doelgroep loonkostensubsidie hoort (Participatiewet, artikel 10da).",
  wpa: "Alleen voor een werknemer die bij de gemeente hoort (Participatiewet, artikel 10).",
};

/** De uitkomst van Participatiewet artikel 10 voor werkplekaanpassing. */
const WPA_OUTPUT = "heeft_aanspraak_op_voorziening_arbeidsinschakeling";

/**
 * Wat de werkgever met een regeling doet, als label rechts in de kaart: een
 * actie (blauw) of niets (grijs). Zonder actie is er niets te kiezen.
 */
const ACTIE: Record<RegelingId, { label: string; doen: boolean }> = {
  lks: { label: "Controleren", doen: true },
  ld: { label: "Controleren", doen: true },
  jc: { label: "Kiezen", doen: true },
  wpa: { label: "Kiezen", doen: true },
  lkv: { label: "Nu geen actie nodig", doen: false },
  nrp: { label: "Nu geen actie nodig", doen: false },
  doelgroepverklaring: { label: "Werknemer vraagt aan", doen: false },
  vz_wajong: { label: "Werknemer vraagt aan", doen: false },
  vz_wia: { label: "Werknemer vraagt aan", doen: false },
  pp: { label: "Kandidaat vraagt aan", doen: false },
};

/** Waarom deze uitkomst? zonder afleiding: voor regelingen die de engine niet rekent. */
const AlleenUitleg = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <Accordion>
      <AccordionSection
        headingLevel={4}
        label="Waarom deze uitkomst?"
        // Het type eist `body`, de component rendert alleen `children`.
        body={null}
        expanded={open}
        onActivate={() => setOpen(!open)}
      >
        <div className="rhc-mox-stack">{children}</div>
      </AccordionSection>
    </Accordion>
  );
};

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
  const { kandidaat, labels, bronnen } =
    perSituatie[
      situatie === "wajong" || situatie === "wia" ? situatie : "gemeente"
    ];
  const paneelIds = route.panelen.flatMap((p) => p.ids);
  // Alle regelingen in één lijst: eerst wat u indient, dan wat vanzelf gaat,
  // dan de taken van de werknemer.
  const rijIds: RegelingId[] = [...paneelIds, ...route.vanzelf, ...route.taken];
  const lkv = uitkomsten.regels.find((r) => r.id === "lkv");
  const nrp = uitkomsten.overige.find((o) => o.id === "nrp");

  // Zonder iets om te versturen is er niets te kiezen: de kaarten tonen wat
  // er geldt, zonder vinkje.
  const zonderAanvraag = paneelIds.length === 0;
  // Welke regelingen de ondernemer kiest: de kaarten met een vinkje.
  const gekozen = (id: RegelingId) => !!g[id];
  const aantalGekozen = rijIds.filter(
    (id) => ACTIE[id].doen && gekozen(id),
  ).length;
  // Hoe vaak versturen zonder keuze is geprobeerd: elke poging zet de focus
  // op de melding, zodat die wordt voorgelezen.
  const [kiesFout, setKiesFout] = useState(0);
  useEffect(() => {
    if (kiesFout) document.getElementById("kies-fout")?.focus();
  }, [kiesFout]);
  const kies = (id: RegelingId, aan: boolean) => {
    werkBij({
      gecontroleerd: { ...g, [id]: aan },
      // Jobcoaching en werkplekaanpassing gaan mee als de keuze "ja" is.
      ...(id === "jc" || id === "wpa"
        ? { keuzes: { ...k, [id]: aan ? "ja" : "nee" } }
        : {}),
    });
    if (aan) setKiesFout(0);
  };
  // Hoe lang het kan duren voordat de werkgever weet waar die aan toe is.
  // Voor het meten van de loonwaarde noemt de wet geen termijn; daarom alleen
  // "vaak een paar maanden". De loonwaarde is nog niet gemeten als de
  // gemeente dat zo opgeeft.
  const loonwaardeNogNiet = bronnen.some((b) =>
    b.gegevens.some(
      (gegeven) =>
        gegeven.parameter === "college_heeft_loonwaarde_vastgesteld" &&
        gegeven.waarde.startsWith("Nog niet"),
    ),
  );
  const hoeLang = (zin: string, bronnenVanZin: Source[]) => (
    <>
      <Heading level={5}>Hoe lang het kan duren</Heading>
      <Paragraph>{zin}</Paragraph>
      <SourceLinks sources={bronnenVanZin} />
    </>
  );

  // Werkplekaanpassing (Pwet 10) zit niet in de oriëntatie; de uitleg rekent
  // met de invoer van jobcoaching (zelfde wet en situatie) en de feiten die
  // artikel 10 daarnaast vraagt. Wat de gemeente nog beoordeelt, telt als ja,
  // net als bij de andere regelingen.
  const jcInvoer = invoer(
    "participatiewet",
    "heeft_aanspraak_op_begeleiding_op_de_werkplek",
  );
  const wpaInvoer = jcInvoer && {
    ...jcInvoer,
    output: WPA_OUTPUT,
    uitleggen: [],
    parameters: {
      college_acht_voorziening_noodzakelijk: true,
      is_wia_uitstromer_artikel_34a_35_36: false,
      heeft_nabestaandenuitkering_anw: false,
      is_niet_uitkeringsgerechtigde: a.doelgroepen.includes("nug"),
      valt_onder_lid_2_wegens_voorziening: false,
      ...jcInvoer.parameters,
    },
  };

  const waarom = (
    wet: string,
    output: string,
    regeling: string,
    voorAf?: ReactNode,
  ) => {
    const i = output === WPA_OUTPUT ? wpaInvoer : invoer(wet, output);
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

  const balans = balansRegels(uitkomsten, loonkostenPerJaar(a));
  const bedragVan = (id: "lks" | "ld" | "lkv") =>
    balans.find((r) => r.id === id && r.status === "bedrag")?.bedrag;
  const voorbeeldbedrag = (id: "lks" | "ld" | "lkv") => {
    const bedrag = bedragVan(id);
    // Direct via Regelingen aanvragen: loonwaarde en uurloon zijn nog niet
    // gevraagd, dus geen bedrag op de standaardwaarden.
    if (bedrag !== undefined && staat.voorbeeldBerekend === false)
      return (
        <Paragraph>
          <Link
            href="/personeel/iemand-aannemen/voorbeeldberekening"
            className="utrecht-link utrecht-link--html-a"
          >
            Maak een voorbeeldberekening
          </Link>{" "}
          om een bedrag te zien.
        </Paragraph>
      );
    return bedrag === undefined ? null : (
      <Paragraph>
        Voorbeeldbedrag: <strong>{euroHeel(bedrag)}</strong> per jaar.
      </Paragraph>
    );
  };

  // Waarom de no-riskpolis hier geldt, volgens de engine: lid 2 (zonder
  // einde) of lid 1 (5 jaar). Binnen lid 2 Wajong (a) of onderdeel e: de
  // banenafspraak, of bij beschut werk de loonkostensubsidie.
  const nrpGrond =
    nrp?.duurJaren === -1
      ? a.doelgroepen.includes("wajong")
        ? `Geldt hier omdat ${kandidaat.voornaam} een Wajong-uitkering heeft (Ziektewet, artikel 29b lid 2).`
        : a.doelgroepen.includes("beschut")
          ? `Geldt hier omdat u voor ${kandidaat.voornaam} loonkostensubsidie krijgt (Ziektewet, artikel 29b lid 2 onder e).`
          : `Geldt hier omdat ${kandidaat.voornaam} bij de doelgroep banenafspraak hoort (Ziektewet, artikel 29b lid 2 onder e).`
      : nrp?.duurJaren === 5 && a.doelgroepen.includes("wia")
        ? `Geldt hier omdat ${kandidaat.voornaam} vlak voor dit werk een WIA-uitkering had (Ziektewet, artikel 29b lid 1).`
        : undefined;

  // Wie de regeling uitvoert.
  const deGemeente = `de gemeente ${kandidaat.gemeente}`;
  const UITVOERDER: Record<RegelingId, string> = {
    lks: deGemeente,
    ld: "UWV",
    jc: deGemeente,
    wpa: deGemeente,
    lkv: "de Belastingdienst",
    nrp: "UWV",
    doelgroepverklaring: "UWV",
    vz_wajong: "UWV",
    vz_wia: "UWV",
    pp: deGemeente,
  };

  // Eén kaart per regeling, altijd open: de naam met rechts wat de werkgever
  // doet, wat de regeling is, het voorbeeldbedrag en wie die uitvoert. De wet,
  // de termijnen en de afleiding staan onder Waarom deze uitkomst?. Onderaan
  // de actie: een vinkje of een vraag, alleen als er iets te doen is.
  const rij = (id: RegelingId, meer: ReactNode) => {
    const doen = ACTIE[id].doen && !zonderAanvraag;
    return (
      <li key={id} id={`regeling-${id}`}>
        <Card
          heading={NAAM[id]}
          headingLevel={3}
          label={
            <TextBadge variant={ACTIE[id].doen ? "info" : "neutral"}>
              {ACTIE[id].label}
            </TextBadge>
          }
          className={doen && gekozen(id) ? "rhc-mox-card--selected" : undefined}
          action={
            doen && (
              // De naam van de regeling alleen voor schermlezers: elk vinkje
              // heet anders, zoals in een lijst met formuliervelden.
              <FormFieldCheckboxOption
                className="rhc-mox-card__action"
                label={
                  <>
                    Kies deze regeling
                    <span className="rhc-visually-hidden">: {NAAM[id]}</span>
                  </>
                }
                name={`kies-${id}`}
                checked={gekozen(id)}
                onChange={(event) => kies(id, event.target.checked)}
              />
            )
          }
        >
          {BEGRIP[id].map((b) => (
            <Paragraph key={b}>{BEGRIPPEN[b].uitleg}</Paragraph>
          ))}
          {id === "nrp" && nrpGrond && <Paragraph>{nrpGrond}</Paragraph>}
          {id === "lkv" && (
            <Paragraph>
              Dit wordt tijdens de loonaangifte afgehandeld.
            </Paragraph>
          )}
          {(id === "lks" || id === "ld" || id === "lkv") && voorbeeldbedrag(id)}
          <Paragraph className="rhc-mox-small-text">
            Uitgevoerd door {UITVOERDER[id]}.
          </Paragraph>
          {meer}
        </Card>
      </li>
    );
  };

  // Waarom deze uitkomst?: met de afleiding van regelrecht als de engine de
  // regeling rekent, anders alleen de uitleg uit de wet.
  const uitleg = (
    voorAf: ReactNode,
    engine?: [wet: string, output: string, regeling: string],
  ) =>
    (engine && waarom(engine[0], engine[1], engine[2], voorAf)) ?? (
      <AlleenUitleg>{voorAf}</AlleenUitleg>
    );

  const paneel = (id: PaneelId): ReactNode => {
    if (id === "lks")
      return rij(
        id,
        uitleg(
          <>
            <Paragraph>
              U vraagt de gemeente {kandidaat.gemeente} om loonkostensubsidie
              (Participatiewet, artikel 10d). Vraag aan binnen 6 maanden na de
              start van het dienstverband (Participatiewet, artikel 10d lid 2).
            </Paragraph>
            <Heading level={5}>
              Hoe de gemeente {kandidaat.gemeente} beslist
            </Heading>
            <UnorderedList>
              <UnorderedListItem>
                De gemeente beoordeelt of {kandidaat.voornaam} met een volledige
                baan het minimumloon niet kan verdienen.
              </UnorderedListItem>
              <UnorderedListItem>
                Een loonwaardedeskundige beoordeelt het werk op de werkplek. Met
                dat rapport stelt de gemeente de loonwaarde vast. Daarna weet u
                het precieze bedrag.
              </UnorderedListItem>
              <UnorderedListItem>
                Is {kandidaat.voornaam} nog niet begonnen? Dan kan de gemeente
                in overleg met u besluiten de loonwaarde eerst niet vast te
                stellen. U krijgt dan de eerste 6 maanden hoogstens 50 procent
                van het minimumloon met vakantiegeld, naar verhouding van de
                uren. Daarna stelt de gemeente de loonwaarde alsnog vast.
              </UnorderedListItem>
              <UnorderedListItem>
                U krijgt een brief met het besluit. Is {kandidaat.voornaam} al
                begonnen? Dan binnen 8 weken, tenzij de gemeente laat weten dat
                het langer duurt. Anders binnen 5 weken nadat de gemeente de
                loonwaarde heeft vastgesteld.
              </UnorderedListItem>
            </UnorderedList>
            <SourceLinks
              sources={[
                BRON.pwet10c,
                BRON.besluitLks3,
                BRON.pwet10dLid5,
                BRON.awb,
                BRON.pwet10dLid12,
              ]}
            />
          </>,
          ["participatiewet", "heeft_recht_op_lks", "Loonkostensubsidie"],
        ),
      );

    if (id === "ld")
      return rij(
        id,
        uitleg(
          <>
            <Paragraph>
              U vraagt UWV om loondispensatie: u betaalt minder loon dan het
              minimumloon (Wajong, artikel 2:20).
            </Paragraph>
            <Paragraph>
              Loondispensatie geldt vanaf de maand waarin u aanvraagt. Een
              arbeidsdeskundige van UWV komt meestal op de werkplek. UWV stelt
              het percentage vast en beslist binnen 14 weken. Volgens UWV krijgt
              u meestal binnen 8 weken een brief.
            </Paragraph>
            <SourceLinks sources={[BRON.besluitLd4, BRON.wajong61]} />
          </>,
          [
            "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten",
            "heeft_recht_op_loondispensatie",
            "Loondispensatie",
          ],
        ),
      );

    if (id === "jc")
      return rij(
        id,
        uitleg(
          <Paragraph>
            De werknemer heeft recht op jobcoaching als die bij de doelgroep
            loonkostensubsidie hoort (Participatiewet, artikel 10da). Dat stelt
            de gemeente vast.
          </Paragraph>,
          [
            "participatiewet",
            "heeft_aanspraak_op_begeleiding_op_de_werkplek",
            "Jobcoaching",
          ],
        ),
      );

    return rij(
      id,
      uitleg(
        <Paragraph>
          De gemeente beslist of een aanpassing van de werkplek nodig is
          (Participatiewet, artikel 10).
        </Paragraph>,
        ["participatiewet", WPA_OUTPUT, "Werkplekaanpassing"],
      ),
    );
  };

  const taak = (id: TaakId): ReactNode => {
    if (id === "doelgroepverklaring")
      return rij(
        id,
        uitleg(
          <>
            <Paragraph>
              De werknemer vraagt de doelgroepverklaring aan bij UWV, binnen 3
              maanden na de start. Zonder verklaring geen loonkostenvoordeel
              (Wet tegemoetkomingen loondomein, artikel 2.7).
            </Paragraph>
            {situatie === "wia" &&
              hoeLang(
                "UWV beslist meestal binnen 8 weken. Ontbreekt er informatie? Dan beslist UWV binnen 13 weken.",
                [],
              )}
          </>,
        ),
      );
    if (id === "vz_wajong")
      return rij(
        id,
        uitleg(
          <Paragraph>
            De werknemer vraagt een jobcoach of een aangepaste werkplek zelf aan
            bij UWV (Wajong, artikel 2:22).
          </Paragraph>,
        ),
      );
    if (id === "vz_wia")
      return rij(
        id,
        uitleg(
          <Paragraph>
            De werknemer vraagt een jobcoach of een aangepaste werkplek zelf aan
            bij UWV (Wet WIA, artikel 35). Voor extra kosten kunt u zelf
            subsidie vragen bij UWV, als het dienstverband ten minste 6 maanden
            duurt (Wet WIA, artikel 36).
          </Paragraph>,
        ),
      );
    // De proefplaatsing ligt vóór de dienstbetrekking (Pwet 6 h) en de
    // toestemming gaat naar de kandidaat (8a lid 2 d): geen deel van de
    // aanvraag, die van een vaste eerste werkdag uitgaat.
    return rij(
      id,
      uitleg(
        <Paragraph>
          Onbetaald werk bij u vóór de eerste werkdag. Dat duurt 2 maanden; de
          gemeente kan dat met hoogstens 4 maanden verlengen (Participatiewet,
          artikel 8a lid 2 onder d). De kandidaat vraagt de gemeente om
          toestemming; dat gaat buiten deze aanvraag om.
        </Paragraph>,
        ["participatiewet", "mag_proefplaatsing_aangaan", "Proefplaatsing"],
      ),
    );
  };

  const vanzelf = (id: VanzelfId): ReactNode =>
    id === "lkv"
      ? rij(
          id,
          uitleg(
            <>
              <Paragraph>
                U zet het vakje loonkostenvoordeel aan in de loonaangifte; een
                aparte aanvraag is niet nodig (Wet tegemoetkomingen loondomein).
              </Paragraph>
              {lkv?.aanname && <Aanname id={lkv.aanname} />}
            </>,
            [
              "wet_tegemoetkomingen_loondomein",
              "heeft_recht_op_lkv",
              "Loonkostenvoordeel",
            ],
          ),
        )
      : rij(
          id,
          uitleg(
            <Paragraph>
              Wordt de werknemer ziek? Meld dat bij UWV, uiterlijk op de eerste
              dag na 6 weken ziekte (Ziektewet, artikel 38a lid 3). UWV betaalt
              dan ziekengeld (Ziektewet, artikel 29b).{" "}
              {duurTekst(nrp?.duurJaren)}
            </Paragraph>,
            ["ziektewet", "heeft_recht_op_no_risk_polis", "No-riskpolis"],
          ),
        );

  // De regelingen die bij deze antwoorden niet gelden. Jobcoaching en
  // werkplekaanpassing van de gemeente niet als UWV die al regelt.
  const viaUwv = rijIds.includes("vz_wajong") || rijIds.includes("vz_wia");
  const nietGeldend = (
    ["lks", "ld", "lkv", "nrp", "pp", "jc", "wpa"] as RegelingId[]
  ).filter(
    (id) => !rijIds.includes(id) && !(viaUwv && (id === "jc" || id === "wpa")),
  );

  // Eerst de regelingen met een bedrag, als laatste die met een keuze;
  // daartussen de rest, in de volgorde van de route.
  const volgorde = (id: RegelingId) =>
    id === "lks" || id === "ld" || id === "lkv"
      ? 0
      : id === "jc" || id === "wpa"
        ? 2
        : 1;
  const kaart = (id: RegelingId): ReactNode =>
    (paneelIds as RegelingId[]).includes(id)
      ? paneel(id as PaneelId)
      : (route.vanzelf as RegelingId[]).includes(id)
        ? vanzelf(id as VanzelfId)
        : taak(id as TaakId);

  // Afronden zonder iets te versturen. Bij WIA maakt dat de zaak aan (de
  // werknemer vraagt de verklaring aan). Daarna altijd de bedankpagina.
  const klaar = () => {
    // Met iets om te versturen kiest de ondernemer ten minste één regeling.
    if (!zonderAanvraag && aantalGekozen === 0) {
      setKiesFout((keer) => keer + 1);
      return;
    }
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
        undefined,
        perSituatie.wia.kandidaat.bsnMasker,
      );
    }
    // Zonder keuze gelden alle regelingen: de bedankpagina noemt ze allemaal.
    werkBij({
      afgerond: true,
      ...(zonderAanvraag
        ? {
            gecontroleerd: {
              ...g,
              ...Object.fromEntries(rijIds.map((id) => [id, true])),
            },
          }
        : {}),
    });
    router.push("/personeel/iemand-aannemen/verstuurd");
  };

  // Versturen staat onderaan deze stap: wat erheen gaat, naar wie, en de
  // bevestiging. Geen aparte pagina en geen nieuwe berekening.
  const uwv = situatie === "wajong";
  const demo = perSituatie[uwv ? "wajong" : "gemeente"];
  const verstuurt = paneelIds
    .filter(gekozen)
    .map((id) => NAAM[id].toLowerCase());
  const opsomming =
    verstuurt.length < 2
      ? (verstuurt[0] ?? "")
      : `${verstuurt.slice(0, -1).join(", ")} en ${verstuurt.at(-1)}`;

  const indienen = () => {
    // Minimaal één regeling.
    if (aantalGekozen === 0) {
      setKiesFout((keer) => keer + 1);
      return;
    }
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
    // Deze aanvraag is nu ingediend; een volgende begint opnieuw.
    werkBij({ aanvraagIngediend: true });
    zaakAanmaken(
      situatie,
      demo.zaak,
      "In behandeling",
      onderwerp,
      kandidaat.bsnMasker,
    );
    router.push("/personeel/iemand-aannemen/verstuurd");
  };

  if (isIngediend(staat))
    return (
      <>
        <Heading level={1}>{TAAK_TITEL}</Heading>
        <div className="rhc-mox-card">
          <Stappen huidige={2} />
          <AlIngediend />
        </div>
      </>
    );

  // Via de stappenbalk kan stap 2 open gaan zonder gekozen kandidaat of eerste
  // werkdag, zoals na een andere situatie in de voorbeeldberekening. Dan is er
  // niemand met toestemming om voor aan te vragen: eerst terug naar stap 1.
  if (
    bekend &&
    route.zaak !== null &&
    (staat.kandidaat !== kandidaat.bsnMasker || !a.aanvang)
  )
    return (
      <>
        <Heading level={1}>{TAAK_TITEL}</Heading>
        <div className="rhc-mox-card">
          <Stappen huidige={2} />
          <Paragraph>
            Kies eerst in stap 1 wie u wilt aannemen en vul de eerste werkdag
            in. Daarna controleert u hier de aanvraag.
          </Paragraph>
          <StepNavigation
            back="/personeel/iemand-aannemen/gegevens"
            backLabel={terugNaar(1)}
          />
        </div>
      </>
    );

  return (
    <>
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <div className="rhc-mox-card">
        <Stappen huidige={2} />
        {!bekend && !resultaat.fout ? (
          <LoadingStatus>Wij zoeken uit welke regelingen gelden…</LoadingStatus>
        ) : (
          // Met iets te versturen staat de uitleg onder Kies de regelingen.
          (resultaat.fout || paneelIds.length === 0) && (
            <Paragraph>
              {resultaat.fout
                ? "Wij kunnen de bedragen nu niet berekenen. Laad de pagina opnieuw."
                : rijIds.length === 0
                  ? "Bij deze antwoorden is er niets aan te vragen. Klopt een antwoord niet? Pas het dan aan in de voorbeeldberekening."
                  : overzichtTekst(route)}
            </Paragraph>
          )
        )}

        {bekend && rijIds.length > 0 && (
          <section className="rhc-mox-row-gap" aria-labelledby="regelingen">
            <Heading level={2} id="regelingen">
              {zonderAanvraag ? "Wat er geldt" : "Kies de regelingen"}
            </Heading>
            {/* Direct via Regelingen aanvragen: geen voorbeeldbedragen. */}
            {(!zonderAanvraag || staat.voorbeeldBerekend !== false) && (
              <Paragraph>
                {!zonderAanvraag &&
                  "Er gaat pas iets naar de gemeente of UWV als u verstuurt. "}
                {staat.voorbeeldBerekend !== false &&
                  "De voorbeeldbedragen zijn op basis van de voorbeeldberekening, de uitvoeringsorganisatie bepaalt het daadwerkelijke bedrag."}
              </Paragraph>
            )}
            <div
              className={
                kiesFout > 0 && aantalGekozen === 0
                  ? "rhc-mox-row-gap utrecht-form-field--invalid"
                  : "rhc-mox-row-gap"
              }
            >
              {kiesFout > 0 && aantalGekozen === 0 && (
                <div id="kies-fout" tabIndex={-1}>
                  <Alert type="error">
                    <Paragraph>
                      U heeft nog geen regeling gekozen. Kies ten minste één
                      regeling.
                    </Paragraph>
                  </Alert>
                </div>
              )}
              <ul className="rhc-mox-card-grid rhc-mox-card-grid--stacked">
                {[...rijIds]
                  .sort((x, y) => volgorde(x) - volgorde(y))
                  .map(kaart)}
              </ul>
              {nietGeldend.length > 0 && (
                <div className="rhc-mox-stack rhc-mox-stack--sm">
                  <Heading level={3}>Geldt niet bij uw antwoorden</Heading>
                  <UnorderedList>
                    {nietGeldend.map((id) => (
                      <UnorderedListItem key={id}>
                        <strong>{NAAM[id]}.</strong> {ALLEEN_VOOR[id]}
                      </UnorderedListItem>
                    ))}
                  </UnorderedList>
                </div>
              )}
            </div>
          </section>
        )}

        {bekend && rijIds.length > 0 && (
          <Controleer
            bronnen={bronnen}
            kandidaat={kandidaat}
            aanvang={a.aanvang}
            uren={a.uren}
            vraagEerder={vraagEerderInDienst(a)}
            eerderInDienst={a.eerderInDienst}
          />
        )}

        {bekend && paneelIds.length > 0 && verstuurt.length > 0 && (
          <section className="rhc-mox-row-gap" aria-labelledby="versturen">
            <Heading level={2} id="versturen">
              Versturen
            </Heading>
            <Paragraph>
              U verstuurt de aanvraag {opsomming}. De organisatie die de
              regeling uitvoert, beslist. U krijgt een ontvangstbevestiging met
              zaaknummer in uw berichtenbox en volgt het dossier in Lopende
              zaken.
            </Paragraph>
            <FormFieldCheckboxOption
              id="bevestiging"
              invalid={bevestigFout && !bevestigd}
              errorMessage={
                bevestigFout && !bevestigd
                  ? "U heeft nog niet bevestigd dat u alles naar waarheid heeft ingevuld."
                  : undefined
              }
              label="Ik heb alles naar waarheid ingevuld."
              name="bevestiging"
              checked={bevestigd}
              onChange={(event) => setBevestigd(event.target.checked)}
            />
            {/* Vlak voor Versturen: hoe lang het duurt. Geen gemiddelde; bij
                de gemeente noemt de wet geen termijn voor de meting. */}
            {(uwv || loonwaardeNogNiet) && (
              <Paragraph className="rhc-mox-small-text">
                {uwv
                  ? "UWV beslist binnen 14 weken. Volgens UWV krijgt u meestal binnen 8 weken een brief."
                  : `Een aanvraag duurt vaak een paar maanden. Eerst komt een loonwaardedeskundige kijken naar het werk van ${kandidaat.voornaam} op de werkplek. Daarna beslist de gemeente.`}
              </Paragraph>
            )}
          </section>
        )}

        {bekend && (
          <StepNavigation
            back="/personeel/iemand-aannemen/gegevens"
            backLabel={terugNaar(1)}
            later="/personeel"
            next={
              // Afronden als er niets naar de gemeente of UWV gaat: zonder
              // aanvraag, of met alleen regelingen zonder aanvraag gekozen.
              // Beide gaan naar de bedankpagina. Een ingediende aanvraag komt
              // hier niet (isIngediend hierboven); een nieuwe aanvraag voor
              // dezelfde situatie mag weer worden ingediend.
              {
                label:
                  verstuurt.length > 0 ||
                  (!zonderAanvraag && aantalGekozen === 0)
                    ? "Aanvraag versturen"
                    : "Afronden",
                onClick: verstuurt.length > 0 ? indienen : klaar,
                final: true,
                noIcon: true,
              }
            }
          />
        )}
      </div>
    </>
  );
};

export default Aanvraag;
