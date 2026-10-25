"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ActionGroup,
  Alert,
  Button,
  Fieldset,
  FormFieldRadio,
  Paragraph,
} from "@/components/rhc";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import { updateVoorkeur } from "@/network/profiel/hooks/updateVoorkeur/action";
import type { DemoProfielIdentiteit } from "@/demo";

/**
 * Communicatiekanalen, zoals communicatievoorkeuren-wijzigen in moza-poc.
 * "Bellen" staat in de profielservice (voorkeur MagGebeldWorden). Voor het
 * voorkeurskanaal (e-mail of post) heeft de profielservice geen voorkeur; dat
 * bewaart het prototype in deze browser.
 */

const SLEUTEL = "moza-voorkeurskanaal";
const KANALEN = ["E-mail", "Post"] as const;
const BELLEN = {
  ja: "Ik mag gebeld worden",
  nee: "Ik wil niet gebeld worden",
} as const;

const leesKanaal = () => {
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

const Formulier = ({
  identificatieType,
  identificatieNummer,
}: DemoProfielIdentiteit) => {
  const queryClient = useQueryClient();
  const { data, status } = useGetProfielInformation(
    identificatieType,
    identificatieNummer,
  );
  const opgeslagenKanaal =
    useSyncExternalStore(subscribe, leesKanaal, () => null) ?? "E-mail";
  const voorkeur = data?.data?.voorkeuren?.find(
    ({ voorkeurType }) => voorkeurType === "MagGebeldWorden",
  );
  const opgeslagenBellen = voorkeur?.waarde === "true" ? "ja" : "nee";

  const [kanaal, setKanaal] = useState<string | null>(null);
  const [bellen, setBellen] = useState<"ja" | "nee" | null>(null);
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<
    "opgeslagen" | "fout-opslag" | "fout-service" | null
  >(null);
  const meldingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (melding) meldingRef.current?.focus();
  }, [melding]);

  if (status === "pending")
    return <Paragraph role="status">Uw voorkeuren worden geladen.</Paragraph>;

  const gekozenKanaal = kanaal ?? opgeslagenKanaal;
  const gekozenBellen = bellen ?? opgeslagenBellen;
  const gewijzigd =
    gekozenKanaal !== opgeslagenKanaal || gekozenBellen !== opgeslagenBellen;
  const serviceWerkt = status === "success" && data.status < 500;

  const opslaan = async (event: FormEvent) => {
    event.preventDefault();
    if (bezig) return;
    setBezig(true);
    setMelding(null);
    try {
      try {
        window.localStorage.setItem(SLEUTEL, gekozenKanaal);
        luisteraars.forEach((luisteraar) => luisteraar());
      } catch {
        setMelding("fout-opslag");
        return;
      }
      if (gekozenBellen !== opgeslagenBellen) {
        const antwoord = await updateVoorkeur(
          identificatieNummer,
          identificatieType,
          "MagGebeldWorden",
          String(gekozenBellen === "ja"),
          voorkeur?.id,
        );
        if (antwoord >= 400) {
          setMelding("fout-service");
          return;
        }
        await queryClient.invalidateQueries({
          queryKey: ["profiel", identificatieType, identificatieNummer],
        });
      }
      setKanaal(null);
      setBellen(null);
      setMelding("opgeslagen");
    } catch {
      setMelding("fout-service");
    } finally {
      setBezig(false);
    }
  };

  return (
    <form className="rhc-mox-row-gap" onSubmit={opslaan}>
      {melding && (
        <div ref={meldingRef} tabIndex={-1}>
          <Alert
            type={melding === "opgeslagen" ? "ok" : "error"}
            closable
            onClose={() => setMelding(null)}
          >
            <Paragraph>
              {melding === "opgeslagen"
                ? "Uw voorkeuren zijn opgeslagen."
                : melding === "fout-opslag"
                  ? "Uw voorkeuren zijn niet opgeslagen. Uw browser bewaart nu niets voor deze website. Zet privénavigatie uit en probeer het opnieuw."
                  : "Uw keuze voor bellen is niet opgeslagen. De dienst met uw voorkeuren is nu niet bereikbaar. Probeer het later opnieuw."}
            </Paragraph>
          </Alert>
        </div>
      )}

      <Fieldset legend="Voorkeurskanaal">
        {KANALEN.map((optie) => (
          <FormFieldRadio
            key={optie}
            name="voorkeurskanaal"
            value={optie}
            label={optie}
            checked={gekozenKanaal === optie}
            onChange={() => {
              setMelding(null);
              setKanaal(optie);
            }}
          />
        ))}
      </Fieldset>

      <Fieldset legend="Bellen">
        {(["ja", "nee"] as const).map((optie) => (
          <FormFieldRadio
            key={optie}
            name="bellen"
            value={optie}
            label={BELLEN[optie]}
            disabled={!serviceWerkt}
            checked={gekozenBellen === optie}
            onChange={() => {
              setMelding(null);
              setBellen(optie);
            }}
          />
        ))}
        {!serviceWerkt && (
          <Paragraph>
            Uw keuze voor bellen kan nu niet worden opgehaald. Probeer het later
            opnieuw.
          </Paragraph>
        )}
      </Fieldset>

      <Alert type="info" closable>
        <Paragraph>
          Blijft een bericht 14 dagen ongelezen? Dan stuurt de overheid
          automatisch een herinnering naar uw voorkeurskanaal.
        </Paragraph>
      </Alert>

      <ActionGroup>
        <Button
          type="submit"
          appearance="primary-action-button"
          aria-disabled={bezig || undefined}
        >
          Opslaan
        </Button>
        <Button
          appearance="secondary-action-button"
          aria-disabled={!gewijzigd || undefined}
          onClick={() => {
            if (!gewijzigd) return;
            setKanaal(null);
            setBellen(null);
            setMelding(null);
          }}
        >
          Annuleren
        </Button>
      </ActionGroup>
    </form>
  );
};

const Kanalen = (props: DemoProfielIdentiteit) => {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Formulier {...props} />
    </QueryClientProvider>
  );
};

export default Kanalen;
