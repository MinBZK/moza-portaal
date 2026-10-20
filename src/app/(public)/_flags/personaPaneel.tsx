"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Button,
  Fieldset,
  FormFieldRadio,
} from "@rijkshuisstijl-community/components-react";
import { Icon, LinkButton, VisuallyHidden } from "@/components/rhc";
import SideOverlay from "@/components/SideOverlay";
import { useCookie } from "@/utils/useCookie";

export type PersonaKeuze = {
  id: string;
  label: string;
  beschrijving?: string;
  /** Uitgewerkte persona met avatar, zoals op cx-moza. Zonder: testaccount. */
  profiel?: {
    rol: string;
    kleur: string;
    /** Kleur van het rol-label; standaard dezelfde als de avatar. */
    labelKleur?: string;
    avatar: string;
    doelgroep?: string;
    /** Nog in uitwerking, zoals "(draft)" op cx-moza. */
    concept?: boolean;
  };
  organisaties: { id: string; handelsnaam: string; functies?: string }[];
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

  /** Zet persona en organisatie en laadt de pagina opnieuw. */
  const pasToe = (personaId?: string, organisatieId?: string) => {
    const persona = personas.find((item) => item.id === personaId);
    const organisatie = persona?.organisaties.find(
      (item) => item.id === organisatieId,
    );
    if (!persona || !organisatie) return;
    if (
      persona.id === actievePersonaId &&
      organisatie.id === actieveOrganisatieId
    )
      return;

    const maxAge = 60 * 60 * 24 * 30;
    setPersonaId(persona.id, { path: "/", maxAge });
    setOrganisatieId(organisatie.id, { path: "/", maxAge });
    if (persona.id !== actievePersonaId) {
      VAN_DE_PERSONA.forEach((sleutel) => localStorage.removeItem(sleutel));
    }
    if (
      persona.id !== actievePersonaId &&
      pathname.startsWith("/berichtenbox/")
    )
      window.location.assign("/berichtenbox");
    else location.reload();
  };

  const wisselPersona = (event: FormEvent) => {
    event.preventDefault();
    pasToe(gekozenPersonaId, gekozenOrganisatieId);
  };

  /** De organisatie die bij het kiezen van een persona hoort. */
  const organisatieBij = (persona: PersonaKeuze) =>
    persona.id === actievePersonaId
      ? actieveOrganisatieId
      : persona.organisaties[0]?.id;

  const kiesPersona = (personaId: string) => {
    const persona = personas.find((item) => item.id === personaId);
    if (!persona) return;
    setGekozenPersonaId(persona.id);
    setGekozenOrganisatieId(organisatieBij(persona));
  };

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

  // Uitgewerkte persona's per doelgroep, zoals op cx-moza. Daarna de
  // testaccounts zonder profiel, met placeholder-inhoud.
  const groepen = [
    {
      titel: "Ondernemers",
      personas: personas.filter((p) => p.profiel?.doelgroep === "ondernemer"),
    },
    {
      titel: "Dienstverleners",
      personas: personas.filter(
        (p) => p.profiel?.doelgroep === "dienstverlener",
      ),
    },
    {
      titel: "Testaccounts",
      personas: personas.filter((p) => !p.profiel && !p.archief),
    },
    {
      titel: "Persona-archief",
      personas: personas.filter((p) => !p.profiel && p.archief),
    },
  ].filter((groep) => groep.personas.length > 0);

  // Testaccounts zonder profiel heten voorlopig allemaal Robin Vogel.
  const naamVan = (persona: PersonaKeuze) =>
    persona.profiel ? persona.label : "Robin Vogel";

  /** Rol-label: van het profiel, anders functie en bedrijf. */
  const rolVan = (persona: PersonaKeuze) => {
    if (persona.profiel) return persona.profiel.rol;
    const [eerste, ...andere] = persona.organisaties;
    // "Eigenaar, Winkelier": de laatste functie is de meest specifieke.
    const functie = eerste?.functies?.split(",").at(-1)?.trim() ?? "Eigenaar";
    const meer =
      andere.length === 0
        ? ""
        : ` en ${andere.length} ${andere.length === 1 ? "andere organisatie" : "andere organisaties"}`;
    return `${functie} bij ${eerste?.handelsnaam}${meer}`;
  };

  return (
    <SideOverlay id="persona-paneel" title="Kies een persona" shortcut="p">
      <form onSubmit={wisselPersona}>
        <Fieldset legend="Persona">
          {groepen.map((groep) => (
            <div key={groep.titel} className="prototype-persona-group">
              <p className="prototype-persona-group__title">{groep.titel}</p>
              <div className="prototype-persona-cards">
                {groep.personas.map((persona) => (
                  <div
                    key={persona.id}
                    className="prototype-persona-card"
                    style={
                      persona.profiel &&
                      ({
                        "--prototype-persona-kleur": `var(--rhc-color-${persona.profiel.kleur}-100)`,
                        "--prototype-persona-label-kleur": `var(--rhc-color-${persona.profiel.labelKleur ?? persona.profiel.kleur}-100)`,
                      } as CSSProperties)
                    }
                  >
                    <label className="prototype-persona-card__select">
                      <input
                        type="radio"
                        name="persona"
                        value={persona.id}
                        checked={gekozenPersonaId === persona.id}
                        onChange={() => kiesPersona(persona.id)}
                        className="prototype-persona-card__input"
                      />
                      {persona.profiel?.concept && (
                        <span className="prototype-persona-card__concept">
                          Concept
                        </span>
                      )}
                      {/* Decoratief: de naam staat ernaast. */}
                      {persona.profiel ? (
                        <Image
                          src={persona.profiel.avatar}
                          alt=""
                          width={96}
                          height={96}
                          className="prototype-persona-card__avatar"
                          unoptimized
                        />
                      ) : (
                        <span className="prototype-persona-card__avatar prototype-persona-card__avatar--placeholder">
                          <Icon icon="user" />
                        </span>
                      )}
                      <span className="prototype-persona-card__name">
                        {naamVan(persona)}
                      </span>
                      <span className="prototype-persona-card__role">
                        {rolVan(persona)}
                      </span>
                      {persona.id === actievePersonaId && (
                        <span className="prototype-persona-card__active">
                          Actief
                        </span>
                      )}
                      {persona.beschrijving && (
                        <span className="prototype-persona-description">
                          {persona.beschrijving}
                        </span>
                      )}
                    </label>
                    {/* Buiten het label: een link in een label is niet toegestaan,
                      en een klik zou de persona activeren. */}
                    <div className="prototype-persona-card__actions">
                      {persona.id !== actievePersonaId && (
                        <LinkButton
                          type="button"
                          onClick={() =>
                            pasToe(persona.id, organisatieBij(persona))
                          }
                        >
                          Gebruik deze persona
                          <VisuallyHidden>
                            : {naamVan(persona)}, {rolVan(persona)}
                          </VisuallyHidden>
                        </LinkButton>
                      )}
                      {persona.profiel && (
                        <a
                          href={`https://cx-moza.rijksapp.dev/personas/persona-${persona.id}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="utrecht-link utrecht-link--html-a prototype-persona-card__more"
                        >
                          Meer over {persona.label}
                          <VisuallyHidden>
                            {" "}
                            (opent in een nieuw tabblad)
                          </VisuallyHidden>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
