import Link from "next/link";

export const Tabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      role="tablist"
      className="mx-[-16px] flex w-[calc(100%_+_32px)] border-b-1 border-neutral-200 px-[16px] sm:mx-[-32px] sm:w-[calc(100%_+_64px)] sm:px-[32px] lg:mx-[-40px] lg:w-[calc(100%_+_80px)] lg:px-[40px]"
    >
      {children}
    </div>
  );
};

export const Tab = ({
  isActive,
  href,
  label,
}: {
  isActive: boolean;
  href: string;
  label: string;
}) => {
  return (
    <Link
      role="tab"
      href={href}
      className={`px-4 py-1 ${isActive && "border-primary cursor-pointer border-b-4 font-extrabold"}`}
    >
      <span className="hover-up">{label}</span>
    </Link>
  );
};
