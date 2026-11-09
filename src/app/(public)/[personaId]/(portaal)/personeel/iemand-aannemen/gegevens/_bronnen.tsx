"use client";

import StepNavigation from "@/components/StepNavigation";
import RangeSlider from "@/components/RangeSlider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BegripInfo } from "../_begrippen";
import { overKandidaat } from "../_opgehaald";
import {
  ActionGroup,
  Button,
  Fieldset,
  FormFieldErrorMessage,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import {
  eigenOpgaveCompleet,
  STANDAARD_ANTWOORDEN,
  useAannemen,
  type AannemenStaat,
  type Antwoorden,
} from "../_useAannemen";
import { routeVoor, situatieVan } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { datumNL } from "../_werkgever";
import { verderNaar } from "../_stappen";

const NIEUW = "nieuw";

/** Negen cijfers en de elfproef van het BSN. */
const elfproef = (bsn: string) => {
  if (!/^\d{9}$/.test(bsn)) return false;
  const som = [...bsn].reduce(
    (t, c, i) => t + Number(c) * (i === 8 ? -1 : 9 - i),
    0,
  );
  return som % 11 === 0;
};

/**
 * Wat alleen de werkgever weet: de eerste werkdag, de functie, de uren en het
 * loon. Vooringevuld met de antwoorden van de voorbeeldberekening waar die er zijn; nu
 * definitief. De loonwaarde staat hier niet: die stelt de gemeente of UWV
 * vast, niet de werkgever.
 */
const EigenOpgave = ({
  voornaam,
  a,
  zet,
  keuzes,
  kies,
  vraagJc,
  vraagWpa,
  aanvangFout,
}: {
  voornaam: string;
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
  keuzes: AannemenStaat["keuzes"];
  kies: (deel: AannemenStaat["keuzes"]) => void;
  /** Alleen als jobcoaching of werkplekaanpassing bij de aanvraag hoort. */
  vraagJc: boolean;
  vraagWpa: boolean;
  aanvangFout?: string;
}) => (
  // Onder de gekozen kandidaat, ingesprongen: deze vragen gaan over die persoon.
  <div
    id="eigen-opgave"
    role="group"
    aria-label={`Over ${voornaam}`}
    className="rhc-mox-stack rhc-mox-reveal"
  >
    <FormFieldTextInput
      id="eerste-werkdag"
      name="aanvang"
      type="date"
      label={`Wat is de eerste werkdag van ${voornaam}?`}
      invalid={!!aanvangFout}
      errorMessage={aanvangFout}
      value={a.aanvang ?? ""}
      onChange={(event) =>
        zet({
          aanvang: (event.target as HTMLInputElement).value || undefined,
        })
      }
    />
    {/* Dezelfde vraag als in de voorbeeldberekening, nu definitief. */}
    <RangeSlider
      label={`Hoeveel uur per week gaat ${voornaam} werken?`}
      min={1}
      max={40}
      step={1}
      value={a.uren}
      onChange={(uren) => zet({ uren })}
      formatValue={(uren) => `${uren} uur`}
      filled
    />
    {/* Keuzes voor de aanvraag horen hier; stap 2 controleert alleen. */}
    {vraagJc && (
      <Fieldset
        legend="Wilt u jobcoaching aanvragen?"
        info={<BegripInfo id="jobcoaching" />}
      >
        <FormFieldRadio
          name="jc"
          value="ja"
          label="Ja, via de gemeente"
          checked={keuzes.jc === "ja"}
          onChange={() => kies({ jc: "ja" })}
        />
        <FormFieldRadio
          name="jc"
          value="nee"
          label="Nee, niet nodig"
          checked={keuzes.jc === "nee"}
          onChange={() => kies({ jc: "nee" })}
        />
      </Fieldset>
    )}
    {vraagWpa && (
      <Fieldset
        legend="Is er een aanpassing van de werkplek nodig?"
        info={<BegripInfo id="werkplekaanpassing" />}
      >
        <FormFieldRadio
          name="wpa"
          value="ja"
          label="Ja, ik weet wat er nodig is"
          checked={keuzes.wpa === "ja"}
          onChange={() => kies({ wpa: "ja" })}
        />
        <FormFieldRadio
          name="wpa"
          value="later"
          label="Weet ik nog niet, ik vraag het later aan"
          checked={keuzes.wpa === "later"}
          onChange={() => kies({ wpa: "later" })}
        />
        <FormFieldRadio
          name="wpa"
          value="nee"
          label="Nee"
          checked={keuzes.wpa === "nee"}
          onChange={() => kies({ wpa: "nee" })}
        />
      </Fieldset>
    )}
  </div>
);

/**
 * De kandidaat kiezen of toevoegen, en het omgekeerde formulier:
 * alles wat de overheid al weet in een tabel, per bron een vinkje dat
 * standaard aan staat. De werkgever geeft de werknemer op met naam en BSN, zoals
 * nu bij de gemeente en UWV; de organisaties kijken met het BSN in hun eigen
 * gegevens. De grond van registratie in het doelgroepregister ziet de
 * werkgever niet: UWV geeft alleen ja of nee.
 */
const Bronnen = ({
  perSituatie,
}: {
  perSituatie: Record<"gemeente" | "wajong" | "wia", DemoAannemen>;
}) => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();
  const situatie = situatieVan(staat?.antwoorden.doelgroepen ?? []);
  // Zonder iets om aan te vragen gaat de route na de gegevens naar het overzicht.
  const antwoorden = staat?.antwoorden ?? STANDAARD_ANTWOORDEN;
  const resultaat = useUitkomsten(antwoorden);
  // Zonder aanvraag (alleen register of uitleg) gaat het BSN nergens mee.
  const route = resultaat.bekend
    ? routeVoor(antwoorden.doelgroepen, resultaat.uitkomsten)
    : undefined;
  const geenAanvraag = !!route?.overzicht;
  const paneelIds = route?.panelen.flatMap((p) => p.ids) ?? [];
  const { bronnen, kandidaat } =
    perSituatie[
      situatie === "wajong" || situatie === "wia" ? situatie : "gemeente"
    ];
  const [nieuw, setNieuw] = useState({ naam: "", bsn: "" });
  // Een BSN heeft negen cijfers en voldoet aan de elfproef.
  const bsn = nieuw.bsn.trim();
  const bsnGoed = elfproef(bsn);
  // De melding pas na het verlaten van het veld, niet tijdens het typen.
  const [bsnGezien, setBsnGezien] = useState(false);
  const bsnFout =
    bsn === "" || bsnGoed
      ? undefined
      : /^\d{9}$/.test(bsn)
        ? "Dit BSN klopt niet. Controleer het nummer."
        : "Een BSN heeft negen cijfers. Controleer het nummer.";
  const keuze = staat?.kandidaat;
  const nieuwe = staat?.kandidatenNieuw ?? [];
  const gekozen = keuze === kandidaat.bsnMasker;
  const wachtend = nieuwe.find((k) => k.naam === keuze);
  // De loonwaarde is nog niet gemeten als de gemeente dat zo opgeeft.
  const loonwaardeNogNiet = bronnen.some((b) =>
    b.gegevens.some(
      (g) =>
        g.parameter === "college_heeft_loonwaarde_vastgesteld" &&
        g.waarde.startsWith("Nog niet"),
    ),
  );
  // Hoe lang het kan duren voordat de werkgever weet waar die aan toe is:
  // alleen termijnen uit de wet of van UWV, geen gemiddelde.
  const duur = [
    ...(situatie === "gemeente" && loonwaardeNogNiet
      ? [
          `De loonwaarde van ${kandidaat.voornaam} is nog niet gemeten. Een deskundige van de gemeente meet die op de werkplek, als ${kandidaat.voornaam} is ingewerkt. Een vaste wachttijd daarvoor is er niet. Daarna beslist de gemeente uiterlijk acht weken na uw aanvraag (Algemene wet bestuursrecht, artikel 4:13).`,
        ]
      : []),
    ...(situatie === "wajong"
      ? [
          "Voor loondispensatie komt een arbeidsdeskundige van UWV meestal op de werkplek. UWV beslist binnen acht weken na uw aanvraag.",
        ]
      : []),
    ...(situatie === "wia"
      ? [
          "De werknemer vraagt de doelgroepverklaring aan bij UWV. UWV beslist binnen acht weken, of binnen dertien weken als er informatie ontbreekt.",
        ]
      : []),
  ];
  const opgave = eigenOpgaveCompleet(antwoorden);
  const naam = `${kandidaat.voornaam} ${kandidaat.achternaam}`;
  const { wie, meer, eigen } = overKandidaat(bronnen, situatie);

  // The first thing that still stops Verder, in the order of the form.
  const ontbreekt:
    "kandidaat" | "naam" | "bsn" | "toestemming" | "aanvang" | undefined =
    gekozen
      ? opgave
        ? undefined
        : "aanvang"
      : keuze !== NIEUW
        ? "kandidaat"
        : !nieuw.naam.trim()
          ? "naam"
          : !bsnGoed
            ? "bsn"
            : "toestemming";
  // Set when Verder is clicked; the message shows while that part is missing.
  const [foutBij, setFoutBij] = useState<typeof ontbreekt>();
  const fout = foutBij && foutBij === ontbreekt ? foutBij : undefined;
  const kandidaatFout =
    fout === "kandidaat"
      ? wachtend
        ? "Deze kandidaat heeft nog geen toestemming gegeven. Kies een kandidaat met toestemming."
        : "U hebt nog geen kandidaat gekozen."
      : undefined;
  const naamFout =
    fout === "naam"
      ? "U hebt nog geen naam van de kandidaat ingevuld."
      : undefined;
  const aanvangFout =
    fout === "aanvang" ? "U hebt nog geen eerste werkdag ingevuld." : undefined;
  const bsnVeldFout =
    fout === "bsn" && bsn === ""
      ? "U hebt nog geen BSN ingevuld."
      : fout === "bsn" || bsnGezien
        ? bsnFout
        : undefined;

  // Verder does not work yet: show why, and go to what is still missing.
  const naarInvoer = () => {
    if (!ontbreekt) return;
    setFoutBij(ontbreekt);
    const veld =
      ontbreekt === "naam"
        ? document.querySelector<HTMLElement>("#kandidaat-naam input")
        : ontbreekt === "bsn"
          ? document.querySelector<HTMLElement>("#kandidaat-bsn input")
          : ontbreekt === "toestemming"
            ? document.getElementById("toestemming-vragen")
            : ontbreekt === "aanvang"
              ? document.querySelector<HTMLElement>("#eerste-werkdag input")
              : (document.querySelector<HTMLElement>(
                  'input[name="kandidaat"]:checked',
                ) ??
                document.querySelector<HTMLElement>('input[name="kandidaat"]'));
    veld?.focus();
  };

  const voegToe = () => {
    const n = nieuw.naam.trim();
    // Nog niet compleet: zeg wat ontbreekt en ga naar dat veld.
    if (!n || !bsnGoed) {
      naarInvoer();
      return;
    }
    werkBij({
      kandidatenNieuw: [
        ...nieuwe.filter((k) => k.naam !== n),
        {
          naam: n,
          bsn: `•••••${nieuw.bsn.trim().slice(-4)}`,
          gevraagdOp: new Date().toISOString().slice(0, 10),
        },
      ],
      kandidaat: n,
    });
    setNieuw({ naam: "", bsn: "" });
    setBsnGezien(false);
  };

  return (
    <>
      <section className="rhc-mox-stack" aria-labelledby="kandidaat">
        <Heading level={2} id="kandidaat">
          Wie wilt u aannemen?
        </Heading>
        <Paragraph>
          Wij vragen de kandidaat eerst om toestemming; dat is de werkwijze van
          dit portaal. {wie.charAt(0).toUpperCase() + wie.slice(1)}{" "}
          {meer ? "zoeken" : "zoekt"} de kandidaat op met het
          burgerservicenummer (BSN).
        </Paragraph>
        <Paragraph>
          Werkt de kandidaat al bij u? Dan staat het BSN in uw
          loonadministratie. Anders vraagt u het aan de kandidaat.
        </Paragraph>
        <Fieldset
          legend="Kandidaten"
          invalid={!!kandidaatFout}
          aria-describedby={kandidaatFout ? "kandidaat-fout" : undefined}
        >
          {kandidaatFout && (
            <FormFieldErrorMessage id="kandidaat-fout">
              {kandidaatFout}
            </FormFieldErrorMessage>
          )}
          <FormFieldRadio
            name="kandidaat"
            value={kandidaat.bsnMasker}
            label={`${naam}, geboren ${datumNL(kandidaat.geboortedatum)}, BSN ${kandidaat.bsnMasker}`}
            checked={gekozen}
            onChange={() => werkBij({ kandidaat: kandidaat.bsnMasker })}
          />
          {nieuwe.map((k) => (
            <FormFieldRadio
              key={k.naam}
              name="kandidaat"
              value={k.naam}
              label={`${k.naam}${k.geboortedatum ? `, geboren ${k.geboortedatum}` : ""}${k.bsn ? `, BSN ${k.bsn}` : ""}`}
              checked={keuze === k.naam}
              onChange={() => werkBij({ kandidaat: k.naam })}
            />
          ))}
          <FormFieldRadio
            name="kandidaat"
            value={NIEUW}
            label="Iemand anders: werknemer toevoegen"
            checked={keuze === NIEUW}
            onChange={() => werkBij({ kandidaat: NIEUW })}
          />
        </Fieldset>
        {keuze === NIEUW && (
          <div className="rhc-mox-row-gap">
            <FormFieldTextInput
              id="kandidaat-naam"
              label="Naam van de kandidaat"
              invalid={!!naamFout}
              errorMessage={naamFout}
              // Not the user's own data: the browser must not fill in the
              // user's name or date of birth here (WCAG 1.3.5).
              autoComplete="off"
              value={nieuw.naam}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  naam: (event.target as HTMLInputElement).value,
                })
              }
            />
            <FormFieldTextInput
              id="kandidaat-bsn"
              label="Burgerservicenummer (BSN)"
              inputMode="numeric"
              autoComplete="off"
              value={nieuw.bsn}
              invalid={bsnVeldFout !== undefined}
              errorMessage={bsnVeldFout}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  bsn: (event.target as HTMLInputElement).value,
                })
              }
              onBlur={() => setBsnGezien(true)}
            />
            <Paragraph className="rhc-mox-small-text">
              Vraag het BSN pas als u de kandidaat wilt aannemen. Gebruik het
              alleen voor deze aanvraag.
            </Paragraph>
            {fout === "toestemming" && (
              <FormFieldErrorMessage id="toestemming-fout">
                U hebt nog geen toestemming gevraagd. Kies{" "}
                <strong>Toestemming vragen</strong>.
              </FormFieldErrorMessage>
            )}
            <ActionGroup>
              <Button
                id="toestemming-vragen"
                appearance="secondary-action-button"
                aria-disabled={!nieuw.naam.trim() || !bsnGoed}
                aria-describedby={
                  fout === "toestemming"
                    ? "toestemming-fout toestemming-melding"
                    : "toestemming-melding"
                }
                onClick={voegToe}
              >
                Toestemming vragen
              </Button>
            </ActionGroup>
            <Paragraph id="toestemming-melding" className="rhc-mox-small-text">
              U krijgt een melding zodra de kandidaat toestemming heeft gegeven.
            </Paragraph>
          </div>
        )}
        {gekozen && (
          <Paragraph className="rhc-mox-small-text">
            {geenAanvraag
              ? "U ziet alleen de laatste vier cijfers van het BSN."
              : "Het BSN gaat mee met de aanvraag. U ziet alleen de laatste vier cijfers."}
          </Paragraph>
        )}
        {gekozen && (
          <EigenOpgave
            voornaam={kandidaat.voornaam}
            a={antwoorden}
            zet={(deel) => werkBij({ antwoorden: { ...antwoorden, ...deel } })}
            keuzes={staat?.keuzes ?? {}}
            kies={(deel) =>
              werkBij({
                keuzes: { ...(staat?.keuzes ?? {}), ...deel },
                // Een andere keuze is een andere aanvraag: controleer die opnieuw.
                gecontroleerd: {
                  ...(staat?.gecontroleerd ?? {}),
                  ...Object.fromEntries(
                    Object.keys(deel).map((id) => [id, false]),
                  ),
                },
              })
            }
            vraagJc={paneelIds.includes("jc")}
            vraagWpa={paneelIds.includes("wpa")}
            aanvangFout={aanvangFout}
          />
        )}
      </section>

      {wachtend && (
        <section className="rhc-mox-stack" aria-labelledby="overheid-weet">
          <Heading level={2} id="overheid-weet">
            Gegevens die de overheid kan ophalen voor de berekening
          </Heading>
          <Paragraph>
            Wij vragen {wachtend.naam} eerst om toestemming. Daarna{" "}
            {meer ? "kijken" : "kijkt"} {wie} met het BSN in {eigen}.
          </Paragraph>
          <Paragraph>
            Tot {wachtend.naam} toestemming geeft, kunt u hier niet verder. Uw
            antwoorden blijven bewaard tot u dit tabblad sluit.
          </Paragraph>
        </section>
      )}

      {gekozen && duur.length > 0 && (
        <section className="rhc-mox-stack" aria-labelledby="hoe-lang">
          <Heading level={2} id="hoe-lang">
            Hoe lang het kan duren
          </Heading>
          {duur.map((zin) => (
            <Paragraph key={zin}>{zin}</Paragraph>
          ))}
        </section>
      )}

      <div className="rhc-mox-stack">
        <Paragraph role="status">
          {wachtend
            ? `Wacht op toestemming van ${wachtend.naam}.`
            : !gekozen
              ? ""
              : !opgave
                ? "Vul uw eigen opgave in: de eerste werkdag."
                : "Wij vullen de aanvraag voor u in. In de volgende stap controleert u die."}
        </Paragraph>
        <StepNavigation
          back="/personeel/iemand-aannemen/voorbeeldberekening"
          backLabel="Terug naar Voorbeeldberekening"
          later={wachtend ? "/personeel" : undefined}
          next={{
            label: verderNaar(2),
            disabled: !gekozen || !opgave || !resultaat.bekend,
            onBlocked: naarInvoer,
            // Stap 2 heeft één vorm, ook als er niets te versturen is.
            onClick: () =>
              router.push("/personeel/iemand-aannemen/concept-aanvraag"),
          }}
        />
      </div>
    </>
  );
};

export default Bronnen;
