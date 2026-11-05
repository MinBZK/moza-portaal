"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/rhc";
import { CheckIcon } from "@/components/icons/checkIcon";

type Next = {
  /** Text of the button; "Verder" by default. */
  label?: string;
  /** Go to this address. */
  href?: string;
  /** Or do this, for example check the form first. */
  onClick?: () => void;
  /** Not yet possible; the button stays focusable (aria-disabled). */
  disabled?: boolean;
  /** Id of the text that says why the button does not work yet. */
  describedBy?: string;
  /** The last action of the task, such as sending: a green button with a check mark. */
  final?: boolean;
};

/**
 * Back and forward at the bottom of a step in a task: Terug on the left,
 * Verder on the right. On the last step the forward button is the final
 * action, in its own style.
 */
const StepNavigation = ({ back, next }: { back?: string; next?: Next }) => {
  const forwardClass = next?.final
    ? "rhc-mox-step-navigation__final"
    : undefined;
  const label = (
    <>
      {next?.final && <CheckIcon />}
      {next?.label ?? "Verder"}
      {!next?.final && <Icon icon="chevron-right" />}
    </>
  );

  return (
    <div className="rhc-mox-step-navigation">
      {back && (
        <Link
          href={back}
          className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
        >
          <Icon icon="chevron-left" />
          Terug
        </Link>
      )}
      {next &&
        (next.href && !next.onClick ? (
          <Link
            href={next.href}
            className={`utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action${forwardClass ? ` ${forwardClass}` : ""}`}
            aria-disabled={next.disabled || undefined}
            aria-describedby={next.describedBy}
            onClick={(event) => {
              if (next.disabled) event.preventDefault();
            }}
          >
            {label}
          </Link>
        ) : (
          <Button
            appearance="primary-action-button"
            className={forwardClass}
            aria-disabled={next.disabled || undefined}
            aria-describedby={next.describedBy}
            onClick={() => {
              if (!next.disabled) next.onClick?.();
            }}
          >
            {label}
          </Button>
        ))}
    </div>
  );
};

export default StepNavigation;
