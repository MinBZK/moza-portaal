"use client";

import { Button } from "@/components/rhc";
import { openSideOverlay } from "@/components/SideOverlay";

/** Knoppen voor de panelen, voor wie de sneltoetsen F en P niet gebruikt. */
const PrototypeOpties = () => (
  <div className="prototype-options">
    <Button
      appearance="secondary-action-button"
      aria-keyshortcuts="f"
      onClick={() => openSideOverlay("flags-paneel")}
    >
      Flags
    </Button>
    <Button
      appearance="secondary-action-button"
      aria-keyshortcuts="p"
      onClick={() => openSideOverlay("persona-paneel")}
    >
      Persona’s
    </Button>
  </div>
);

export default PrototypeOpties;
