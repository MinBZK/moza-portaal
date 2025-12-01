"use client";

import React, { ReactNode, useState } from "react";
import { Icon } from "../icons/infoIcon";
import { tv } from "tailwind-variants";
import { XMarkIcon } from "@heroicons/react/24/outline";

const NotificationTV = tv({
  base: "p-3 shadow-md",
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
  header = "Test",
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
      <div className="relative grid grid-cols-[auto_1fr_auto] items-start gap-2">
        <div className="mt-0.5 flex flex-row items-start gap-3">
          <Icon variant={variant} />
        </div>
        <div className="flex flex-col gap-2 whitespace-pre-line">
          <div>{header}</div>
          <div>{text}</div>
        </div>
        <button
          onClick={handleClose}
          className="mt-0.5 text-gray-500 hover:text-gray-700"
          aria-label="Close notification"
        >
          {variant != "error" && <XMarkIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  ) : null;
};
