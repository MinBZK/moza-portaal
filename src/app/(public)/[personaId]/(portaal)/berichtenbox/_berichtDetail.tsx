"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionGroup,
  Alert,
  Button,
  Heading,
  Paragraph,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import { FlagIcon } from "@/components/icons/flagIcon";
import type { DemoBericht } from "@/demo";
import BerichtenboxNav from "./_berichtenboxNav";
import {
  bewaarFoutTekst,
  isGemarkeerd,
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

const BerichtDetail = ({
  berichten,
  berichtId,
  children,
}: {
  berichten: DemoBericht[];
  berichtId: string;
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
  } = useBerichtenboxState();
  const delen = useFlag("mox_delen");
  const [vraagVoorgoed, setVraagVoorgoed] = useState(false);
  const voorgoedKnopRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const annuleerKnopRef = useRef<HTMLButtonElement>(null);

  const status = staat ? statusVan(staat, berichtId) : null;
  const alGelezen = staat ? !!staat.gelezen[berichtId] : true;

  // Openen telt als lezen. Lukt bewaren niet, dan is dat geen melding waard.
  useEffect(() => {
    if (!alGelezen) markeerGelezen(berichtId);
  }, [alGelezen, berichtId, markeerGelezen]);

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

  const verplaats = (actie: (id: string) => boolean) => {
    if (!status || status === "weg") return;
    if (actie(berichtId)) router.push(lijstVan[status]);
  };

  const gemarkeerd = staat ? isGemarkeerd(staat, berichtId) : false;

  return (
    <>
      <div className="mox-card">
        <BerichtenboxNav
          berichten={berichten}
          actief={status === "weg" ? null : status}
          opLijst={false}
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

            {status && (
              <ActionGroup direction="row">
                <Button
                  appearance="secondary-action-button"
                  aria-pressed={gemarkeerd}
                  onClick={() => zetGemarkeerd(berichtId, !gemarkeerd)}
                >
                  <FlagIcon
                    filled={gemarkeerd}
                    className={gemarkeerd ? "mox-button-mark-true" : ""}
                  />
                  Markeren
                </Button>

                {/* Schets uit moza-poc: Delen doet nog niets. */}
                {delen && (
                  <Button appearance="secondary-action-button">
                    <Icon icon="delen" />
                    Delen
                  </Button>
                )}

                {status !== "archief" && (
                  <Button
                    appearance="secondary-action-button"
                    onClick={() => verplaats(archiveer)}
                  >
                    <ArchiveIcon />
                    Archiveren
                  </Button>
                )}

                {status !== "inbox" && (
                  <Button
                    appearance="secondary-action-button"
                    onClick={() => verplaats(zetTerugInInbox)}
                  >
                    <Icon icon="inbox" />
                    Terugzetten in inbox
                  </Button>
                )}

                {status === "prullenbak" ? (
                  <Button
                    ref={voorgoedKnopRef}
                    appearance="secondary-action-button"
                    hint="danger"
                    aria-haspopup="dialog"
                    onClick={() => setVraagVoorgoed(true)}
                  >
                    <Icon icon="verwijderen" />
                    Voorgoed verwijderen
                  </Button>
                ) : (
                  <Button
                    appearance="secondary-action-button"
                    onClick={() => verplaats(verwijder)}
                  >
                    <Icon icon="verwijderen" />
                    Verwijderen
                  </Button>
                )}
              </ActionGroup>
            )}
          </>
        )}
      </div>

      {status === "prullenbak" && (
        <dialog
          ref={dialogRef}
          className="mox-dialog"
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
              onClick={() => {
                if (verwijderVoorgoed(berichtId)) {
                  router.push(lijstVan.prullenbak);
                }
              }}
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
