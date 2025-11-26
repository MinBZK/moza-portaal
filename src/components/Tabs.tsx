import Link from "next/link";

export const Tabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      role="tablist"
      className="flex w-full space-x-2 border-b-1 border-neutral-200"
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
      className={`px-2 py-1 ${isActive && "border-primary border-b-3 font-extrabold"}`}
    >
      {label}
    </Link>
  );
};
