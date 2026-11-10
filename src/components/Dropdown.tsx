"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";

const DropdownContext = createContext<() => void>(() => {});

/** Closes the dropdown this component is in, for example after an action. */
export const useDropdownClose = () => useContext(DropdownContext);

/**
 * Button with a menu that opens below it, such as the organisation choice in
 * the header or the actions of a message. Uses the popover API: a click
 * outside the menu or Escape closes it, and the browser keeps aria-expanded
 * up to date. The menu sits in the top layer, so it is never cut off by a
 * table or header, and is placed against its button with CSS anchor
 * positioning (rhc-mox-dropdown in rhc.css).
 */
export const Dropdown = ({
  trigger,
  triggerClassName = "utrecht-button utrecht-button--subtle rhc-button",
  triggerLabel,
  triggerRef,
  triggerKeyShortcuts,
  align = "end",
  children,
}: {
  /** Content of the button, such as an icon and a text. */
  trigger: ReactNode;
  /** Look of the button; by default a subtle RHC button. */
  triggerClassName?: string;
  /** Accessible name, when the content of the button is not enough. */
  triggerLabel?: string;
  /** For example to put focus back on the button after a dialog. */
  triggerRef?: Ref<HTMLButtonElement>;
  /** Keyboard shortcut that opens the menu (aria-keyshortcuts). */
  triggerKeyShortcuts?: string;
  /** Align the menu with the start or the end of the button. */
  align?: "start" | "end";
  /** DropdownItems. */
  children: ReactNode;
}) => {
  const id = useId().replace(/[^\w-]/g, "");
  const menuId = `dropdown-${id}`;
  const anchor = {
    "--rhc-mox-dropdown-anchor": `--${menuId}`,
  } as CSSProperties;
  const menuRef = useRef<HTMLUListElement>(null);
  const close = useCallback(() => menuRef.current?.hidePopover(), []);

  return (
    <DropdownContext.Provider value={close}>
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={menuId}
        aria-label={triggerLabel}
        aria-keyshortcuts={triggerKeyShortcuts}
        className={`${triggerClassName} rhc-mox-dropdown__trigger`}
        style={anchor}
      >
        {trigger}
      </button>
      <ul
        ref={menuRef}
        id={menuId}
        popover="auto"
        className={`rhc-mox-dropdown__menu rhc-mox-dropdown__menu--${align}`}
        style={anchor}
      >
        {children}
      </ul>
    </DropdownContext.Provider>
  );
};

/**
 * One choice in a Dropdown. Closes the menu and then runs onSelect. With
 * `selected` the item is a choice out of several: the chosen one gets
 * aria-current, which the CSS shows with a background and semi-bold text.
 */
export const DropdownItem = ({
  icon,
  selected,
  keepOpen = false,
  onSelect,
  children,
}: {
  icon?: ReactNode;
  /** Only for a choice out of several, such as the organisation. */
  selected?: boolean;
  /** Keep the menu open after the click. */
  keepOpen?: boolean;
  onSelect?: () => void;
  children: ReactNode;
}) => {
  const close = useDropdownClose();
  return (
    <li>
      <button
        type="button"
        className="rhc-mox-dropdown__item"
        aria-current={selected ? "true" : undefined}
        onClick={() => {
          if (!keepOpen) close();
          onSelect?.();
        }}
      >
        {icon}
        {children}
      </button>
    </li>
  );
};
