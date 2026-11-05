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
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import ProgressBar from "@/components/ProgressBar";
import TextBadge, { type TextBadgeVariant } from "@/components/TextBadge";
import type { DemoAannemen } from "@/demo";
import basis from "../_basisfeiten.json";
import { Aanname, duurTekst, LkvVoorbehoud } from "../_balans";
import type { PaneelId, TaakId, VanzelfId } from "../_route";
import { routeVoor } from "../_route";
import Stappen from "../_stappen";
import { TAAK_TITEL } from "../_taakTitel";
import { loonkostenPerJaar } from "../_engine";
import { balansRegels, invoerVoor, type Feiten } from "../_uitkomsten";
import { useUitkomsten } from "../_useUitkomsten";
import Waarom from "../_waarom";
import {
  onderMinimumloon,
  useAannemen,
  type AannemenStaat,
  type RegelingId,
} from "../_useAannemen";
import { nieuweZaakStand, zaakAanmaken } from "../_zaakStart";
import { datumNL, euro, type Werkgever } from "../_werkgever";
import PageSearch from "@/layouts/search";

type Gegeven = { label: string; waarde: string; bron: string };

/** De gegevens in twee kolommen, met de bron als label onder de waarde. */
const Gegevens = ({ rijen }: { rijen: Gegeven[] }) => (
  <DataSummary appearance="column" className="rhc-data-summary--columns">
    {/* Zoals bij Bedrijfsgegevens: de waarde bevat een label, dus geen DataSummaryItem. */}
    {rijen.map((r) => (
      <div key={r.label} className="rhc-data-summary__item">
        <dt className="rhc-data-summary__item-key">{r.label}</dt>
        <dd className="rhc-data-summary__item-value">
          {r.waarde} <TextBadge>{r.bron}</TextBadge>
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

/** Wat de organisatie zelf beoordeelt voordat die beslist; dicht tot de gebruiker erom vraagt. */
const Beoordeling = ({
  titel,
  open,
  onWissel,
  children,
}: {
  titel: string;
  open: boolean;
  onWissel: () => void;
  children: ReactNode;
}) => (
  <Accordion>
    <AccordionSection
      headingLevel={4}
      label={titel}
      // Het type eist `body`, de component rendert alleen `children`.
      body={null}
      expanded={open}
      onActivate={onWissel}
    >
      <div className="rhc-mox-stack">{children}</div>
    </AccordionSection>
  </Accordion>
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
  // Alle regelingen in één lijst: eerst wat u indient, dan wat vanzelf gaat,
  // dan de taken van de werknemer.
  const rijIds: RegelingId[] = [...paneelIds, ...route.vanzelf, ...route.taken];
  const aantal = rijIds.filter((id) => g[id]).length;
  const lkv = uitkomsten.regels.find((r) => r.id === "lkv");
  const ld = uitkomsten.regels.find((r) => r.id === "ld");
  const nrp = uitkomsten.overige.find((o) => o.id === "nrp");

  const kies = (deel: typeof k) => werkBij({ keuzes: { ...k, ...deel } });

  const isPaneel = (id: RegelingId): id is PaneelId =>
    (paneelIds as RegelingId[]).includes(id);
  const mist = (id: RegelingId) =>
    (id === "jc" && !k.jc) || (id === "wpa" && !k.wpa);

  const status = (id: RegelingId): Status =>
    g[id]
      ? isPaneel(id)
        ? "gecontroleerd"
        : "gelezen"
      : mist(id)
        ? "aanvullen"
        : "controleren";

  // Welke regelingen openstaan. Zolang de gebruiker niets open- of
  // dichtklapte, staat de eerste die nog niet gecontroleerd is open.
  const [open, setOpen] = useState<string[] | null>(null);
  const [melding, setMelding] = useState("");
  const eerste = rijIds.find((id) => !g[id]);
  const openIds: string[] = open ?? (eerste ? [eerste] : []);
  const isOpen = (id: string) => openIds.includes(id);
  const wissel = (id: string) =>
    setOpen(isOpen(id) ? openIds.filter((x) => x !== id) : [...openIds, id]);

  // Het vinkje legt alleen vast. Verder gaan doet de gebruiker zelf met de
  // knop eronder, zodat de focus niet verspringt (WCAG 3.2.2).
  const controleer = (id: RegelingId, aanvinken: boolean) => {
    // Leg vast wat nu open is, anders schuift de standaard mee en klapt deze
    // regeling dicht terwijl de focus erin staat.
    setOpen(openIds);
    werkBij({ gecontroleerd: { ...g, [id]: aanvinken } });
    const wat = isPaneel(id) ? "gecontroleerd" : "gelezen";
    setMelding(
      aanvinken ? `${NAAM[id]} is ${wat}.` : `${NAAM[id]} is nog niet ${wat}.`,
    );
  };
  const volgendeVan = (id: RegelingId) => rijIds.find((x) => x !== id && !g[x]);
  // Deze regeling gaat dicht, de volgende open, en de focus gaat naar de kop
  // van de volgende regeling of naar Controleren en versturen.
  const naarVolgende = (id: RegelingId) => {
    const volgende = volgendeVan(id);
    setOpen(volgende ? [volgende] : []);
    requestAnimationFrame(() => {
      const doel = document.querySelector<HTMLElement>(
        volgende ? `#paneel-${volgende} [aria-expanded]` : "#versturen button",
      );
      doel?.focus();
      doel?.scrollIntoView({ block: "start" });
    });
  };

  // Een gewone functie, geen component: een component in de render zou bij
  // elke wijziging opnieuw worden aangemaakt.
  const vinkje = (id: RegelingId) => (
    <>
      <FormFieldCheckboxOption
        label={
          isPaneel(id) ? "Ik heb dit gecontroleerd en het klopt" : "Gelezen"
        }
        name={`ok-${id}`}
        checked={!!g[id]}
        onChange={(event) => controleer(id, event.target.checked)}
      />
      {g[id] && (
        <ActionGroup>
          <Button
            appearance="secondary-action-button"
            onClick={() => naarVolgende(id)}
          >
            {volgendeVan(id)
              ? `Naar ${NAAM[volgendeVan(id)!].toLowerCase()}`
              : "Naar versturen"}
          </Button>
        </ActionGroup>
      )}
    </>
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
    // Uitkeringsgegevens ziet de werkgever niet; UWV controleert ze zelf.
    situatie === "wajong" || situatie === "wia"
      ? {
          label: "Uitkering van de werknemer",
          waarde: "UWV controleert dit zelf",
          bron: "niet met u gedeeld",
        }
      : inRegister
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
    },
    { label: "Uren per week", waarde: String(a.uren), bron: "Uw antwoord" },
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
        <Paragraph className="rhc-mox-small-text">
          <TextBadge variant={STATUS[status(id)].variant}>
            {STATUS[status(id)].tekst}
          </TextBadge>{" "}
          {wie}
        </Paragraph>
        {kind}
        {vinkje(id)}
      </div>
    </AccordionSection>
  );

  const voorbeeldbedrag = (id: "lks" | "ld") => {
    const bedrag = bedragVan(id);
    return bedrag === undefined ? null : (
      <Paragraph>
        Voorbeeldbedrag: <strong>{euro(bedrag)}</strong> per jaar, met uw
        antwoorden. De beslissing neemt de organisatie die de regeling uitvoert.
      </Paragraph>
    );
  };

  const paneel = (id: PaneelId): ReactNode => {
    const kop = (note: string, kind: ReactNode) => rij(id, note, kind);
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
          {voorbeeldbedrag("lks")}
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
                    {
                      label: "Regeling werknemer",
                      waarde: "Doelgroep banenafspraak",
                      bron: "UWV doelgroepregister",
                    },
                  ]
                : []),
            ]}
          />
          <Paragraph>
            U vraagt de loonkostensubsidie aan uiterlijk zes maanden na de
            eerste werkdag ({datumNL(a.aanvang ?? dienstverband.aanvang)}). Dat
            staat in de Participatiewet, artikel 10d lid 2.
          </Paragraph>
          <Beoordeling
            titel={`Wat de gemeente ${kandidaat.gemeente} zelf beoordeelt`}
            open={isOpen("beoordeelt-lks")}
            onWissel={() => wissel("beoordeelt-lks")}
          >
            <UnorderedList>
              <UnorderedListItem>
                <strong>Of {kandidaat.voornaam} bij de doelgroep hoort.</strong>{" "}
                Dat is zo als {kandidaat.voornaam} met een volledige baan niet
                het minimumloon kan verdienen (Participatiewet, artikel 6,
                onderdeel e, en artikel 10c).
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
                Is {kandidaat.voornaam} al begonnen? Dan stelt de gemeente de
                loonwaarde vast voordat zij beslist (Participatiewet, artikel
                10d lid 2 en lid 4).
              </UnorderedListItem>
              <UnorderedListItem>
                Vraagt u aan voordat {kandidaat.voornaam} begint? Dan kunt u met
                de gemeente afspreken dat de meting eerst niet nodig is. U
                krijgt dan ten hoogste de eerste zes maanden een vast bedrag: 50
                procent van het minimumloon met vakantiegeld, naar verhouding
                van de uren, plus een vergoeding voor werkgeverslasten. Daarna
                stelt de gemeente de loonwaarde vast (artikel 10d lid 1
                onderdeel b en lid 5). In Rotterdam is die meting dan in de
                vijfde maand van het dienstverband (werkwijze van de gemeente
                Rotterdam).
              </UnorderedListItem>
              <UnorderedListItem>
                De gemeente spreekt met u en {kandidaat.voornaam} af wanneer zij
                de loonwaarde opnieuw meet (artikel 10d lid 6).
              </UnorderedListItem>
            </UnorderedList>
            <Paragraph>
              U krijgt een brief van de gemeente. Daarin staat of u
              loonkostensubsidie krijgt en hoeveel. Is {kandidaat.voornaam} al
              begonnen? Dan krijgt u de brief <strong>binnen acht weken</strong>{" "}
              na uw aanvraag (Algemene wet bestuursrecht, artikel 4:13). Vraagt
              u aan voordat {kandidaat.voornaam} begint? Dan beslist de gemeente{" "}
              <strong>binnen vijf weken</strong> nadat zij de loonwaarde heeft
              vastgesteld of heeft afgesproken dat de meting eerst niet nodig is
              (Participatiewet, artikel 10d lid 12).
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
          {voorbeeldbedrag("ld")}
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
          <Paragraph>
            Na uw aanvraag komt een arbeidsdeskundige van UWV meestal op de
            werkplek. Die praat met u en met {kandidaat.voornaam}. UWV stuurt u{" "}
            <strong>binnen acht weken</strong> na de aanvraag een brief met het
            besluit.
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
            De werknemer vraagt de doelgroepverklaring zelf aan bij UWV, binnen
            drie maanden na de start. U bewaart de verklaring bij de
            loonadministratie. Zonder verklaring kunt u het loonkostenvoordeel
            niet krijgen (Wet tegemoetkomingen loondomein 2.7).
          </Paragraph>
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
            namens de werknemer aanvragen in dit portaal. Duurt het
            dienstverband ten minste zes maanden, dan kunt u bij UWV zelf
            subsidie vragen voor de extra kosten van voorzieningen (Wet WIA 36).
            Daarvoor gelden meer voorwaarden. De kosten moeten bijvoorbeeld
            hoger zijn dan een drempelbedrag. UWV beslist of u de subsidie
            krijgt.
          </Paragraph>
        )}
        {/* De proefplaats ligt vóór de dienstbetrekking (Pwet 6 h) en de
            toestemming gaat naar de kandidaat (8a lid 2 d): geen deel van de
            aanvraag, die van een vaste eerste werkdag uitgaat. */}
        {id === "pp" && (
          <>
            <Paragraph>
              Een proefplaats is onbetaald werk bij u, vóór de eerste werkdag.
              De proefplaats duurt twee maanden. Verlengen kan met ten hoogste
              vier maanden (Participatiewet 8a). De gemeente geeft de
              toestemming aan de kandidaat, omdat de kandidaat bijstand krijgt.
              De gemeente heeft daarvoor eigen regels.
            </Paragraph>
            <Paragraph>
              Wilt u eerst een proefplaats? Dan vraagt de kandidaat de gemeente
              om toestemming, vóór de eerste werkdag. Dat gaat buiten deze
              aanvraag om. Of een proefplaats en loonkostensubsidie samen
              kunnen, staat nog niet vast.
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
            {lkv && (
              <Paragraph>
                Voorbeeldbedrag: <strong>{euro(lkv.bedragPerJaar)}</strong> per
                jaar.
              </Paragraph>
            )}
            {lkv?.aanname && <Aanname id={lkv.aanname} />}
            <LkvVoorbehoud categorie={lkv?.categorie} />
            <Paragraph>
              U vraagt het loonkostenvoordeel aan door in de loonaangifte het
              vakje loonkostenvoordeel aan te zetten; een aparte aanvraag is
              niet nodig.
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
          </>,
        )
      : rij(
          id,
          "UWV, geen aanvraag nodig",
          <>
            <Paragraph>
              Wordt de werknemer ziek? Dan betaalt u het loon door. UWV betaalt
              u ziekengeld voor de werknemer: 70 procent van het dagloon
              (Ziektewet 29b). In de eerste 52 weken van de ziekte kunt u UWV
              vragen om het hele dagloon. Het ziekengeld is dan niet hoger dan
              het loon. U hoeft de no-riskpolis niet aan te vragen.{" "}
              {duurTekst(nrp?.duurJaren)} Bij ziekte meldt u de werknemer ziek
              bij UWV.
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
    if (aantal < rijIds.length) {
      setFout(true);
      return;
    }
    setFout(false);
    router.push("/personeel/iemand-aannemen/versturen");
  };

  return (
    <>
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <PageSearch />
      <div className="rhc-mox-card">
        <Stappen huidige={4} />
        <Paragraph role={bekend ? undefined : "status"}>
          {resultaat.fout
            ? "De berekening lukt nu niet. Laad de pagina opnieuw."
            : !bekend
              ? "Wij zoeken in de wet uit welke regelingen gelden…"
              : rijIds.length === 0
                ? "Bij deze antwoorden is er niets aan te vragen."
                : paneelIds.length === 0
                  ? "U hoeft niets te versturen. Hieronder staat wat de werknemer aanvraagt en wat vanzelf gaat."
                  : `Wij hebben ${paneelIds.length === 1 ? "de aanvraag" : `${paneelIds.length} aanvragen`} voor u ingevuld met gegevens die de overheid al heeft. Controleer per regeling de gegevens en vul aan wat nog ontbreekt.`}
        </Paragraph>
        <Paragraph className="rhc-mox-small-text">
          Alleen u ziet deze aanvraag. Er is nog niets naar de gemeente of UWV
          gestuurd. Vraagt u bij een regeling om uitleg in gewone taal? Dan gaan
          de gegevens van die uitkomst naar de digitale assistent. Uw antwoorden
          worden niet bewaard: sluit u de browser, dan begint u opnieuw.
        </Paragraph>

        {bekend && rijIds.length > 0 && (
          <section className="rhc-mox-row-gap" aria-labelledby="regelingen">
            <Heading level={2} id="regelingen">
              Regelingen
            </Heading>
            <div className="rhc-mox-stack rhc-mox-stack--sm">
              <Paragraph>
                Gecontroleerd: {aantal} van {rijIds.length}
              </Paragraph>
              <ProgressBar
                label="Gecontroleerd"
                value={aantal}
                max={rijIds.length}
                valueText={`${aantal} van ${rijIds.length}`}
              />
              <Paragraph role="status" className="rhc-mox-small-text">
                {melding}
              </Paragraph>
            </div>

            {fout && aantal < rijIds.length && (
              <Alert type="error">
                <Paragraph>
                  Nog niet klaar om te versturen. Controleer eerst:
                </Paragraph>
                <UnorderedList>
                  {rijIds
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
                <UnorderedListItem key={r.id}>
                  {NAAM[r.id]} <TextBadge>Geldt niet</TextBadge>
                </UnorderedListItem>
              ))}
            </UnorderedList>
          </section>
        )}

        {bekend && (
          <ActionGroup id="versturen">
            <Button
              appearance="primary-action-button"
              onClick={paneelIds.length > 0 ? indienen : klaar}
            >
              {paneelIds.length > 0 ? "Controleren en versturen" : "Klaar"}
            </Button>
            <Link
              href="/personeel"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
            >
              Sla op en ga later verder
            </Link>
          </ActionGroup>
        )}
      </div>
    </>
  );
};

export default Aanvraag;
