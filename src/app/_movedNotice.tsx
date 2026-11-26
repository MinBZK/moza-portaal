"use client";

import { useSyncExternalStore } from "react";
import {
  ActionGroup,
  Button,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
} from "@/components/rhc";

/** The old address of the prototype; only there the notice shows. */
const OLD_HOST = "proef.moza.rijksapp.nl";
const NEW_URL = "https://moza.mijnoverheidzakelijk.nl/";
/** Same key as on proef.moza.rijksapp.dev; Hard reset in Flags clears it. */
const HIDE_KEY = "verhuismelding-niet-meer";

const subscribe = () => () => {};
const onOldHost = () =>
  window.location.hostname === OLD_HOST &&
  localStorage.getItem(HIDE_KEY) !== "ja";

/**
 * Tells visitors of the old address that the prototype has moved, in a modal
 * dialog on every page load, unless they tick "Verberg deze melding".
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
        MijnOverheid Zakelijk is verhuisd
      </Heading>
      <Paragraph>
        U bekijkt een oude versie van het prototype van MijnOverheid Zakelijk.
        Deze versie werken wij niet meer bij, maar blijft bewaard ter
        referentie.
      </Paragraph>
      <Paragraph>
        De nieuwe versie staat op een ander adres. Daar gebruiken wij andere
        technieken. Zo kunnen wij het prototype beter aansluiten op echte
        diensten en gegevens.
      </Paragraph>
      <Paragraph>Het nieuwe adres is moza.mijnoverheidzakelijk.nl.</Paragraph>
      <form method="dialog">
        <FormFieldCheckboxOption
          label={
            <>
              Verberg deze melding{" "}
              <small>(Hard reset in feature flags toont melding opnieuw)</small>
            </>
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
            Bekijk de oude versie
          </Button>
        </ActionGroup>
      </form>
    </dialog>
  );
};

export default MovedNotice;
