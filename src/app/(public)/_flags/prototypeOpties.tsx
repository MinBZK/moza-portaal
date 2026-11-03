"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/rhc";
import { Dropdown, DropdownItem } from "@/components/Dropdown";
import { openSideOverlay } from "@/components/SideOverlay";
import { useCookie } from "@/utils/useCookie";

/** Log in via Keycloak with the chosen login method. */
const KeycloakLogin = () => {
  const { set } = useCookie("loginMethod");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // K opens the menu, as F and P open the panels; not while typing or with
  // a dialog open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        event.isComposing ||
        event.defaultPrevented ||
        document.querySelector("dialog[open]")
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            "input, textarea, select, [contenteditable='true'], [role='textbox']",
          ))
      )
        return;
      event.preventDefault();
      triggerRef.current?.focus();
      triggerRef.current?.click();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const login = (method: "digid" | "eherkenning") => {
    set(method);
    signIn(undefined, { callbackUrl: "/" });
  };

  return (
    <Dropdown
      trigger="Keycloak"
      triggerClassName="utrecht-button utrecht-button--secondary-action rhc-button"
      triggerRef={triggerRef}
      triggerKeyShortcuts="k"
      align="end"
    >
      <DropdownItem onSelect={() => login("digid")}>DigiD</DropdownItem>
      <DropdownItem onSelect={() => login("eherkenning")}>
        eHerkenning
      </DropdownItem>
    </Dropdown>
  );
};

/**
 * Knoppen voor de panelen, voor wie de sneltoetsen F en P niet gebruikt. Op
 * de landingspagina ook de inlog via Keycloak (sneltoets K).
 */
const PrototypeOpties = ({
  keycloakLogin = false,
}: {
  keycloakLogin?: boolean;
}) => (
  <div className="prototype-options">
    {keycloakLogin && <KeycloakLogin />}
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
