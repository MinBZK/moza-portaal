"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Button, Icon } from "@rijkshuisstijl-community/components-react";

/**
 * Het hoofdmenu op een smal scherm: de knop staat in de header, het menu in
 * de navigatie. Ze delen hier of het menu open is. Het menu is open voor het
 * pad waarop het geopend werd, dus na een klik op een link klapt het dicht.
 */

let openOp: string | null = null;
const luisteraars = new Set<() => void>();
const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  return () => luisteraars.delete(luisteraar);
};
const zetOpenOp = (pad: string | null) => {
  openOp = pad;
  luisteraars.forEach((luisteraar) => luisteraar());
};

export const MENU_ID = "hoofdmenu";

export const useMenuOpen = () => {
  const pathname = usePathname();
  const pad = useSyncExternalStore(
    subscribe,
    () => openOp,
    () => null,
  );
  return pad === pathname;
};

const MenuKnop = () => {
  const pathname = usePathname();
  const open = useMenuOpen();
  const knopRef = useRef<HTMLButtonElement>(null);

  // De hoogte van de header als CSS-variabele: het open menu vult de rest van
  // het scherm (zie .rhc-menu-lists--open in rhc.css).
  useEffect(() => {
    const header = knopRef.current?.closest("header");
    if (!header) return;
    const meet = () =>
      document.documentElement.style.setProperty(
        "--mox-header-hoogte",
        `${header.offsetHeight}px`,
      );
    meet();
    const observer = new ResizeObserver(meet);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <Button
      ref={knopRef}
      appearance="subtle-button"
      className="rhc-menu-button"
      aria-expanded={open}
      aria-controls={MENU_ID}
      onClick={() => zetOpenOp(open ? null : pathname)}
    >
      <Icon icon={open ? "chevron-up" : "menu"} />
      Menu
    </Button>
  );
};

export default MenuKnop;
