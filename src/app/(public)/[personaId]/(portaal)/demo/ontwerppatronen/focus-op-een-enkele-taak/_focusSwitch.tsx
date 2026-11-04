"use client";

import { useState } from "react";
import { Paragraph } from "@/components/rhc";
import Switch from "@/components/Switch";
import CollapsibleNavigation from "@/layouts/navigation/collapsibleNavigation";

/** Turns the folded navigation on and off on this page, to try it out. */
const FocusSwitch = () => {
  const [on, setOn] = useState(false);
  return (
    <>
      {on && <CollapsibleNavigation />}
      <Switch label="Zijnavigatie inklappen" checked={on} onChange={setOn} />
      <Paragraph>
        Aan: op een scherm van 768 pixels of breder verdwijnt de zijnavigatie en
        loopt de inhoud over de volle breedte. In een taak zet de schakelaar{" "}
        <strong>Focus-mode</strong> onder de kop de navigatie terug.
      </Paragraph>
    </>
  );
};

export default FocusSwitch;
