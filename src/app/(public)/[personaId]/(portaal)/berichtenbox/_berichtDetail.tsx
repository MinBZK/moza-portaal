"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionGroup,
  Alert,
  Button,
  LinkButton,
  Heading,
  Paragraph,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { FolderIcon } from "@/components/icons/folderIcon";
import { MailOpenIcon } from "@/components/icons/mailOpenIcon";
import TijdelijkeMelding from "@/components/TijdelijkeMelding";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import { FlagIcon } from "@/components/icons/flagIcon";
import type { DemoBericht } from "@/demo";
import BerichtenboxNav from "./_berichtenboxNav";
import MapDialog from "./_mapDialog";
import {
  bewaarFoutTekst,
  isGemarkeerd,
  isOngelezen,
  mapVanBericht,
  statusVan,
  useBerichtenboxState,
  type Weergave,
} from "./_useBerichtenboxState";
import { useFlag } from "@/app/(public)/_flags/flagsContext";

const lijstVan: Record<Weergave, string> = {
  inbox: "/berichtenbox",
  archief: "/berichtenbox/archief",
  prullenbak: "/berichtenbox/prullenbak",
};

/** Een bericht uit het Federatief Berichtenstelsel: de plek staat daar. */
export type StelselActies = {
  plek: Weergave;
  /** Geeft null als het lukte, anders de tekst voor de gebruiker. */
  verplaats: (plek: Weergave) => Promise<string | null>;
  verwijderVoorgoed: () => Promise<string | null>;
  /** Zet het bericht in een map; een lege naam haalt het eruit. */
  zetMap: (map: string) => Promise<string | null>;
};

