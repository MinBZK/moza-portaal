"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import type { DemoAannemen, DemoAannemenBron, DemoAannemenTrace } from "@/demo";
import Balans from "../_balans";
import Waarom from "../_waarom";
import {
  REGELINGEN,
  onderMinimumloon,
  useAannemen,
  uurloonTekst,
  type RegelingId,
} from "../_useAannemen";
import { datumNL, type Werkgever } from "../_werkgever";

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

/**
 * De vooringevulde aanvraag: per regeling een paneel met de gegevens en hun
 * bron, "Waarom deze uitkomst?" en een vinkje "gecontroleerd". Rechts wat het
 * oplevert, live uit de engine. Indienen kan pas als alle zes gecontroleerd zijn.
 */
const Aanvraag = ({
  aannemen,
  traces,
  bronnen,
  werkgever,
  ondernemer,
}: {
  aannemen: DemoAannemen;
  traces: Record<string, DemoAannemenTrace>;
  bronnen: DemoAannemenBron[];
  werkgever: Werkgever;
  ondernemer: string;
}) => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();
  const [fout, setFout] = useState(false);
  if (!staat) return null;
  const { kandidaat, dienstverband, labels } = aannemen;
  const a = staat.antwoorden;
  const g = staat.gecontroleerd;
  const k = staat.keuzes;
  const aantal = REGELINGEN.filter((id) => g[id]).length;
  const vind = (bronId: string, parameter: string) =>
    bronnen
      .find((b) => b.id === bronId)
      ?.gegevens.find((x) => x.parameter === parameter)?.waarde ?? "";

  const controleer = (id: RegelingId, aan: boolean) =>
    werkBij({ gecontroleerd: { ...g, [id]: aan } });
  const kies = (deel: typeof k) => werkBij({ keuzes: { ...k, ...deel } });

  const mist = (id: RegelingId) =>
    (id === "jc" && !k.jc) ||
    (id === "wpa" && !k.wpa) ||
    (id === "pp" && !k.pp);

  const status = (id: RegelingId) =>
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
  const vinkje = (id: RegelingId) => (
    <FormFieldCheckboxOption
      label="Ik heb dit gecontroleerd"
      name={`ok-${id}`}
      checked={!!g[id]}
      onChange={(event) => controleer(id, event.target.checked)}
    />
  );

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
    {
      label: "In het doelgroepregister",
      waarde: vind("uwv", "is_arbeidsbeperkte"),
      bron: "UWV doelgroepregister",
    },
    {
      label: "Woonplaats werknemer",
      waarde: `${kandidaat.woonplaats}, gemeente ${kandidaat.gemeente}`,
      bron: "Basisregistratie Personen",
    },
  ];
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

  const indienen = () => {
    if (aantal < REGELINGEN.length) {
      setFout(true);
      return;
    }
    setFout(false);
    router.push("/personeel/iemand-aannemen/indienen");
  };

  return (
    <>
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

      <div className="mox-hiring-progress">
        <label htmlFor="voortgang">Gecontroleerd</label>
        <progress id="voortgang" value={aantal} max={REGELINGEN.length} />
        <span>
          {aantal} van {REGELINGEN.length}
        </span>
      </div>

      {fout && aantal < REGELINGEN.length && (
        <Alert type="error">
          <Paragraph>
            Nog niet klaar om in te dienen. Controleer eerst:
          </Paragraph>
          <UnorderedList>
            {REGELINGEN.filter((id) => !g[id]).map((id) => (
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
          <details className="mox-hiring-panel" id="paneel-lks" open>
            <summary>
              <span>
                <Heading level={2}>Loonkostensubsidie</Heading>
                <span className="mox-hiring-note">
                  Gemeente waar de kandidaat woont
                </span>
              </span>
              {status("lks")}
            </summary>
            <div className="rhc-mox-row-gap">
              <Gegevens
                rijen={[...werkgeverRijen, ...werknemerRijen, ...dienstRijen]}
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
              <Waarom
                trace={traces["participatiewet:heeft_recht_op_lks"]}
                antwoorden={a}
                regeling="Loonkostensubsidie"
                kvk={werkgever.kvkNummer}
                labels={labels}
              />
              {vinkje("lks")}
            </div>
          </details>

          <details className="mox-hiring-panel" id="paneel-lkv">
            <summary>
              <span>
                <Heading level={2}>Loonkostenvoordeel</Heading>
                <span className="mox-hiring-note">UWV en Belastingdienst</span>
              </span>
              {status("lkv")}
            </summary>
            <div className="rhc-mox-row-gap">
              <Gegevens
                rijen={[
                  ...werkgeverRijen,
                  {
                    label: "Loonheffingennummer",
                    waarde: werkgever.loonheffingennummer,
                    bron: "Belastingdienst",
                  },
                  ...werknemerRijen.slice(0, 2),
                  {
                    label: "Verloonde uren per jaar",
                    waarde: `${a.uren * 52} (${a.uren} uur per week)`,
                    bron: "Uw antwoord",
                  },
                ]}
              />
              <Paragraph>
                U vraagt het loonkostenvoordeel aan door in de loonaangifte het
                vakje loonkostenvoordeel aan te zetten; een aparte verklaring is
                niet nodig. De Belastingdienst rekent het na afloop van het jaar
                uit.
              </Paragraph>
              <Waarom
                trace={
                  traces["wet_tegemoetkomingen_loondomein:heeft_recht_op_lkv"]
                }
                antwoorden={a}
                regeling="Loonkostenvoordeel"
                kvk={werkgever.kvkNummer}
                labels={labels}
              />
              {vinkje("lkv")}
            </div>
          </details>

          <details className="mox-hiring-panel" id="paneel-nrp">
            <summary>
              <span>
                <Heading level={2}>No-riskpolis</Heading>
                <span className="mox-hiring-note">
                  UWV, geen aanvraag nodig
                </span>
              </span>
              {status("nrp")}
            </summary>
            <div className="rhc-mox-row-gap">
              <Paragraph>
                Wordt {kandidaat.voornaam} ziek, dan betaalt UWV ziekengeld (70
                procent van het dagloon) in plaats van dat u het loon
                doorbetaalt. Dit geldt vanzelf, omdat {kandidaat.voornaam} in
                het doelgroepregister staat en de dienstbetrekking op of na 1
                januari 2015 begint. Bij ziekte meldt u {kandidaat.voornaam}{" "}
                ziek bij UWV.
              </Paragraph>
              <Gegevens rijen={werknemerRijen.slice(0, 2)} />
              <Waarom
                trace={traces["ziektewet:heeft_recht_op_no_risk_polis"]}
                antwoorden={a}
                regeling="No-riskpolis"
                kvk={werkgever.kvkNummer}
                labels={labels}
              />
              {vinkje("nrp")}
            </div>
          </details>

          <details className="mox-hiring-panel" id="paneel-jc">
            <summary>
              <span>
                <Heading level={2}>Jobcoaching</Heading>
                <span className="mox-hiring-note">
                  Gemeente waar de kandidaat woont
                </span>
              </span>
              {status("jc")}
            </summary>
            <div className="rhc-mox-row-gap">
              <Paragraph>
                Begeleiding op de werkvloer. Iedereen voor wie
                loonkostensubsidie geldt, heeft hier recht op (Participatiewet
                10da). U kiest of u er gebruik van maakt.
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
              <Waarom
                trace={
                  traces[
                    "participatiewet:heeft_aanspraak_op_begeleiding_op_de_werkplek"
                  ]
                }
                antwoorden={a}
                regeling="Jobcoaching"
                kvk={werkgever.kvkNummer}
                labels={labels}
              />
              {vinkje("jc")}
            </div>
          </details>

          <details className="mox-hiring-panel" id="paneel-wpa">
            <summary>
              <span>
                <Heading level={2}>Werkplekaanpassing</Heading>
                <span className="mox-hiring-note">
                  Gemeente waar de kandidaat woont
                </span>
              </span>
              {status("wpa")}
            </summary>
            <div className="rhc-mox-row-gap">
              <Paragraph>
                Vergoeding voor een aangepaste werkplek of een hulpmiddel. De
                gemeente beoordeelt de aanvraag; voor een kandidaat met een
                UWV-uitkering doet UWV dat (Wet WIA 35, boven het drempelbedrag
                van € 195,16).
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
              {vinkje("wpa")}
            </div>
          </details>

          <details className="mox-hiring-panel" id="paneel-pp">
            <summary>
              <span>
                <Heading level={2}>Proefplaatsing</Heading>
                <span className="mox-hiring-note">
                  Gemeente waar de kandidaat woont
                </span>
              </span>
              {status("pp")}
            </summary>
            <div className="rhc-mox-row-gap">
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
              <Waarom
                trace={traces["participatiewet:mag_proefplaatsing_aangaan"]}
                antwoorden={a}
                regeling="Proefplaatsing"
                kvk={werkgever.kvkNummer}
                labels={labels}
              />
              {vinkje("pp")}
            </div>
          </details>

          <section className="rhc-mox-card" aria-labelledby="paneel-ld">
            <Heading level={2} id="paneel-ld">
              Loondispensatie{" "}
              <span className="mox-hiring-label mox-hiring-label--not-applicable">
                Geldt niet
              </span>
            </Heading>
            <Paragraph>
              Alleen voor mensen met een Wajong-uitkering. {kandidaat.voornaam}{" "}
              valt onder de Participatiewet; daarvoor is loonkostensubsidie
              bedoeld.
            </Paragraph>
            <Waarom
              trace={
                traces[
                  "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten:heeft_recht_op_loondispensatie"
                ]
              }
              antwoorden={a}
              regeling="Loondispensatie"
              kvk={werkgever.kvkNummer}
              labels={labels}
            />
          </section>

          <ActionGroup>
            <Button appearance="primary-action-button" onClick={indienen}>
              Controleren en indienen
            </Button>
            <Link
              href="/personeel"
              className="utrecht-link utrecht-link--html-a"
            >
              Opslaan en later afronden
            </Link>
          </ActionGroup>
        </div>

        <aside
          className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-4 rhc-mox-row-gap"
          aria-label="Wat dit u oplevert"
        >
          <Balans antwoorden={a} traces={traces} kort />
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

const NAAM: Record<RegelingId, string> = {
  lks: "Loonkostensubsidie",
  lkv: "Loonkostenvoordeel",
  nrp: "No-riskpolis",
  jc: "Jobcoaching",
  wpa: "Werkplekaanpassing",
  pp: "Proefplaatsing",
};

export default Aanvraag;
