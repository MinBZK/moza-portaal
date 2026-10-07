"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
import { FlagIcon } from "@/components/icons/flagIcon";
import type { DemoBericht } from "@/demo";
import { formatDatum } from "./_formatDatum";
import OphaalVoortgang, { useNagebootstOphalen } from "./_ophaalVoortgang";
import {
  bewaarFoutTekst,
  isGemarkeerd,
  isOngelezen,
  statusVan,
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
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const knopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const sluitBijKlikBuiten = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const sluitBijEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      knopRef.current?.focus();
    };
    document.addEventListener("click", sluitBijKlikBuiten);
    document.addEventListener("keydown", sluitBijEscape);
    return () => {
      document.removeEventListener("click", sluitBijKlikBuiten);
      document.removeEventListener("keydown", sluitBijEscape);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        ref={knopRef}
        appearance="subtle-button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon icon="meer" />
        <VisuallyHidden>Acties voor {onderwerp}</VisuallyHidden>
      </Button>
      {open && (
        <ul className="absolute end-0 z-10 flex flex-col rounded bg-[var(--rhc-color-wit)] p-2 shadow-md">
          <li>
            {/* Schets uit moza-poc: Delen doet nog niets. */}
            <Button appearance="subtle-button" onClick={() => setOpen(false)}>
              <Icon icon="delen" />
              Delen
            </Button>
          </li>
          <li>
            <Button appearance="subtle-button" onClick={onArchiveer}>
              <ArchiveIcon />
              Archiveren
            </Button>
          </li>
          <li>
            <Button appearance="subtle-button" onClick={onVerwijder}>
              <Icon icon="verwijderen" />
              Verwijderen
            </Button>
          </li>
        </ul>
      )}
    </div>
  );
};

const BerichtenLijst = ({
  berichten,
  weergave,
  pagina,
}: {
  berichten: DemoBericht[];
  weergave: Weergave;
  pagina: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { staat, fout, zetGemarkeerd, archiveer, verwijder } =
    useBerichtenboxState();
  const [zoek, setZoek] = useState("");
  const [sortering, setSortering] = useState<Sortering | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const meldingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (melding) meldingRef.current?.focus();
  }, [melding]);

  const inbox = staat
    ? berichten.filter((bericht) => statusVan(staat, bericht.id) === "inbox")
    : null;
  const { bezig, voortgang } = useNagebootstOphalen(
    weergave === "inbox",
    inbox ? new Set(inbox.map((bericht) => bericht.afzenderId)).size : null,
    inbox?.length ?? 0,
  );

  if (!staat) {
    return <Paragraph role="status">Uw berichten worden geladen.</Paragraph>;
  }

  const naarEerstePagina = () => {
    if (pagina !== 1) router.replace(pathname, { scroll: false });
  };

  const inWeergave = berichten.filter(
    (bericht) => statusVan(staat, bericht.id) === weergave,
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

  const voerUit = (
    actie: "archiveren" | "verwijderen",
    bericht: DemoBericht,
  ) => {
    const gelukt =
      actie === "archiveren" ? archiveer(bericht.id) : verwijder(bericht.id);
    if (!gelukt) return;
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
    <div className="space-y-4">
      {bezig ? null : weergave === "inbox" ? (
        <Paragraph>
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

      <div ref={meldingRef} tabIndex={-1}>
        {melding && !bezig && <Alert type="ok">{melding}</Alert>}
      </div>

      {weergave === "inbox" && (
        <FormFieldTextInput
          label="Filter berichten"
          description="Filter op afzender of onderwerp."
          type="search"
          value={zoek}
          onChange={(event) => {
            // Het event komt van het tekstveld, maar is getypt als dat van de wrapper.
            setZoek((event.target as HTMLInputElement).value);
            naarEerstePagina();
          }}
        />
      )}

      {bezig && <OphaalVoortgang voortgang={voortgang} />}

      <div aria-live="polite" className="sr-only">
        {bezig
          ? "We halen uw berichten op bij de organisaties."
          : zoekterm
            ? `${meervoud(gevonden.length, "bericht", "berichten")} gevonden`
            : voortgang
              ? `${meervoud(voortgang.gevonden, "bericht", "berichten")} opgehaald.`
              : ""}
      </div>

      {bezig ? null : gesorteerd.length === 0 ? (
        <Paragraph>
          {zoekterm
            ? `Er zijn geen berichten gevonden met "${zoek.trim()}". Probeer een ander woord.`
            : legeTekst[weergave]}
        </Paragraph>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
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
                  const isNieuw = isOngelezen(
                    staat,
                    bericht.id,
                    bericht.isOngelezen,
                  );
                  const gemarkeerd = isGemarkeerd(staat, bericht.id);
                  return (
                    <TableRow key={bericht.id}>
                      <TableCell>
                        <button
                          type="button"
                          aria-pressed={gemarkeerd}
                          onClick={() => zetGemarkeerd(bericht.id, !gemarkeerd)}
                          className={`flex cursor-pointer rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                            gemarkeerd
                              ? "text-[var(--rhc-color-oranje-500)]"
                              : "text-[var(--rhc-color-foreground-subtle)]"
                          }`}
                        >
                          <FlagIcon filled={gemarkeerd} />
                          <VisuallyHidden>Markeren</VisuallyHidden>
                        </button>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`flex items-center gap-2 ${isNieuw ? "font-bold" : ""}`}
                        >
                          {isNieuw && (
                            <>
                              <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-[var(--rhc-color-oranje-500)]"
                              />
                              <VisuallyHidden>Ongelezen.</VisuallyHidden>
                            </>
                          )}
                          {bericht.afzender}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/berichtenbox/${bericht.id}`}
                          className={`utrecht-link utrecht-link--html-a ${isNieuw ? "font-bold" : ""}`}
                        >
                          {bericht.onderwerp}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDatum(bericht.datum)}
                      </TableCell>
                      <TableCell>
                        {bericht.heeftBijlage && (
                          <>
                            <Icon icon="paperclip" />
                            <VisuallyHidden>Heeft bijlage</VisuallyHidden>
                          </>
                        )}
                      </TableCell>
                      {weergave === "inbox" && (
                        <TableCell>
                          <RijActies
                            onderwerp={bericht.onderwerp}
                            onArchiveer={() => voerUit("archiveren", bericht)}
                            onVerwijder={() => voerUit("verwijderen", bericht)}
                          />
                        </TableCell>
                      )}
                    </TableRow>
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
