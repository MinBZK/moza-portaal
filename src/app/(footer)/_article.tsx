import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Heading } from "@/components/rhc";

/** A page from the footer: the heading, and the content in a card. */
export const FooterArticle = ({
  title,
  lang,
  children,
}: {
  title: string;
  /** Language of the page, if it is not Dutch. */
  lang?: string;
  children: ReactNode;
}) => (
  <>
    <Heading level={1} lang={lang}>
      {title}
    </Heading>
    <div className="rhc-mox-card" lang={lang}>
      {children}
    </div>
  </>
);

/** A part of the page with its own heading. */
export const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => (
  <section className="rhc-mox-stack" aria-labelledby={id}>
    <Heading level={2} id={id}>
      {title}
    </Heading>
    {children}
  </section>
);

/** An internal link in running text. */
export const TextLink = (props: ComponentProps<typeof Link>) => (
  <Link {...props} className="utrecht-link utrecht-link--html-a" />
);

/** A link to another website, in running text. */
export const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a href={href} rel="external" className="utrecht-link utrecht-link--html-a">
    {children}
  </a>
);
