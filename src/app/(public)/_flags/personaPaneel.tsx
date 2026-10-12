"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  Fieldset,
  FormFieldRadio,
} from "@rijkshuisstijl-community/components-react";
import SideOverlay from "@/components/SideOverlay";

export type PersonaKeuze = {
  id: string;
  label: string;
  handelsnaam: string;
  archief: boolean;
};

const VAN_DE_PERSONA = [
  "moza-berichtenbox",
  "moza-bewaard",
  "moza-zaken",
  "moza-contactorganisaties",
];

const PersonaPaneel = ({
  personas,
  actievePersonaId,
}: {
  personas: PersonaKeuze[];
  actievePersonaId?: string;
}) => {
  const pathname = usePathname();
  const [gekozen, setGekozen] = useState(actievePersonaId);

  const wisselPersona = (event: FormEvent) => {
    event.preventDefault();
    if (!gekozen || gekozen === actievePersonaId) return;
    const veilig = location.protocol === "https:" ? "; secure" : "";
    document.cookie = `personaId=${encodeURIComponent(gekozen)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${veilig}`;
    VAN_DE_PERSONA.forEach((sleutel) => localStorage.removeItem(sleutel));
    if (pathname.startsWith("/berichtenbox/")) location.href = "/berichtenbox";
    else location.reload();
  };

  const personaKeuze = (persona: PersonaKeuze) => (
    <FormFieldRadio
      key={persona.id}
      name="persona"
      value={persona.id}
      label={`${persona.label}: ${persona.handelsnaam}${persona.id === actievePersonaId ? " (actief)" : ""}`}
      checked={gekozen === persona.id}
      onChange={() => setGekozen(persona.id)}
    />
  );

  const hoofdlijst = personas.filter((persona) => !persona.archief);
  const archief = personas.filter((persona) => persona.archief);
  const actiefInArchief = archief.some(
    (persona) => persona.id === actievePersonaId,
  );

  return (
    <SideOverlay id="persona-paneel" title="Kies een persona" shortcut="p">
      <form onSubmit={wisselPersona}>
        <Fieldset legend="Persona’s">
          {hoofdlijst.map(personaKeuze)}
          {archief.length > 0 && (
            <details open={actiefInArchief}>
              <summary>Persona-archief ({archief.length})</summary>
              <div className="utrecht-form-fieldset__fieldset utrecht-form-fieldset--html-fieldset">
                {archief.map(personaKeuze)}
              </div>
            </details>
          )}
        </Fieldset>
        <Button
          type="submit"
          appearance="secondary-action-button"
          disabled={!gekozen || gekozen === actievePersonaId}
        >
          Wissel van persona
        </Button>
      </form>
    </SideOverlay>
  );
};

export default PersonaPaneel;
