import "@/styles/globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import { auth } from "@/auth";
import { getKvkFromCookie, getKvkOptionsFromCookie } from "@/utils/kvknummer";
import { Footer } from "@/layouts/footer";
import Breadcrumb from "@/layouts/breadcrumb";
import PublicRootLayout from "./publiclayout";

export const metadata: Metadata = {
  title: "Mijn overheid zakelijk",
  description: "mijn overheid zakelijk",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const kvk = await getKvkFromCookie();
  const kvkOpties = await getKvkOptionsFromCookie();

  return (
    <html lang="en">
      <body className="bg-[#fafafa]">
        {!session ? (
          <PublicRootLayout />
        ) : (
          <Providers session={session}>
            <Header kvk={kvk!} kvkOpties={kvkOpties} />
            <main className="border-b-ro-blue after:bg-ro-blue relative border-b-2 pb-[68] after:absolute after:bottom-0 after:left-1/2 after:block after:h-[32px] after:w-[44px] after:-translate-x-1/2 after:content-['']">
              <div className="container mx-auto py-1.5">
                <div className="grid max-w-screen-xl grid-cols-[288px_1fr_1fr_1fr] justify-between gap-3">
                  <div className="hidden md:col-span-1 md:block">
                    <Navigation />
                  </div>
                  <div className="col-span-4 md:col-span-3 md:pt-[9px]">
                    <Breadcrumb />
                    <div className="space-y-4 pt-1.5">{children}</div>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </Providers>
        )}
      </body>
    </html>
  );
}
