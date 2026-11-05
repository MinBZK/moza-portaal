import Link from "next/link";
import { VisuallyHidden } from "@/components/rhc";
import { CheckIcon } from "@/components/icons/checkIcon";

type Status = "past" | "current" | "future";

const STATUS_TEXT: Record<Status, string> = {
  past: "Afgerond",
  current: "Huidige stap",
  future: "Nog te doen",
};

/**
 * Where the user is in a task with several steps, built like nldd-step-bar of
 * the NLDD Design System: discs on a line with the name under each. A
 * completed step gets a check mark. Every step the user has already been to
 * (up to `reached`) links to that step when it has an href, also one after
 * the current step, so the user can go back and forth.
 * The current step has aria-current="step"; the status of every step is also
 * read out as text. On a narrow container only the name of the current step,
 * "Stap 2 van 4" and a bar in segments remain.
 */
const StepIndicator = ({
  steps,
  current,
  reached = current,
  label = "Voortgang",
}: {
  /** The steps in order: a name, or a name with the address of the step. */
  steps: (string | { name: string; href?: string })[];
  /** Index of the current step, starting at 0. */
  current: number;
  /** Index of the furthest step the user has been to; defaults to `current`. */
  reached?: number;
  /** Accessible name of the navigation. */
  label?: string;
  /**
   * Accepted for compatibility with callers on main. This version already
   * shows "Stap 2 van 4" only on a narrow container.
   */
  hideCount?: boolean;
}) => {
  const items = steps.map((step) =>
    typeof step === "string" ? { name: step, href: undefined } : step,
  );
  return (
    <nav className="rhc-mox-step-indicator" aria-label={label}>
      <ol className="rhc-mox-step-indicator__list">
        {items.map(({ name, href }, index) => {
          const status: Status =
            index === current
              ? "current"
              : index < Math.max(current, reached)
                ? "past"
                : "future";
          const bezocht = index !== current && index <= reached;
          const content = (
            <>
              <span
                className="rhc-mox-step-indicator__marker"
                aria-hidden="true"
              >
                {status === "past" ? <CheckIcon /> : index + 1}
              </span>
              <span className="rhc-mox-step-indicator__name">
                {name}
                <VisuallyHidden>, {STATUS_TEXT[status]}</VisuallyHidden>
              </span>
            </>
          );
          return (
            <li
              key={name}
              className={`rhc-mox-step-indicator__step rhc-mox-step-indicator__step--${status}`}
              aria-current={status === "current" ? "step" : undefined}
            >
              {bezocht && href ? (
                <Link href={href} className="rhc-mox-step-indicator__control">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
      <div className="rhc-mox-step-indicator__compact">
        <p className="rhc-mox-step-indicator__compact-text">
          <span className="rhc-mox-step-indicator__compact-name">
            {items[current]?.name}
          </span>
          <span className="rhc-mox-step-indicator__compact-count">
            Stap {current + 1} van {items.length}
          </span>
        </p>
        <span
          className="rhc-mox-step-indicator__compact-bar"
          aria-hidden="true"
        >
          {items.map(({ name }, index) => (
            <span
              key={name}
              className={`rhc-mox-step-indicator__segment${index <= current ? " rhc-mox-step-indicator__segment--filled" : ""}`}
            />
          ))}
        </span>
      </div>
    </nav>
  );
};

export default StepIndicator;
