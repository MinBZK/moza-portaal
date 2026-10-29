"use client";

import { Button } from "@/components/rhc";
import { openSideOverlay } from "@/components/SideOverlay";

/** Knoppen voor de panelen, voor wie de sneltoetsen Alt+Shift+F en Alt+Shift+P niet gebruikt. */
const PrototypeOpties = () => (
  <div className="prototype-options">
    <Button
      appearance="secondary-action-button"
      aria-keyshortcuts="Alt+Shift+F"
      onClick={() => openSideOverlay("flags-paneel")}
    >
      Flags
    </Button>
    <Button
      appearance="secondary-action-button"
      aria-keyshortcuts="Alt+Shift+P"
      onClick={() => openSideOverlay("persona-paneel")}
    >
      Persona’s
    </Button>
  </div>
);

export default PrototypeOpties;
