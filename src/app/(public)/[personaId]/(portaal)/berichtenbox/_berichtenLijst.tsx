"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  FormFieldSelect,
  FormFieldTextInput,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  SelectOption,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { FolderIcon } from "@/components/icons/folderIcon";
import { MailOpenIcon } from "@/components/icons/mailOpenIcon";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import TijdelijkeMelding from "@/components/TijdelijkeMelding";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import type { DemoBericht } from "@/demo";
import { useFlag } from "@/app/(public)/_flags/flagsContext";
import BerichtRij from "./_berichtRij";
import {
  bronnenVan,
  useDruppelen,
  useLaatstBinnengekomen,
  useNieuweBerichten,
  usePlanUitval,
  useUitval,
} from "./_demoSimulatie";
import MapDialog from "./_mapDialog";
import OphaalVoortgang, {
  useNagebootstOphalen,
  type Voortgang,
} from "./_ophaalVoortgang";
import {
  bewaarFoutTekst,
  isGemarkeerd,
  isOngelezen,
  mapVanBericht,
  statusVanBericht,
  useBerichtenboxState,
  type Weergave,
} from "./_useBerichtenboxState";

const PAGINA_GROOTTE = 10;

type SorteerSleutel = "afzender" | "onderwerp" | "datum";
type Sortering = { sleutel: SorteerSleutel; oplopend: boolean };

const meervoud = (aantal: number, enkelvoud: string, meer: string) =>
  `${aantal} ${aantal === 1 ? enkelvoud : meer}`;

const legeTekst: Record<Weergave, string> = {
  inbox:
    "Er staan geen berichten in uw inbox. Een nieuw bericht verschijnt hier zodra een organisatie u schrijft.",
  archief: "U heeft nog geen berichten gearchiveerd.",
  prullenbak: "Er staan geen berichten in de prullenbak.",
};

const SorteerKop = ({
  sleutel,
  sortering,
  onSorteer,
  children,
}: {
  sleutel: SorteerSleutel;
  sortering: Sortering | null;
  onSorteer: (sleutel: SorteerSleutel) => void;
  children: string;
}) => {
  const richting =
    sortering?.sleutel === sleutel
      ? sortering.oplopend
        ? "ascending"
        : "descending"
      : "none";
  // Eigen <th>: TableHeaderCell van RHC geeft aria-sort niet door aan de cel.
  return (
    <th scope="col" aria-sort={richting} className="utrecht-table__header-cell">
      <Button
        appearance="subtle-button"
        className="utrecht-table__header-cell-button"
        onClick={() => onSorteer(sleutel)}
      >
        {children}
        <Icon icon={richting === "none" ? "arrows-sort" : `sort-${richting}`} />
      </Button>
    </th>
  );
};

const RijActies = ({
  onderwerp,
  ongelezen,
  map,
  onArchiveer,
  onVerwijder,
  onOngelezen,
  onVerplaats,
  onUitMap,
}: {
  onderwerp: string;
  ongelezen: boolean;
  /** De map waarin het bericht staat. */
  map: string | null;
  onArchiveer: () => void;
  onVerwijder: () => void;
  onOngelezen: () => void;
  /** Opent de mapkeuze; de knop krijgt daarna de focus terug. */
  onVerplaats: (opener: HTMLElement | null) => void;
  onUitMap: () => void;
}) => {
  const delen = useFlag("mox_delen");
  const menuRef = useRef<HTMLUListElement>(null);
  const knopRef = useRef<HTMLButtonElement>(null);
  // Het menu staat als popover in de top layer, dus buiten de scrollende
  // tabel. Elk menu krijgt een eigen anker om onder zijn knop te staan.
  const id = useId().replace(/[^\w-]/g, "");
  const menuId = `acties-${id}`;
  const sluit = () => menuRef.current?.hidePopover();
  const actie = (uitvoeren: () => void) => () => {
    sluit();
    uitvoeren();
  };

  return (
    <div
      className="mox-menu"
      style={{ "--mox-menu-anker": `--${menuId}` } as CSSProperties}
    >
      <Button
        ref={knopRef}
        appearance="subtle-button"
        className="mox-menu-trigger"
        popoverTarget={menuId}
      >
        <Icon icon="meer" />
        <VisuallyHidden>Acties voor {onderwerp}</VisuallyHidden>
      </Button>
      <ul ref={menuRef} id={menuId} popover="auto" className="rhc-action-menu">
        {delen && (
          <li>
            <Button appearance="subtle-button" onClick={sluit}>
              <Icon icon="delen" />
              Delen
            </Button>
          </li>
        )}
        <li>
          <Button appearance="subtle-button" onClick={actie(onOngelezen)}>
            {ongelezen ? <MailOpenIcon /> : <Icon icon="mail" />}
            {ongelezen ? "Als gelezen markeren" : "Als ongelezen markeren"}
          </Button>
        </li>
        <li>
          <Button
            appearance="subtle-button"
            onClick={() => {
              sluit();
              onVerplaats(knopRef.current);
            }}
          >
            <FolderIcon />
            Naar map verplaatsen
          </Button>
        </li>
        {map && (
          <li>
            <Button appearance="subtle-button" onClick={actie(onUitMap)}>
              <Icon icon="inbox" />
              Uit map halen
            </Button>
          </li>
        )}
        <li>
          <Button appearance="subtle-button" onClick={actie(onArchiveer)}>
            <ArchiveIcon />
            Archiveren
          </Button>
        </li>
        <li>
          <Button appearance="subtle-button" onClick={actie(onVerwijder)}>
            <Icon icon="verwijderen" />
            Verwijderen
          </Button>
        </li>
      </ul>
    </div>
  );
};

