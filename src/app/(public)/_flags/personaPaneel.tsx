"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon, LinkButton, VisuallyHidden } from "@/components/rhc";
import SideOverlay from "@/components/SideOverlay";
import { useCookie } from "@/utils/useCookie";

export type PersonaKeuze = {
  id: string;
  label: string;
  /** Voor- en achternaam uit de persona-gegevens. */
  naam: string;
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
  organisaties: {
    id: string;
    handelsnaam: string;
    functies?: string;
    rol?: string;
    werkzamePersonen?: number;
  }[];
  archief: boolean;
};

const VAN_DE_PERSONA = [
  "moza-berichtenbox",
  "moza-berichtenbox-nieuw",
  "moza-bewaard",
  "moza-zaken",
  "moza-contactorganisaties",
  "moza-iemand-aannemen",
];

const PersonaPaneel = ({
  personas,
  actievePersonaId,
}: {
  personas: PersonaKeuze[];
  actievePersonaId?: string;
}) => {
  const pathname = usePathname();
  const { set: setPersonaId } = useCookie("personaId");
  const { set: setOrganisatieId } = useCookie("organisatieId");

  /** Zet de persona met de eerste organisatie en laadt de pagina opnieuw. */
  const gebruik = (persona: PersonaKeuze) => {
    const organisatie = persona.organisaties[0];
    if (!organisatie || persona.id === actievePersonaId) return;

    const maxAge = 60 * 60 * 24 * 30;
    setPersonaId(persona.id, { path: "/", maxAge });
    setOrganisatieId(organisatie.id, { path: "/", maxAge });
    VAN_DE_PERSONA.forEach((sleutel) => localStorage.removeItem(sleutel));
    if (pathname.startsWith("/berichtenbox/"))
      window.location.assign("/berichtenbox");
    else location.reload();
  };

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

  const naamVan = (persona: PersonaKeuze) =>
    persona.profiel ? persona.label : persona.naam;

  /**
   * Soort ondernemer voor testaccounts, met dezelfde rol en kleur als de
   * uitgewerkte persona's.
   */
  const soortVan = (persona: PersonaKeuze) => {
    if (persona.profiel)
      return {
        rol: persona.profiel.rol,
        kleur: persona.profiel.labelKleur ?? persona.profiel.kleur,
      };
    const [eerste, ...andere] = persona.organisaties;
    const functies = `${eerste?.rol ?? ""}, ${eerste?.functies ?? ""}`;
    if (/intermediair|gemachtigd/i.test(functies))
      return { rol: "Intermediair", kleur: "oranje" };
    if (!/eigenaar|directeur|vennoot|maat/i.test(functies))
      return { rol: "Werknemer mkb", kleur: "paars" };
    if (andere.length === 0 && (eerste?.werkzamePersonen ?? 1) <= 1)
      return { rol: "Zzp’er", kleur: "hemelblauw" };
    return { rol: "Directeur mkb", kleur: "rood" };
  };

  const AANTAL = ["geen", "één", "twee", "drie", "vier", "vijf"];

  /** "Robin Vogel is winkelier bij Viervoeter & Co." voor testaccounts. */
  const beschrijvingVan = (persona: PersonaKeuze) => {
    if (persona.profiel) return persona.beschrijving;
    const [eerste, ...andere] = persona.organisaties;
    if (!eerste) return persona.beschrijving;
    // "Eigenaar, Winkelier": de laatste functie is de meest specifieke.
    const functie = (
      eerste.functies?.split(",").at(-1)?.trim() ?? "Eigenaar"
    ).toLowerCase();
    const aantal = AANTAL[andere.length] ?? String(andere.length);
    const meer =
      andere.length === 0
        ? ""
        : ` en heeft ${andere.length === 1 ? "nog één andere organisatie" : `${aantal} andere organisaties`}`;
    const zin = `${naamVan(persona)} is ${functie} bij ${eerste.handelsnaam}${meer}`;
    // Geen tweede punt na "B.V." of "N.V.".
    return zin.endsWith(".") ? zin : `${zin}.`;
  };

  return (
    <SideOverlay id="persona-paneel" title="Kies een persona" shortcut="p">
      <div>
        {groepen.map((groep) => (
          <div key={groep.titel} className="prototype-persona-group">
            <p className="prototype-persona-group__title">{groep.titel}</p>
            <div className="prototype-persona-cards">
              {groep.personas.map((persona) => (
                <div
                  key={persona.id}
                  className={`prototype-persona-card${persona.id === actievePersonaId ? " prototype-persona-card--active" : ""}`}
                  style={
                    persona.profiel
                      ? ({
                          "--prototype-persona-kleur": `var(--rhc-color-${persona.profiel.kleur}-100)`,
                          "--prototype-persona-label-kleur": `var(--rhc-color-${persona.profiel.labelKleur ?? persona.profiel.kleur}-100)`,
                        } as CSSProperties)
                      : ({
                          "--prototype-persona-label-kleur": `var(--rhc-color-${soortVan(persona).kleur}-100)`,
                        } as CSSProperties)
                  }
                >
                  <div className="prototype-persona-card__body">
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
                    {!persona.profiel && persona.organisaties[0] && (
                      <span className="prototype-persona-card__company">
                        {persona.organisaties[0].handelsnaam}
                      </span>
                    )}
                    <span className="prototype-persona-card__role">
                      {soortVan(persona).rol}
                    </span>
                    {beschrijvingVan(persona) && (
                      <span className="prototype-persona-description">
                        {beschrijvingVan(persona)}
                      </span>
                    )}
                  </div>
                  <div className="prototype-persona-card__actions">
                    {persona.id === actievePersonaId ? (
                      <span className="prototype-persona-card__active">
                        Actief
                      </span>
                    ) : (
                      <LinkButton
                        type="button"
                        onClick={() => gebruik(persona)}
                      >
                        Deze persona gebruiken
                        <VisuallyHidden>
                          : {naamVan(persona)},{" "}
                          {persona.profiel
                            ? persona.profiel.rol
                            : persona.organisaties[0]?.handelsnaam}
                        </VisuallyHidden>
                      </LinkButton>
                    )}
                    {persona.profiel && (
                      <a
                        href={`https://cx-moza.rijksapp.dev/personas/persona-${persona.id}.html`}
                        target="_blank"
                        rel="external noopener "
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
      </div>
    </SideOverlay>
  );
};

export default PersonaPaneel;
