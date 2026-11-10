"use client";

import { useEffect, useRef, useState } from "react";
import { samenvoegen } from "./_uitkomsten";

/**
 * De regelrecht-engine in de browser: een Web Worker met de WASM-kern van
 * regelrecht-uitleg (public/regelrecht/). Rekent een wet uit op eigen invoer
 * en geeft de uitkomsten, het model en de afleiding terug. Zonder worker of
 * bij een fout blijft de pagina op de vooraf berekende waarden staan.
 */

export type Invoer = {
  wet: string;
  output: string;
  peildatum: string;
  parameters: Record<string, unknown>;
  uitleggen?: string[];
};

/** Eén regel van de afleiding in tekst; `technisch` hoort niet op het scherm van een ondernemer. */
export type AfleidingRegel = { tekst: string; technisch: boolean };
export type AfleidingStap = AfleidingRegel & {
  diepte: number;
  bron: string | null;
  exact: string | null;
};

export type Berekening = {
  outputs: Record<string, unknown>;
  model: unknown;
  afleidingen: Record<
    string,
    {
      afleiding: unknown;
      tekst: {
        kort: AfleidingRegel[];
        volledig: AfleidingStap[];
        motivering: AfleidingRegel[];
      };
    }
  >;
};

type Antwoord = {
  id: number;
  ok: boolean;
  json?: string;
  fout?: string;
  ms?: number;
};

let worker: Worker | null = null;
let volgnummer = 0;
const wachtend = new Map<number, (a: Antwoord) => void>();

/**
 * De worker kan een berekening niet afbreken. Daarom gaat er steeds één
 * verzoek tegelijk heen; een verzoek dat niet meer nodig is (`geldig`
 * geeft false, bijvoorbeeld na een nieuwe stand van een schuifregelaar)
 * gaat er nooit heen. Zo blijft er geen rij verouderde berekeningen staan.
 */
const rij: {
  id: number;
  opdracht: Record<string, unknown>;
  geldig?: () => boolean;
}[] = [];
let onderweg = false;

const pomp = () => {
  if (onderweg || !worker) return;
  while (rij.length > 0) {
    const volgende = rij.shift()!;
    if (volgende.geldig && !volgende.geldig()) {
      wachtend.get(volgende.id)?.({
        id: volgende.id,
        ok: false,
        fout: "niet meer nodig",
      });
      wachtend.delete(volgende.id);
      continue;
    }
    onderweg = true;
    worker.postMessage({ id: volgende.id, ...volgende.opdracht });
    return;
  }
};

const start = () => {
  if (worker || typeof window === "undefined") return worker;
  try {
    worker = new Worker("/regelrecht/worker.js", { type: "module" });
    worker.onmessage = (bericht: MessageEvent<Antwoord>) => {
      wachtend.get(bericht.data.id)?.(bericht.data);
      wachtend.delete(bericht.data.id);
      onderweg = false;
      pomp();
    };
    // Laadt worker.js zelf niet, dan komt er nooit een antwoord: geef elk
    // wachtend verzoek een fout, zodat het scherm niet blijft rekenen.
    worker.onerror = (fout) => {
      fout.preventDefault();
      for (const [id, klaar] of wachtend)
        klaar({ id, ok: false, fout: "de engine laadt niet" });
      wachtend.clear();
      rij.length = 0;
      onderweg = false;
      worker = null;
    };
  } catch {
    worker = null;
  }
  return worker;
};

const vraag = <T>(
  opdracht: Record<string, unknown>,
  geldig?: () => boolean,
): Promise<T> =>
  new Promise((los, weiger) => {
    const w = start();
    if (!w) {
      weiger(new Error("geen worker"));
      return;
    }
    const id = ++volgnummer;
    wachtend.set(id, (a) => {
      if (a.ok && a.json) los(JSON.parse(a.json) as T);
      else weiger(new Error(a.fout ?? "onbekende fout"));
    });
    rij.push({ id, opdracht, geldig });
    pomp();
  });

/**
 * Berekeningen die al gedaan zijn, per invoer. De engine geeft bij dezelfde
 * invoer altijd dezelfde uitkomst, dus een volgende stap met dezelfde
 * antwoorden hoeft niet opnieuw te rekenen. Het geheugen blijft zolang de
 * pagina niet herlaadt. Een volledige berekening (met model en afleiding)
 * is tot zo'n 200 KB, de uitkomsten alleen zijn klein: daarom blijven de
 * uitkomsten langer bewaard dan de volledige berekening.
 */
const MAX_UITKOMSTEN = 500;
const MAX_VOLLEDIG = 20;
const uitkomsten = new Map<string, Berekening["outputs"]>();
const volledig = new Map<string, Berekening>();

/** Bewaart, en haalt de oudste weg boven het maximum. */
const bewaar = <T>(
  lijst: Map<string, T>,
  max: number,
  sleutel: string,
  waarde: T,
) => {
  lijst.delete(sleutel);
  lijst.set(sleutel, waarde);
  if (lijst.size > max) lijst.delete(lijst.keys().next().value as string);
};

export const bereken = (invoer: Invoer, geldig?: () => boolean) => {
  const sleutel = JSON.stringify(invoer);
  const al = volledig.get(sleutel);
  if (al) return Promise.resolve(al);
  return vraag<Berekening>({ soort: "bereken", invoer }, geldig).then(
    (waarde) => {
      bewaar(volledig, MAX_VOLLEDIG, sleutel, waarde);
      bewaar(uitkomsten, MAX_UITKOMSTEN, sleutel, waarde.outputs);
      return waarde;
    },
  );
};

