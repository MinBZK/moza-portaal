"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  ActionGroup,
  Alert,
  Button,
  DataSummary,
  DataSummaryItem,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import type { DemoAannemen } from "@/demo";
import basis from "../_basisfeiten.json";
import { Aanname, duurTekst, KorteBalans } from "../_balans";
import type { PaneelId, TaakId, VanzelfId } from "../_route";
import { routeVoor } from "../_route";
import Stappen from "../_stappen";
import { invoerVoor, type Feiten } from "../_uitkomsten";
import { useUitkomsten } from "../_useUitkomsten";
import Waarom from "../_waarom";
import {
  onderMinimumloon,
  useAannemen,
  uurloonTekst,
  type AannemenStaat,
  type RegelingId,
} from "../_useAannemen";
import { nieuweZaakStand, zaakAanmaken } from "../_zaakStart";
import { datumNL, euro, type Werkgever } from "../_werkgever";

type Gegeven = { label: string; waarde: string; bron: string };

const Tag = ({ tekst }: { tekst: string }) => (
  <span className="mox-hiring-tag">{tekst}</span>
);

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
  pp: "Proefplaatsing",
};

const TAAK: Record<TaakId, string> = {
  doelgroepverklaring: "Doelgroepverklaring aanvragen",
  vz_wajong: "Jobcoach of werkplekaanpassing aanvragen",
  vz_wia: "Jobcoach of werkplekaanpassing aanvragen",
};

const ORGANISATIE = { gemeente: "Naar de gemeente", uwv: "Naar UWV" } as const;

type Props = {
  perSituatie: Record<"gemeente" | "wajong" | "wia", DemoAannemen>;
  werkgever: Werkgever;
  ondernemer: string;
};

