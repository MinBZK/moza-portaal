import { auth } from "@/auth";
import { getKvkFromCookie, getKvkOptionsFromCookie } from "@/utils/kvknummer";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import OngelezenBadge from "@/app/(public)/[personaId]/(portaal)/berichtenbox/_ongelezenBadge";
import Breadcrumb from "@/layouts/breadcrumb";
import Providers from "@/app/providers";
import { getFlagsFromServerCookie } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const flags = await getFlagsFromServerCookie();
  const session = await auth();
  const kvk = await getKvkFromCookie();
  const kvkOpties = await getKvkOptionsFromCookie();

  if (!session) {
    redirect("/");
  }

  return (
    <Providers session={session}>
      <Header kvk={kvk!} kvkOpties={kvkOpties} />
      {/* Zelfde opbouw als de PublicLayout in (public)/_layout.tsx */}
      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <div className="rhc-grid">
            <nav className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
              <Navigation
                flags={flags}
                berichtenboxBadge={<OngelezenBadge />}
              />
            </nav>
            <div className="rhc-grid__cell rhc-grid__cell-t-9 mox-main-container">
              <Breadcrumb />
              {children}
            </div>
          </div>
        </div>
      </main>
    </Providers>
  );
}
