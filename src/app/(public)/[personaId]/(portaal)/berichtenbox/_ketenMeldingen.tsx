"use client";

import {
  Fragment,
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Alert, Button, Paragraph } from "@/components/rhc";
import type { Afgekapt, Volledigheid } from "@/network/keten/client";
import { haalOpnieuwOp } from "./_useKeten";

/**
 * Wat het stelsel zegt over de volledigheid van de lijst, en een verlopen
 * sessie. Zonder deze meldingen lijkt een onvolledige lijst volledig, en heeft
 * de ondernemer geen reden om het later nog eens te proberen.
 *
 * De meldingen staan in een `role="status"` die er altijd is: een live region
 * die samen met zijn inhoud verschijnt, lezen schermlezers vaak niet voor. Geen
 * `role="alert"`: ontbrekende organisaties zijn niet zo dringend.
 */

const OPNIEUW = "Berichten opnieuw ophalen";

/** "A", "A en B", "A, B en C". */
const noemOp = (namen: string[]) =>
  namen.map((naam, index) => (
    <Fragment key={index}>
      {index === 0 ? "" : index === namen.length - 1 ? " en " : ", "}
      {naam}
    </Fragment>
  ));

const meervoud = (aantal: number, een: string, meer: string) =>
  `${aantal} ${aantal === 1 ? een : meer}`;

const metAantallen = ({
  naam,
  aantalOpgehaald,
  totaalBeschikbaar,
}: Afgekapt) =>
  aantalOpgehaald !== undefined && totaalBeschikbaar
    ? `${naam} (${aantalOpgehaald} van ${totaalBeschikbaar} berichten)`
    : naam;

/**
 * De knop verdwijnt zodra het ophalen begint. De focus gaat daarom eerst naar
 * <main>, zoals bij het sluiten van een melding, en raakt niet kwijt op <body>.
 */
const OpnieuwKnop = () => {
  const kies = (event: MouseEvent<HTMLButtonElement>) => {
    const main = event.currentTarget.closest("main");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
    void haalOpnieuwOp();
  };
  return (
    <Button appearance="secondary-action-button" onClick={kies}>
      {OPNIEUW}
    </Button>
  );
};

/** Een container die er altijd is, zodat wat erin verschijnt voorgelezen wordt. */
// Niet atomair: een wijziging in de ene melding leest de andere niet opnieuw voor.
/** Zet de focus op <main>, zodat die niet op <body> belandt. */
const naarMain = (vanaf: Element | null) => {
  const main = vanaf?.closest("main") ?? document.querySelector("main");
  if (!main) return;
  if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });
};

/**
 * Een container die er altijd is, zodat wat erin verschijnt voorgelezen wordt.
 * Niet atomair: een wijziging in de ene melding leest de andere niet opnieuw
 * voor. Verdwijnt een melding met de focus erin (de knop wordt een laadtekst,
 * of de melding gaat weg), dan gaat de focus naar <main>.
 */
export const MeldingenRegio = ({ children }: { children: ReactNode }) => {
  const regio = useRef<HTMLDivElement>(null);
  const hadFocus = useRef(false);
  useLayoutEffect(() => {
    if (!hadFocus.current || regio.current?.contains(document.activeElement))
      return;
    hadFocus.current = false;
    naarMain(regio.current);
  });
  return (
    <div
      ref={regio}
      role="status"
      aria-atomic="false"
      onFocus={() => {
        hadFocus.current = true;
      }}
      onBlur={(event) => {
        if (!regio.current?.contains(event.relatedTarget as Node | null))
          hadFocus.current = false;
      }}
    >
      {children}
    </div>
  );
};

export const SessieVerlopen = ({
  herstelt,
  opBericht = false,
}: {
  /** Het opnieuw ophalen loopt al. */
  herstelt: boolean;
  /** Op de pagina van één bericht, niet bij de lijst. */
  opBericht?: boolean;
}) => (
  <Alert type="info" role="presentation">
    {herstelt ? (
      <Paragraph>
        {opBericht
          ? "Wij halen dit bericht opnieuw op…"
          : "Wij halen uw berichten opnieuw op…"}
      </Paragraph>
    ) : opBericht ? (
      <Paragraph>
        U was een tijd niet actief op deze pagina. Zodra u verdergaat, halen wij
        dit bericht opnieuw op.
      </Paragraph>
    ) : (
      <>
        <Paragraph>
          U was een tijd niet actief op deze pagina. Daarom staan hier misschien
          niet uw nieuwste berichten. Zodra u verdergaat, halen wij uw berichten
          opnieuw op.
        </Paragraph>
        <Paragraph>
          Kies <strong>{OPNIEUW}</strong> om de lijst nu bij te werken.
        </Paragraph>
        <OpnieuwKnop />
      </>
    )}
  </Alert>
);

