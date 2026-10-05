import { auth } from "@/auth";
import PublicPage from "./(public)/_landing";
import Dashboard from "./(private)/dashboard";
import PrivateLayout from "./(private)/_layout";
import PublicLayout from "./(public)/_layout";

export default async function Page() {
  const session = await auth();

  if (!session) {
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
