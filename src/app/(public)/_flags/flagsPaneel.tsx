"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useOptimistic,
  useTransition,
  type FormEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  Heading,
} from "@rijkshuisstijl-community/components-react";
import { resetFeatureFlags, setFeatureFlag } from "@/app/actions";
import {
  MOX_FLAGS,
  type FeatureFlagKey,
  type FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";

/**
 * Het Flags-paneel uit moza-poc: feature flags, persona's en hulpmiddelen voor
 * wie het prototype test. Zichtbaar via de knop rechtsonder.
 */

export type PersonaKeuze = {
  id: string;
  label: string;
  handelsnaam: string;
  archief: boolean;
};

const PAUZE_SLEUTEL = "setting:pause-animations";
// Gegevens die bij een persona horen. Bij wisselen gaan ze weg, net als in moza-poc.
const VAN_DE_PERSONA = ["moza-berichtenbox", "moza-bewaard"];

const luisterNaarOpslag = (luisteraar: () => void) => {
  window.addEventListener("storage", luisteraar);
  return () => window.removeEventListener("storage", luisteraar);
};

const FlagsPaneel = ({
  flags,
  personas,
  actievePersonaId,
}: {
  flags: FeatureFlags;
  personas: PersonaKeuze[];
  actievePersonaId?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [bezig, startTransition] = useTransition();
  // Toont de nieuwe stand meteen; de server bevestigt hem daarna.
  const [zichtbareFlags, zetZichtbareFlag] = useOptimistic(
    flags,
    (huidig, [key, aan]: [FeatureFlagKey, boolean]) => ({
      ...huidig,
      [key]: aan,
    }),
  );
  const [gekozen, setGekozen] = useState(actievePersonaId);
  const knopRef = useRef<HTMLButtonElement>(null);
  const paneelRef = useRef<HTMLElement>(null);

  const gepauzeerd = useSyncExternalStore(
    luisterNaarOpslag,
    () => localStorage.getItem(PAUZE_SLEUTEL) === "true",
    () => false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("animations-paused", gepauzeerd);
  }, [gepauzeerd]);

  useEffect(() => {
    if (!open) return;
    const sluitBijEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      knopRef.current?.focus();
    };
    const sluitBijKlikBuiten = (event: MouseEvent) => {
      const doel = event.target as Node;
      if (
        !paneelRef.current?.contains(doel) &&
        !knopRef.current?.contains(doel)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", sluitBijEscape);
    document.addEventListener("click", sluitBijKlikBuiten);
    return () => {
      document.removeEventListener("keydown", sluitBijEscape);
      document.removeEventListener("click", sluitBijKlikBuiten);
    };
  }, [open]);

  const zetFlag = (key: (typeof MOX_FLAGS)[number]["key"], aan: boolean) =>
    startTransition(async () => {
      zetZichtbareFlag([key, aan]);
      await setFeatureFlag(key, aan);
      router.refresh();
    });

  const zetPauze = (aan: boolean) => {
    localStorage.setItem(PAUZE_SLEUTEL, String(aan));
    // useSyncExternalStore hoort het storage-event alleen uit andere tabbladen.
    window.dispatchEvent(new StorageEvent("storage", { key: PAUZE_SLEUTEL }));
  };

  const wisselPersona = (event: FormEvent) => {
    event.preventDefault();
    if (!gekozen || gekozen === actievePersonaId) return;
    const veilig = location.protocol === "https:" ? "; secure" : "";
    document.cookie = `personaId=${encodeURIComponent(gekozen)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${veilig}`;
    VAN_DE_PERSONA.forEach((sleutel) => localStorage.removeItem(sleutel));
    // Een bericht van de vorige persona bestaat bij de nieuwe misschien niet.
    if (pathname.startsWith("/berichtenbox/")) location.href = "/berichtenbox";
    else location.reload();
  };

  const hardReset = () =>
    startTransition(async () => {
      if (
        !window.confirm(
          "Alles wissen? Uw bewaarde items, de Berichtenbox en de flags gaan terug naar de beginstand. De persona blijft.",
        )
      ) {
        return;
      }
      localStorage.clear();
      sessionStorage.clear();
      await resetFeatureFlags();
      location.reload();
    });

  const flagGroep = (groep: "pagina" | "functionaliteit", label: string) => (
    // Fieldset: FormFieldCheckboxGroup koppelt zijn label niet aan de groep.
    <Fieldset legend={label}>
      {MOX_FLAGS.filter((flag) => flag.groep === groep).map((flag) => (
        <FormFieldCheckboxOption
          key={flag.key}
          label={flag.label}
          description={flag.werkt ? undefined : "(Nog niet in dit prototype)"}
          checked={zichtbareFlags[flag.key]}
          onChange={(event) => zetFlag(flag.key, event.target.checked)}
        />
      ))}
    </Fieldset>
  );

  const personaKeuze = (persona: PersonaKeuze) => (
    <FormFieldRadio
      key={persona.id}
      name="persona"
      value={persona.id}
      label={`${persona.label}: ${persona.handelsnaam}${persona.id === actievePersonaId ? " (actief)" : ""}`}
      checked={gekozen === persona.id}
      onChange={() => setGekozen(persona.id)}
    />
  );

  const hoofdlijst = personas.filter((persona) => !persona.archief);
  const archief = personas.filter((persona) => persona.archief);
  const actiefInArchief = archief.some(
    (persona) => persona.id === actievePersonaId,
  );

  return (
    <>
      <Button
        ref={knopRef}
        appearance="secondary-action-button"
        aria-expanded={open}
        aria-controls="flags-paneel"
        className="mox-button-trigger-flags"
        onClick={() => setOpen(!open)}
      >
        Flags
      </Button>

      {open && (
        <section
          ref={paneelRef}
          id="flags-paneel"
          aria-labelledby="flags-paneel-kop"
        >
          <Heading level={2} id="flags-paneel-kop">
            Flags
          </Heading>

          <div>
            {flagGroep("pagina", "Pagina’s")}
            {flagGroep("functionaliteit", "Functionaliteit")}
            <div>
              <form onSubmit={wisselPersona}>
                <Fieldset legend="Persona's">
                  {hoofdlijst.map(personaKeuze)}
                  {archief.length > 0 && (
                    <details open={actiefInArchief}>
                      <summary>Persona-archief ({archief.length})</summary>
                      {/* Zelfde opmaak als de hoofdlijst. Een div: de rondjes staan al in de fieldset Persona's. */}
                      <div className="utrecht-form-fieldset__fieldset utrecht-form-fieldset--html-fieldset">
                        {archief.map(personaKeuze)}
                      </div>
                    </details>
                  )}
                </Fieldset>
                <Button
                  type="submit"
                  appearance="secondary-action-button"
                  disabled={!gekozen || gekozen === actievePersonaId}
                >
                  Wissel van persona
                </Button>
              </form>
            </div>

            <div>
              <Fieldset legend="Hulpmiddelen">
                <FormFieldCheckboxOption
                  label="Animaties pauzeren"
                  checked={gepauzeerd}
                  onChange={(event) => zetPauze(event.target.checked)}
                />
              </Fieldset>
              <Button
                appearance="secondary-action-button"
                hint="danger"
                disabled={bezig}
                onClick={hardReset}
              >
                Hard reset (alles wissen)
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default FlagsPaneel;
