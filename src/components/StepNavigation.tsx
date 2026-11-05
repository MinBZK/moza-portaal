"use client";

import Link from "next/link";
import { ActionGroup, Button, Icon } from "@/components/rhc";
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
  /** When the button is clicked while disabled, such as focus the field to fill in. */
  onBlocked?: () => void;
  /** Id of the text that says why the button does not work yet. */
  describedBy?: string;
  /** The last action of the task, such as sending: a green button with a check mark. */
  final?: boolean;
  /** The final action sends something: a paper plane instead of the check mark. */
  sends?: boolean;
};

/**
 * Back and forward at the bottom of a step in a task, in an action group:
 * Terug on the left, Verder on the right. On the last step
 * the forward button is the final action, in its own style.
 */
const StepNavigation = ({
  back,
  backLabel = "Terug",
  next,
}: {
  back?: string;
  /** Text of the back button; "Terug" by default. */
  backLabel?: string;
  next?: Next;
}) => {
  const forwardClass = next?.final
    ? "rhc-mox-step-navigation__final"
    : undefined;
  const label = (
    <>
      {next?.final && (next.sends ? <Icon icon="verzenden" /> : <CheckIcon />)}
      {next?.label ?? "Verder"}
      {!next?.final && <Icon icon="chevron-right" />}
    </>
  );

  return (
    <ActionGroup>
      {back && (
        <Link
          href={back}
          className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
        >
          <Icon icon="chevron-left" />
          {backLabel}
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
              if (!next.disabled) return;
              event.preventDefault();
              next.onBlocked?.();
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
              if (next.disabled) next.onBlocked?.();
              else next.onClick?.();
            }}
          >
            {label}
          </Button>
        ))}
    </ActionGroup>
  );
};

export default StepNavigation;
