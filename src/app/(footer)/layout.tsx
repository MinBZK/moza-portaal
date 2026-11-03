import PublicLayout from "@/app/(public)/_layout";

/**
 * Pages from the footer for a visitor without a persona. With a persona the
 * proxy sends the same address to the portal ([personaId]/(portaal)/[slug]).
 */
const FooterLayout = ({ children }: { children: React.ReactNode }) => (
  <PublicLayout withNavigation={false} signedIn={false}>
    {children}
  </PublicLayout>
);

export default FooterLayout;
