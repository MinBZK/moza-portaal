import type { Bron, VraagSpec, Veld, WalletData } from "./_types";

/**
 * Logica zonder opmaak, overgenomen uit moza-poc
 * (assets/javascript/digitale-assistent.js). Het commentaar daar legt de
 * keuzes uit; hier staat alleen het waarom als het niet vanzelf spreekt.
 */

/** De bronnen van de assistent, met wat ze doen en waar ze na te slaan zijn. */
export const BRONNEN = [
  {
    key: "regelrecht",
    label: "RegelRecht",
    url: "https://regelrecht.rijks.app/",
    uitleg: "Rekent uit welke regels voor uw bedrijf gelden.",
  },
  {
    key: "rvo",
    label: "RVO",
    url: "https://www.rvo.nl/",
    uitleg: "Neemt uw rapportage in ontvangst.",
  },
  // De Business Wallet is een mock: er is geen pagina om naar te verwijzen.
  {
    key: "netbeheerder",
    label: "Business Wallet",
    url: "",
    uitleg: "Levert uw energieverbruik, afgegeven door uw netbeheerder.",
  },
  {
    key: "kvk",
    label: "KVK Handelsregister",
    url: "https://www.kvk.nl/handelsregister/",
    uitleg: "Levert de gegevens van uw onderneming.",
  },
  {
    key: "koop",
    label: "KOOP Regelingenbank",
    url: "https://wetten.overheid.nl/",
    uitleg: "Levert de officiële wetteksten.",
  },
];

/** URL bij de naam van een bron, ook als die niet volledig genoemd wordt. */
export const bronURL = (label: string) => {
  const naam = label.trim().toLowerCase();
  if (!naam) return "";
  return (
    BRONNEN.find(({ label: bron, url }) => {
      const itemNaam = bron.toLowerCase();
      return (
        url &&
        (naam === itemNaam ||
          naam.includes(itemNaam) ||
          itemNaam.includes(naam))
      );
    })?.url ?? ""
  );
};

const LABELS: Record<string, string> = {
  regelrecht: "RegelRecht",
  rvo: "RVO",
  kvk: "KVK Handelsregister",
  koop: "KOOP Regelingenbank",
  netbeheerder: "Business Wallet",
};

/** "regelrecht__toets" wordt "RegelRecht: toets". */
export const leesbareStap = (bericht?: string) => {
  if (!bericht) return "";
  if (!bericht.includes("__")) return bericht;
  const [server, ...rest] = bericht.split("__");
  const tekst = rest.join(" ").replace(/_/g, " ").trim();
  const label = LABELS[server] ?? server;
  return tekst ? `${label}: ${tekst}` : label;
};

/** "RegelRecht (art. 5.15 …)" of "[RVO: x](https://…)" naar een bron. */
export const maakBron = (waarde: string): Bron => {
  let tekst = String(waarde ?? "")
    .trim()
    .replace(/[.\s]+$/, "");
  let url = "";
  const link = tekst.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
  if (link) {
    tekst = link[1].trim();
    url = link[2];
  }
  const haakje = tekst.match(/^(.+?)\s*\((.+)\)$/);
  const dubbelePunt = tekst.match(/^([^:]+):\s*(.+)$/);
  const [label, titel] = haakje
    ? [haakje[1], haakje[2]]
    : dubbelePunt
      ? [dubbelePunt[1], dubbelePunt[2]]
      : [tekst, ""];
  return { label: label.trim(), titel: titel.trim(), url };
};

const BRON_REGEL = /^bron(?:nen)?\s*:\s*(.*)$/i;

/** Haalt de bronvermelding van het eind van de antwoordtekst. */
export const haalBronnenUitTekst = (
  tekst: string,
): { tekst: string; bronnen: Bron[] } => {
  const regels = String(tekst ?? "").split("\n");
  const opsomming: string[] = [];
  for (let i = regels.length - 1; i >= 0; i--) {
    const regel = regels[i].trim();
    if (!regel) continue;
    const bullet = regel.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      opsomming.unshift(bullet[1]);
      continue;
    }
    const bron = regel.match(BRON_REGEL);
    if (!bron) break;
    const waarden = bron[1].trim() ? [bron[1]] : opsomming;
    if (!waarden.length) break;
    const rest = regels.slice(0, i).join("\n").trimEnd();
    if (!rest) break;
    return { tekst: rest, bronnen: waarden.map(maakBron) };
  }
  return { tekst, bronnen: [] };
};

type Payload = Record<string, unknown>;

const object = (waarde: unknown): Payload =>
  typeof waarde === "object" && waarde !== null ? (waarde as Payload) : {};

/** Herkent het tool-event met het energieverbruik uit de Wallet. */
export const walletPayload = (payload: Payload) => {
  const naam = String(payload.tool ?? payload.name ?? payload.message ?? "");
  if (
    !/netbeheerder__verbruik/.test(naam) &&
    !(/netbeheerder/.test(naam) && /verbruik/.test(naam))
  )
    return null;
  const resultaat = object(payload.result);
  const data = (payload.data ?? resultaat.data) as WalletData | undefined;
  if (!data?.verbruik) return null;
  const herkomst = object(payload.provenance ?? resultaat.provenance);
  return {
    data,
    uitgever:
      data.credential?.uitgegeven_door ??
      String(herkomst.issuer ?? "uw netbeheerder"),
  };
};

const hoofdletter = (tekst: string) => {
  const t = tekst.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
};

