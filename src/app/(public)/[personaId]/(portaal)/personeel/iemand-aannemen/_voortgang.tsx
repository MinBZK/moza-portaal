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
}: {
  steps: { name: string; href: string }[];
  huidige: 1 | 2 | 3 | 4;
}) => {
  const { staat, werkBij } = useAannemen();
  const verst = Math.max(staat?.verstStap ?? 0, huidige);
  useEffect(() => {
    if (staat && (staat.verstStap ?? 0) < huidige)
      werkBij({ verstStap: huidige });
  }, [staat, huidige, werkBij]);

  return (
    <StepIndicator
      steps={steps}
      current={huidige - 1}
      reached={verst - 1}
      label="Stappen"
      hideCount
    />
  );
};

export default Voortgang;
