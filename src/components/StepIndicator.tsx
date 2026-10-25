import { VisuallyHidden } from "@/components/rhc";
import { CheckIcon } from "@/components/icons/checkIcon";

/**
 * Where the user is in a form with several steps: "Stap 2 van 4" and the
 * steps in a row. Completed steps get a check mark, the current step has
 * aria-current="step". On a narrow screen only the text and the current
 * step remain.
 */
const StepIndicator = ({
  steps,
  current,
  label = "Voortgang",
}: {
  /** Names of the steps, in order. */
  steps: string[];
  /** Index of the current step, starting at 0. */
  current: number;
  /** Accessible name of the navigation. */
  label?: string;
}) => (
  <nav className="rhc-mox-step-indicator" aria-label={label}>
    <p className="rhc-mox-step-indicator__count">
      Stap {current + 1} van {steps.length}
    </p>
    <ol className="rhc-mox-step-indicator__list">
      {steps.map((step, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "todo";
        return (
          <li
            key={step}
            className={`rhc-mox-step-indicator__step rhc-mox-step-indicator__step--${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="rhc-mox-step-indicator__marker" aria-hidden="true">
              {state === "done" ? <CheckIcon /> : index + 1}
            </span>
            <span className="rhc-mox-step-indicator__name">
              {state === "done" && <VisuallyHidden>Klaar: </VisuallyHidden>}
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  </nav>
);

export default StepIndicator;
