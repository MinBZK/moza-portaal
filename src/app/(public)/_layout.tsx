import Breadcrumb from "@/layouts/breadcrumb";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import OngelezenBadge from "@/app/(public)/inbox/_ongelezenBadge";

export default function PublicLayout({
  children,
  withNavigation = true,
  signedIn = true,
}: {
  children: React.ReactNode;
  withNavigation?: boolean;
  signedIn?: boolean;
}) {
  return (
    <>
      <Header isPublic signedIn={signedIn} />

      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <div className="rhc-grid">
            {withNavigation && (
              <nav className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
                <Navigation berichtenboxBadge={<OngelezenBadge />} />
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
    </>
  );
}
