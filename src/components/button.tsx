import React, { ReactNode } from "react";

interface Props extends React.HTMLProps<HTMLButtonElement> {
  type?: "submit" | "reset" | "button" | undefined;
  children: ReactNode;
  className?: string;
}

const Button = ({ children, className, type = "button", ...props }: Props) => {
  return (
    <button
      {...props}
      type={type}
      className={`bg-primary hover:bg-primary-600 active:bg-primary-700 hover-up inline-block w-fit cursor-pointer rounded px-6 pt-2.5 pb-2 text-xs leading-normal font-extrabold text-white uppercase shadow-[0_4px_9px_-4px_#3b71ca] ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
