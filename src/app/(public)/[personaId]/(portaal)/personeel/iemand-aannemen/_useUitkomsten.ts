"use client";

import basis from "./_basisfeiten.json";
import type { Antwoorden } from "./_useAannemen";
import {
  invoerVoor,
  uitkomstenUit,
  type Feiten,
  type Uitkomsten,
} from "./_uitkomsten";
import { useBerekeningen } from "./_useRegelrecht";

export type Resultaat = {
  uitkomsten: Uitkomsten;
  bekend: boolean;
  bezig: boolean;
  fout?: string;
};

/** De oriëntatie live: de antwoorden door de regelrecht-engine, als schermmodel. */
export const useUitkomsten = (a: Antwoorden): Resultaat => {
  const { uit, bekend, bezig, fout } = useBerekeningen(
    invoerVoor(a, basis as Feiten),
  );
  return { uitkomsten: uitkomstenUit(a, uit), bekend, bezig, fout };
};
