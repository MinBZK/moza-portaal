import { Fragment } from "react";
import { Paragraph } from "@/components/rhc";

/** A source: the name of the law article and where it is published. */
export type Source = { label: string; url: string };

/**
 * A small line with the sources under a text, such as the law articles behind
 * a deadline. The text itself stays plain; the source is one click away. The
 * links open in a new tab, so the user keeps their place in a form.
 */
const SourceLinks = ({ sources }: { sources: Source[] }) =>
  sources.length === 0 ? null : (
    <Paragraph className="rhc-mox-small-text">
      Bron:{" "}
      {sources.map((source, i) => (
        <Fragment key={source.label}>
          {i > 0 && "; "}
          <a
            href={source.url}
            className="utrecht-link utrecht-link--html-a"
            target="_blank"
            rel="external noopener noreferrer"
          >
            {source.label}
            <span className="rhc-visually-hidden">
              {" "}
              (opent in een nieuw tabblad)
            </span>
          </a>
        </Fragment>
      ))}
    </Paragraph>
  );

export default SourceLinks;