/**
 * De vooringevulde aanvraag volgt de route van de situatie: per organisatie
 * de panelen voor wat de werkgever zelf indient (met de gegevens en hun bron,
 * "Waarom deze uitkomst?" en een vinkje "gecontroleerd"), daaronder de taken
 * voor de werknemer en wat vanzelf of via de loonaangifte gaat. Rechts wat
 * het oplevert, live uit de engine. Indienen kan pas als alle panelen
 * gecontroleerd zijn; zonder panelen is er niets in te dienen.
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
  ondernemer,
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

  const controleer = (id: RegelingId, aanvinken: boolean) =>
    werkBij({ gecontroleerd: { ...g, [id]: aanvinken } });
  const kies = (deel: typeof k) => werkBij({ keuzes: { ...k, ...deel } });

  const mist = (id: PaneelId) =>
    (id === "jc" && !k.jc) ||
    (id === "wpa" && !k.wpa) ||
    (id === "pp" && !k.pp);

  const status = (id: PaneelId) =>
    g[id] ? (
      <span className="mox-hiring-label mox-hiring-label--done">
        Gecontroleerd
      </span>
    ) : (
      <span className="mox-hiring-label mox-hiring-label--todo">
        {mist(id) ? "Aanvullen" : "Controleren"}
      </span>
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
  const werknemerRijen: Gegeven[] = [
    {
      label: "Werknemer",
      waarde: `${kandidaat.voornaam} ${kandidaat.achternaam}`,
      bron: "UWV doelgroepregister",
    },
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
        : {
            label: "In het doelgroepregister",
            waarde: vind("uwv", "is_arbeidsbeperkte"),
            bron: "UWV doelgroepregister",
          },
  ];
  const woonplaatsRij: Gegeven = {
    label: "Woonplaats werknemer",
    waarde: `${kandidaat.woonplaats}, gemeente ${kandidaat.gemeente}`,
    bron: "Basisregistratie Personen",
  };
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

  const paneel = (id: PaneelId): ReactNode => {
    const kop = (note: string, kind: ReactNode) => (
      <details
        className="mox-hiring-panel"
        id={`paneel-${id}`}
        open={id === paneelIds[0]}
        key={id}
      >
        <summary>
          <span>
            <Heading level={3}>{NAAM[id]}</Heading>
            <span className="mox-hiring-note">{note}</span>
          </span>
          {status(id)}
        </summary>
        <div className="rhc-mox-row-gap">
          {kind}
          {vinkje(id)}
        </div>
      </details>
    );
    const gemeente = "Gemeente waar de kandidaat woont";

    if (id === "lks")
      return kop(
        gemeente,
        <>
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
              {
                label: "Regeling werknemer",
                waarde: "Participatiewet, doelgroep banenafspraak",
                bron: "UWV doelgroepregister",
              },
              {
                label: "Loonwaarde",
                waarde: onderMinimumloon(a)
                  ? `${a.loonwaarde} procent, uw schatting; de gemeente meet op de werkplek`
                  : "Kandidaat kan het werk zelfstandig doen; geen subsidie",
                bron: "Uw antwoord",
              },
            ]}
          />
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
                      bron: "Berekend door de engine",
                    },
                  ]
                : []),
            ]}
          />
          <div className="mox-hiring-note">
            Het percentage is een schatting.{" "}
            <InfoToggletip label="Toelichting bij het percentage">
              UWV stelt het percentage vast na een onderzoek op de werkplek. Dat
              kan hoger of lager uitvallen dan uw schatting. De aanspraak per
              uur verandert dan mee.
            </InfoToggletip>
          </div>
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
            Begeleiding op de werkvloer. Iedereen voor wie loonkostensubsidie
            geldt, heeft hier recht op (Participatiewet 10da). U kiest of u er
            gebruik van maakt.
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

    if (id === "wpa")
      return kop(
        gemeente,
        <>
          <Paragraph>
            Vergoeding voor een aangepaste werkplek of een hulpmiddel. De
            gemeente beoordeelt de aanvraag; voor een kandidaat met een
            UWV-uitkering doet UWV dat (Wet WIA 35, boven het drempelbedrag van
            € 195,16).
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
              label="Weet ik nog niet; later aanvragen"
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

    return kop(
      gemeente,
      <>
        <Paragraph>
          Eerst maximaal twee maanden op proef, met behoud van uitkering
          (Participatiewet 8a). Alleen vóór de eerste werkdag.
        </Paragraph>
        <Fieldset legend="Wilt u eerst een proefplaatsing?">
          <FormFieldRadio
            name="pp"
            value="ja"
            label="Ja, twee maanden"
            checked={k.pp === "ja"}
            onChange={() => kies({ pp: "ja" })}
          />
          <FormFieldRadio
            name="pp"
            value="nee"
            label="Nee, meteen in dienst"
            checked={k.pp === "nee"}
            onChange={() => kies({ pp: "nee" })}
          />
        </Fieldset>
        {waarom(
          "participatiewet",
          "mag_proefplaatsing_aangaan",
          "Proefplaatsing",
        )}
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
          De werknemer vraagt dit zelf aan bij UWV, als dat nodig is (Wajong
          2:22). U kunt niet namens de werknemer aanvragen in dit portaal.
        </Paragraph>
      )}
      {id === "vz_wia" && (
        <Paragraph>
          De werknemer vraagt dit zelf aan bij UWV, als dat nodig is (Wet WIA
          35). U kunt niet namens de werknemer aanvragen in dit portaal.
        </Paragraph>
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
          <p className="mox-hiring-amount">
            {euro(lkv.bedragPerJaar)}{" "}
            <span className="mox-hiring-note">per jaar</span>
          </p>
        )}
        {lkv?.aanname && <Aanname id={lkv.aanname} />}
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
          Wordt de werknemer ziek, dan betaalt UWV ziekengeld (70 procent van
          het dagloon) in plaats van dat u het loon doorbetaalt. Dit geldt
          vanzelf: u hoeft niets aan te vragen. {duurTekst(nrp?.duurJaren)} Bij
          ziekte meldt u de werknemer ziek bij UWV.
        </Paragraph>
        {waarom("ziektewet", "heeft_recht_op_no_risk_polis", "No-riskpolis")}
      </section>
    );

  // Zonder panelen is er niets in te dienen. Bij WIA maakt "Klaar" de zaak
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
    router.push("/personeel/iemand-aannemen/indienen");
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
          ? "De engine in de browser kan nu niet rekenen. Laad de pagina opnieuw."
          : !bekend
            ? "De regelrecht-engine rekent uit welke regelingen gelden…"
            : regelingen === 0
              ? "Bij deze antwoorden is er niets aan te vragen."
              : paneelIds.length === 0
                ? "U hoeft niets in te dienen. Hieronder staat wat de werknemer aanvraagt en wat vanzelf gaat."
                : `${regelingen} ${regelingen === 1 ? "regeling geldt" : "regelingen gelden"} voor deze situatie. Controleer per regeling de gegevens en vul aan wat nog ontbreekt.`}
      </Paragraph>

      <p className="mox-hiring-meta">
        <span className="mox-hiring-label">Vooringevuld</span>
        <Tag tekst={werkgever.onderneming} />
        <Tag
          tekst={
            staat.rol === "namens"
              ? `Ingevuld namens ${werkgever.onderneming}`
              : `Ingevuld door ${ondernemer}`
          }
        />
        <Tag tekst="Nog niet ingediend" />
      </p>

      {paneelIds.length > 0 && (
        <div className="mox-hiring-progress">
          <label htmlFor="voortgang">Gecontroleerd</label>
          <progress id="voortgang" value={aantal} max={paneelIds.length} />
          <span>
            {aantal} van {paneelIds.length}
          </span>
        </div>
      )}

      {fout && aantal < paneelIds.length && (
        <Alert type="error">
          <Paragraph>
            Nog niet klaar om in te dienen. Controleer eerst:
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
                {groep.ids.map(paneel)}
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
            <ActionGroup>
              <Button
                appearance="primary-action-button"
                onClick={paneelIds.length > 0 ? indienen : klaar}
              >
                {paneelIds.length > 0 ? "Controleren en indienen" : "Klaar"}
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

        <aside
          className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-4 rhc-mox-row-gap"
          aria-label="Wat dit u oplevert"
        >
          <KorteBalans antwoorden={a} resultaat={resultaat} />
          <Heading level={2}>Wie ziet deze aanvraag?</Heading>
          <Paragraph>
            Alleen u. Er is nog niets naar de overheid gestuurd.
          </Paragraph>
          <Paragraph className="mox-hiring-note">
            Uw aanvraag is opgeslagen in deze browser. U kunt later verder.
          </Paragraph>
        </aside>
      </div>
    </>
  );
};

export default Aanvraag;
