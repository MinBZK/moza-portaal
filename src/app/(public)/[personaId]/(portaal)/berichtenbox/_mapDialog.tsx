"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  ActionGroup,
  Alert,
  Button,
  FormFieldTextInput,
  Heading,
  Paragraph,
} from "@rijkshuisstijl-community/components-react";
import { FolderIcon } from "@/components/icons/folderIcon";

/**
 * Kies een map voor een bericht, of maak een nieuwe. Een modale dialog, net
 * als "Voorgoed verwijderen". Na sluiten gaat de focus terug naar `opener`.
 */
const MapDialog = ({
  open,
  mappen,
  huidige,
  opener,
  onKies,
  onSluit,
}: {
  open: boolean;
  mappen: string[];
  /** De map waarin het bericht nu staat. */
  huidige: string | null;
  opener: HTMLElement | null;
  /** Geeft null als het lukte, anders de tekst voor de gebruiker. */
  onKies: (map: string) => Promise<string | null> | string | null;
  onSluit: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const eersteRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [naam, setNaam] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [veldFout, setVeldFout] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      eersteRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const sluit = () => {
    // Eerst de modal dicht: zolang die open is, kan de focus niet terug.
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    opener?.focus();
    setNaam("");
    setFout(null);
    setVeldFout(null);
    onSluit();
  };

  const kies = async (map: string) => {
    const tekst = await onKies(map);
    if (tekst) setFout(tekst);
    else sluit();
  };

  const maakNieuwe = (event: FormEvent) => {
    event.preventDefault();
    const nieuw = naam.trim();
    if (!nieuw) {
      setVeldFout("Vul een naam voor de map in.");
      return;
    }
    void kies(nieuw);
  };

  const andere = mappen.filter((map) => map !== huidige);

  return (
    <dialog
      ref={dialogRef}
      className="mox-dialog"
      aria-labelledby={`${id}-kop`}
      // Escape sluit de dialog zelf; dan alleen nog opruimen.
      onClose={sluit}
    >
      <Heading level={2} id={`${id}-kop`}>
        Verplaatsen naar map
      </Heading>
      {fout && <Alert type="error">{fout}</Alert>}
      {andere.length > 0 && (
        <>
          <Paragraph>Kies een map:</Paragraph>
          <ul className="mox-map-keuze">
            {andere.map((map, index) => (
              <li key={map}>
                <Button
                  ref={index === 0 ? eersteRef : undefined}
                  appearance="subtle-button"
                  onClick={() => void kies(map)}
                >
                  <FolderIcon />
                  {map}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      <form onSubmit={maakNieuwe} noValidate>
        <FormFieldTextInput
          label={andere.length > 0 ? "Of maak een nieuwe map" : "Nieuwe map"}
          value={naam}
          invalid={!!veldFout}
          errorMessage={veldFout ?? undefined}
          onChange={(event) => {
            setNaam((event.target as HTMLInputElement).value);
            setVeldFout(null);
          }}
        />
        <ActionGroup direction="row">
          <Button appearance="primary-action-button" type="submit">
            Map maken en verplaatsen
          </Button>
          <Button
            ref={andere.length === 0 ? eersteRef : undefined}
            appearance="secondary-action-button"
            onClick={sluit}
          >
            Annuleren
          </Button>
        </ActionGroup>
      </form>
    </dialog>
  );
};

export default MapDialog;
