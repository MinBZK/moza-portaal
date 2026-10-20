"use client";

import {
  Alert,
  Paragraph,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
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
 * De vijf nieuwste berichten uit de inbox. Net als in de Berichtenbox worden
 * ze eerst opgehaald bij de organisaties, met de voortgang erbij: nagebootst
 * voor demo-berichten, echt voor een persona op het Federatief Berichtenstelsel.
 *
 * @param ontvanger Voor een aangesloten persona; zonder: de demo-berichten.
 */
const RecenteBerichten = ({
  berichten: demo,
  ontvanger = null,
}: {
  berichten: DemoBericht[];
  ontvanger?: string | null;
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
    return <Paragraph role="status">Uw berichten worden geladen.</Paragraph>;
  }

  if (bezig) return <OphaalVoortgang voortgang={voortgang} />;

  if (keten.fout)
    return <Alert type="error">{ketenFoutTekst[keten.fout]}</Alert>;

  if (storing?.scenario === "geen") {
    return (
      <Alert type="error">
        <Paragraph>
          Er gaat iets mis met het ophalen van berichten bij de organisaties.
          Probeer het later opnieuw.
        </Paragraph>
      </Alert>
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
            organisatie staan daarom niet in de lijst.
          </Paragraph>
        </Alert>
      )}
      {recent.length === 0 ? (
        <Paragraph>Er staan geen berichten in uw inbox.</Paragraph>
      ) : (
        <div className="mox-table-container">
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
    </>
  );
};

export default RecenteBerichten;
