"use client";

import { useEffect } from "react";
import StepIndicator from "@/components/StepIndicator";
import { useAannemen } from "./_useAannemen";

/**
 * The steps of Iemand aannemen. Remembers the furthest step reached in this
 * session, so the user can also go forward to a step they already did.
 */
const Voortgang = ({
  steps,
  huidige,
  volgendeBereikbaar = true,
}: {
  steps: { name: string; href: string }[];
  huidige: 1 | 2;
  /** Kan de volgende stap nu? Zo niet, dan is die geen link. */
  volgendeBereikbaar?: boolean;
}) => {
  const { staat, werkBij } = useAannemen();
  // Een sessie van voor de drie stappen kan nog 4 bewaard hebben.
  const verst = Math.min(
    Math.max(staat?.verstStap ?? 0, huidige),
    steps.length,
  );
  useEffect(() => {
    if (staat && (staat.verstStap ?? 0) < huidige)
      werkBij({ verstStap: huidige });
  }, [staat, huidige, werkBij]);

  return (
    <StepIndicator
      steps={steps}
      current={huidige - 1}
      reached={volgendeBereikbaar ? verst - 1 : huidige - 1}
      label="Stappen"
      hideCount
    />
  );
};

export default Voortgang;
