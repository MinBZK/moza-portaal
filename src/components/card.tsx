import { ReactNode } from "react";

const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`mx-[-12px] rounded-sm bg-white p-4 shadow-[0_0_6px_rgba(0,0,0,0.16)] sm:mx-0 md:p-8 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
