import React, { ReactNode } from "react";
import { Icon } from "../icons/infoIcon";
import { tv } from "tailwind-variants";

const NotificationTV = tv({
  base: "px-4 py-2 shadow-md",
  variants: {
    variant: {
      information: "bg-blue-100",
      warning: "bg-orange-200",
      error: "bg-red-200",
      success: "bg-green-200",
    },
  },
  defaultVariants: {
    variant: "information",
  },
});

export const Notification = ({
  text,
  variant = "information",
  header,
}: {
  text?: ReactNode;
  variant?: "information" | "warning" | "error" | "success";
  header?: ReactNode;
}) => {
  return (
    <div className={NotificationTV({ variant })} role="alert">
      <div className="">
        <div className="flex flex-row items-start gap-3">
          <Icon variant={variant} />
          {header}
        </div>
        <div className="ms-7 whitespace-pre-line">{text}</div>
      </div>
    </div>
  );
};
