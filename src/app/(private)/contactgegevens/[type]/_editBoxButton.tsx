import React from "react";
import { Button } from "@/components/rhc";

export const EditBoxButton = ({
  className,
  onClick,
  children,
  type = "button",
  icon,
  ariaLabel,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  /** Naam voor schermlezers, als de zichtbare tekst te kort is ("Aanpassen"). */
  ariaLabel?: string;
}) => {
  return (
    <Button
      appearance="subtle-button"
      type={type}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {icon}
      {children}
    </Button>
  );
};
