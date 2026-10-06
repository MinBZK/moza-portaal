"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Link,
  Paragraph,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { bewaarFoutTekst, useBewaard, type BewaarItem } from "./_useBewaard";

// Een span: de knoppen staan in een ActionGroup, en dat is een <p>.
const FoutMelding = () => (
  <span role="alert" className="text-[var(--rhc-color-rood-600)]">
    {bewaarFoutTekst}
  </span>
);

export const BewaarKnop = ({ item }: { item: BewaarItem }) => {
  const { staat, fout, zetBewaard } = useBewaard();
  const bewaard = !!staat?.bewaard[item.sleutel];

  return (
    <>
      <Button
        appearance="secondary-action-button"
        pressed={bewaard}
        onClick={() => zetBewaard(item, !bewaard)}
      >
        <Icon icon={bewaard ? "vinkje" : "favoriet"} />
        Bewaar
        <VisuallyHidden>: {item.titel}</VisuallyHidden>
      </Button>
      {fout && <FoutMelding />}
    </>
  );
};

export const NietRelevantKnop = ({ item }: { item: BewaarItem }) => {
  const { fout, zetNietRelevant } = useBewaard();

  return (
    <>
      <Button
        appearance="secondary-action-button"
        onClick={() => zetNietRelevant(item, true)}
      >
        <Icon icon="kruis" />
        Niet relevant voor mij
        <VisuallyHidden>: {item.titel}</VisuallyHidden>
      </Button>
      {fout && <FoutMelding />}
    </>
  );
};

/**
 * Toont een item, tenzij de gebruiker het niet relevant vond. Direct na het
 * wegklikken staat er een melding met de mogelijkheid het terug te zetten.
 */
export const RelevantItem = ({
  item,
  children,
}: {
  item: BewaarItem;
  children: ReactNode;
}) => {
  const { staat, zetNietRelevant } = useBewaard();
  const verborgen = staat ? !!staat.nietRelevant[item.sleutel] : null;
  const [vorige, setVorige] = useState(verborgen);
  const [toonMelding, setToonMelding] = useState(false);
  const meldingRef = useRef<HTMLDivElement>(null);

  // Alleen een melding als het item zojuist verborgen werd, niet bij het laden.
  if (verborgen !== vorige) {
    setVorige(verborgen);
    setToonMelding(vorige === false && verborgen === true);
  }

  useEffect(() => {
    if (toonMelding) meldingRef.current?.focus();
  }, [toonMelding]);

  if (!verborgen) return children;
  if (!toonMelding) return null;

  return (
    <div ref={meldingRef} tabIndex={-1} className="mox-card">
      <Paragraph>
        U ziet &quot;{item.titel}&quot; niet meer. U vindt het terug bij{" "}
        <Link inline href="/bewaard">
          Bewaarde items
        </Link>
        .
      </Paragraph>
      <Button
        appearance="secondary-action-button"
        onClick={() => zetNietRelevant(item, false)}
      >
        Ongedaan maken
      </Button>
    </div>
  );
};
