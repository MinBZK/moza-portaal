"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  Fieldset,
  FormFieldSelect,
  FormFieldRadio,
  SelectOption,
} from "@rijkshuisstijl-community/components-react";
import SideOverlay from "@/components/SideOverlay";
import { useCookie } from "@/utils/useCookie";

export type PersonaKeuze = {
  id: string;
  label: string;
  beschrijving?: string;
  organisaties: { id: string; handelsnaam: string }[];
  archief: boolean;
};

const VAN_DE_PERSONA = [
  "moza-berichtenbox",
  "moza-berichtenbox-nieuw",
  "moza-bewaard",
  "moza-zaken",
  "moza-contactorganisaties",
];

const PersonaPaneel = ({
  personas,
  actievePersonaId,
  actieveOrganisatieId,
}: {
  personas: PersonaKeuze[];
  actievePersonaId?: string;
  actieveOrganisatieId?: string;
}) => {
  const pathname = usePathname();
  const { set: setPersonaId } = useCookie("personaId");
  const { set: setOrganisatieId } = useCookie("organisatieId");
  const [gekozenPersonaId, setGekozenPersonaId] = useState(actievePersonaId);
  const [gekozenOrganisatieId, setGekozenOrganisatieId] =
    useState(actieveOrganisatieId);
  const gekozenPersona = personas.find(
    (persona) => persona.id === gekozenPersonaId,
  );

  const wisselPersona = (event: FormEvent) => {
    event.preventDefault();
    const organisatie = gekozenPersona?.organisaties.find(
      (item) => item.id === gekozenOrganisatieId,
    );
    if (!gekozenPersona || !organisatie) return;

    const maxAge = 60 * 60 * 24 * 30;
    setPersonaId(gekozenPersona.id, { path: "/", maxAge });
    setOrganisatieId(organisatie.id, { path: "/", maxAge });
    if (gekozenPersona.id !== actievePersonaId) {
      VAN_DE_PERSONA.forEach((sleutel) => localStorage.removeItem(sleutel));
    }
    if (
      gekozenPersona.id !== actievePersonaId &&
      pathname.startsWith("/berichtenbox/")
    )
      window.location.assign("/berichtenbox");
    else location.reload();
  };

  const kiesPersona = (personaId: string) => {
    const persona = personas.find((item) => item.id === personaId);
    if (!persona) return;
    setGekozenPersonaId(persona.id);
    setGekozenOrganisatieId(
      persona.id === actievePersonaId
        ? actieveOrganisatieId
        : persona.organisaties[0]?.id,
    );
  };

  const personaOpties = (lijst: PersonaKeuze[]) =>
    lijst.map((persona) => {
      const aantalOrganisaties = persona.organisaties.length;
      return (
        <SelectOption key={persona.id} value={persona.id}>
          {persona.label}
          {persona.id === actievePersonaId ? " (actief)" : ""} (
          {aantalOrganisaties}{" "}
          {aantalOrganisaties === 1 ? "organisatie" : "organisaties"})
        </SelectOption>
      );
    });

  const organisatieKeuze = (
    organisatie: PersonaKeuze["organisaties"][number],
  ) => (
    <FormFieldRadio
      key={`organisatie-${organisatie.id}`}
      name="organisatie"
      value={organisatie.id}
      label={`${organisatie.handelsnaam}${organisatie.id === actieveOrganisatieId && gekozenPersonaId === actievePersonaId ? " (actief)" : ""}`}
      checked={gekozenOrganisatieId === organisatie.id}
      onChange={() => setGekozenOrganisatieId(organisatie.id)}
    />
  );

  const hoofdlijst = personas.filter((persona) => !persona.archief);
  const archief = personas.filter((persona) => persona.archief);

  return (
    <SideOverlay id="persona-paneel" title="Kies een persona" shortcut="p">
      <form onSubmit={wisselPersona}>
        <Fieldset legend="Persona">
          <FormFieldSelect
            label="Kies een persona"
            value={gekozenPersonaId ?? ""}
            onChange={(event) => kiesPersona(event.target.value)}
          >
            <optgroup label="Persona’s">{personaOpties(hoofdlijst)}</optgroup>
            {archief.length > 0 && (
              <optgroup label="Persona-archief">
                {personaOpties(archief)}
              </optgroup>
            )}
          </FormFieldSelect>
          {gekozenPersona?.beschrijving && <p>{gekozenPersona.beschrijving}</p>}
        </Fieldset>
        {gekozenPersona && (
          <Fieldset legend="Organisatie">
            {gekozenPersona.organisaties.map(organisatieKeuze)}
          </Fieldset>
        )}
        <Button
          type="submit"
          appearance="secondary-action-button"
          disabled={
            !gekozenPersona ||
            !gekozenOrganisatieId ||
            (gekozenPersonaId === actievePersonaId &&
              gekozenOrganisatieId === actieveOrganisatieId)
          }
        >
          Keuze toepassen
        </Button>
      </form>
    </SideOverlay>
  );
};

export default PersonaPaneel;
