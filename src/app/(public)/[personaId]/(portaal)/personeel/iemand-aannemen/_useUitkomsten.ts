"use client";

import basis from "./_basisfeiten.json";
import type { Antwoorden } from "./_useAannemen";
import {
  invoerVoor,
  PEILDATUM,
  uitkomstenUit,
  type Feiten,
  type Rekenkeuzes,
  type Uitkomsten,
} from "./_uitkomsten";
import { useBerekening, useBerekeningen, type Invoer } from "./_useRegelrecht";

export type Resultaat = {
  uitkomsten: Uitkomsten;
  bekend: boolean;
  bezig: boolean;
  fout?: string;
  /** Het wettelijk minimumloon per uur in eurocent, uit de engine; leeg tot die gerekend heeft. */
  minimumloon?: number;
  /** De antwoorden zoals de engine ze krijgt, met uurloon en minimumloon ingevuld. */
  keuzes?: Rekenkeuzes;
};

/** Het minimumloon per uur op de peildatum (Wet minimumloon en minimumvakantiebijslag, artikel 8). */
const MINIMUMLOON: Invoer = {
  wet: "wet_minimumloon_en_minimumvakantiebijslag",
  output: "minimumloon_per_uur_eurocent",
  peildatum: PEILDATUM,
  parameters: { bsn: (basis as Feiten).bsn },
};

/** Het minimumloon uit de engine; leeg zolang die rekent. */
export const useMinimumloon = (): number | undefined => {
  const stand = useBerekening(MINIMUMLOON);
  const waarde =
    stand.status === "klaar"
      ? stand.waarde.outputs.minimumloon_per_uur_eurocent
      : undefined;
  return typeof waarde === "number" ? waarde : undefined;
};

/** De antwoorden met het uurloon (zonder keuze het minimumloon) en het minimumloon erbij. */
export const keuzesVan = (a: Antwoorden, minimumloon: number): Rekenkeuzes => ({
  ...a,
  uurloon: a.uurloon ?? minimumloon,
  minimumloon,
});

/** De oriëntatie live: de antwoorden door de regelrecht-engine, als schermmodel. */
export const useUitkomsten = (a: Antwoorden): Resultaat => {
  const minimumloon = useMinimumloon();
  const keuzes =
    minimumloon === undefined ? undefined : keuzesVan(a, minimumloon);
  const { uit, bekend, bezig, fout } = useBerekeningen(
    keuzes ? invoerVoor(keuzes, basis as Feiten) : [],
  );
  return {
    uitkomsten: uitkomstenUit(
      keuzes ?? { ...a, uurloon: 0, minimumloon: 0 },
      keuzes ? uit : {},
    ),
    bekend: bekend && !!keuzes,
    bezig: bezig || !keuzes,
    fout,
    minimumloon,
    keuzes,
  };
};
