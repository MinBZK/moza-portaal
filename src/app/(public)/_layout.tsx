import Breadcrumb from "@/layouts/breadcrumb";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import OngelezenBadge from "@/app/(public)/[personaId]/(portaal)/berichtenbox/_ongelezenBadge";
import { getFlagsFromServerCookie } from "@/app/actions";
import { getDemoPersonas } from "@/demo";
import { FlagsProvider } from "./_flags/flagsContext";
import FlagsPaneel from "./_flags/flagsPaneel";
import { getActievePersona } from "./_persona";

export default async function PublicLayout({
  children,
  withNavigation = true,
  signedIn = true,
}: {
  children: React.ReactNode;
  withNavigation?: boolean;
  signedIn?: boolean;
}) {
  const [flags, persona, personas] = await Promise.all([
    getFlagsFromServerCookie(),
    getActievePersona(),
    getDemoPersonas(),
  ]);

  return (
    <FlagsProvider flags={flags}>
      <Header
        isPublic
        signedIn={signedIn}
        naam={
          persona
            ? `${persona.persoon.voornaam} ${persona.persoon.achternaam}`
            : undefined
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
                />
              </nav>
            )}
            <div
              className={
                withNavigation
                  ? "rhc-grid__cell rhc-grid__cell-t-9 mox-main-container"
                  : "rhc-grid__cell mox-row-gap"
              }
            >
              <Breadcrumb />
              {children}
            </div>
          </div>
        </div>
      </main>

      <FlagsPaneel
        flags={flags}
        actievePersonaId={persona?.id}
        personas={personas.map((p) => ({
          id: p.id,
          label: p.label,
          handelsnaam: p.bedrijf.handelsnaam,
          archief: !!p.archief,
        }))}
      />
    </FlagsProvider>
  );
}
