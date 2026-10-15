import { auth } from "@/auth";
import PublicPage from "./(public)/_landing";
import Dashboard from "./(private)/dashboard";
import PrivateLayout from "./(private)/_layout";
import PublicLayout from "./(public)/_layout";

export default async function Page() {
  const session = await auth();

  // Zonder geldige sessie de landingspagina. Ontbreekt AUTH_SECRET (lokaal
  // zonder .env.local), dan geeft auth() geen null maar een object zonder
  // gebruiker; dat telt niet als ingelogd.
  if (!session?.user) {
    return (
      <PublicLayout withNavigation={false} signedIn={false}>
        <PublicPage />
      </PublicLayout>
    );
  }

  return (
    <PrivateLayout>
      <Dashboard />
    </PrivateLayout>
  );
}
