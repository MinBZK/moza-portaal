import Header from "@/layouts/header";

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header isPublic={true} />
      <main className="border-b-ro-blue after:bg-ro-blue relative border-b-2 pb-[68] after:absolute after:bottom-0 after:left-1/2 after:block after:h-[32px] after:w-[44px] after:-translate-x-1/2 after:content-['']">
        {children}
      </main>
    </>
  );
}