const BerichtDetail = ({
  berichten,
  berichtId,
  stelsel,
  children,
}: {
  berichten: (DemoBericht & { plek?: Weergave })[];
  berichtId: string;
  stelsel?: StelselActies;
  /** De inhoud van het bericht. */
  children: ReactNode;
}) => {
  const router = useRouter();
  const {
    staat,
    fout,
    markeerGelezen,
    zetGemarkeerd,
    archiveer,
    verwijder,
    zetTerugInInbox,
    verwijderVoorgoed,
    zetOngelezen,
    zetMap,
  } = useBerichtenboxState();
  // De knop die de mapkeuze opende; die krijgt na sluiten de focus terug.
  const [kiesMap, setKiesMap] = useState<HTMLElement | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  // (On)gelezen en een map kiezen zijn kleine wissels: die melding verdwijnt
  // na 3 seconden.
  const [tijdelijk, setTijdelijk] = useState(false);
  // Telt mee in de key, zodat dezelfde tekst opnieuw verschijnt.
  const [meldingNummer, setMeldingNummer] = useState(0);
  const delen = useFlag("mox_delen");
  const [vraagVoorgoed, setVraagVoorgoed] = useState(false);
  const [actieFout, setActieFout] = useState<string | null>(null);
  const voorgoedKnopRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const annuleerKnopRef = useRef<HTMLButtonElement>(null);

  const status = stelsel
    ? stelsel.plek
    : staat
      ? statusVan(staat, berichtId)
      : null;
  const bericht = berichten.find((b) => b.id === berichtId);
  const ongelezen =
    staat && bericht
      ? isOngelezen(staat, berichtId, bericht.isOngelezen)
      : false;
  const map = staat && bericht ? mapVanBericht(staat, bericht) : null;
  const mappen = staat
    ? [
        ...new Set([
          ...berichten
            .map((b) => mapVanBericht(staat, b))
            .filter((naam): naam is string => !!naam),
          ...(stelsel ? [] : staat.eigenMappen),
        ]),
      ].sort((a, b) => a.localeCompare(b, "nl"))
    : [];

  // Openen telt als lezen, één keer per bericht: daarna mag de gebruiker het
  // weer op ongelezen zetten. Lukt bewaren niet, dan is dat geen melding waard.
  const gelezenBijOpenen = useRef<string | null>(null);
  useEffect(() => {
    if (!staat || gelezenBijOpenen.current === berichtId) return;
    gelezenBijOpenen.current = berichtId;
    if (!staat.gelezen[berichtId] || staat.ongelezen[berichtId])
      markeerGelezen(berichtId);
  }, [staat, berichtId, markeerGelezen]);

  const wisselOngelezen = () => {
    if (!zetOngelezen(berichtId, !ongelezen)) return;
    setActieFout(null);
    setTijdelijk(true);
    setMeldingNummer((n) => n + 1);
    setMelding(
      ongelezen
        ? "Het bericht is gemarkeerd als gelezen."
        : "Het bericht is gemarkeerd als ongelezen.",
    );
  };

  /** Geeft null als het lukte, anders de tekst voor de gebruiker. */
  const zetInMap = async (naar: string) => {
    const van = map;
    if (stelsel) {
      const tekst = await stelsel.zetMap(naar);
      if (tekst) return tekst;
    } else if (!zetMap(berichtId, naar)) {
      return "Het is niet gelukt om dit bericht te verplaatsen. Probeer het opnieuw.";
    }
    setActieFout(null);
    setTijdelijk(true);
    setMeldingNummer((n) => n + 1);
    setMelding(
      naar
        ? `Het bericht staat nu in de map ${naar}.`
        : `Het bericht is uit de map ${van} gehaald.`,
    );
    return null;
  };

  // showModal() maakt de rest van de pagina onbereikbaar en sluit met Escape.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (vraagVoorgoed && !dialog.open) {
      dialog.showModal();
      // Focus op de veilige keuze, niet op de eerste knop.
      annuleerKnopRef.current?.focus();
    }
    if (!vraagVoorgoed && dialog.open) dialog.close();
  }, [vraagVoorgoed]);

  const sluitVraag = () => {
    setVraagVoorgoed(false);
    voorgoedKnopRef.current?.focus();
  };

  const verplaats = async (plek: Weergave) => {
    if (!status || status === "weg") return;
    setActieFout(null);
    if (stelsel) {
      const tekst = await stelsel.verplaats(plek);
      if (tekst) setActieFout(tekst);
      else router.push(lijstVan[status]);
      return;
    }
    const actie = {
      inbox: zetTerugInInbox,
      archief: archiveer,
      prullenbak: verwijder,
    }[plek];
    if (actie(berichtId)) router.push(lijstVan[status]);
  };

  const verwijderDefinitief = async () => {
    if (!stelsel) {
      if (verwijderVoorgoed(berichtId)) router.push(lijstVan.prullenbak);
      return;
    }
    const tekst = await stelsel.verwijderVoorgoed();
    if (!tekst) {
      router.push(lijstVan.prullenbak);
      return;
    }
    setVraagVoorgoed(false);
    setActieFout(tekst);
  };

  const gemarkeerd = staat ? isGemarkeerd(staat, berichtId) : false;

  return (
    <>
      <div className="mox-card">
        <BerichtenboxNav
          berichten={berichten}
          actief={status === "weg" ? null : status}
          opLijst={false}
          metNieuwe={!stelsel}
        />

        {status === "weg" ? (
          <>
            <Heading level={1}>Bericht verwijderd</Heading>
            <Paragraph>
              U heeft dit bericht voorgoed verwijderd. Het staat niet meer in uw
              Berichtenbox.
            </Paragraph>
            <Paragraph>
              <Link
                href="/berichtenbox"
                className="utrecht-link utrecht-link--html-a"
              >
                Ga naar uw inbox
              </Link>
            </Paragraph>
          </>
        ) : (
          <>
            {children}

            {fout && <Alert type="error">{bewaarFoutTekst[fout]}</Alert>}
            {actieFout && <Alert type="error">{actieFout}</Alert>}
            <div role="status">
              {melding &&
                (tijdelijk ? (
                  <TijdelijkeMelding key={meldingNummer}>
                    {melding}
                  </TijdelijkeMelding>
                ) : (
                  <Alert type="ok">{melding}</Alert>
                ))}
            </div>
            {map && status === "inbox" && (
              <Paragraph>
                <FolderIcon /> Dit bericht staat in de map{" "}
                <Link
                  href={`/berichtenbox?${new URLSearchParams({ map })}`}
                  className="utrecht-link utrecht-link--html-a"
                >
                  {map}
                </Link>
                .
              </Paragraph>
            )}

            {status && (
              <ActionGroup direction="row" className="mox-action-group-dense">
                <LinkButton
                  pressed={gemarkeerd}
                  onClick={() => zetGemarkeerd(berichtId, !gemarkeerd)}
                >
                  <FlagIcon
                    filled={gemarkeerd}
                    className={gemarkeerd ? "rhc-button-mark-true" : ""}
                  />
                  Markeren
                </LinkButton>

                <LinkButton onClick={wisselOngelezen}>
                  {ongelezen ? <MailOpenIcon /> : <Icon icon="mail" />}
                  {ongelezen
                    ? "Als gelezen markeren"
                    : "Als ongelezen markeren"}
                </LinkButton>

                {status === "inbox" && (
                  <LinkButton
                    aria-haspopup="dialog"
                    onClick={(event) => setKiesMap(event.currentTarget)}
                  >
                    <FolderIcon />
                    Naar map verplaatsen
                  </LinkButton>
                )}

                {status === "inbox" && map && (
                  <LinkButton onClick={() => void zetInMap("")}>
                    <Icon icon="inbox" />
                    Uit map halen
                  </LinkButton>
                )}

                {/* Schets uit moza-poc: Delen doet nog niets. */}
                {delen && (
                  <LinkButton>
                    <Icon icon="delen" />
                    Delen
                  </LinkButton>
                )}

                {status !== "archief" && (
                  <LinkButton onClick={() => void verplaats("archief")}>
                    <ArchiveIcon />
                    Archiveren
                  </LinkButton>
                )}

                {status !== "inbox" && (
                  <LinkButton onClick={() => void verplaats("inbox")}>
                    <Icon icon="inbox" />
                    Terugzetten in inbox
                  </LinkButton>
                )}

                {status === "prullenbak" ? (
                  <LinkButton
                    ref={voorgoedKnopRef}
                    className="rhc-link-button--danger"
                    aria-haspopup="dialog"
                    onClick={() => setVraagVoorgoed(true)}
                  >
                    <Icon icon="verwijderen" />
                    Voorgoed verwijderen
                  </LinkButton>
                ) : (
                  <LinkButton
                    className="rhc-link-button--danger"
                    onClick={() => void verplaats("prullenbak")}
                  >
                    <Icon icon="verwijderen" />
                    Verwijderen
                  </LinkButton>
                )}
              </ActionGroup>
            )}
          </>
        )}
      </div>

      {kiesMap && (
        <MapDialog
          open
          mappen={mappen}
          huidige={map}
          opener={kiesMap}
          onKies={zetInMap}
          onSluit={() => setKiesMap(null)}
        />
      )}

      {status === "prullenbak" && (
        <dialog
          ref={dialogRef}
          className="rhc-dialog"
          aria-labelledby="voorgoed-kop"
          aria-describedby="voorgoed-vraag"
          onClose={sluitVraag}
        >
          <Heading level={2} id="voorgoed-kop">
            Bericht voorgoed verwijderen?
          </Heading>
          <Paragraph id="voorgoed-vraag">
            U kunt het bericht daarna niet meer terugzetten.
          </Paragraph>
          <ActionGroup direction="row">
            <Button
              appearance="primary-action-button"
              hint="danger"
              onClick={() => void verwijderDefinitief()}
            >
              Ja, voorgoed verwijderen
            </Button>
            <Button
              ref={annuleerKnopRef}
              appearance="secondary-action-button"
              onClick={sluitVraag}
            >
              Annuleren
            </Button>
          </ActionGroup>
        </dialog>
      )}
    </>
  );
};

export default BerichtDetail;
