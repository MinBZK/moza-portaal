/** Typen van de digitale assistent. De vorm volgt de events van de backend. */

export type Bron = {
  label: string;
  titel?: string;
  url?: string;
  geraadpleegdOp?: string;
};

export type Veld = {
  naam: string;
  label: string;
  type: "radio" | "tekst" | "categorieen";
  opties?: string[] | null;
  groepen?: { onderdeel: string; opties?: string[] }[] | null;
  /** Voorgevuld door de host, met de reden in de toelichting. */
  waarde?: string | null;
  toelichting?: string | null;
};

export type VraagSpec = {
  titel: string;
  intro: string;
  tekst: string;
  bron: string;
  velden: Veld[];
  /** Het formulier komt uit de antwoordtekst zelf. */
  vanTekst?: boolean;
};

/** Energieverbruik uit de (gesimuleerde) EU Business Wallet. */
export type WalletData = {
  credential?: { uitgegeven_door?: string; peiljaar?: number | string };
  toestemming?: { met_toestemming_ondernemer?: boolean };
  verbruik?: {
    totaal?: {
      jaarlijks_elektriciteitsverbruik_kwh?: number;
      jaarlijks_gasverbruik_m3?: number;
    };
  };
};

export type Antwoorden = Record<string, string | string[]>;

/** Eén onderdeel van het gesprek. Het gesprek wordt als deze lijst bewaard. */
export type Item = { id: string } & (
  | { soort: "gebruiker"; tekst: string }
  | {
      soort: "assistent";
      tekst: string;
      bronnen?: Bron[];
      vervolg?: { label: string; href: string };
    }
  | { soort: "fout"; tekst: string; vervolg?: { label: string; href: string } }
  | { soort: "suggesties"; opnieuw: boolean }
  | {
      soort: "deelverzoek";
      bron: string;
      omschrijving: string;
      /** Van de backend: "Delen" start een nieuwe beurt. */
      vanBackend: boolean;
      staat: "open" | "gedeeld" | "geweigerd";
      energie?: { data: WalletData; uitgever: string };
    }
  | {
      soort: "vraag";
      spec: VraagSpec;
      staat: "open" | "verstuurd";
      antwoorden?: Antwoorden;
    }
);

/** Context van de actieve persona, voor de demo en de backend. */
export type AssistentPersona = {
  id: string;
  kvkNummer: string;
  bedrijf: {
    handelsnaam?: string;
    kvkNummer?: string;
    rechtsvorm?: string;
    sbi?: { code: string; omschrijving: string } | null;
    vestiging?: string;
    startdatum?: string;
    omzetbelastingnummer?: string;
    energie?: { elektriciteitKwh: number; gasM3: number } | null;
  };
};

export type ServerStatus = {
  servers?: Record<string, string>;
  cli?: Record<string, string>;
};
