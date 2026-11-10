"use client";

import LoadingStatus from "@/components/LoadingStatus";
import StepNavigation from "@/components/StepNavigation";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
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
import { BegripInfo, BEGRIP, NAAM } from "../_begrippen";
import Controleer from "../_opgehaald";
import Stappen, { TAAK_TITEL, terugNaar } from "../_stappen";
import { loonkostenPerJaar } from "../_engine";
import { balansRegels, invoerVoor, type Feiten } from "../_uitkomsten";
import { useUitkomsten } from "../_useUitkomsten";
import Waarom from "../_waarom";
import {
  useAannemen,
  vraagEerderInDienst,
  type AannemenStaat,
  type RegelingId,
} from "../_useAannemen";
import { INGEDIEND_OP, nieuweZaakStand, zaakAanmaken } from "../_zaakStart";
import { datumNL, euroHeel, type Werkgever } from "../_werkgever";

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
  const aantalGekozen = rijIds.filter(gekozen).length;
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

  const balans = balansRegels(uitkomsten, loonkostenPerJaar(a));
  const bedragVan = (id: "lks" | "ld" | "lkv") =>
    balans.find((r) => r.id === id && r.status === "bedrag")?.bedrag;
  // Eén kaart per regeling: de naam als kop, wie de regeling uitvoert, wat het
  // is, en onderaan een vinkje om te kiezen (niet zonder aanvraag).
  const rij = (id: RegelingId, wie: string, kind: ReactNode) => (
    <li
      key={id}
      id={`regeling-${id}`}
      className={`rhc-mox-card${!zonderAanvraag && gekozen(id) ? " rhc-mox-card--selected" : ""}`}
    >
      <div className="rhc-mox-cluster">
        <Heading level={3}>{NAAM[id]}</Heading>
        {BEGRIP[id].map((b) => (
          <BegripInfo key={b} id={b} />
        ))}
      </div>
      <Paragraph className="rhc-mox-small-text">{wie}</Paragraph>
      {kind}
      {/* De naam van de regeling alleen voor schermlezers: elk vinkje heet
          anders, ook buiten de kaart, zoals in een lijst met formuliervelden. */}
      {!zonderAanvraag && (
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
      )}
    </li>
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
            (Participatiewet, artikel 10d). De gemeente beslist of u die krijgt.
          </Paragraph>
          {voorbeeldbedrag("lks")}
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
            daar recht op als die bij de doelgroep loonkostensubsidie hoort
            (Participatiewet, artikel 10da). Dat stelt de gemeente vast.
          </Paragraph>
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
  const naarWie = uwv ? "UWV" : `de gemeente ${kandidaat.gemeente}`;
  const bestaand = staat.zaken[situatie];
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
    zaakAanmaken(situatie, demo.zaak, "In behandeling", onderwerp);
    router.push("/personeel/iemand-aannemen/verstuurd");
  };

  // Via de stappenbalk kan stap 2 open gaan zonder gekozen kandidaat of eerste
  // werkdag, zoals na een andere situatie in de voorbeeldberekening. Dan is er
  // niemand met toestemming om voor aan te vragen: eerst terug naar stap 1.
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
                  : "Controleer de gegevens en kies de regelingen."}
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
              {zonderAanvraag ? "Wat er geldt" : "Kies de regelingen"}
            </Heading>
            {!zonderAanvraag && (
              <Paragraph>Kies ten minste één regeling.</Paragraph>
            )}
            {kiesFout > 0 && aantalGekozen === 0 && (
              <div id="kies-fout" tabIndex={-1}>
                <Alert type="error">
                  <Paragraph>
                    U hebt nog geen regeling gekozen. Vink ten minste één
                    regeling aan.
                  </Paragraph>
                </Alert>
              </div>
            )}
            <ul className="rhc-mox-card-grid">
              {paneelIds.map(paneel)}
              {route.vanzelf.map(vanzelf)}
              {route.taken.map(taak)}
            </ul>
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
            backLabel={terugNaar(1)}
            later="/personeel"
            next={
              paneelIds.length > 0 && bestaand?.ingediend
                ? { label: "Bekijk de zaak", href: demo.zaak.url }
                : // Afronden als er niets naar de gemeente of UWV gaat: zonder
                  // aanvraag, of met alleen regelingen zonder aanvraag gekozen.
                  // Beide gaan naar de bedankpagina.
                  {
                    label:
                      verstuurt.length > 0 ||
                      (!zonderAanvraag && aantalGekozen === 0)
                        ? "Dossier indienen"
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
