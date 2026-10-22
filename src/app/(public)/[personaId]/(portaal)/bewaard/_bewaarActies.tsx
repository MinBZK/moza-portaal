"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Link,
  LinkButton,
  Paragraph,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { bewaarFoutTekst, useBewaard, type BewaarItem } from "./_useBewaard";

// Een span: de knoppen staan in een ActionGroup, en dat is een <p>.
const FoutMelding = () => <span role="alert">{bewaarFoutTekst}</span>;

/**
 * Een knop van een actie bij een item. Met `alsLink` een knop met de opmaak
 * van een link (LinkButton), zoals in een compacte actiebalk
 * (rhc-action-group-dense); anders een secundaire knop.
 */
const ActieKnop = ({
  alsLink,
  pressed,
  onClick,
  children,
}: {
  alsLink: boolean;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) =>
  alsLink ? (
    <LinkButton pressed={pressed} onClick={onClick}>
      {children}
    </LinkButton>
  ) : (
    <Button
      appearance="secondary-action-button"
      pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Button>
  );

export const BewaarKnop = ({
  item,
  alsLink = false,
}: {
  item: BewaarItem;
  alsLink?: boolean;
}) => {
  const { staat, fout, zetBewaard } = useBewaard();
  const bewaard = !!staat?.bewaard[item.sleutel];

  return (
    <>
      <ActieKnop
        alsLink={alsLink}
        pressed={bewaard}
        onClick={() => zetBewaard(item, !bewaard)}
      >
        <Icon
          icon="favoriet"
          className={bewaard ? "rhc-icon-saved" : undefined}
        />
        {bewaard ? "Bewaard" : "Bewaren"}
        <VisuallyHidden>: {item.titel}</VisuallyHidden>
      </ActieKnop>
      {fout && <FoutMelding />}
    </>
  );
};

export const NietRelevantKnop = ({
  item,
  alsLink = false,
}: {
  item: BewaarItem;
  alsLink?: boolean;
}) => {
  const { fout, zetNietRelevant } = useBewaard();

  return (
    <>
      <ActieKnop alsLink={alsLink} onClick={() => zetNietRelevant(item, true)}>
        <Icon icon="kruis" />
        Niet relevant voor mij
        <VisuallyHidden>: {item.titel}</VisuallyHidden>
      </ActieKnop>
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
    <div ref={meldingRef} tabIndex={-1} className="rhc-mox-card">
      <Paragraph>
        U ziet &quot;{item.titel}&quot; niet meer. U vindt het terug bij{" "}
        <Link inline href="/bewaard/niet-relevant">
          Niet relevant gemarkeerd
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
