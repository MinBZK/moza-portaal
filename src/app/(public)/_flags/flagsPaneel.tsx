"use client";

import {
  useEffect,
  useSyncExternalStore,
  useOptimistic,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
} from "@rijkshuisstijl-community/components-react";
import { resetFeatureFlags, setFeatureFlag } from "@/app/actions";
import {
  MOX_FLAGS,
  type FeatureFlagKey,
  type FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";
import SideOverlay from "@/components/SideOverlay";
import AssistentPaneel from "./assistentPaneel";

const PAUZE_SLEUTEL = "setting:pause-animations";

const luisterNaarOpslag = (luisteraar: () => void) => {
  window.addEventListener("storage", luisteraar);
  return () => window.removeEventListener("storage", luisteraar);
};

const FlagsPaneel = ({
  flags,
  assistentBackendIngesteld,
}: {
  flags: FeatureFlags;
  /** Is de backend van de Digitale assistent ingesteld? */
  assistentBackendIngesteld: boolean;
}) => {
  const router = useRouter();
  const [bezig, startTransition] = useTransition();
  const [zichtbareFlags, zetZichtbareFlag] = useOptimistic(
    flags,
    (huidig, [key, aan]: [FeatureFlagKey, boolean]) => ({
      ...huidig,
      [key]: aan,
    }),
  );

  const gepauzeerd = useSyncExternalStore(
    luisterNaarOpslag,
    () => localStorage.getItem(PAUZE_SLEUTEL) === "true",
    () => false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("animations-paused", gepauzeerd);
  }, [gepauzeerd]);

  const zetFlag = (key: (typeof MOX_FLAGS)[number]["key"], aan: boolean) =>
    startTransition(async () => {
      zetZichtbareFlag([key, aan]);
      await setFeatureFlag(key, aan);
      router.refresh();
    });

  const zetPauze = (aan: boolean) => {
    localStorage.setItem(PAUZE_SLEUTEL, String(aan));
    window.dispatchEvent(new StorageEvent("storage", { key: PAUZE_SLEUTEL }));
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

  return (
    <SideOverlay id="flags-paneel" title="Flags" shortcut="f">
      {flagGroep("pagina", "Pagina’s")}
      {flagGroep("functionaliteit", "Functionaliteit")}

      <div>
        <AssistentPaneel backendIngesteld={assistentBackendIngesteld} />
      </div>

      <div>
        <Fieldset legend="Hulpmiddelen">
          <FormFieldCheckboxOption
            label="Animaties pauzeren"
            checked={gepauzeerd}
            onChange={(event) => zetPauze(event.target.checked)}
          />
        </Fieldset>
      </div>
      <div>
        <Fieldset legend="Huisstijl">
          <FormFieldRadio
            name="huisstijl"
            value="huidig"
            label="Huidige MijnOverheid huisstijl"
            checked={!zichtbareFlags.mox_nieuweHuisstijl}
            onChange={() => zetFlag("mox_nieuweHuisstijl", false)}
          />
          <FormFieldRadio
            name="huisstijl"
            value="nieuw"
            label="Nieuwe MijnOverheid huisstijl (in ontwikkeling)"
            description="Zonder mox.css: alleen RHC en de MOx-afwijkingen in rhc.css."
            checked={zichtbareFlags.mox_nieuweHuisstijl}
            onChange={() => zetFlag("mox_nieuweHuisstijl", true)}
          />
        </Fieldset>
      </div>
      <div>
        <Button
          appearance="secondary-action-button"
          hint="danger"
          disabled={bezig}
          onClick={hardReset}
        >
          Hard reset (alles wissen)
        </Button>
      </div>
    </SideOverlay>
  );
};

export default FlagsPaneel;
