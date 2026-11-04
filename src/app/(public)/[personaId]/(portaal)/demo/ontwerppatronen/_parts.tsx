import type { ReactNode } from "react";
import {
  Heading,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/rhc";
import { ExternalLink, TextLink } from "@/app/(footer)/_article";

export { ExternalLink, TextLink };

export { PATTERNS } from "./_patterns";

/** A pattern page: the heading, where it comes from, and the content in a card. */
export const PatternPage = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <>
    <Heading level={1}>{title}</Heading>
    <Paragraph>
      Overgenomen uit de Storybook van moza-poc. De tekst beschrijft het
      patroon; de uitwerking in dit portaal kan afwijken.{" "}
      <TextLink href="/demo/ontwerppatronen">Alle ontwerppatronen</TextLink>
    </Paragraph>
    <div className="rhc-mox-card">{children}</div>
  </>
);

/** A part of a pattern page with its own heading. */
export const PatternSection = ({
  id,
  title,
  level = 2,
  children,
}: {
  id: string;
  title: ReactNode;
  level?: 2 | 3 | 4;
  children: ReactNode;
}) => (
  <section className="rhc-mox-stack" aria-labelledby={id}>
    <Heading level={level} id={id}>
      {title}
    </Heading>
    {children}
  </section>
);

/** A table with a header row; the first cell of a row is plain text. */
export const PatternTable = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) => (
  <div className="rhc-mox-table-container">
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((cell) => (
            <TableHeaderCell key={cell} scope="col">
              {cell}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, r) => (
          <TableRow key={r}>
            {row.map((cell, c) => (
              <TableCell key={c}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

/** A source with a title link and the points taken from it. */
export const Source = ({
  href,
  title,
  by,
  children,
}: {
  href: string;
  title: string;
  /** Publisher, after the title. */
  by?: string;
  children: ReactNode;
}) => (
  <div className="rhc-mox-stack rhc-mox-stack--sm">
    <Paragraph>
      <strong>
        <ExternalLink href={href}>{title}</ExternalLink>
      </strong>
      {by && ` (${by})`}
    </Paragraph>
    {children}
  </div>
);