const normVeld = (v: Payload, i: number): Veld => {
  const opties = (v.opties ?? v.options ?? null) as string[] | null;
  return {
    naam: String(v.naam ?? v.code ?? v.name ?? v.id ?? `veld${i + 1}`),
    label: String(
      v.label ?? v.vraag ?? v.omschrijving ?? v.naam ?? `Veld ${i + 1}`,
    ),
    type: (v.type as Veld["type"]) ?? (opties ? "radio" : "tekst"),
    opties,
    groepen: (v.groepen as Veld["groepen"]) ?? null,
    waarde: (v.waarde as string) ?? null,
    toelichting: (v.toelichting as string) ?? null,
  };
};

const maakVeld = (label: string, opties: string[], index: number): Veld => {
  const code = label.match(/^([A-Z]{1,4}\d+)\b/);
  return {
    naam: code ? code[1] : `v${index + 1}`,
    label,
    type: "radio",
    opties,
  };
};

const parseVeldRegel = (regel: string, index: number) => {
  const inhoud = regel.replace(/\?+$/, "").trim();
  const slash = inhoud.lastIndexOf(" / ");
  if (slash !== -1) {
    const optie2 = inhoud.slice(slash + 3).trim();
    const voor = inhoud.slice(0, slash);
    const streep = voor.lastIndexOf(" - ");
    if (streep !== -1) {
      const optie1 = voor.slice(streep + 3).trim();
      const label = voor.slice(0, streep).trim();
      if (optie1 && optie2 && label)
        return maakVeld(
          label,
          [hoofdletter(optie1), hoofdletter(optie2)],
          index,
        );
    }
  }
  return maakVeld(inhoud, ["Ja", "Nee"], index);
};

/** Genummerde vraagregels in platte tekst naar een formulier. */
const parseVraag = (bericht: string): VraagSpec | null => {
  const velden: Veld[] = [];
  const intro: string[] = [];
  let bron = "";
  let zagVraag = false;
  for (const ruw of bericht.split("\n")) {
    const regel = ruw.trim();
    if (!regel) continue;
    const bronM = regel.match(/^bron\s*:\s*(.+)$/i);
    if (bronM) {
      bron = bronM[1].replace(/[.\s]+$/, "").trim();
      continue;
    }
    const nummer = regel.match(/^(\d+)[.)]\s+(.+)$/);
    if (nummer) {
      if (/\?\s*$/.test(nummer[2]) || / \/ /.test(nummer[2])) {
        velden.push(parseVeldRegel(nummer[2], velden.length));
        zagVraag = true;
      }
      continue;
    }
    if (!zagVraag && !/^[•·*-]/.test(regel)) intro.push(regel);
  }
  if (!velden.length) return null;
  const introTekst = intro.join(" ").trim();
  const isEml =
    /erkende maatregelenlijst|eml/i.test(introTekst) ||
    velden.some((v) => /^[A-Z]{1,4}\d+$/.test(v.naam));
  return {
    titel: isEml
      ? "Erkende Maatregelenlijst (EML 2023)"
      : "Vragen van de assistent",
    intro: introTekst,
    tekst: "",
    bron,
    velden,
  };
};

/** Een vraag van de assistent met een gestructureerd antwoord. */
export const vraagSpec = (payload: Payload): VraagSpec | null => {
  const data = object(payload.data);
  const vraag = object(payload.vraag ?? data.vraag);
  let velden = (vraag.velden ?? payload.velden ?? data.velden) as
    | Payload[]
    | undefined;
  const maatregelen = (payload.maatregelen ?? data.maatregelen) as
    | Payload[]
    | undefined;
  let uitMaatregelen = false;

  if (!velden && Array.isArray(maatregelen) && maatregelen.length) {
    uitMaatregelen = true;
    velden = maatregelen.map((m) => {
      const code = String(m.code ?? m.naam ?? m.id ?? "");
      const omschrijving = String(
        m.omschrijving ?? m.titel ?? m.beschrijving ?? "",
      );
      return {
        naam: code || omschrijving,
        label:
          code && omschrijving
            ? `${code} – ${omschrijving}`
            : code || omschrijving,
        type: "radio",
        opties: ["Uitgevoerd", "Niet uitgevoerd"],
      };
    });
  }

  if (!Array.isArray(velden) || !velden.length) {
    const tekst = String(payload.message ?? "");
    const geparsed = /erkende maatregelenlijst|\bEML\b|maatregel/i.test(tekst)
      ? parseVraag(tekst)
      : null;
    return geparsed ? { ...geparsed, vanTekst: true } : null;
  }
  const herkomst = object(payload.provenance);
  return {
    titel: String(
      vraag.titel ??
        (uitMaatregelen
          ? "Erkende Maatregelenlijst (EML 2023)"
          : "Vragen van de assistent"),
    ),
    intro: String(vraag.intro ?? ""),
    tekst: String(
      vraag.tekst ??
        (uitMaatregelen ? "Geef per maatregel aan of deze is uitgevoerd." : ""),
    ),
    bron: String(
      vraag.bron ?? payload.bron ?? data.bron ?? herkomst.source ?? "",
    ),
    velden: velden.map(normVeld),
  };
};

/** Een radio-antwoord als feit voor de regel; andere labels sturen we niet. */
export const RADIO_WAARDE: Record<string, boolean> = {
  Uitgevoerd: true,
  Ja: true,
  "Niet uitgevoerd": false,
  Nee: false,
};

/** Alleen velden die eruitzien als regelparameter gaan als opgave mee. */
export const REGELPARAMETER = /^[A-Z][A-Z0-9_]*$/;

export const vandaag = () =>
  new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const getal = (waarde: number) => waarde.toLocaleString("nl-NL");
