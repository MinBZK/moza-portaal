"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import type { DemoAannemen } from "@/demo";
import { routeVoor, type PaneelId, type TaakId } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { useAannemen, uurloonTekst, type AannemenStaat } from "../_useAannemen";
import { INGEDIEND_OP, zaakAanmaken } from "../_zaakStart";
import { datumNL, type Werkgever } from "../_werkgever";

const Loket = ({
  titel,
  label,
  items,
}: {
  titel: string;
  label?: string;
  items: string[];
}) => (
  <section className="rhc-mox-card rhc-mox-row-gap" aria-label={titel}>
    <Heading level={3}>
      {titel}
      {label && <span className="mox-hiring-label">{label}</span>}
    </Heading>
    <UnorderedList>
      {items.map((i) => (
        <UnorderedListItem key={i}>{i}</UnorderedListItem>
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

  const { uitkomsten, bekend } = useUitkomsten(a);
  const route = useMemo(
    () => routeVoor(a.doelgroepen, uitkomsten),
    [a.doelgroepen, uitkomsten],
  );

  if (!bekend)
    return <Paragraph role="status">De aanvraag wordt berekend…</Paragraph>;

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
  const uwv = situatie === "wajong";
  const organisatie = uwv ? "UWV" : `Gemeente ${kandidaat.gemeente}`;
  const lkv = uitkomsten.regels.find((r) => r.id === "lkv");

  const aanvang = `vanaf ${datumNL(dienstverband.aanvang)}, ${a.uren} uur per week, ${uurloonTekst(a)}, functie ${dienstverband.functie}`;
  const ingediend: string[] = [];
  const later: string[] = [];
  const niet: string[] = [];
  for (const id of route.panelen.flatMap((p) => p.ids) as PaneelId[]) {
    if (id === "lks") ingediend.push(`Loonkostensubsidie: ${aanvang}`);
    else if (id === "ld")
      ingediend.push(
        `Loondispensatie: ${aanvang}, percentage ${a.loonwaarde} procent (uw schatting; UWV stelt het vast)`,
      );
    else if (id === "jc")
      (k.jc === "ja" ? ingediend : niet).push(
        k.jc === "ja" ? "Jobcoaching via de gemeente" : "Jobcoaching",
      );
    else if (id === "wpa") {
      if (k.wpa === "ja") ingediend.push("Werkplekaanpassing");
      else if (k.wpa === "later")
        later.push("Werkplekaanpassing, als u weet wat er nodig is");
      else niet.push("Werkplekaanpassing");
    } else
      (k.pp === "ja" ? ingediend : niet).push(
        k.pp === "ja"
          ? "Proefplaatsing van maximaal twee maanden"
          : "Proefplaatsing",
      );
  }

  const vanzelf: string[] = [];
  if (route.vanzelf.includes("lkv"))
    vanzelf.push(
      `Loonkostenvoordeel${lkv?.categorie === "arbeidsgehandicapte_werknemer" ? " arbeidsgehandicapte" : ""}: opgeven in uw loonaangifte, vanaf de eerste loonaangifte na de start`,
    );
  if (route.vanzelf.includes("nrp"))
    vanzelf.push(
      `No-riskpolis bij UWV, omdat ${vn} in het doelgroepregister staat`,
    );
  vanzelf.push(...later);

  const indienen = () => {
    if (!bevestigd) {
      setFout(true);
      return;
    }
    werkZaakBij(situatie, {
      ingediend: true,
      verstuurdOp: INGEDIEND_OP,
      fase: eersteFase,
    });
    zaakAanmaken(situatie, zaak, "In behandeling");
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
      {route.taken.length > 0 && (
        <>
          <Heading level={2}>Taken voor de werknemer</Heading>
          <Loket
            titel={`${vn} vraagt dit zelf aan`}
            label="Geen aanvraag door u"
            items={route.taken.map((t) => TAAK[t])}
          />
        </>
      )}
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
          Tot nu toe heeft geen overheidsorganisatie deze aanvraag gezien. Als u
          indient, stuurt MijnOverheid Zakelijk de aanvraag naar{" "}
          {uwv ? "UWV" : `de gemeente ${kandidaat.gemeente}`}, die erover
          beslist. U krijgt een ontvangstbevestiging met zaaknummer in uw
          Berichtenbox, en u volgt de zaak bij Lopende zaken.
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
