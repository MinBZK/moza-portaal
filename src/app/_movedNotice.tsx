"use client";

import { useSyncExternalStore } from "react";
import {
  ActionGroup,
  Button,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
} from "@/components/rhc";

/** The old addresses of the prototype; only there the notice shows. */
const OLD_HOSTS = new Set([
  "moza.mijnoverheidzakelijk.nl",
  "proef.moza.rijksapp.nl",
]);
const NEW_URL = "https://proef.mijnoverheidzakelijk.nl/";
/** A new key makes this address change visible to visitors who hid the old notice. */
const HIDE_KEY = "verhuismelding-proef-nieuw-adres";

const subscribe = () => () => {};
const onOldHost = () =>
  OLD_HOSTS.has(window.location.hostname) &&
  localStorage.getItem(HIDE_KEY) !== "ja";

/**
 * Tells visitors at an old address that the prototype has moved, in a modal
 * dialog on every page load, unless they hide the notice.
 */
const MovedNotice = () => {
  const show = useSyncExternalStore(subscribe, onOldHost, () => false);
  if (!show) return null;

  return (
    <dialog
      className="rhc-mox-dialog"
      aria-labelledby="moved-notice-title"
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
    >
      <Heading level={2} id="moved-notice-title">
        MijnOverheid Zakelijk heeft een nieuw adres
      </Heading>
      <Paragraph>
        U bekijkt een oude versie van het prototype. Wij werken deze versie niet
        meer bij, maar u kunt die blijven bekijken.
      </Paragraph>
      <Paragraph>
        De nieuwste versie staat op{" "}
        <a href="https://proef.mijnoverheidzakelijk.nl">
          proef.mijnoverheidzakelijk.nl
        </a>
        .
      </Paragraph>
      <form method="dialog">
        <FormFieldCheckboxOption
          label={
            <div>
              <p>Verberg deze melding </p>
              <small>
                (Alles wissen in feature flags (<kbd>F</kbd>) toont melding
                opnieuw)
              </small>
            </div>
          }
          onChange={(event) => {
            if ((event.target as HTMLInputElement).checked)
              localStorage.setItem(HIDE_KEY, "ja");
            else localStorage.removeItem(HIDE_KEY);
          }}
        />
        <ActionGroup>
          <a
            href={NEW_URL}
            autoFocus
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Ga naar de nieuwe versie
          </a>
          <Button appearance="secondary-action-button" type="submit">
            Blijf op deze website
          </Button>
        </ActionGroup>
      </form>
    </dialog>
  );
};

export default MovedNotice;
