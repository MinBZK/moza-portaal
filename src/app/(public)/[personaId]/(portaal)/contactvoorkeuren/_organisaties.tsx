"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  ActionGroup,
  Alert,
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@rijkshuisstijl-community/components-react";
import type { DemoOrganisatie } from "@/demo";

/**
 * Welke organisaties uw centrale contactgegevens gebruiken. De profielservice
 * kent dit (nog) niet: er staan daar geen dienstverleners in en een partij heeft
 * geen lijst met aangesloten organisaties. Daarom bewaart het prototype de
 * keuze in deze browser (localStorage), net als andere keuzes van de persona.
 */

const SLEUTEL = "moza-contactorganisaties";

const lees = () => {
  try {
    return window.localStorage.getItem(SLEUTEL);
  } catch {
    return null;
  }
};

const luisteraars = new Set<() => void>();
const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

const Organisaties = ({
  organisaties,
}: {
  organisaties: DemoOrganisatie[];
}) => {
  // null op de server en tot de opslag gelezen is.
  const rauw = useSyncExternalStore(subscribe, lees, () => null);
  const standaard = organisaties
    .filter((o) => o.aangesloten && !o.vast)
    .map((o) => o.id);
  let opgeslagen = standaard;
  try {
    const gelezen: unknown = rauw ? JSON.parse(rauw) : null;
    if (Array.isArray(gelezen)) opgeslagen = gelezen.map(String);
  } catch {
    // Onleesbaar: de standaard.
  }

  const [keuze, setKeuze] = useState<string[] | null>(null);
  const [melding, setMelding] = useState<"opgeslagen" | "fout" | null>(null);
  const meldingRef = useRef<HTMLDivElement>(null);
  const gekozen = keuze ?? opgeslagen;
  const gewijzigd =
    keuze !== null &&
    [...keuze].sort().join() !== [...opgeslagen].sort().join();

  useEffect(() => {
    if (melding) meldingRef.current?.focus();
  }, [melding]);

  const vast = organisaties.filter((o) => o.vast);
  const keuzes = organisaties.filter((o) => !o.vast);
  const aantal = vast.length + gekozen.length;

  const opslaan = (event: FormEvent) => {
    event.preventDefault();
    try {
      window.localStorage.setItem(SLEUTEL, JSON.stringify(gekozen));
    } catch {
      setMelding("fout");
      return;
    }
    luisteraars.forEach((luisteraar) => luisteraar());
    setKeuze(null);
    setMelding("opgeslagen");
  };

  return (
    <form className="rhc-row-gap" onSubmit={opslaan}>
      <Paragraph>
        Deze organisaties gebruiken uw centrale contactgegevens om contact met u
        op te nemen. Kiest u een extra organisatie, dan gebruikt ook die uw
        centrale contactgegevens.
        {` U gebruikt ze nu bij ${vast.length + opgeslagen.length} van de ${organisaties.length} organisaties.`}
      </Paragraph>

      {melding && (
        <div ref={meldingRef} tabIndex={-1}>
          <Alert type={melding === "fout" ? "error" : "ok"}>
            <Paragraph>
              {melding === "fout"
                ? "Uw keuze is niet opgeslagen. Uw browser bewaart nu niets voor deze website. Zet privénavigatie uit en probeer het opnieuw."
                : `Uw keuze is opgeslagen. ${aantal} organisaties gebruiken nu uw centrale contactgegevens.`}
            </Paragraph>
          </Alert>
        </div>
      )}

      <Fieldset legend="Altijd aangesloten">
        <UnorderedList>
          {vast.map((o) => (
            <UnorderedListItem key={o.id}>{o.naam}</UnorderedListItem>
          ))}
        </UnorderedList>
      </Fieldset>

      <Fieldset legend="Kies welke organisaties ook uw contactgegevens gebruiken">
        {keuzes.map((o) => (
          <FormFieldCheckboxOption
            key={o.id}
            label={o.naam}
            checked={gekozen.includes(o.id)}
            onChange={(event) => {
              setMelding(null);
              setKeuze(
                event.target.checked
                  ? [...gekozen, o.id]
                  : gekozen.filter((id) => id !== o.id),
              );
            }}
          />
        ))}
      </Fieldset>

      <ActionGroup>
        <Button type="submit" appearance="primary-action-button">
          Opslaan
        </Button>
        <Button
          appearance="secondary-action-button"
          aria-disabled={!gewijzigd || undefined}
          onClick={() => {
            if (!gewijzigd) return;
            setKeuze(null);
            setMelding(null);
          }}
        >
          Annuleren
        </Button>
      </ActionGroup>
    </form>
  );
};

export default Organisaties;
