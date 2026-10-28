"use client";

import type { ReactNode } from "react";

import {
  Alert,
  Paragraph,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@/components/rhc";
import type { DemoBericht } from "@/demo";
import BerichtRij from "./berichtenbox/_berichtRij";
import {
  bronnenVan,
  useDruppelen,
  useNieuweBerichten,
  useUitval,
} from "./berichtenbox/_demoSimulatie";
import OphaalVoortgang, {
  useNagebootstOphalen,
} from "./berichtenbox/_ophaalVoortgang";
import {
  isGemarkeerd,
  isOngelezen,
  statusVanBericht,
  useBerichtenboxState,
} from "./berichtenbox/_useBerichtenboxState";
import { ketenFoutTekst, useKeten } from "./berichtenbox/_useKeten";

const AANTAL = 5;

/**
 * De vijf nieuwste berichten uit de berichtenbox. Net als in de berichtenbox worden
 * ze eerst opgehaald bij de organisaties, met de voortgang erbij: nagebootst
 * voor demo-berichten, echt voor een persona op het Federatief Berichtenstelsel.
 *
 * @param ontvanger Voor een aangesloten persona; zonder: de demo-berichten.
 * @param children Shown only once the messages have loaded, such as a link
 *   to the Berichtenbox.
 */
const RecenteBerichten = ({
  berichten: demo,
  ontvanger = null,
  children,
}: {
  berichten: DemoBericht[];
  ontvanger?: string | null;
  children?: ReactNode;
}) => {
  const { staat, zetGemarkeerd } = useBerichtenboxState();
  const stelsel = !!ontvanger;
  const keten = useKeten(ontvanger);
  const nieuwe = useNieuweBerichten();
  const uitval = useUitval();

  const alle = stelsel ? keten.berichten : [...(nieuwe ?? []), ...demo];
  // Een organisatie die niet antwoordt, levert geen berichten.
  const storing = !stelsel && uitval.scenario ? uitval : null;
  const berichten = storing
    ? alle.filter((bericht) => !storing.blokkeert(bericht))
    : alle;
  const inInbox = (lijst: typeof alle) =>
    staat
      ? lijst.filter((bericht) => statusVanBericht(staat, bericht) === "inbox")
      : null;
  const inboxAlle = inInbox(alle);
  const inbox = inInbox(berichten);

  const nagebootst = useNagebootstOphalen(
    !stelsel,
    inboxAlle ? bronnenVan(inboxAlle).length : null,
    inbox?.length ?? 0,
    inbox ? bronnenVan(inbox).length : 0,
  );
  // Ook op de homepage komen nieuwe berichten vanzelf binnen.
  useDruppelen(!stelsel && !!staat && !nagebootst.bezig, bronnenVan(demo));

  const bezig = stelsel
    ? keten.fase !== "klaar" && keten.fase !== "fout"
    : nagebootst.bezig;
  const voortgang = stelsel ? keten.voortgang : nagebootst.voortgang;

  if (!staat || !inbox || (stelsel && bezig && !voortgang)) {
    return <Paragraph role="status">Wij halen uw berichten op.</Paragraph>;
  }

  if (bezig) return <OphaalVoortgang voortgang={voortgang} />;

  if (keten.fout)
    return (
      <>
        <Alert type="error">{ketenFoutTekst[keten.fout]}</Alert>
        {children}
      </>
    );

  if (storing?.scenario === "geen") {
    return (
      <>
        <Alert type="error">
          <Paragraph>
            Er gaat iets mis met het ophalen van berichten bij de organisaties.
            Probeer het later opnieuw.
          </Paragraph>
        </Alert>
        {children}
      </>
    );
  }

  // Nieuwste eerst; een bericht dat net binnenkwam staat bovenaan.
  const recent = [...inbox]
    .sort((a, b) => b.datum.localeCompare(a.datum))
    .slice(0, AANTAL);

  return (
    <>
      {storing?.bron && (
        <Alert type="warning">
          <Paragraph>
            <b>{storing.bron.naam}</b> is nu niet bereikbaar. Berichten van deze
            organisatie staan daarom niet in de lijst. Probeer het later
            opnieuw.
          </Paragraph>
        </Alert>
      )}
      {recent.length === 0 ? (
        <Paragraph>
          Er staan geen berichten in uw berichtenbox Oudere berichten vindt u in
          uw berichtenbox.
        </Paragraph>
      ) : (
        <div className="rhc-mox-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">
                  <VisuallyHidden>Gemarkeerd</VisuallyHidden>
                </TableHeaderCell>
                <TableHeaderCell scope="col">Afzender</TableHeaderCell>
                <TableHeaderCell scope="col">Onderwerp</TableHeaderCell>
                <TableHeaderCell scope="col">Datum</TableHeaderCell>
                <TableHeaderCell scope="col">
                  <VisuallyHidden>Bijlage</VisuallyHidden>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((bericht) => {
                const gemarkeerd = isGemarkeerd(staat, bericht.id);
                return (
                  <BerichtRij
                    key={bericht.id}
                    bericht={bericht}
                    ongelezen={isOngelezen(
                      staat,
                      bericht.id,
                      bericht.isOngelezen,
                    )}
                    gemarkeerd={gemarkeerd}
                    onMarkeer={() => zetGemarkeerd(bericht.id, !gemarkeerd)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {children}
    </>
  );
};

export default RecenteBerichten;
