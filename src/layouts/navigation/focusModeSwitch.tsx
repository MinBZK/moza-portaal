"use client";

import { Paragraph } from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import Switch from "@/components/Switch";
import { useFlag } from "@/app/(public)/_flags/flagsContext";
import { useFocusMode } from "./pageGrid";

/**
 * Switch for focus mode, below the heading of a page with CollapsibleNavigation.
 * Only with the flag mox_focusSchakelaar, for research; otherwise focus mode
 * stays on during the task.
 */
const FocusModeSwitch = () => {
  const { on, set } = useFocusMode();
  const tonen = useFlag("mox_focusSchakelaar");
  if (!tonen) return null;
  return (
    <div className="rhc-mox-focus-mode-switch">
      <Switch
        label="Focus-mode: alleen de taak tonen"
        hideLabel
        onText="Focus-mode"
        offText="Focus-mode"
        checked={on}
        onChange={set}
      />
      <InfoToggletip label="Uitleg over focus-mode">
        <Paragraph>
          In focus-mode ziet u alleen deze taak. Het menu, het kruimelpad en de
          meeste links onderaan de pagina zijn dan verborgen.
        </Paragraph>
        <Paragraph>
          Zet focus-mode uit om ze weer te zien. Uw keuze blijft gelden op de
          volgende pagina’s van deze taak.
        </Paragraph>
      </InfoToggletip>
    </div>
  );
};

export default FocusModeSwitch;
