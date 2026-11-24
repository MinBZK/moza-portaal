"use client";

import { useSyncExternalStore } from "react";
import {
  ActionGroup,
  Button,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
} from "@/components/rhc";

const OLD_HOST = "moza.mijnoverheidzakelijk.nl";
const NEW_HOST = "proef.mijnoverheidzakelijk.nl";
const HIDE_KEY = "verhuismelding-moza-nieuw-adres";

const subscribe = () => () => {};
const shouldShowNotice = () =>
  window.location.hostname === OLD_HOST &&
  localStorage.getItem(HIDE_KEY) !== "ja";

const getNewAddress = () => {
  const url = new URL(window.location.href);
  url.hostname = NEW_HOST;
  url.protocol = "https:";
  url.port = "";
  return url.toString();
};

const MovedNotice = () => {
  const show = useSyncExternalStore(subscribe, shouldShowNotice, () => false);
  if (show) return null;

  const newUrl = getNewAddress();

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
        U bekijkt de oude versie van het prototype. De nieuwste versie staat op{" "}
        <a href={newUrl} rel="noopener noreferrer">
          {newUrl}
        </a>
        .
      </Paragraph>
      <form method="dialog">
        <FormFieldCheckboxOption
          label={
            <div>
              <p>Verberg deze melding</p>
              <small>
                (Alles resetten bij de flags <kbd>F</kbd> brengt deze melding
                weer terug.)
              </small>
            </div>
          }
          onChange={(event) => {
            if (event.target.checked) localStorage.setItem(HIDE_KEY, "ja");
            else localStorage.removeItem(HIDE_KEY);
          }}
        />
        <ActionGroup>
          <a
            href={getNewAddress()}
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
