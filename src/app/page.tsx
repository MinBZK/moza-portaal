import { auth } from "@/auth";
import PublicPage from "./(public)/landing";
import Dashboard from "./(private)/dashboard";
import PrivateLayout from "./(private)/_layout";
import PublicLayout from "./(public)/_layout";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return (
      <PublicLayout>
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
