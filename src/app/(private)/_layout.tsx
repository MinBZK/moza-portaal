import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getKvkFromCookie, getKvkOptionsFromCookie } from "@/utils/kvknummer";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import PageGrid from "@/layouts/navigation/pageGrid";
import { FOCUS_MODE_COOKIE } from "@/layouts/navigation/focusModeCookie";
import OngelezenBadge from "@/app/(public)/[personaId]/(portaal)/berichtenbox/_ongelezenBadge";
import ZakenBadge from "@/app/(public)/[personaId]/(portaal)/lopendezaken/_zakenBadge";
import Breadcrumb from "@/layouts/breadcrumb";
import Providers from "@/app/providers";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const kvk = await getKvkFromCookie();
  const kvkOpties = await getKvkOptionsFromCookie();

  // Zie src/app/page.tsx: zonder gebruiker is er geen geldige sessie.
  if (!session?.user) {
    redirect("/");
  }

  return (
    <Providers session={session}>
      <Header kvk={kvk!} kvkOpties={kvkOpties} metMenu />
      {/* Zelfde opbouw als de PublicLayout in (public)/_layout.tsx */}
      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <PageGrid
            focusModeOff={
              (await cookies()).get(FOCUS_MODE_COOKIE)?.value === "uit"
            }
          >
            <div className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
              <Navigation
                berichtenboxBadge={<OngelezenBadge />}
                lopendeZakenBadge={<ZakenBadge />}
              />
            </div>
            <div className="rhc-grid__cell rhc-grid__cell-t-9 rhc-mox-main-container">
              <Breadcrumb />
              {children}
            </div>
          </PageGrid>
        </div>
      </main>
    </Providers>
  );
}
