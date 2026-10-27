"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  ActionGroup,
  Alert,
  Button,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import type { DemoAannemen } from "@/demo";
import {
  onderwerpVoor,
  routeVoor,
  type PaneelId,
  type TaakId,
} from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { useAannemen, uurloonTekst, type AannemenStaat } from "../_useAannemen";
import { INGEDIEND_OP, nieuweZaakStand, zaakAanmaken } from "../_zaakStart";
import { datumNL, type Werkgever } from "../_werkgever";

const Loket = ({
  titel,
  label,
  items,
}: {
  titel: string;
  label?: string;
  items: ReactNode[];
}) => (
  <section className="rhc-mox-card rhc-mox-row-gap" aria-label={titel}>
    <Heading level={3}>
      {titel}
      {label && <span className="mox-hiring-label">{label}</span>}
    </Heading>
    <UnorderedList>
      {items.map((i, n) => (
        <UnorderedListItem key={n}>{i}</UnorderedListItem>
      ))}
    </UnorderedList>
  </section>
);

const TAAK: Record<TaakId, string> = {
  doelgroepverklaring:
    "Doelgroepverklaring aanvragen bij UWV, binnen drie maanden na de start",
  vz_wajong:
    "Jobcoach of werkplekaanpassing aanvragen bij UWV, als dat nodig is",
  vz_wia: "Jobcoach of werkplekaanpassing aanvragen bij UWV, als dat nodig is",
  // Gaat buiten de aanvraag om: de proefplaats ligt vóór de eerste werkdag.
  pp: "Proefplaatsing: de kandidaat vraagt de gemeente om toestemming, vóór de eerste werkdag",
};

type Props = {
  perSituatie: Record<"gemeente" | "wajong", DemoAannemen>;
  werkgever: Werkgever;
};

const Indienen = (props: Props) => {
  const { staat } = useAannemen();
  // De inhoud rekent met de engine; dat mag pas als de opslag gelezen is.
  if (!staat) return null;
  return <IndienenInhoud {...props} staat={staat} />;
};

/**
 * Per organisatie wat erheen gaat (de panelen van de route), daaronder de
 * taken voor de werknemer, wat vanzelf of via de loonaangifte gaat en wat
 * niet wordt aangevraagd; dan de bevestiging en Indienen.
 */
