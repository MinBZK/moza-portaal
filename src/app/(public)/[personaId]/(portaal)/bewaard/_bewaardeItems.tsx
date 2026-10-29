"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  Heading,
  Link,
  Paragraph,
  VisuallyHidden,
} from "@/components/rhc";
import {
  bewaarFoutTekst,
  useBewaard,
  type BewaarItem,
} from "@/components/save/useSaved";

const tekst = {
  bewaard: {
    knop: "Uit bewaarde items verwijderen",
    melding: (titel: string) =>
      `“${titel}” staat niet meer bij uw bewaarde items.`,
  },
  nietRelevant: {
    knop: "Zet terug in overzicht",
    melding: (titel: string) => `U ziet “${titel}” weer in het overzicht.`,
  },
};

/** Bewaarde of niet relevante items, per categorie. */
const BewaardeItems = ({
  soort,
  leeg,
  alleenCategorie,
  zonderCategorie,
}: {
  soort: "bewaard" | "nietRelevant";
  /** Wat er staat als er nog niets is. */
  leeg: ReactNode;
  /** Alleen deze categorie, zoals de gesprekken met de digitale assistent. */
  alleenCategorie?: string;
  /** Alles behalve deze categorie. */
  zonderCategorie?: string;
}) => {
  const { staat, fout, zetBewaard, zetNietRelevant } = useBewaard();
  const [melding, setMelding] = useState<string | null>(null);
  // Object, zodat twee keer dezelfde categorie het effect opnieuw laat lopen.
  const [focusOp, setFocusOp] = useState<{ categorie: string } | null>(null);
  const kopRefs = useRef(new Map<string, HTMLHeadingElement>());
  const meldingRef = useRef<HTMLParagraphElement>(null);

  // Het item met de aangeklikte knop is weg. De focus gaat naar de kop van
  // zijn categorie, of naar een andere categorie als die leeg is geraakt. Is
  // er niets meer over, dan naar de melding.
  useEffect(() => {
    if (!focusOp) return;
    const doel =
      kopRefs.current.get(focusOp.categorie) ??
      kopRefs.current.values().next().value ??
      meldingRef.current;
    doel?.focus();
  }, [focusOp]);

  if (!staat)
    return <Paragraph role="status">Wij halen uw items op.</Paragraph>;

  const items = Object.values(staat[soort]).filter(
    (item) =>
      (!alleenCategorie || item.categorie === alleenCategorie) &&
      item.categorie !== zonderCategorie,
  );
  const perCategorie = new Map<string, BewaarItem[]>();
  for (const item of items) {
    perCategorie.set(item.categorie, [
      ...(perCategorie.get(item.categorie) ?? []),
      item,
    ]);
  }

  const haalWeg = (item: BewaarItem) => {
    const gelukt =
      soort === "bewaard"
        ? zetBewaard(item, false)
        : zetNietRelevant(item, false);
    if (!gelukt) return;
    setMelding(tekst[soort].melding(item.titel));
    setFocusOp({ categorie: item.categorie });
  };

  return (
    <>
      {fout && <Alert type="error">{bewaarFoutTekst}</Alert>}
      {melding && (
        <Alert type="ok" closable>
          {/* Gewone <p>: Paragraph van RHC geeft geen ref door. */}
          <p ref={meldingRef} tabIndex={-1} className="nl-paragraph">
            {melding}
          </p>
        </Alert>
      )}

      {items.length === 0 ? (
        leeg
      ) : (
        // Inside the card of the page: no card of its own per category.
        <div className="mox-card-topic-list">
          {[...perCategorie].map(([categorie, inCategorie]) => (
            <section key={categorie} className="rhc-mox-row-gap">
              <Heading
                level={2}
                tabIndex={-1}
                ref={(kop: HTMLHeadingElement | null) => {
                  if (kop) kopRefs.current.set(categorie, kop);
                  else kopRefs.current.delete(categorie);
                }}
              >
                {categorie}
              </Heading>
              <ul className="mox-card-topic-list">
                {inCategorie.map((item) => (
                  <li key={item.sleutel}>
                    <Heading level={4}>
                      <Link href={item.href}>{item.titel}</Link>
                    </Heading>
                    <Paragraph>{item.samenvatting}</Paragraph>
                    <Button
                      appearance="secondary-action-button"
                      onClick={() => haalWeg(item)}
                    >
                      {tekst[soort].knop}
                      <VisuallyHidden>: {item.titel}</VisuallyHidden>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
};

export default BewaardeItems;
