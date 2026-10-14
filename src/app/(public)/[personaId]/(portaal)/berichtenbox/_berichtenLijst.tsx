"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  FormFieldTextInput,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import type { DemoBericht } from "@/demo";
import { useFlag } from "@/app/(public)/_flags/flagsContext";
import BerichtRij from "./_berichtRij";
import OphaalVoortgang, {
  useNagebootstOphalen,
  type Voortgang,
} from "./_ophaalVoortgang";
import {
  bewaarFoutTekst,
  isGemarkeerd,
  isOngelezen,
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
  onArchiveer,
  onVerwijder,
}: {
  onderwerp: string;
  onArchiveer: () => void;
  onVerwijder: () => void;
}) => {
  const delen = useFlag("mox_delen");
  const menuRef = useRef<HTMLUListElement>(null);
  // Het menu staat als popover in de top layer, dus buiten de scrollende
  // tabel. Elk menu krijgt een eigen anker om onder zijn knop te staan.
  const id = useId().replace(/[^\w-]/g, "");
  const menuId = `acties-${id}`;
  const sluit = () => menuRef.current?.hidePopover();

  return (
    <div
      className="mox-menu"
      style={{ "--mox-menu-anker": `--${menuId}` } as CSSProperties}
    >
      <Button
        appearance="subtle-button"
        className="mox-menu-trigger"
        popoverTarget={menuId}
      >
        <Icon icon="meer" />
        <VisuallyHidden>Acties voor {onderwerp}</VisuallyHidden>
      </Button>
      <ul ref={menuRef} id={menuId} popover="auto" className="mox-action-menu">
        {delen && (
          <li>
            <Button appearance="subtle-button" onClick={sluit}>
              <Icon icon="delen" />
              Delen
            </Button>
          </li>
        )}
        <li>
          <Button
            appearance="subtle-button"
            onClick={() => {
              sluit();
              onArchiveer();
            }}
          >
            <ArchiveIcon />
            Archiveren
          </Button>
        </li>
        <li>
          <Button
            appearance="subtle-button"
            onClick={() => {
              sluit();
              onVerwijder();
            }}
          >
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
};

const BerichtenLijst = ({
  berichten,
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
  const { staat, fout, zetGemarkeerd, archiveer, verwijder } =
    useBerichtenboxState();
  const [zoek, setZoek] = useState("");
  const [sortering, setSortering] = useState<Sortering | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [actieFout, setActieFout] = useState<string | null>(null);
  const meldingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (melding) meldingRef.current?.focus();
  }, [melding]);

  const inbox = staat
    ? berichten.filter(
        (bericht) => statusVanBericht(staat, bericht) === "inbox",
      )
    : null;
  const nagebootst = useNagebootstOphalen(
    weergave === "inbox" && !stelsel,
    inbox ? new Set(inbox.map((bericht) => bericht.afzenderId)).size : null,
    inbox?.length ?? 0,
  );

  const bezig = stelsel ? stelsel.bezig : nagebootst.bezig;
  const voortgang = stelsel ? stelsel.voortgang : nagebootst.voortgang;

  if (!staat || (stelsel?.bezig && !stelsel.voortgang)) {
    return <Paragraph role="status">Uw berichten worden geladen.</Paragraph>;
  }

  const naarEerstePagina = () => {
    if (pagina !== 1) router.replace(pathname, { scroll: false });
  };

  const inWeergave = berichten.filter(
    (bericht) => statusVanBericht(staat, bericht) === weergave,
  );
  const zoekterm = zoek.trim().toLowerCase();
  const gevonden = zoekterm
    ? inWeergave.filter((bericht) =>
        `${bericht.afzender} ${bericht.onderwerp}`
          .toLowerCase()
          .includes(zoekterm),
      )
    : inWeergave;
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
    setMelding(
      actie === "archiveren"
        ? `Het bericht "${bericht.onderwerp}" staat nu in het archief.`
        : `Het bericht "${bericht.onderwerp}" staat nu in de prullenbak.`,
    );
  };

  const ongelezen = inWeergave.filter((bericht) =>
    isOngelezen(staat, bericht.id, bericht.isOngelezen),
  ).length;
  const organisaties = new Set(inWeergave.map((bericht) => bericht.afzenderId))
    .size;

  return (
    <div>
      {bezig || stelsel?.fout ? null : weergave === "inbox" ? (
        <Paragraph className="mox-notice-amount-berichtenbox">
          {meervoud(inWeergave.length, "bericht", "berichten")} van{" "}
          {meervoud(organisaties, "organisatie", "organisaties")}, {ongelezen}{" "}
          ongelezen.
        </Paragraph>
      ) : (
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

      <div ref={meldingRef} tabIndex={-1}>
        {melding && !bezig && <Alert type="ok">{melding}</Alert>}
      </div>

      {weergave === "inbox" && (
        <FormFieldTextInput
          label="Filter berichten op afzender of onderwerp"
          type="search"
          value={zoek}
          className="mox-filter-berichtenbox"
          onChange={(event) => {
            // Het event komt van het tekstveld, maar is getypt als dat van de wrapper.
            setZoek((event.target as HTMLInputElement).value);
            naarEerstePagina();
          }}
        />
      )}

      {bezig && <OphaalVoortgang voortgang={voortgang} />}

      <div aria-live="polite" className="rhc-visually-hidden">
        {bezig
          ? "We halen uw berichten op bij de organisaties."
          : zoekterm
            ? `${meervoud(gevonden.length, "bericht", "berichten")} gevonden`
            : voortgang
              ? `${meervoud(voortgang.gevonden, "bericht", "berichten")} opgehaald.`
              : ""}
      </div>

      {bezig || stelsel?.fout ? null : gesorteerd.length === 0 ? (
        <Paragraph>
          {zoekterm
            ? `Er zijn geen berichten gevonden met "${zoek.trim()}". Probeer een ander woord.`
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
                      onMarkeer={() => zetGemarkeerd(bericht.id, !gemarkeerd)}
                    >
                      {weergave === "inbox" && (
                        <TableCell>
                          <RijActies
                            onderwerp={bericht.onderwerp}
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
            />
          )}
        </>
      )}
    </div>
  );
};

export default BerichtenLijst;