/** Berichten uit het Federatief Berichtenstelsel in plaats van demo-data. */
export type StelselBron = {
  /** Nog bezig met laden of ophalen. */
  bezig: boolean;
  voortgang: Voortgang | null;
  /** Tekst als het ophalen niet lukte. */
  fout: string | null;
  /** Geeft null als het lukte, anders de tekst voor de gebruiker. */
  verplaats: (id: string, plek: Weergave) => Promise<string | null>;
  /** Zet een bericht in een map; een lege naam haalt het eruit. */
  zetMap: (id: string, map: string) => Promise<string | null>;
};

const BerichtenLijst = ({
  berichten: uitBron,
  weergave,
  pagina,
  stelsel,
}: {
  berichten: (DemoBericht & { plek?: Weergave })[];
  weergave: Weergave;
  pagina: number;
  stelsel?: StelselBron;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    staat,
    fout,
    zetGemarkeerd,
    zetOngelezen,
    zetMap,
    archiveer,
    verwijder,
  } = useBerichtenboxState();
  const zoekParams = useSearchParams();
  // Een map is een filter op de inbox, zoals in moza-poc.
  const map = weergave === "inbox" ? zoekParams.get("map") : null;
  const [afzender, setAfzender] = useState("");
  const [verplaats, setVerplaats] = useState<{
    id: string;
    opener: HTMLElement | null;
  } | null>(null);
  const [zoek, setZoek] = useState("");
  const [sortering, setSortering] = useState<Sortering | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  // Een map kiezen is een kleine wissel: die melding fadet na 3 seconden uit.
  // De nummer-key toont dezelfde tekst opnieuw.
  const [meldingTijdelijk, setMeldingTijdelijk] = useState(false);
  const [meldingNummer, setMeldingNummer] = useState(0);
  const [actieFout, setActieFout] = useState<string | null>(null);
  const meldingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (melding) meldingRef.current?.focus();
  }, [melding]);

  // Nagebootst federatief gedrag, alleen voor demo-berichten op de inbox.
  const simuleer = !stelsel && weergave === "inbox";
  const nieuwe = useNieuweBerichten();
  const alle = stelsel ? uitBron : [...(nieuwe ?? []), ...uitBron];
  const uitval = useUitval();
  const storing = simuleer && uitval.scenario ? uitval : null;
  // Een organisatie die niet antwoordt, levert geen berichten.
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
    simuleer,
    inboxAlle ? bronnenVan(inboxAlle).length : null,
    inbox?.length ?? 0,
    inbox ? bronnenVan(inbox).length : 0,
  );
  const naOphalen = simuleer && !!staat && !nagebootst.bezig;
  const alleBinnen = useDruppelen(naOphalen, bronnenVan(uitBron));
  usePlanUitval(naOphalen, uitval, bronnenVan(inbox ?? []));

  // Een binnengekomen bericht: kort laten oplichten en aankondigen.
  const nieuwId = useLaatstBinnengekomen();
  const nieuwBericht = alle.find((bericht) => bericht.id === nieuwId);

  const herstel = () => {
    if (!storing) return;
    const naam = storing.bron?.naam;
    storing.herstel();
    setMeldingTijdelijk(false);
    setMelding(
      naam
        ? `De berichten van ${naam} staan weer in uw inbox.`
        : "Uw berichten zijn opgehaald.",
    );
  };

  const bezig = stelsel ? stelsel.bezig : nagebootst.bezig;
  const voortgang = stelsel ? stelsel.voortgang : nagebootst.voortgang;

  if (!staat || (stelsel?.bezig && !stelsel.voortgang)) {
    return <Paragraph role="status">Uw berichten worden geladen.</Paragraph>;
  }

  const naarEerstePagina = () => {
    if (pagina !== 1) router.replace(pathname, { scroll: false });
  };

  const inWeergave = berichten.filter(
    (bericht) =>
      statusVanBericht(staat, bericht) === weergave &&
      (!map || mapVanBericht(staat, bericht) === map),
  );
  const zoekterm = zoek.trim().toLowerCase();
  const gevonden = inWeergave.filter(
    (bericht) =>
      (!afzender || bericht.afzenderId === afzender) &&
      (!zoekterm ||
        `${bericht.afzender} ${bericht.onderwerp}`
          .toLowerCase()
          .includes(zoekterm)),
  );
  // Organisaties voor het filter: alleen wie in deze weergave iets stuurde.
  const afzenders = bronnenVan(inWeergave).sort((a, b) =>
    a.naam.localeCompare(b.naam, "nl"),
  );
  // Mappen uit de berichten en de mappen die de gebruiker zelf maakte.
  const mappen = [
    ...new Set([
      ...berichten
        .map((bericht) => mapVanBericht(staat, bericht))
        .filter((naam): naam is string => !!naam),
      ...(stelsel ? [] : staat.eigenMappen),
    ]),
  ].sort((a, b) => a.localeCompare(b, "nl"));
  const gesorteerd = sortering
    ? [...gevonden].sort(
        (a, b) =>
          (sortering.oplopend ? 1 : -1) *
          a[sortering.sleutel].localeCompare(b[sortering.sleutel], "nl", {
            numeric: true,
          }),
      )
    : gevonden;

  const totaalPaginas = Math.max(
    1,
    Math.ceil(gesorteerd.length / PAGINA_GROOTTE),
  );
  const huidigePagina = Math.min(Math.max(1, pagina), totaalPaginas);
  const zichtbaar = gesorteerd.slice(
    (huidigePagina - 1) * PAGINA_GROOTTE,
    huidigePagina * PAGINA_GROOTTE,
  );

  const sorteer = (sleutel: SorteerSleutel) => {
    setSortering((huidig) => ({
      sleutel,
      oplopend: huidig?.sleutel === sleutel ? !huidig.oplopend : true,
    }));
    naarEerstePagina();
  };

  const voerUit = async (
    actie: "archiveren" | "verwijderen",
    bericht: DemoBericht,
  ) => {
    setActieFout(null);
    if (stelsel) {
      const tekst = await stelsel.verplaats(
        bericht.id,
        actie === "archiveren" ? "archief" : "prullenbak",
      );
      if (tekst) {
        setMelding(null);
        setActieFout(tekst);
        return;
      }
    } else {
      const gelukt =
        actie === "archiveren" ? archiveer(bericht.id) : verwijder(bericht.id);
      if (!gelukt) return;
    }
    setMeldingTijdelijk(false);
    setMelding(
      actie === "archiveren"
        ? `Het bericht "${bericht.onderwerp}" staat nu in het archief.`
        : `Het bericht "${bericht.onderwerp}" staat nu in de prullenbak.`,
    );
  };

  const wisselOngelezen = (bericht: DemoBericht) => {
    const wordtOngelezen = !isOngelezen(staat, bericht.id, bericht.isOngelezen);
    if (!zetOngelezen(bericht.id, wordtOngelezen)) return;
    setActieFout(null);
    setMeldingTijdelijk(false);
    setMelding(
      wordtOngelezen
        ? `Het bericht "${bericht.onderwerp}" is gemarkeerd als ongelezen.`
        : `Het bericht "${bericht.onderwerp}" is gemarkeerd als gelezen.`,
    );
  };

  /** Geeft null als het lukte, anders de tekst voor de gebruiker. */
  const zetInMap = async (bericht: DemoBericht, naar: string) => {
    const van = mapVanBericht(staat, bericht);
    if (stelsel) {
      const tekst = await stelsel.zetMap(bericht.id, naar);
      if (tekst) return tekst;
    } else if (!zetMap(bericht.id, naar)) {
      return "Het is niet gelukt om dit bericht te verplaatsen. Probeer het opnieuw.";
    }
    setActieFout(null);
    setMeldingTijdelijk(true);
    setMeldingNummer((n) => n + 1);
    setMelding(
      naar
        ? `Het bericht "${bericht.onderwerp}" staat nu in de map ${naar}.`
        : `Het bericht "${bericht.onderwerp}" is uit de map ${van} gehaald.`,
    );
    return null;
  };
  const teVerplaatsen = verplaats
    ? berichten.find((bericht) => bericht.id === verplaats.id)
    : undefined;

  const ongelezen = inWeergave.filter((bericht) =>
    isOngelezen(staat, bericht.id, bericht.isOngelezen),
  ).length;
  const organisaties = new Set(inWeergave.map((bericht) => bericht.afzenderId))
    .size;

  return (
    <div>
      {bezig ||
      stelsel?.fout ||
      storing?.scenario === "geen" ? null : weergave === "inbox" ? (
        <Paragraph className="rhc-notice-amount-inbox">
          {map && `Map ${map}: `}
          {meervoud(inWeergave.length, "bericht", "berichten")} van{" "}
          {meervoud(organisaties, "organisatie", "organisaties")}, {ongelezen}{" "}
          ongelezen.
        </Paragraph>
      ) : inWeergave.length === 0 ? null : (
        // Leeg archief of lege prullenbak: de lege-tekst eronder zegt het al.
        <Paragraph>
          {weergave === "archief"
            ? meervoud(
                inWeergave.length,
                "gearchiveerd bericht",
                "gearchiveerde berichten",
              )
            : meervoud(
                inWeergave.length,
                "verwijderd bericht",
                "verwijderde berichten",
              )}
        </Paragraph>
      )}

      {fout && <Alert type="error">{bewaarFoutTekst[fout]}</Alert>}
      {stelsel?.fout && <Alert type="error">{stelsel.fout}</Alert>}
      {actieFout && <Alert type="error">{actieFout}</Alert>}

      {!bezig && storing?.scenario === "een" && storing.bron && (
        <Alert type="warning">
          <Paragraph>
            De <b>{storing.bron.naam}</b> is nu niet bereikbaar. Berichten van
            andere organisaties staan hieronder.
          </Paragraph>
          <Button appearance="secondary-action-button" onClick={herstel}>
            {storing.bron.naam} opnieuw proberen
          </Button>
        </Alert>
      )}
      {!bezig && storing?.scenario === "geen" && (
        <Alert type="error">
          <Paragraph>
            Er gaat iets mis met het ophalen van berichten bij de organisaties.
            Probeer het later opnieuw.
          </Paragraph>
          <Button appearance="secondary-action-button" onClick={herstel}>
            Opnieuw proberen
          </Button>
        </Alert>
      )}
      {!bezig && storing?.scenario === "later" && storing.bron && (
        <Alert type="warning">
          <Paragraph>
            <b>{storing.bron.naam}</b> is zojuist niet meer bereikbaar.
            Berichten van deze organisatie staan daarom nu niet in de lijst.
          </Paragraph>
          <Button appearance="secondary-action-button" onClick={herstel}>
            Opnieuw proberen
          </Button>
        </Alert>
      )}
      <div role="status">
        {!bezig && alleBinnen && weergave === "inbox" && (
          <TijdelijkeMelding>
            <Paragraph>Alle demo-berichten zijn binnengekomen.</Paragraph>
          </TijdelijkeMelding>
        )}
      </div>

      {/* role="status": ook als de focus elders blijft, zoals na de mapkeuze. */}
      <div ref={meldingRef} tabIndex={-1} role="status">
        {melding &&
          !bezig &&
          (meldingTijdelijk ? (
            <TijdelijkeMelding key={meldingNummer}>{melding}</TijdelijkeMelding>
          ) : (
            <Alert type="ok">{melding}</Alert>
          ))}
      </div>

      {weergave === "inbox" && (
        <div className="rhc-inbox-filter rhc-inbox-filters">
          <FormFieldTextInput
            label="Filter berichten"
            type="search"
            value={zoek}
            onChange={(event) => {
              // Het event komt van het tekstveld, maar is getypt als dat van de wrapper.
              setZoek((event.target as HTMLInputElement).value);
              naarEerstePagina();
            }}
          />
          <FormFieldSelect
            label="Afzender"
            value={afzender}
            onChange={(event) => {
              setAfzender(event.target.value);
              naarEerstePagina();
            }}
          >
            <SelectOption value="">Alle afzenders</SelectOption>
            {afzenders.map((bron) => (
              <SelectOption key={bron.id} value={bron.id}>
                {bron.naam}
              </SelectOption>
            ))}
          </FormFieldSelect>
        </div>
      )}

      {bezig && <OphaalVoortgang voortgang={voortgang} />}

      <div aria-live="polite" className="rhc-visually-hidden">
        {nieuwBericht && !bezig
          ? `Nieuw bericht van ${nieuwBericht?.afzender}.`
          : bezig
            ? "We halen uw berichten op bij de organisaties."
            : zoekterm
              ? `${meervoud(gevonden.length, "bericht", "berichten")} gevonden`
              : voortgang
                ? `${meervoud(voortgang.gevonden, "bericht", "berichten")} opgehaald.`
                : ""}
      </div>

      {bezig ||
      stelsel?.fout ||
      storing?.scenario === "geen" ? null : gesorteerd.length === 0 ? (
        <Paragraph>
          {zoekterm
            ? `Er zijn geen berichten gevonden met "${zoek.trim()}". Probeer een ander woord.`
            : afzender
              ? "Er zijn geen berichten van deze afzender. Kies bij Afzender voor Alle afzenders."
              : map
                ? "In deze map staan nu geen berichten. Een bericht dat u archiveerde of verwijderde, staat in het archief of in de prullenbak."
                : legeTekst[weergave]}
        </Paragraph>
      ) : (
        <>
          <div className="mox-table-container">
            <Table>
              <caption className="rhc-visually-hidden">
                Berichten, pagina {huidigePagina} van {totaalPaginas}
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell scope="col">
                    <VisuallyHidden>Gemarkeerd</VisuallyHidden>
                  </TableHeaderCell>
                  <SorteerKop
                    sleutel="afzender"
                    sortering={sortering}
                    onSorteer={sorteer}
                  >
                    Afzender
                  </SorteerKop>
                  <SorteerKop
                    sleutel="onderwerp"
                    sortering={sortering}
                    onSorteer={sorteer}
                  >
                    Onderwerp
                  </SorteerKop>
                  <SorteerKop
                    sleutel="datum"
                    sortering={sortering}
                    onSorteer={sorteer}
                  >
                    Datum
                  </SorteerKop>
                  <TableHeaderCell scope="col">
                    <VisuallyHidden>Bijlage</VisuallyHidden>
                  </TableHeaderCell>
                  {weergave === "inbox" && (
                    <TableHeaderCell scope="col">
                      <VisuallyHidden>Acties</VisuallyHidden>
                    </TableHeaderCell>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {zichtbaar.map((bericht) => {
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
                      nieuw={bericht.id === nieuwId}
                      onMarkeer={() => zetGemarkeerd(bericht.id, !gemarkeerd)}
                    >
                      {weergave === "inbox" && (
                        <TableCell>
                          <RijActies
                            onderwerp={bericht.onderwerp}
                            ongelezen={isOngelezen(
                              staat,
                              bericht.id,
                              bericht.isOngelezen,
                            )}
                            map={mapVanBericht(staat, bericht)}
                            onOngelezen={() => wisselOngelezen(bericht)}
                            onVerplaats={(opener) =>
                              setVerplaats({ id: bericht.id, opener })
                            }
                            onUitMap={() => void zetInMap(bericht, "")}
                            onArchiveer={() =>
                              void voerUit("archiveren", bericht)
                            }
                            onVerwijder={() =>
                              void voerUit("verwijderen", bericht)
                            }
                          />
                        </TableCell>
                      )}
                    </BerichtRij>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totaalPaginas > 1 && (
            <PageNumberNavigation
              page={huidigePagina}
              totalPages={totaalPaginas}
              maxVisiblePages={7}
              query={map ? { map } : undefined}
            />
          )}
        </>
      )}

      {teVerplaatsen && (
        <MapDialog
          open
          mappen={mappen}
          huidige={mapVanBericht(staat, teVerplaatsen)}
          opener={verplaats?.opener ?? null}
          onKies={(naar) => zetInMap(teVerplaatsen, naar)}
          onSluit={() => setVerplaats(null)}
        />
      )}
    </div>
  );
};

export default BerichtenLijst;
