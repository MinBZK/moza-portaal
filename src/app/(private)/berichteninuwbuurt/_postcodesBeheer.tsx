"use client";

import { useEffect, useRef, useState } from "react";
import {
  ActionGroup,
  Button,
  FormFieldTextInput,
  Heading,
  Icon,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  VisuallyHidden,
} from "@/components/rhc";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { useAddPostcodeVoorkeur } from "@/network/actualiteiten/hooks/addPostcodeVoorkeur/useAddPostcodeVoorkeur";
import { useDeletePostcodeVoorkeur } from "@/network/actualiteiten/hooks/deletePostcodeVoorkeur/useDeletePostcodeVoorkeur";

const POSTCODE_REGEX = /^[1-9][0-9]{3}(\s?[A-Za-z]{2})?$/;
const MAX_POSTCODES = 10;

const normalizePostcode = (pc: string) => pc.toUpperCase().replace(/\s/g, "");

const PostcodesBeheer = () => {
  const [kvkNummer, setKvkNummer] = useState<string | undefined | null>(null);
  useEffect(() => {
    getKvkFromCookie().then(setKvkNummer);
  }, []);

  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren();

  const addMutation = useAddPostcodeVoorkeur();
  const deleteMutation = useDeletePostcodeVoorkeur();

  const [newPostcode, setNewPostcode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const postcodeVoorkeuren = voorkeuren?.postcodes ?? [];

  if (kvkNummer == null || voorkeurenStatus === "pending") return null;

  const toonFout = (melding: string) => {
    setError(melding);
    inputRef.current?.focus();
  };

  const handleAdd = () => {
    setError("");
    const normalized = normalizePostcode(newPostcode);

    if (!POSTCODE_REGEX.test(newPostcode)) {
      toonFout("Voer een geldige postcode in (bijv. 1234 of 1234AB).");
      return;
    }

    if (postcodeVoorkeuren.some((v) => v.postcode === normalized)) {
      toonFout("Deze postcode is al toegevoegd.");
      return;
    }

    if (postcodeVoorkeuren.length >= MAX_POSTCODES) {
      toonFout(`U kunt maximaal ${MAX_POSTCODES} postcodes toevoegen.`);
      return;
    }

    addMutation.mutate(
      { postcode: normalized },
      { onSuccess: () => setNewPostcode("") },
    );
  };

  const handleDelete = (id: number) => deleteMutation.mutate({ id });

  return (
    <>
      <Heading level={2}>Uw postcodes</Heading>
      <Paragraph>
        Voeg postcodes toe om berichten in die omgeving te zien.
      </Paragraph>
      {postcodeVoorkeuren.length > 0 && (
        <UnorderedList>
          {postcodeVoorkeuren.map((v) => (
            <UnorderedListItem key={v.id}>
              {v.postcode}{" "}
              <Button
                appearance="subtle-button"
                onClick={() => handleDelete(v.id)}
                disabled={deleteMutation.isPending}
              >
                <Icon icon="kruis" />
                <VisuallyHidden>Verwijder postcode {v.postcode}</VisuallyHidden>
              </Button>
            </UnorderedListItem>
          ))}
        </UnorderedList>
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <FormFieldTextInput
          label="Postcode"
          inputRef={inputRef}
          value={newPostcode}
          onChange={(event) =>
            // Het event komt van het tekstveld, maar is getypt als dat van de wrapper.
            setNewPostcode((event.target as HTMLInputElement).value)
          }
          placeholder="1234AB"
          maxLength={7}
          invalid={!!error}
          errorMessage={error}
        />
        <ActionGroup direction="row">
          <Button
            appearance="secondary-action-button"
            type="submit"
            disabled={addMutation.isPending}
          >
            <Icon icon="plus" />
            Toevoegen
          </Button>
        </ActionGroup>
      </form>
    </>
  );
};

export default PostcodesBeheer;
