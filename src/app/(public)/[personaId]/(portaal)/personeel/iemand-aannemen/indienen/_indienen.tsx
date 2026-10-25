"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { voegZaakToe } from "../../../lopendezaken/_assistentZaken";
import { useAannemen, uurloonTekst } from "../_useAannemen";
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

/** Wordt ingediend, hoeft niet, later, niet; dan de bevestiging en Indienen. */
const Indienen = ({
  aannemen,
  werkgever,
}: {
  aannemen: DemoAannemen;
  werkgever: Werkgever;
}) => {
  const router = useRouter();
  const { staat, werkZaakBij } = useAannemen();
  const [bevestigd, setBevestigd] = useState(false);
  const [fout, setFout] = useState(false);
  if (!staat) return null;
  const { kandidaat, dienstverband, zaak } = aannemen;
  const vn = kandidaat.voornaam;
  const a = staat.antwoorden;
  const k = staat.keuzes;

  const gemeente = [
    `Loonkostensubsidie: vanaf ${datumNL(dienstverband.aanvang)}, ${a.uren} uur per week, ${uurloonTekst(a)}, functie ${dienstverband.functie}`,
  ];
  const niet: string[] = ["Loondispensatie (geldt niet)"];
  const later: string[] = [
    "Loonkostenvoordeel opgeven in uw loonaangifte, vanaf de eerste loonaangifte na de start",
  ];
  if (k.jc === "ja") gemeente.push("Jobcoaching via de gemeente");
  else niet.push("Jobcoaching");
  if (k.wpa === "ja") gemeente.push("Werkplekaanpassing");
  else if (k.wpa === "later")
    later.push("Werkplekaanpassing, als u weet wat er nodig is");
  else niet.push("Werkplekaanpassing");
  if (k.pp === "ja") gemeente.push("Proefplaatsing van maximaal twee maanden");
  else niet.push("Proefplaatsing");

  const indienen = () => {
    if (!bevestigd) {
      setFout(true);
      return;
    }
    werkZaakBij("gemeente", {
      ingediend: true,
      verstuurdOp: "2026-10-05",
      fase: "ontvangst",
    });
    voegZaakToe({
      referentienummer: zaak.nummer,
      onderwerp: zaak.onderwerp,
      organisatie: zaak.organisatie,
      status: "In behandeling",
      ingediend_op: "2026-10-05",
      regeling: "loonkostensubsidie",
    });
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
      <Loket
        titel={`Gemeente ${kandidaat.gemeente}`}
        label="Aanvraag"
        items={gemeente}
      />
      <Heading level={2}>Hoeft u nu niet in te dienen</Heading>
      <Loket
        titel="Geldt automatisch"
        label="Geen aanvraag nodig"
        items={[
          `No-riskpolis bij UWV, omdat ${vn} in het doelgroepregister staat`,
        ]}
      />
      <Loket titel="Later" label="Komt als taak" items={later} />
      <Loket titel="Niet aangevraagd" items={niet} />
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
          indient, stuurt MijnOverheid Zakelijk de aanvraag naar de gemeente{" "}
          {kandidaat.gemeente}, die erover beslist. U krijgt een
          ontvangstbevestiging met zaaknummer in uw Berichtenbox, en u volgt de
          zaak bij Lopende zaken: de loonwaardemeting, het besluit en de
          betaling.
        </Paragraph>
        <FormFieldCheckboxOption
          label={`Ik heb alles naar waarheid ingevuld${staat.rol === "namens" ? `, namens ${werkgever.onderneming}` : ""}.`}
          name="bevestiging"
          checked={bevestigd}
          onChange={(event) => setBevestigd(event.target.checked)}
        />
        <ActionGroup>
          <Button appearance="primary-action-button" onClick={indienen}>
            Indienen bij gemeente {kandidaat.gemeente}
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