/** Niet bereikbaar of te laat: een storing bij die organisatie. */
const isStoring = (status: string) => status === "FOUT" || status === "TIMEOUT";
/** Niet bevraagd: het was bij het stelsel te druk. Opnieuw proberen helpt. */
const isTeDruk = (status: string) => status === "NIET_OPGEHAALD";

const Volledigheidsmelding = ({
  volledigheid,
}: {
  volledigheid: Volledigheid;
}) => {
  const { aantalNietGeleverd, nietGeleverd, afgekapt, teLang, onzeker } =
    volledigheid;
  const storing = nietGeleverd
    .filter((o) => isStoring(o.status))
    .map((o) => o.naam);
  const teDruk = nietGeleverd
    .filter((o) => isTeDruk(o.status))
    .map((o) => o.naam);
  // Een uitkomst die wij niet kennen: niet geleverd, opnieuw proberen kan helpen.
  const anders = nietGeleverd
    .filter((o) => !isStoring(o.status) && !isTeDruk(o.status))
    .map((o) => o.naam);
  // Niet van elke organisatie is bekend welke het was.
  const naamloos = Math.max(0, aantalNietGeleverd - nietGeleverd.length);
  if (!aantalNietGeleverd && !afgekapt.length && !teLang && !onzeker)
    return null;

  return (
    <Alert type="warning" role="presentation">
      {storing.length === 1 && (
        <Paragraph>
          {storing[0]} was niet bereikbaar toen wij uw berichten ophaalden.
          Berichten en mappen van deze organisatie ontbreken daardoor misschien.
        </Paragraph>
      )}
      {storing.length > 1 && (
        <Paragraph>
          Deze organisaties waren niet bereikbaar toen wij uw berichten
          ophaalden: {noemOp(storing)}. Berichten en mappen van deze
          organisaties ontbreken daardoor misschien.
        </Paragraph>
      )}
      {teDruk.length === 1 && (
        <Paragraph>
          Bij {teDruk[0]} hebben wij uw berichten deze keer niet opgehaald. Het
          was bij ons te druk. Bij {teDruk[0]} zelf is niets mis. Berichten en
          mappen van deze organisatie ontbreken daardoor.
        </Paragraph>
      )}
      {teDruk.length > 1 && (
        <Paragraph>
          Bij {noemOp(teDruk)} hebben wij uw berichten deze keer niet opgehaald.
          Het was bij ons te druk. Bij deze organisaties zelf is niets mis.
          Berichten en mappen van deze organisaties ontbreken daardoor.
        </Paragraph>
      )}
      {anders.length > 0 && (
        <Paragraph>
          Van {noemOp(anders)} hebben wij uw berichten niet gekregen. Berichten
          en mappen van{" "}
          {anders.length === 1 ? "die organisatie" : "die organisaties"}{" "}
          ontbreken daardoor.
        </Paragraph>
      )}
      {naamloos > 0 && (
        <Paragraph>
          Van {nietGeleverd.length ? "nog " : ""}
          {meervoud(naamloos, "organisatie", "organisaties")} hebben wij uw
          berichten niet gekregen. Berichten en mappen van{" "}
          {naamloos === 1 ? "die organisatie" : "die organisaties"} ontbreken
          daardoor.
        </Paragraph>
      )}
      {afgekapt.length === 1 &&
        (afgekapt[0].aantalOpgehaald !== undefined &&
        afgekapt[0].totaalBeschikbaar ? (
          <Paragraph>
            Hier staan {afgekapt[0].aantalOpgehaald} van uw{" "}
            {afgekapt[0].totaalBeschikbaar} berichten van {afgekapt[0].naam}.
          </Paragraph>
        ) : (
          <Paragraph>
            Hier staan niet al uw berichten van {afgekapt[0].naam}.
          </Paragraph>
        ))}
      {afgekapt.length > 1 && (
        <Paragraph>
          Hier staan niet al uw berichten van deze organisaties:{" "}
          {noemOp(afgekapt.map(metAantallen))}.
        </Paragraph>
      )}
      {teLang && (
        <Paragraph>
          De lijst is te lang om alles te tonen. Daarom staan hier misschien
          niet al uw berichten.
        </Paragraph>
      )}
      {onzeker && (
        <Paragraph>Wij weten niet zeker of dit al uw berichten zijn.</Paragraph>
      )}
      {(aantalNietGeleverd > 0 || onzeker) && (
        <>
          <Paragraph>
            Kies <strong>{OPNIEUW}</strong> om het nog eens te proberen.
          </Paragraph>
          <OpnieuwKnop />
        </>
      )}
    </Alert>
  );
};

export default Volledigheidsmelding;
