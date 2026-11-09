import type { ComponentProps } from "react";
import { Children, isValidElement } from "react";

/**
 * Utrecht/RHC ActionGroup as a <div> instead of a <p>, so it may also hold
 * block content. Same classes and the same role="group" with two or more
 * elements.
 */
export const ActionGroup = ({
  children,
  className,
  direction = "row",
  ...props
}: ComponentProps<"div"> & {
  direction?: "row" | "column" | "column-stretch";
}) => {
  const many =
    Children.toArray(children).filter((child) => isValidElement(child))
      .length >= 2;
  return (
    <div
      role={many ? "group" : undefined}
      {...props}
      className={[
        "utrecht-action-group",
        `utrecht-action-group--${direction}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};
