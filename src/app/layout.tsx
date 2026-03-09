import "@/styles/globals.css";
import type { Metadata } from "next";
import { Footer } from "@/layouts/footer";

export const metadata: Metadata = {
  title: "Mijn overheid zakelijk",
  description: "mijn overheid zakelijk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body className="bg-[#fafafa]">
        {children}
        <Footer />
      </body>
    </html>
  );
}
