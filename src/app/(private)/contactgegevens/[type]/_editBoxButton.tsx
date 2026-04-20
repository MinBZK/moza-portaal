import React from "react";

export const EditBoxButton = ({
  className,
  onClick,
  children,
  type = "button",
  icon,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-primary ml-auto flex cursor-pointer items-center gap-2 hover:underline ${className ?? ""}`}
    >
      {icon}
      {children}
    </button>
  );
};
