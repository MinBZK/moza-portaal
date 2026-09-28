import Breadcrumb from "@/layouts/breadcrumb";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";

export default function WettenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header isPublic />
      <main id="hoofd-inhoud" className="utrecht-page-body">
        <div className="utrecht-page-body__content">
          <div className="rhc-grid">
            <nav className="main-navigation rhc-grid__cell rhc-grid__cell-t-3">
              <Navigation />
            </nav>
            <div className="rhc-grid__cell rhc-grid__cell-t-9">
              <Breadcrumb />
              {children}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
