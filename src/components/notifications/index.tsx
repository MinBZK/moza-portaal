"use client";

import React, { ReactNode, useState } from "react";
import { Icon } from "../icons/infoIcon";
import { tv } from "tailwind-variants";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
  onClose,
}: {
  text?: ReactNode;
  variant?: "information" | "warning" | "error" | "success";
  header?: ReactNode;
  onClose?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };
  return isVisible ? (
    <div className={NotificationTV({ variant })} role="alert">
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 p-1 text-gray-500 hover:text-gray-700"
          aria-label="Close notification"
        >
          {variant != "error" && <XMarkIcon className="h-5 w-5" />}
        </button>
        <div className="flex flex-row items-start gap-3 pr-8">
          <Icon variant={variant} />
          {header}
        </div>
        <div className="ms-7 whitespace-pre-line">{text}</div>
      </div>
    </div>
  ) : null;
};
