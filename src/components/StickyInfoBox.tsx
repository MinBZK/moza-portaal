import { useId, type ReactNode } from "react";
import { Heading } from "@/components/rhc";

/**
 * Box with supporting information that stays in view while the page scrolls,
 * for example next to a long form: what you need, or who to contact. On a
 * narrow screen it scrolls along with the page.
 */
const StickyInfoBox = ({
  title,
  headingLevel = 2,
  children,
}: {
  title: string;
  headingLevel?: 2 | 3 | 4;
  children: ReactNode;
}) => {
  const titleId = useId();
  return (
    <aside className="rhc-mox-sticky-info-box" aria-labelledby={titleId}>
      <Heading level={headingLevel} id={titleId}>
        {title}
      </Heading>
      {children}
    </aside>
  );
};

export default StickyInfoBox;
