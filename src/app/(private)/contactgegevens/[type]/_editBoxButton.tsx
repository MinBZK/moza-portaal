import React from "react";
import { Button } from "@/components/rhc";

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
    <Button
      appearance="subtle-button"
      type={type}
      onClick={onClick}
      className={className}
    >
      {icon}
      {children}
    </Button>
  );
};
