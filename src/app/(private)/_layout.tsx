import { auth } from "@/auth";
import { getKvkFromCookie, getKvkOptionsFromCookie } from "@/utils/kvknummer";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import OngelezenBadge from "@/app/(private)/berichtenbox/_ongelezenBadge";
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
      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <div className="rhc-grid">
            <div className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
              <Navigation
                flags={flags}
                berichtenboxBadge={<OngelezenBadge />}
              />
            </div>
            <div className="rhc-grid__cell rhc-grid__cell-t-9 mox-main-container">
              <Breadcrumb />
              <div className="mox-main-container">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </Providers>
  );
}
