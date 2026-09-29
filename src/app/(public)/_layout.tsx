import Breadcrumb from "@/layouts/breadcrumb";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";

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

      <div className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <div className="rhc-grid">
            <div className="rhc-grid__cell mox-breadcrumb-cell">
              <Breadcrumb />
            </div>
          </div>
        </div>
      </div>

      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <div className="rhc-grid">
            {withNavigation && (
              <nav className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
                <Navigation />
              </nav>
            )}
            <div
              className={
                withNavigation
                  ? "rhc-grid__cell rhc-grid__cell-t-9 mox-row-gap"
                  : "rhc-grid__cell mox-row-gap"
              }
            >
              {children}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
