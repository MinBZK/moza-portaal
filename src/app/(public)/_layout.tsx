import { cookies } from "next/headers";
import Breadcrumb from "@/layouts/breadcrumb";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import PageGrid from "@/layouts/navigation/pageGrid";
import { FOCUS_MODE_COOKIE } from "@/layouts/navigation/focusModeCookie";
import OngelezenBadge from "@/app/(public)/[personaId]/(portaal)/berichtenbox/_ongelezenBadge";
import ZakenBadge from "@/app/(public)/[personaId]/(portaal)/lopendezaken/_zakenBadge";
import {
  getBerichtenboxVariant,
  getFlagsFromServerCookie,
} from "@/app/actions";
import {
  getDemoConceptAanvragen,
  getDemoOrganisatieId,
  getDemoPersonas,
} from "@/demo";
import {
  DEMO_COMPONENT_NAMES,
  DEMO_LISTS,
  demoId,
} from "./[personaId]/(portaal)/demo/_components";
import { PATTERNS } from "./[personaId]/(portaal)/demo/ontwerppatronen/_patterns";
import { FlagsProvider } from "./_flags/flagsContext";
import FlagsPaneel from "./_flags/flagsPaneel";
import PersonaPaneel from "./_flags/personaPaneel";
import PrototypeOpties from "./_flags/prototypeOpties";
import {
  getActieveOrganisatie,
  getActievePersona,
  getIngelogdeNaam,
  getIngelogdeOrganisaties,
} from "./_persona";

export default async function PublicLayout({
  children,
  withNavigation = true,
  signedIn = true,
  keycloakLogin = false,
}: {
  children: React.ReactNode;
  withNavigation?: boolean;
  signedIn?: boolean;
  /** Show the Keycloak login among the prototype options (landing page). */
  keycloakLogin?: boolean;
}) {
  const [flags, persona, personas, berichtenboxVariant] = await Promise.all([
    getFlagsFromServerCookie(),
    getActievePersona(),
    getDemoPersonas(),
    getBerichtenboxVariant(),
  ]);
  const [organisatie, naam, conceptAanvragen, ingelogd] = await Promise.all([
    getActieveOrganisatie(persona),
    getIngelogdeNaam(persona),
    getDemoConceptAanvragen(persona?.id),
    getIngelogdeOrganisaties(persona),
  ]);
  // Alle organisaties van de persona; voor een organisatie zonder inlog
  // (na inloggen met een wallet) leidt de keuze naar apart inloggen.
  const organisaties =
    persona?.organisaties.map((o) => ({
      id: getDemoOrganisatieId(o),
      handelsnaam: o.handelsnaam,
      ingelogd: ingelogd.includes(o),
    })) ?? [];

  return (
    <FlagsProvider flags={flags}>
      <Header
        isPublic
        signedIn={signedIn}
        metMenu={withNavigation}
        naam={naam}
        actieveOrganisatieId={
          organisatie ? getDemoOrganisatieId(organisatie) : undefined
        }
        actieveOrganisatieNaam={organisatie?.handelsnaam}
        organisaties={organisaties}
      />

      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <PageGrid
            // Zonder de schakelaar (een flag voor onderzoek) staat focus-mode
            // in een taak altijd aan.
            focusModeOff={
              flags.mox_focusSchakelaar &&
              (await cookies()).get(FOCUS_MODE_COOKIE)?.value === "uit"
            }
          >
            {withNavigation && (
              <div className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
                <Navigation
                  berichtenboxBadge={<OngelezenBadge />}
                  lopendeZakenBadge={
                    <ZakenBadge nogInTeDienen={conceptAanvragen.length} />
                  }
                  naam={naam}
                  actieveOrganisatieId={
                    organisatie ? getDemoOrganisatieId(organisatie) : undefined
                  }
                  actieveOrganisatieNaam={organisatie?.handelsnaam}
                  organisaties={organisaties}
                  demoMenu={{
                    components: DEMO_COMPONENT_NAMES.map((name) => ({
                      id: demoId(name),
                      name,
                    })),
                    lists: [...DEMO_LISTS],
                    patterns: PATTERNS.map(({ slug, title }) => ({
                      id: slug,
                      name: title,
                    })),
                  }}
                />
              </div>
            )}
            <div
              className={
                withNavigation
                  ? "rhc-grid__cell rhc-grid__cell-t-9 rhc-mox-main-container"
                  : "rhc-grid__cell rhc-mox-row-gap"
              }
            >
              <Breadcrumb />
              {children}
            </div>
          </PageGrid>
        </div>
      </main>

      <PrototypeOpties keycloakLogin={keycloakLogin} />
      <FlagsPaneel
        flags={flags}
        berichtenboxVariant={berichtenboxVariant}
        assistentBackendIngesteld={!!process.env.ASSISTENT_BACKEND_URL}
      />
      <PersonaPaneel
        actievePersonaId={persona?.id}
        personas={personas.map((p) => ({
          id: p.id,
          label: p.label,
          naam: `${p.persoon.voornaam} ${p.persoon.achternaam}`,
          beschrijving: p.beschrijving,
          profiel: p.profiel,
          organisaties: p.organisaties.map((o) => ({
            id: getDemoOrganisatieId(o),
            handelsnaam: o.handelsnaam,
            functies: o.functies,
            rol: o.rol,
            werkzamePersonen:
              (o.werkzamePersonenFulltime ?? 0) +
              (o.werkzamePersonenParttime ?? 0),
          })),
          archief: !!p.archief,
        }))}
      />
    </FlagsProvider>
  );
}
