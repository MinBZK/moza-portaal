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
        <div className="pointer-events-none fixed top-0 right-0 z-[9999] h-[120px] w-[220px] overflow-visible">
          <div className="absolute top-[60px] right-[-60px] w-[300px] rotate-45 bg-red-600 py-2 text-center text-lg font-bold text-white shadow-lg">
            DEMO WEBSITE
          </div>
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
