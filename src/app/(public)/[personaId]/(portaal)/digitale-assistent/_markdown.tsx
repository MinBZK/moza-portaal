import type { ReactNode } from "react";
import {
  Link,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@rijkshuisstijl-community/components-react";

/**
 * De markdown van de assistent als RHC-componenten: alinea's, opsommingen,
 * vet, cursief, code en links. Geen HTML uit de tekst, dus geen innerHTML.
 * Koppen worden vette alinea's: de tekst staat in een chatballon, midden in de
 * kopstructuur van de pagina.
 */

const INLINE =
  /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

const inline = (tekst: string): ReactNode[] => {
  const delen: ReactNode[] = [];
  let vanaf = 0;
  for (const m of tekst.matchAll(INLINE)) {
    const index = m.index ?? 0;
    if (index > vanaf) delen.push(tekst.slice(vanaf, index));
    const sleutel = `${index}`;
    if (m[1]) delen.push(<strong key={sleutel}>{inline(m[1])}</strong>);
    else if (m[2]) delen.push(<em key={sleutel}>{inline(m[2])}</em>);
    else if (m[3]) delen.push(<code key={sleutel}>{m[3]}</code>);
    else
      delen.push(
        <Link
          key={sleutel}
          href={m[5]}
          target="_blank"
          rel="external noopener"
          inline
        >
          {m[4]}
        </Link>,
      );
    vanaf = index + m[0].length;
  }
  if (vanaf < tekst.length) delen.push(tekst.slice(vanaf));
  return delen;
};

export const Markdown = ({ tekst }: { tekst: string }) => {
  const blokken: ReactNode[] = [];
  let lijst: string[] = [];

  const sluitLijst = () => {
    if (!lijst.length) return;
    blokken.push(
      <UnorderedList key={`l${blokken.length}`}>
        {lijst.map((item, i) => (
          <UnorderedListItem key={i}>{inline(item)}</UnorderedListItem>
        ))}
      </UnorderedList>,
    );
    lijst = [];
  };

  for (const ruw of String(tekst ?? "").split("\n")) {
    const regel = ruw.trim();
    const item = regel.match(/^[-*]\s+(.+)$/);
    if (item) {
      lijst.push(item[1]);
      continue;
    }
    sluitLijst();
    if (!regel) continue;
    const kop = regel.match(/^#{1,4}\s+(.+)$/);
    blokken.push(
      <Paragraph key={`p${blokken.length}`}>
        {kop ? <strong>{inline(kop[1])}</strong> : inline(regel)}
      </Paragraph>,
    );
  }
  sluitLijst();
  return <>{blokken}</>;
};