export type Stand<T> =
  | { status: "laden"; vorige?: T }
  | { status: "klaar"; waarde: T }
  | { status: "fout"; fout: string };

/** Zo lang staat de invoer stil voordat de engine rekent; een slider geeft tientallen tussenstanden. */
const WACHT_MS = 400;

/**
 * Voert een berekening uit zodra de invoer er is; opnieuw als de invoer
 * wijzigt. De worker kan een lopende berekening niet afbreken en werkt alle
 * verzoeken na elkaar af, dus pas na een korte stilte gaat de invoer erheen.
 * Tijdens het rekenen blijft de vorige uitkomst beschikbaar (`vorige`).
 */
export const useBerekening = (invoer: Invoer | null): Stand<Berekening> => {
  const sleutel = invoer ? JSON.stringify(invoer) : "";
  const [uitkomst, setUitkomst] = useState<{
    sleutel: string;
    stand: Stand<Berekening>;
  } | null>(null);
  const eerste = useRef(true);
  useEffect(() => {
    if (!sleutel) return;
    let actueel = true;
    const timer = setTimeout(
      () => {
        bereken(JSON.parse(sleutel) as Invoer, () => actueel).then(
          (waarde) => {
            if (actueel)
              setUitkomst({ sleutel, stand: { status: "klaar", waarde } });
          },
          (fout: Error) => {
            if (actueel)
              setUitkomst({
                sleutel,
                stand: { status: "fout", fout: fout.message },
              });
          },
        );
      },
      eerste.current ? 0 : WACHT_MS,
    );
    eerste.current = false;
    return () => {
      actueel = false;
      clearTimeout(timer);
    };
  }, [sleutel]);
  if (uitkomst && uitkomst.sleutel === sleutel) return uitkomst.stand;
  const al = sleutel ? volledig.get(sleutel) : undefined;
  if (al) return { status: "klaar", waarde: al };
  return {
    status: "laden",
    vorige:
      uitkomst?.stand.status === "klaar" ? uitkomst.stand.waarde : undefined,
  };
};

export type Berekeningen = {
  /** Uitkomsten per "<wet>:<output>"; tijdens het rekenen de vorige van dezelfde aanroep. */
  uit: Record<string, Berekening["outputs"]>;
  /** Elke gevraagde aanroep heeft een (eventueel vorige) uitkomst. */
  bekend: boolean;
  bezig: boolean;
  fout?: string;
};

/**
 * Meerdere berekeningen tegelijk, na dezelfde korte stilte als useBerekening.
 * De worker werkt ze af in de volgorde van `invoeren`; elke uitkomst komt
 * binnen zodra hij klaar is. Een vorige uitkomst blijft alleen staan voor een
 * aanroep die nog steeds gevraagd wordt, zodat er geen bedrag van een andere
 * keuze blijft hangen.
 */
export const useBerekeningen = (invoeren: Invoer[]): Berekeningen => {
  const sleutel = JSON.stringify(invoeren);
  const [stand, setStand] = useState<{
    sleutel: string;
    uit: Record<string, Berekening["outputs"]>;
    /** De laatste uitkomst per aanroep, over alle invoer heen. */
    alle: Record<string, Berekening["outputs"]>;
    fout?: string;
  } | null>(null);
  const eerste = useRef(true);
  useEffect(() => {
    const lijst = JSON.parse(sleutel) as Invoer[];
    let actueel = true;
    const timer = setTimeout(
      () => {
        for (const invoer of lijst) {
          const id = `${invoer.wet}:${invoer.output}`;
          // Al bekend: niet opnieuw naar de worker, wel in de eigen stand, zodat
          // de uitkomst blijft staan als hij later uit het geheugen valt.
          const al = uitkomsten.get(JSON.stringify(invoer));
          (al
            ? Promise.resolve({ outputs: al })
            : bereken(invoer, () => actueel)
          ).then(
            (waarde) => {
              if (!actueel) return;
              setStand((s) => ({
                sleutel,
                uit: {
                  ...(s?.sleutel === sleutel ? s.uit : {}),
                  [id]: waarde.outputs,
                },
                alle: { ...s?.alle, [id]: waarde.outputs },
                fout: s?.sleutel === sleutel ? s.fout : undefined,
              }));
            },
            (fout: Error) => {
              if (!actueel) return;
              setStand((s) => ({
                sleutel,
                uit: s?.sleutel === sleutel ? s.uit : {},
                alle: s?.alle ?? {},
                fout: fout.message,
              }));
            },
          );
        }
      },
      eerste.current ? 0 : WACHT_MS,
    );
    eerste.current = false;
    return () => {
      actueel = false;
      clearTimeout(timer);
    };
  }, [sleutel]);

  const ids = invoeren.map((i) => `${i.wet}:${i.output}`);
  // Al berekend (bijvoorbeeld in de vorige stap): meteen bekend, zonder wachten.
  const alBerekend = Object.fromEntries(
    invoeren.flatMap((i) => {
      const al = uitkomsten.get(JSON.stringify(i));
      return al ? [[`${i.wet}:${i.output}`, al]] : [];
    }),
  );
  const nu = {
    ...alBerekend,
    ...(stand?.sleutel === sleutel ? stand.uit : {}),
  };
  return {
    ...samenvoegen(ids, nu, stand?.alle ?? {}),
    fout: stand?.sleutel === sleutel ? stand.fout : undefined,
  };
};
