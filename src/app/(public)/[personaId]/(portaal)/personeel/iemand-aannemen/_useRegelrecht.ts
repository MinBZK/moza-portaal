"use client";

import { useEffect, useRef, useState } from "react";

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

export type Manifest = {
  regelrecht: string;
  corpus: { repo: string; revisie: string };
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

const start = () => {
  if (worker || typeof window === "undefined") return worker;
  try {
    worker = new Worker("/regelrecht/worker.js", { type: "module" });
    worker.onmessage = (bericht: MessageEvent<Antwoord>) => {
      wachtend.get(bericht.data.id)?.(bericht.data);
      wachtend.delete(bericht.data.id);
    };
  } catch {
    worker = null;
  }
  return worker;
};

const vraag = <T>(opdracht: Record<string, unknown>): Promise<T> =>
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
    w.postMessage({ id, ...opdracht });
  });

export const bereken = (invoer: Invoer) =>
  vraag<Berekening>({ soort: "bereken", invoer });

export const manifest = () => vraag<Manifest>({ soort: "manifest" });

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
        bereken(JSON.parse(sleutel) as Invoer).then(
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
  return {
    status: "laden",
    vorige:
      uitkomst?.stand.status === "klaar" ? uitkomst.stand.waarde : undefined,
  };
};

export const useManifest = () => {
  const [stand, setStand] = useState<Stand<Manifest>>({ status: "laden" });
  useEffect(() => {
    manifest().then(
      (waarde) => setStand({ status: "klaar", waarde }),
      (fout: Error) => setStand({ status: "fout", fout: fout.message }),
    );
  }, []);
  return stand;
};
