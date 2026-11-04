"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
} from "@/components/rhc";
import {
  resetFeatureFlags,
  setBerichtenboxVariant,
  setFeatureFlag,
} from "@/app/actions";
import {
  BERICHTENBOX_VARIANTEN,
  MOX_FLAGS,
  type BerichtenboxVariant,
  type FeatureFlagKey,
  type FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";
import SideOverlay from "@/components/SideOverlay";
import Switch from "@/components/Switch";
import AssistentPaneel from "./assistentPaneel";

const FlagsPaneel = ({
  flags,
  berichtenboxVariant,
  assistentBackendIngesteld,
}: {
  flags: FeatureFlags;
  berichtenboxVariant: BerichtenboxVariant;
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

  const zetFlag = (key: (typeof MOX_FLAGS)[number]["key"], aan: boolean) =>
    startTransition(async () => {
      zetZichtbareFlag([key, aan]);
      await setFeatureFlag(key, aan);
      router.refresh();
    });

  const [zichtbareVariant, zetZichtbareVariant] =
    useOptimistic(berichtenboxVariant);

  const kiesVariant = (variant: BerichtenboxVariant) =>
    startTransition(async () => {
      zetZichtbareVariant(variant);
      await setBerichtenboxVariant(variant);
      router.refresh();
    });

  const hardReset = () =>
    startTransition(async () => {
      if (
        !window.confirm(
          "Alles wissen? Uw bewaarde items, de berichtenbox en de flags gaan terug naar de beginstand. De persona blijft.",
        )
      ) {
        return;
      }
      localStorage.clear();
      sessionStorage.clear();
      await resetFeatureFlags();
      location.reload();
    });

  const functionaliteit = (
    <Fieldset legend="Functionaliteit">
      {MOX_FLAGS.filter((flag) => flag.groep === "functionaliteit").map(
        (flag) => (
          <FormFieldCheckboxOption
            key={flag.key}
            label={flag.label}
            description={flag.werkt ? undefined : "(Nog niet in dit prototype)"}
            checked={zichtbareFlags[flag.key]}
            onChange={(event) => zetFlag(flag.key, event.target.checked)}
          />
        ),
      )}
    </Fieldset>
  );

  return (
    <SideOverlay id="flags-paneel" title="Flags" shortcut="f">
      <div>
        {functionaliteit}
        <Fieldset legend="Berichtenbox A/B/C-test">
          {BERICHTENBOX_VARIANTEN.map((variant) => (
            <FormFieldRadio
              key={variant.waarde}
              name="berichtenbox-variant"
              value={variant.waarde}
              label={variant.label}
              checked={zichtbareVariant === variant.waarde}
              onChange={() => kiesVariant(variant.waarde)}
            />
          ))}
        </Fieldset>
      </div>

      <div>
        <AssistentPaneel backendIngesteld={assistentBackendIngesteld} />
      </div>

      <div>
        <Switch
          label="Huisstijl"
          twoWay
          offText="Huidig"
          onText="Nieuw"
          checked={zichtbareFlags.mox_nieuweHuisstijl}
          onChange={(nieuw) => zetFlag("mox_nieuweHuisstijl", nieuw)}
        />
        <p className="nl-paragraph">
          <Link className="utrecht-link utrecht-link--html-a" href="/demo">
            Overzicht van componenten
          </Link>
        </p>
        <p className="nl-paragraph">
          <Link
            className="utrecht-link utrecht-link--html-a"
            href="/demo/ontwerppatronen"
          >
            Overzicht van ontwerppatronen
          </Link>
        </p>
      </div>
      <div className="prototype-side-overlay__footer">
        <Button
          appearance="secondary-action-button"
          hint="danger"
          disabled={bezig}
          onClick={hardReset}
        >
          Alles wissen
        </Button>
      </div>
    </SideOverlay>
  );
};

export default FlagsPaneel;
