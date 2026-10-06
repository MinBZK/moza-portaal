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
  const [vraagVoorgoed, setVraagVoorgoed] = useState(false);
  const voorgoedKnopRef = useRef<HTMLButtonElement>(null);
  const bevestigKnopRef = useRef<HTMLButtonElement>(null);

  const status = staat ? statusVan(staat, berichtId) : null;
  const alGelezen = staat ? !!staat.gelezen[berichtId] : true;

  // Openen telt als lezen. Lukt bewaren niet, dan is dat geen melding waard.
  useEffect(() => {
    if (!alGelezen) markeerGelezen(berichtId);
  }, [alGelezen, berichtId, markeerGelezen]);

  useEffect(() => {
    if (vraagVoorgoed) bevestigKnopRef.current?.focus();
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
                  className={
                    gemarkeerd ? "text-[var(--rhc-color-oranje-500)]" : ""
                  }
                />
                Markeren
              </Button>

              {status === "inbox" ? (
                <Button
                  appearance="secondary-action-button"
                  onClick={() => verplaats(archiveer)}
                >
                  <ArchiveIcon />
                  Archiveren
                </Button>
              ) : (
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
                  aria-expanded={vraagVoorgoed}
                  onClick={() =>
                    vraagVoorgoed ? sluitVraag() : setVraagVoorgoed(true)
                  }
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

          {status === "prullenbak" && vraagVoorgoed && (
            <div
              role="group"
              aria-labelledby="voorgoed-vraag"
              className="space-y-3 rounded border border-[var(--rhc-color-border-subtle)] p-4"
              onKeyDown={(event) => {
                if (event.key === "Escape") sluitVraag();
              }}
            >
              <Paragraph id="voorgoed-vraag">
                Wilt u dit bericht voorgoed verwijderen? U kunt het daarna niet
                meer terugzetten.
              </Paragraph>
              <ActionGroup direction="row">
                <Button
                  ref={bevestigKnopRef}
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
                  appearance="secondary-action-button"
                  onClick={sluitVraag}
                >
                  Annuleren
                </Button>
              </ActionGroup>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default BerichtDetail;
