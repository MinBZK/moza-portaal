import Breadcrumb from "@/layouts/breadcrumb";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
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
import { FlagsProvider } from "./_flags/flagsContext";
import FlagsPaneel from "./_flags/flagsPaneel";
import PersonaPaneel from "./_flags/personaPaneel";
import PrototypeOpties from "./_flags/prototypeOpties";
import {
  getActieveOrganisatie,
  getActievePersona,
  getIngelogdeNaam,
} from "./_persona";

export default async function PublicLayout({
  children,
  withNavigation = true,
  signedIn = true,
}: {
  children: React.ReactNode;
  withNavigation?: boolean;
  signedIn?: boolean;
}) {
  const [flags, persona, personas, berichtenboxVariant] = await Promise.all([
    getFlagsFromServerCookie(),
    getActievePersona(),
    getDemoPersonas(),
    getBerichtenboxVariant(),
  ]);
  const [organisatie, naam, conceptAanvragen] = await Promise.all([
    getActieveOrganisatie(persona),
    getIngelogdeNaam(persona),
    getDemoConceptAanvragen(persona?.id),
  ]);

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
        organisaties={
          persona?.organisaties.map((o) => ({
            id: getDemoOrganisatieId(o),
            handelsnaam: o.handelsnaam,
          })) ?? []
        }
      />

      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <div className="rhc-grid">
            {withNavigation && (
              <nav className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
                <Navigation
                  flags={flags}
                  berichtenboxBadge={<OngelezenBadge />}
                  lopendeZakenBadge={
                    <ZakenBadge nogInTeDienen={conceptAanvragen.length} />
                  }
                  naam={naam}
                  actieveOrganisatieId={
                    organisatie ? getDemoOrganisatieId(organisatie) : undefined
                  }
                  actieveOrganisatieNaam={organisatie?.handelsnaam}
                  organisaties={
                    persona?.organisaties.map((o) => ({
                      id: getDemoOrganisatieId(o),
                      handelsnaam: o.handelsnaam,
                    })) ?? []
                  }
                />
              </nav>
            )}
            <div
              className={
                withNavigation
                  ? "rhc-grid__cell rhc-grid__cell-t-9 rhc-main-container"
                  : "rhc-grid__cell rhc-row-gap"
              }
            >
              <Breadcrumb />
              {children}
            </div>
          </div>
        </div>
      </main>

      <PrototypeOpties />
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
