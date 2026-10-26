"use client";

import { useEffect, useState } from "react";
import { Icon, LinkButton, VisuallyHidden } from "@/components/rhc";
import { useDropdownClose } from "@/components/Dropdown";
import { CheckIcon } from "@/components/icons/checkIcon";

/** How long the "copied" confirmation stays visible. */
const CONFIRM_MS = 3000;

/**
 * Opens the share sheet of the operating system (Web Share API). Where that
 * is not available, such as Firefox on desktop, it copies the link instead
 * and confirms that in the button.
 *
 * `variant="menu"` renders an item for a Dropdown, as in the Berichtenbox
 * list; after sharing it closes that dropdown. `onShared` runs after the
 * share sheet closes.
 */
const ShareButton = ({
  title,
  text,
  url,
  variant = "link",
  onShared,
}: {
  /** Defaults to the page title. */
  title?: string;
  text?: string;
  /** Path or full URL; defaults to the current page. */
  url?: string;
  variant?: "link" | "menu";
  onShared?: () => void;
}) => {
  const [result, setResult] = useState<"copied" | "failed" | null>(null);
  const closeDropdown = useDropdownClose();

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(null), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [result]);

  const share = async () => {
    const data = {
      title: title ?? document.title,
      text,
      url: new URL(url ?? window.location.href, window.location.origin).href,
    };

    if (navigator.share && (navigator.canShare?.(data) ?? true)) {
      try {
        await navigator.share(data);
      } catch {
        // Closed by the user (AbortError) or not allowed: nothing to report.
      }
      onShared?.();
      closeDropdown();
      return;
    }

    try {
      await navigator.clipboard.writeText(data.url);
      setResult("copied");
    } catch {
      setResult("failed");
    }
  };

  const label = (
    <>
      {result === "copied" ? <CheckIcon /> : <Icon icon="delen" />}
      {result === "copied" ? "Link gekopieerd" : "Delen"}
    </>
  );

  return (
    <>
      {variant === "menu" ? (
        <button
          type="button"
          className="rhc-mox-dropdown__item"
          onClick={share}
        >
          {label}
        </button>
      ) : (
        <LinkButton onClick={share}>{label}</LinkButton>
      )}
      {/* A span: the button can sit in an ActionGroup, which is a <p>. */}
      <span role="status">
        {result === "copied" && (
          <VisuallyHidden>De link is gekopieerd.</VisuallyHidden>
        )}
        {result === "failed" &&
          "Kopiëren lukt niet. Kopieer de link uit de adresbalk."}
      </span>
    </>
  );
};

export default ShareButton;
