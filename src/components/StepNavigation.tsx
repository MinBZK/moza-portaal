"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionGroup, Alert, Button, Icon, Paragraph } from "@/components/rhc";
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
  /** Waiting for something, such as a calculation: a spinner before the text. */
  busy?: boolean;
  /** When the button is clicked while disabled, such as focus the field to fill in. */
  onBlocked?: () => void;
  /** Id of the text that says why the button does not work yet. */
  describedBy?: string;
  /** The last action of the task, such as sending: a check mark instead of the arrow. Not green: nothing has succeeded yet. */
  final?: boolean;
  /** The final action sends something: a paper plane instead of the check mark. */
  sends?: boolean;
  /** Text only, without an icon. */
  noIcon?: boolean;
};

/**
 * "Terug naar" and "Verder naar" only for screen readers: the arrow already
 * shows the direction, the step name stays visible.
 */
const withHiddenPrefix = (text: string) => {
  const match = /^((?:Terug|Verder) naar )(.+)$/.exec(text);
  if (!match) return text;
  return (
    <>
      <span className="rhc-visually-hidden">{match[1]}</span>
      {match[2]}
    </>
  );
};

/**
 * Back and forward at the end of a step in a task, in an action group.
 * Verder comes first in the HTML, so it gets the keyboard focus first and is
 * at the block start when the buttons wrap; in a row, the CSS shows Terug at
 * the inline start. On the last step the forward button is the final action,
 * with its own icon. With `later`, "Sla op en ga later verder" sits next to
 * the forward button.
 */
const StepNavigation = ({
  back,
  backLabel = "Terug",
  backIcon = true,
  next,
  later,
}: {
  back?: string;
  /** Text of the back button; "Terug" by default. */
  backLabel?: string;
  /** Arrow on the back button; off for a button that leaves the task, such as "Afsluiten". */
  backIcon?: boolean;
  next?: Next;
  /** Save and leave the task: go to this address. */
  later?: string;
}) => {
  // Clicked while busy: say that it is still loading, until it is done.
  const [clickedWhileBusy, setClickedWhileBusy] = useState(false);
  if (clickedWhileBusy && !next?.busy) setClickedWhileBusy(false);
  const waiting = clickedWhileBusy && !!next?.busy;
  const label = (
    <>
      {next?.final &&
        !next.noIcon &&
        (next.sends ? <Icon icon="verzenden" /> : <CheckIcon />)}
      {withHiddenPrefix(next?.label ?? "Verder")}
      {!next?.final && !next?.noIcon && <Icon icon="chevron-right" />}
    </>
  );

  return (
    <>
      <div role="status">
        {waiting && (
          <Alert type="warning">
            <Paragraph>
              Even geduld, wij zijn nog bezig. Kies daarna opnieuw{" "}
              <strong>{next?.label ?? "Verder"}</strong>.
            </Paragraph>
          </Alert>
        )}
      </div>
      <ActionGroup className="rhc-mox-step-navigation">
        {next &&
          (next.href && !next.onClick ? (
            <Link
              href={next.href}
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
              aria-disabled={next.disabled || undefined}
              aria-busy={next.busy || undefined}
              aria-describedby={next.describedBy}
              onClick={(event) => {
                if (next.busy) {
                  event.preventDefault();
                  setClickedWhileBusy(true);
                  return;
                }
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
              // Utrecht only greys out :disabled; aria-disabled needs the class.
              className={next.disabled ? "utrecht-button--disabled" : undefined}
              aria-disabled={next.disabled || undefined}
              aria-busy={next.busy || undefined}
              aria-describedby={next.describedBy}
              onClick={() => {
                if (next.busy) setClickedWhileBusy(true);
                else if (next.disabled) next.onBlocked?.();
                else next.onClick?.();
              }}
            >
              {label}
            </Button>
          ))}
        {later && (
          <Link
            href={later}
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
          >
            <Icon icon="save" />
            Opslaan en later verder
          </Link>
        )}
        {back && (
          <Link
            href={back}
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
          >
            {backIcon && <Icon icon="chevron-left" />}
            {withHiddenPrefix(backLabel)}
          </Link>
        )}
      </ActionGroup>
    </>
  );
};

export default StepNavigation;
