import Breadcrumb from "@/layouts/breadcrumb";
import Navigation from "@/layouts/navigation";

export default function SubsidiesLayout({
	children,
  }: {
	children: React.ReactNode;
  }) {
	return <>
	{/* <Header kvk={kvk!} kvkOpties={kvkOpties} /> */}
	<header>Header</header>
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
	</main></>
  }
  