const IndienenInhoud = ({
  perSituatie,
  werkgever,
  staat,
}: Props & { staat: AannemenStaat }) => {
  const router = useRouter();
  const { werkZaakBij } = useAannemen();
  const [bevestigd, setBevestigd] = useState(false);
  const [fout, setFout] = useState(false);
  const a = staat.antwoorden;
  const k = staat.keuzes;

  const { uitkomsten, bekend, fout: engineFout } = useUitkomsten(a);
  const route = useMemo(
    () => routeVoor(a.doelgroepen, uitkomsten),
    [a.doelgroepen, uitkomsten],
  );

  if (!bekend)
    return (
      <Paragraph role="status">
        {engineFout
          ? "De aanvraag kan nu niet worden berekend. Laad de pagina opnieuw."
          : "De aanvraag wordt berekend…"}
      </Paragraph>
    );

  if (route.panelen.length === 0)
    return (
      <>
        <Alert type="info">
          <Paragraph>
            Bij deze antwoorden is er niets in te dienen. Kijk bij de aanvraag
            wat er verder geldt.
          </Paragraph>
        </Alert>
        <Paragraph>
          <Link
            href="/personeel/iemand-aannemen/concept-aanvraag"
            className="utrecht-link utrecht-link--html-a"
          >
            Terug naar de aanvraag
          </Link>
        </Paragraph>
      </>
    );

  const { situatie } = route;
  const { kandidaat, dienstverband, zaak, fasen } =
    perSituatie[situatie === "wajong" ? "wajong" : "gemeente"];
  // De zaak begint bij ontvangst; "indicatie" van de gemeente ligt vóór het indienen.
  const eersteFase = (fasen.find((f) => f.id === "ontvangst") ?? fasen[0]).id;
  const vn = kandidaat.voornaam;
  // Opnieuw indienen zou de zaak terugzetten naar de eerste fase.
  const bestaand = staat.zaken[situatie];
  if (bestaand?.ingediend)
    return (
      <>
        <Alert type="info">
          <Paragraph>
            Deze aanvraag is al ingediend
            {bestaand.verstuurdOp ? ` op ${datumNL(bestaand.verstuurdOp)}` : ""}
            . U volgt de aanvraag in Lopende zaken.
          </Paragraph>
        </Alert>
        <Paragraph>
          <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
            Bekijk de zaak
          </Link>
        </Paragraph>
      </>
    );
  const uwv = situatie === "wajong";
  const organisatie = uwv ? "UWV" : `Gemeente ${kandidaat.gemeente}`;
  const lkv = uitkomsten.regels.find((r) => r.id === "lkv");

  const aanvang = `vanaf ${datumNL(dienstverband.aanvang)}, ${a.uren} uur per week, ${uurloonTekst(a)}, functie ${dienstverband.functie}`;
  const ingediend: ReactNode[] = [];
  const later: string[] = [];
  const niet: string[] = [];
  for (const id of route.panelen.flatMap((p) => p.ids) as PaneelId[]) {
    if (id === "lks") ingediend.push(`Loonkostensubsidie: ${aanvang}`);
    else if (id === "ld")
      ingediend.push(
        <div key="ld">
          {`Loondispensatie: ${aanvang}, percentage ${a.loonwaarde} procent (uw schatting)`}{" "}
          <InfoToggletip label="Toelichting bij het percentage">
            U geeft een schatting. Een arbeidsdeskundige van UWV bekijkt het
            werk en stelt het percentage vast. Loondispensatie geldt vanaf de
            eerste dag van de maand waarin u de aanvraag doet.
          </InfoToggletip>
        </div>,
      );
    else if (id === "jc")
      (k.jc === "ja" ? ingediend : niet).push(
        k.jc === "ja"
          ? "Jobcoaching: begeleiding op de werkplek voor de werknemer, via de gemeente"
          : "Jobcoaching",
      );
    else if (id === "wpa") {
      if (k.wpa === "ja") ingediend.push("Werkplekaanpassing");
      else if (k.wpa === "later")
        later.push("Werkplekaanpassing, als u weet wat er nodig is");
      else niet.push("Werkplekaanpassing");
    }
  }

  const vanzelf: string[] = [];
  if (route.vanzelf.includes("lkv"))
    vanzelf.push(
      lkv?.categorie === "arbeidsgehandicapte_werknemer"
        ? "Loonkostenvoordeel arbeidsgehandicapte: opgeven in uw loonaangifte, zodra u de doelgroepverklaring van de werknemer hebt"
        : "Loonkostenvoordeel: opgeven in uw loonaangifte, vanaf de eerste loonaangifte na de start",
    );
  if (route.vanzelf.includes("nrp"))
    vanzelf.push(
      `No-riskpolis bij UWV: bij ziekte van ${vn} betaalt u het loon door en krijgt u ziekengeld van UWV`,
    );
  vanzelf.push(...later);

  const taken = route.taken.length > 0 && (
    <>
      <Heading level={2}>Taken voor de werknemer</Heading>
      <Loket
        titel={`${vn} vraagt dit zelf aan`}
        label="Geen aanvraag door u"
        items={route.taken.map((t) => TAAK[t])}
      />
    </>
  );

  const onderwerp = onderwerpVoor(
    situatie,
    zaak.onderwerp,
    `${kandidaat.voornaam} ${kandidaat.achternaam}`,
    uitkomsten,
  );

  // Alles wat overblijft is "later" of "nee": er gaat niets naar de organisatie.
  if (ingediend.length === 0)
    return (
      <>
        <Alert type="info">
          <Paragraph>
            U heeft niets gekozen om in te dienen. Kies bij de aanvraag wat u
            wilt aanvragen, of bekijk wat er zonder aanvraag geldt.
          </Paragraph>
        </Alert>
        {taken}
        <ActionGroup>
          <Link
            href="/personeel/iemand-aannemen/overzicht"
            className="utrecht-link utrecht-link--html-a"
          >
            Bekijk het overzicht
          </Link>
          <Link
            href="/personeel/iemand-aannemen/concept-aanvraag"
            className="utrecht-link utrecht-link--html-a"
          >
            Terug naar de aanvraag
          </Link>
        </ActionGroup>
      </>
    );

  const indienen = () => {
    if (!bevestigd) {
      setFout(true);
      return;
    }
    werkZaakBij(
      situatie,
      nieuweZaakStand(eersteFase, a, onderwerp, INGEDIEND_OP),
    );
    zaakAanmaken(situatie, zaak, "In behandeling", onderwerp);
    router.push("/personeel/iemand-aannemen/verstuurd");
  };

  return (
    <>
      {fout && !bevestigd && (
        <Alert type="error">
          <Paragraph>
            Bevestig eerst dat u alles naar waarheid heeft ingevuld.
          </Paragraph>
        </Alert>
      )}
      <Heading level={2}>Wordt ingediend</Heading>
      <Loket titel={organisatie} label="Aanvraag" items={ingediend} />
      {taken}
      {vanzelf.length > 0 && (
        <>
          <Heading level={2}>Gaat vanzelf of via de loonaangifte</Heading>
          <Loket titel="Hoeft u niet in te dienen" items={vanzelf} />
        </>
      )}
      {niet.length > 0 && (
        <>
          <Heading level={2}>Niet aangevraagd</Heading>
          <Loket titel="Uw keuzes" items={niet} />
        </>
      )}
      <Paragraph>
        <Link
          href="/personeel/iemand-aannemen/concept-aanvraag"
          className="utrecht-link utrecht-link--html-a"
        >
          Aanvraag wijzigen
        </Link>
      </Paragraph>

      <section
        className="rhc-mox-card rhc-mox-row-gap"
        aria-labelledby="wat-gebeurt"
      >
        <Heading level={2} id="wat-gebeurt">
          Wat er gebeurt als u indient
        </Heading>
        <Paragraph>
          Tot nu toe heeft {uwv ? "UWV" : `de gemeente ${kandidaat.gemeente}`}{" "}
          deze aanvraag niet gezien. Als u indient, stuurt MijnOverheid Zakelijk
          de aanvraag naar {uwv ? "UWV" : `de gemeente ${kandidaat.gemeente}`},
          die erover beslist. U krijgt een ontvangstbevestiging met zaaknummer
          in uw Berichtenbox, en u volgt de zaak bij Lopende zaken.
        </Paragraph>
        <FormFieldCheckboxOption
          label={`Ik heb alles naar waarheid ingevuld${staat.rol === "namens" ? `, namens ${werkgever.onderneming}` : ""}.`}
          name="bevestiging"
          checked={bevestigd}
          onChange={(event) => setBevestigd(event.target.checked)}
        />
        <ActionGroup>
          <Button appearance="primary-action-button" onClick={indienen}>
            Indienen bij {uwv ? "UWV" : `gemeente ${kandidaat.gemeente}`}
          </Button>
          <Link
            href="/personeel/iemand-aannemen/concept-aanvraag"
            className="utrecht-link utrecht-link--html-a"
          >
            Annuleer
          </Link>
        </ActionGroup>
      </section>
    </>
  );
};

export default Indienen;
