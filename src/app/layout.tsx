import "@/styles/globals.css";

import "@rijkshuisstijl-community/design-tokens/dist/index.css"; // NLDS RHC design tokens importeren
import "@rijkshuisstijl-community/components-css/dist/index.css"; // NLDS RHC CSS importeren
import "@rijkshuisstijl-community/grid-css/dist/index.css"; // NLDS RHC grid

import "@/styles/rhc.css"; // MOx-afwijkingen nieuwe MO ‘sub-huisstijl’, na RHC zodat ze de basis kunnen overschrijven
import "@/styles/mox.css"; // MOx afwijkingen op RHC om tijdelijke de huidige huisstijl te tonen */

import type { Metadata } from "next";
import { Footer } from "@/layouts/footer";

import { SkipLink } from "@/components/rhc";
import { getFlagsFromServerCookie } from "@/app/actions";

export const metadata: Metadata = {
  title: "Mijn overheid zakelijk",
  description: "mijn overheid zakelijk",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const flags = await getFlagsFromServerCookie();
  // mox.css geldt alleen met de huidige huisstijl (keuze in het Flags-paneel).
  const huisstijl = flags.mox_nieuweHuisstijl ? "" : " mox-huidige-huisstijl";

  return (
    <html lang="en">
      <body className={`rhc-theme mox-theme${huisstijl}`}>
        <SkipLink href="#main">Naar de hoofdinhoud</SkipLink>
        {children}
        <Footer />
      </body>
    </html>
  );
}
