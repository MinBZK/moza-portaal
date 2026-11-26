"use client";

import { Fragment, type ReactNode } from "react";
import { Alert, Button, Paragraph } from "@/components/rhc";
import type { Afgekapt, Volledigheid } from "@/network/keten/client";
import { haalOpnieuwOp } from "./_useKeten";

/**
 * Wat het stelsel zegt over de volledigheid van de lijst, en een verlopen
 * sessie. Zonder deze meldingen lijkt een onvolledige lijst volledig, en heeft
 * de ondernemer geen reden om het later nog eens te proberen.
 */

const OPNIEUW = "Berichten opnieuw ophalen";

/** "A", "A en B", "A, B en C", met de namen vet. */
const noemOp = (namen: ReactNode[]) =>
  namen.map((naam, index) => (
    <Fragment key={index}>
      {index === 0 ? "" : index === namen.length - 1 ? " en " : ", "}
      <b>{naam}</b>
    </Fragment>
  ));

const meervoud = (aantal: number, een: string, meer: string) =>
  `${aantal} ${aantal === 1 ? een : meer}`;

/** Wat er uit is, met aantallen als de organisatie die gaf. */
const metAantallen = ({
  naam,
  aantalOpgehaald,
  totaalBeschikbaar,
}: Afgekapt) =>
  aantalOpgehaald !== undefined && totaalBeschikbaar
    ? `${naam} (${aantalOpgehaald} van ${totaalBeschikbaar})`
    : naam;

/** Niet bereikbaar of te laat: een storing bij die organisatie. */
const isStoring = (status: string) => status === "FOUT" || status === "TIMEOUT";

const OpnieuwKnop = () => (
  <Button
    appearance="secondary-action-button"
    onClick={() => void haalOpnieuwOp()}
  >
    {OPNIEUW}
  </Button>
);

export const SessieVerlopen = () => (
  <Alert type="info">
    <Paragraph>
      Uw sessie is verlopen, omdat u een tijd niets heeft gedaan. Wat hier
      staat, is daardoor misschien niet meer actueel. Zodra u iets doet op deze
      pagina, halen wij uw berichten opnieuw op.
    </Paragraph>
    <OpnieuwKnop />
  </Alert>
);

const Volledigheidsmelding = ({
  volledigheid,
  aantal,
}: {
  volledigheid: Volledigheid;
  /** Hoeveel berichten er in de lijst staan. */
  aantal: number;
}) => {
  const { aantalNietGeleverd, nietGeleverd, afgekapt, teLang } = volledigheid;
  const storing = nietGeleverd.filter((o) => isStoring(o.status));
  const teDruk = nietGeleverd.filter((o) => !isStoring(o.status));
  // Niet van elke organisatie is bekend welke het was.
  const onbekend = Math.max(0, aantalNietGeleverd - nietGeleverd.length);
  if (!aantalNietGeleverd && !afgekapt.length && !teLang) return null;

  return (
    <Alert type="warning">
      {storing.length === 1 && (
        <Paragraph>
          {noemOp([storing[0].naam])} was niet bereikbaar toen wij uw berichten
          ophaalden. Berichten en mappen van deze organisatie ontbreken daardoor
          mogelijk.
        </Paragraph>
      )}
      {storing.length > 1 && (
        <Paragraph>
          Deze organisaties waren niet bereikbaar toen wij uw berichten
          ophaalden: {noemOp(storing.map((o) => o.naam))}. Berichten en mappen
          van deze organisaties ontbreken daardoor mogelijk.
        </Paragraph>
      )}
      {teDruk.length === 1 && (
        <Paragraph>
          Bij {noemOp([teDruk[0].naam])} hebben wij uw berichten deze keer niet
          opgehaald, omdat het te druk was. Bij deze organisatie is niets mis,
          maar haar berichten en mappen staan hier nu niet.
        </Paragraph>
      )}
      {teDruk.length > 1 && (
        <Paragraph>
          Bij deze organisaties hebben wij uw berichten deze keer niet
          opgehaald, omdat het te druk was: {noemOp(teDruk.map((o) => o.naam))}.
          Bij deze organisaties is niets mis, maar hun berichten en mappen staan
          hier nu niet.
        </Paragraph>
      )}
      {onbekend > 0 && (
        <Paragraph>
          Van {nietGeleverd.length ? "nog " : ""}
          {meervoud(onbekend, "organisatie", "organisaties")} hebben wij uw
          berichten niet gekregen. Berichten en mappen daarvan ontbreken
          daardoor.
        </Paragraph>
      )}
      {afgekapt.length === 1 &&
        (afgekapt[0].aantalOpgehaald !== undefined &&
        afgekapt[0].totaalBeschikbaar ? (
          <Paragraph>
            Van {noemOp([afgekapt[0].naam])} ziet u{" "}
            {afgekapt[0].aantalOpgehaald} van uw {afgekapt[0].totaalBeschikbaar}{" "}
            berichten. De andere berichten van deze organisatie staan hier niet.
          </Paragraph>
        ) : (
          <Paragraph>
            Van {noemOp([afgekapt[0].naam])} ziet u niet al uw berichten. Een
            deel van de berichten van deze organisatie staat hier niet.
          </Paragraph>
        ))}
      {afgekapt.length > 1 && (
        <Paragraph>
          Van deze organisaties ziet u niet al uw berichten:{" "}
          {noemOp(afgekapt.map(metAantallen))}. Een deel van hun berichten staat
          hier niet.
        </Paragraph>
      )}
      {teLang && (
        <Paragraph>
          U ziet de eerste {aantal} berichten. Mogelijk heeft u er meer.
        </Paragraph>
      )}
      {aantalNietGeleverd > 0 && (
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
