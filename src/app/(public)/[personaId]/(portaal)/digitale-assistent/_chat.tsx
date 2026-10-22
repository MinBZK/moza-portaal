"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ActionGroup,
  Button,
  Paragraph,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import {
  ASSISTENT_DEMO_EVENT,
  leesAssistentInstellingen,
  useAssistentInstellingen,
  type AssistentDemo,
} from "@/app/(public)/_flags/assistentInstellingen";
import { leesBewaardItem, useBewaard } from "../bewaard/_useBewaard";
import { voegZaakToe } from "../lopendezaken/_assistentZaken";
import {
  DEMO_DREMPEL,
  DEMO_STATUS,
  kiesDemoBeurt,
  type DemoStand,
} from "./_demo";
import {
  haalBronnenUitTekst,
  leesbareStap,
  vandaag,
  vraagSpec,
  walletPayload,
} from "./_logica";
import {
  Assistent,
  BronStatus,
  Deelverzoek,
  Denkt,
  Fout,
  Gebruiker,
  Suggesties,
  VraagKaart,
} from "./_onderdelen";
import type {
  AssistentPersona,
  Bron,
  Item,
  ServerStatus,
  VraagSpec,
} from "./_types";

/**
 * De Digitale assistent, overgenomen uit moza-poc
 * (assets/javascript/digitale-assistent.js). De backend praat via
 * Server-Sent Events (status, tool, case, answer, error); de demo-modus speelt
 * dezelfde events af uit een draaiboek. Beide lopen door `verwerk`, dus wat in
 * de demo te zien is, is wat de gebruiker live ook krijgt.
 */

const API = "/api/assistent";

// Het gesprek blijft bewaard in dit tabblad (sessionStorage), per combinatie
// van LLM, transport en persona. Bij een nieuwe opmaak gaat het oude weg.
const OPSLAG_HISTORIE = "chat:history";
const OPSLAG_SESSIES = "chat:sessions";
const OPSLAG_VERSIE = "chat:opmaak-versie";
const OPMAAK_VERSIE = "react-1";
const ONBOARDING_GEZIEN = "chat:onboarding-seen";

const WACHT_KORT = 700;
const WACHT_PAGINALAAD = 1600;
const WALLET_WET = "omgevingswet/energiebesparing/informatieplicht";

const ONBOARDING = [
  "Hallo, ik ben de digitale assistent van MijnOverheid Zakelijk. Voor hulp bij vragen of ondersteuning van taken raadpleeg ik een aantal betrouwbare overheidsbronnen.",
  "Ik kan bijvoorbeeld:\n- uw bedrijfsgegevens opzoeken\n- uitzoeken welke regels voor u gelden\n- uw belastingaangifte voorbereiden",
  "Ik gebruik uw gegevens pas **als u daar toestemming voor geeft**. Bij elk antwoord ziet u welke bron ik heb geraadpleegd.",
];

const TEST_VRAAG =
  "Geldt de energiebesparingsinformatieplicht voor mijn bedrijf?";
const TEST_ANTWOORD =
  "Ja, die geldt voor uw bedrijf. U gebruikt per jaar meer dan 50.000 kWh elektriciteit of 25.000 m³ aardgas, en dan bent u verplicht energie te besparen én te rapporteren welke maatregelen u heeft genomen.\n\nVoor uw branche staan 5 erkende maatregelen op de lijst. U rapporteert uiterlijk 1 december 2026 bij de RVO.\n\nControleer dit bij twijfel bij uw omgevingsdienst: die houdt toezicht op deze plicht.";
const TEST_BRONNEN: Bron[] = [
  {
    label: "KVK Handelsregister",
    titel: "Bedrijfsgegevens: SBI-code, rechtsvorm en vestiging",
    url: "https://www.kvk.nl/handelsregister/",
  },
  {
    label: "KOOP Regelingenbank",
    titel: "Activiteitenbesluit milieubeheer, artikel 2.15",
    url: "https://wetten.overheid.nl/BWBR0022762/",
  },
  {
    label: "RVO",
    titel: "Informatieplicht energiebesparing: rapportagetermijn",
    url: "https://www.rvo.nl/onderwerpen/informatieplicht-energiebesparing",
  },
];

const BEWAAR_CATEGORIE = "Digitale assistent";
const BEWAAR_TITEL_MAX = 80;

type Beurt = {
  combo: string;
  beantwoord: boolean;
  zaakGemaakt: boolean;
  verzoek: { bron?: string; omschrijving?: string } | null;
};

type Payload = Record<string, unknown>;

const wacht = (ms: number) => new Promise((klaar) => setTimeout(klaar, ms));

const leesOpslag = <T,>(sleutel: string): Record<string, T> => {
  try {
    return JSON.parse(window.sessionStorage.getItem(sleutel) ?? "{}") ?? {};
  } catch {
    return {};
  }
};

const schrijfOpslag = (sleutel: string, waarde: unknown) => {
  try {
    window.sessionStorage.setItem(sleutel, JSON.stringify(waarde));
  } catch {
    // Privémodus of vol: het gesprek leeft dan alleen in het geheugen.
  }
};

let teller = 0;
const nieuwId = () => `chat-${Date.now().toString(36)}-${++teller}`;

const Chat = ({
  persona,
  backendIngesteld,
  toonBronstatus,
}: {
  persona: AssistentPersona;
  /** Is er een backend-adres ingesteld? Zo niet, dan is demo de standaard. */
  backendIngesteld: boolean;
  toonBronstatus: boolean;
}) => {
  const instellingen = useAssistentInstellingen();
  const demo = instellingen.demoModus ?? !backendIngesteld;
  const combo = `${instellingen.llm}:${instellingen.transport}:${persona.id}`;
  const { zetBewaard } = useBewaard();

  const [items, setItems] = useState<Item[]>([]);
  const [denkt, setDenkt] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [invoer, setInvoer] = useState("");
  const [status, setStatus] = useState<ServerStatus | null | undefined>();
  const [drempel, setDrempel] = useState<{ kwh: number; gas: number } | null>(
    null,
  );
  const [bewaard, setBewaard] = useState<"nee" | "ja" | "fout">("nee");

  const berichtenRef = useRef<HTMLDivElement>(null);
  const invoerRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const itemsRef = useRef(items);
  const comboRef = useRef(combo);
  const bezigRef = useRef(false);
  const demoStand = useRef<DemoStand>({ scenario: null, beurt: 0 });
  const wachtToken = useRef(0);
  const gestart = useRef(false);
  const scrollNaar = useRef<string | null>(null);
  const focusOp = useRef<string | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const heeftGesprek = items.some((item) => item.soort === "gebruiker");

  // --- Gesprek en sessie bewaren ------------------------------------------

  const bewaarHistorie = useCallback((sleutel: string, lijst: Item[]) => {
    const historie = leesOpslag<Item[]>(OPSLAG_HISTORIE);
    historie[sleutel] = lijst;
    schrijfOpslag(OPSLAG_HISTORIE, historie);
  }, []);

  useEffect(() => {
    if (heeftGesprek) bewaarHistorie(comboRef.current, items);
  }, [items, heeftGesprek, bewaarHistorie]);

  const sessie = (sleutel: string) =>
    leesOpslag<string>(OPSLAG_SESSIES)[sleutel];
  const zetSessie = (sleutel: string, id?: string) => {
    const sessies = leesOpslag<string>(OPSLAG_SESSIES);
    if (id) sessies[sleutel] = id;
    else delete sessies[sleutel];
    schrijfOpslag(OPSLAG_SESSIES, sessies);
  };

  // --- Weergave -----------------------------------------------------------

  const voegToe = useCallback((item: Item, opties?: { focus?: boolean }) => {
    scrollNaar.current = item.id;
    if (opties?.focus) focusOp.current = item.id;
    setItems((huidig) => [...huidig, item]);
  }, []);

  const wijzig = (id: string, wijziging: Partial<Item>) =>
    setItems((huidig) =>
      huidig.map((item) =>
        item.id === id ? ({ ...item, ...wijziging } as Item) : item,
      ),
    );

  const toonDenken = (tekst: string) => setDenkt(tekst);
  const verbergDenken = () => setDenkt(null);

  /** Eerst kort "denken", daarna pas iets zeggen. */
  const naWachten = useCallback((klaar: () => void, duur = WACHT_KORT) => {
    const token = ++wachtToken.current;
    setDenkt("");
    setTimeout(() => {
      if (token !== wachtToken.current) return;
      setDenkt(null);
      klaar();
    }, duur);
  }, []);

  // Een nieuw bericht in beeld. Past het, dan naar onderen zoals elke chat.
  // Is het langer dan het venster, dan de bovenkant: anders begint de lezer
  // aan het eind van een antwoord.
  useLayoutEffect(() => {
    const venster = berichtenRef.current;
    if (!venster) return;
    const id = scrollNaar.current;
    scrollNaar.current = null;
    const el = id
      ? venster.querySelector<HTMLElement>(`[data-item="${id}"]`)
      : null;
    if (!el || el.offsetHeight < venster.clientHeight) {
      venster.scrollTop = venster.scrollHeight;
    } else {
      venster.scrollTop +=
        el.getBoundingClientRect().top -
        venster.getBoundingClientRect().top -
        8;
    }

    // Vraagt de assistent iets in een kaart, dan hoort de focus daar. Niet als
    // iemand midden in een zin zit te typen.
    const kaart = focusOp.current;
    focusOp.current = null;
    if (!kaart) return;
    if (
      document.activeElement === invoerRef.current &&
      invoerRef.current?.value.trim()
    )
      return;
    const doel = venster.querySelector<HTMLElement>(
      `[data-kaart="${kaart}"] :is(input:not(:disabled), button:not(:disabled), h3)`,
    );
    doel?.focus({ preventScroll: true });
  }, [items, denkt]);

  // --- Een beurt verwerken -----------------------------------------------

  const verwerk = useCallback(
    (event: string, payload: Payload, beurt: Beurt) => {
      const zichtbaar = comboRef.current === beurt.combo;

      if (event === "status") {
        if (zichtbaar) toonDenken(leesbareStap(String(payload.message ?? "")));
      } else if (event === "tool") {
        const wallet = walletPayload(payload);
        if (wallet && zichtbaar) {
          verbergDenken();
          voegToe(
            {
              id: nieuwId(),
              soort: "deelverzoek",
              bron: "uw Business Wallet",
              omschrijving:
                "De assistent wil uw energieverbruik-attestatie uit uw Business Wallet gebruiken (afgegeven door uw netbeheerder). U bepaalt zelf of u deze gegevens deelt.",
              vanBackend: false,
              staat: "open",
              energie: wallet,
            },
            { focus: true },
          );
        } else if (zichtbaar) {
          toonDenken(`${leesbareStap(String(payload.message ?? ""))}...`);
        }
      } else if (event === "case") {
        voegZaakToe((payload.data as Payload) ?? payload);
        beurt.zaakGemaakt = true;
      } else if (
        (event === "answer" || event === "error") &&
        !beurt.beantwoord
      ) {
        beurt.beantwoord = true;
        verbergDenken();
        if (payload.session_id)
          zetSessie(beurt.combo, String(payload.session_id));
        if (event === "answer" && payload.toestemming_nodig && zichtbaar)
          beurt.verzoek = payload.toestemming_nodig as Beurt["verzoek"];

        const uitTekst =
          event === "answer"
            ? haalBronnenUitTekst(String(payload.message ?? ""))
            : { tekst: String(payload.message ?? ""), bronnen: [] };
        const bronnen =
          Array.isArray(payload.bronnen) && payload.bronnen.length
            ? (payload.bronnen as Bron[])
            : uitTekst.bronnen;
        const spec: VraagSpec | null =
          event === "answer" && zichtbaar ? vraagSpec(payload) : null;

        const nieuw: Item[] = [];
        if (spec) {
          if (uitTekst.tekst && !spec.vanTekst)
            nieuw.push({
              id: nieuwId(),
              soort: "assistent",
              tekst: uitTekst.tekst,
              bronnen,
            });
          nieuw.push({ id: nieuwId(), soort: "vraag", spec, staat: "open" });
        } else if (event === "error") {
          nieuw.push({
            id: nieuwId(),
            soort: "fout",
            tekst: uitTekst.tekst,
            vervolg: { label: "Contact opnemen", href: "/contact" },
          });
        } else {
          nieuw.push({
            id: nieuwId(),
            soort: "assistent",
            tekst: uitTekst.tekst,
            bronnen,
            vervolg: beurt.zaakGemaakt
              ? { label: "In Lopende zaken bekijken", href: "/lopendezaken" }
              : undefined,
          });
        }

        if (zichtbaar) {
          scrollNaar.current = nieuw[0].id;
          const vraag = nieuw.find((item) => item.soort === "vraag");
          if (vraag) focusOp.current = vraag.id;
          setItems((huidig) => [...huidig, ...nieuw]);
        } else {
          // Tussentijds gewisseld: het antwoord gaat naar het gesprek waar de
          // beurt begon, en is daar te zien bij terugwisselen.
          const historie = leesOpslag<Item[]>(OPSLAG_HISTORIE);
          bewaarHistorie(beurt.combo, [
            ...(historie[beurt.combo] ?? []),
            ...nieuw,
          ]);
        }
      } else if (event === "done") {
        verbergDenken();
      }
    },
    [bewaarHistorie, voegToe],
  );

  const speelDemoBeurt = async (bericht: string, beurt: Beurt) => {
    const stappen = kiesDemoBeurt(bericht, demoStand.current, {
      kvkNummer: testKvk(),
      bedrijf: persona.bedrijf,
    });
    for (const stap of stappen) {
      await wacht(stap.wacht || 600);
      if (comboRef.current !== beurt.combo) return;
      verwerk(stap.event, stap.data, beurt);
    }
    verwerk("done", {}, beurt);
  };

  const testKvk = () =>
    leesAssistentInstellingen().testKvk.trim() || persona.kvkNummer;

  const vraagBackend = async (
    bericht: string,
    beurt: Beurt,
    extra: { opgaven?: Record<string, unknown> | null; toestemming?: boolean },
  ) => {
    const ingesteld = leesAssistentInstellingen();
    const controller = new AbortController();
    const verbinden = setTimeout(() => controller.abort(), 60_000);
    let stil: ReturnType<typeof setTimeout> | undefined;
    const nogBezig = () => {
      clearTimeout(stil);
      stil = setTimeout(() => controller.abort(), 90_000);
    };

    try {
      const antwoord = await fetch(`${API}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VLAM-API-Key": ingesteld.vlamSleutel,
          "X-Claude-API-Key": ingesteld.claudeSleutel,
          "X-Test-User": testKvk(),
        },
        body: JSON.stringify({
          message: bericht,
          session_id: sessie(beurt.combo),
          mode:
            ingesteld.transport === "cli"
              ? `cli:${ingesteld.llm}`
              : ingesteld.llm,
          ...(extra.opgaven && { opgaven: extra.opgaven }),
          ...(extra.toestemming && { toestemming: true }),
        }),
        signal: controller.signal,
      });
      clearTimeout(verbinden);
      if (!antwoord.ok || !antwoord.body)
        throw Object.assign(new Error("http"), { status: antwoord.status });

      const lezer = antwoord.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      nogBezig();
      for (;;) {
        const { done, value } = await lezer.read();
        if (done) break;
        nogBezig();
        buffer += decoder.decode(value, { stream: true });
        const blokken = buffer.split("\n\n");
        buffer = blokken.pop() ?? "";
        for (const blok of blokken) {
          let event = "message";
          let data = "";
          for (const regel of blok.trim().split("\n")) {
            if (regel.startsWith("event: ")) event = regel.slice(7);
            if (regel.startsWith("data: ")) data = regel.slice(6);
          }
          if (data) verwerk(event, JSON.parse(data), beurt);
        }
      }
    } catch (fout) {
      if (beurt.beantwoord) return;
      const status = (fout as { status?: number }).status;
      const reden =
        (fout as Error).name === "AbortError"
          ? "De assistent reageerde te lang niet. Probeer het opnieuw."
          : status === 401
            ? "Er is nog geen toegangssleutel ingevuld, of de sleutel klopt niet. Controleer de sleutel in het Flags-paneel."
            : status === 403
              ? "Deze toegangssleutel geeft geen toegang tot de assistent."
              : status === 503
                ? "De assistent is in deze omgeving niet aangesloten. Zet de demo-modus aan in het Flags-paneel, of probeer het later opnieuw."
                : status && status >= 500
                  ? "De assistent heeft een technisch probleem. Probeer het later opnieuw."
                  : "De assistent is niet bereikbaar. Controleer uw internetverbinding en probeer het opnieuw.";
      verwerk("error", { message: reden }, beurt);
    } finally {
      clearTimeout(verbinden);
      clearTimeout(stil);
    }
  };

  /** Eén vraag versturen en het antwoord verwerken. */
  const verstuur = async (
    tekst: string,
    extra: {
      opgaven?: Record<string, unknown> | null;
      toestemming?: boolean;
    } = {},
  ) => {
    const bericht = tekst.trim();
    if (!bericht || bezigRef.current) return;
    bezigRef.current = true;
    // Een lopende onboarding of wachttijd stopt: de gebruiker is al begonnen.
    wachtToken.current++;
    setBezig(true);
    setBewaard("nee");
    setInvoer("");
    setItems((huidig) => huidig.filter((item) => item.soort !== "suggesties"));
    voegToe({ id: nieuwId(), soort: "gebruiker", tekst: bericht });
    toonDenken("Vraag analyseren…");

    const beurt: Beurt = {
      combo: comboRef.current,
      beantwoord: false,
      zaakGemaakt: false,
      verzoek: null,
    };
    try {
      // Uit de opslag en niet uit de render: bij het laden (?vraag=) is de
      // instelling nog niet gelezen.
      const isDemo = leesAssistentInstellingen().demoModus ?? !backendIngesteld;
      if (isDemo) await speelDemoBeurt(bericht, beurt);
      else await vraagBackend(bericht, beurt, extra);
    } finally {
      verbergDenken();
      bezigRef.current = false;
      setBezig(false);
      // Het deelverzoek komt ná de uitleg in het antwoord.
      if (beurt.verzoek && comboRef.current === beurt.combo)
        voegToe(
          {
            id: nieuwId(),
            soort: "deelverzoek",
            bron: beurt.verzoek.bron ?? "uw Business Wallet",
            omschrijving:
              beurt.verzoek.omschrijving ??
              "De assistent wil uw energieverbruik-attestatie gebruiken (afgegeven door uw netbeheerder). Er wordt niets opgehaald voordat u hier akkoord geeft.",
            vanBackend: true,
            staat: "open",
          },
          { focus: true },
        );
    }
  };

  // --- Onboarding, nieuw gesprek en bewaren ------------------------------

  const toonSuggesties = useCallback(
    (opnieuw: boolean) =>
      voegToe({ id: nieuwId(), soort: "suggesties", opnieuw }),
    [voegToe],
  );

  const onboardingGezien = () => {
    try {
      return window.localStorage.getItem(ONBOARDING_GEZIEN) === "true";
    } catch {
      return false;
    }
  };

  const toonOnboarding = useCallback(async () => {
    const token = ++wachtToken.current;
    setItems((huidig) => huidig.filter((item) => item.soort !== "suggesties"));
    for (const tekst of ONBOARDING) {
      setDenkt("");
      await wacht(1600);
      if (token !== wachtToken.current) return;
      setDenkt(null);
      voegToe({ id: nieuwId(), soort: "assistent", tekst });
      await wacht(800);
    }
    setDenkt("");
    await wacht(700);
    if (token !== wachtToken.current) return;
    setDenkt(null);
    toonSuggesties(onboardingGezien());
    try {
      window.localStorage.setItem(ONBOARDING_GEZIEN, "true");
    } catch {
      // Privémodus: dan volgende keer opnieuw de uitleg.
    }
  }, [toonSuggesties, voegToe]);

  const nieuwGesprek = () => {
    if (!heeftGesprek || bezig) return;
    const historie = leesOpslag<Item[]>(OPSLAG_HISTORIE);
    delete historie[comboRef.current];
    schrijfOpslag(OPSLAG_HISTORIE, historie);
    zetSessie(comboRef.current);
    demoStand.current = { scenario: null, beurt: 0 };
    setItems([]);
    setInvoer("");
    setBewaard("nee");
    invoerRef.current?.focus();
    naWachten(() => toonSuggesties(true));
  };

  const bewaarGesprek = () => {
    if (!heeftGesprek || bezig || bewaard === "ja") return;
    const eerste = items.find((item) => item.soort === "gebruiker");
    const vraag = eerste?.soort === "gebruiker" ? eerste.tekst : "";
    const titel =
      vraag.length <= BEWAAR_TITEL_MAX
        ? vraag
        : `${vraag.slice(0, BEWAAR_TITEL_MAX).replace(/\s+\S*$/, "")}…`;
    const gelukt = zetBewaard(
      {
        sleutel: `gesprek:${titel}`,
        categorie: BEWAAR_CATEGORIE,
        titel,
        samenvatting: `Gesprek van ${vandaag()}`,
        href: `/digitale-assistent?gesprek=${encodeURIComponent(titel)}`,
        gesprek: items.filter((item) => item.soort !== "suggesties"),
      },
      true,
    );
    setBewaard(gelukt ? "ja" : "fout");
  };

  // --- Starten en wisselen ------------------------------------------------

  useEffect(() => {
    if (gestart.current) return;
    gestart.current = true;

    try {
      if (window.sessionStorage.getItem(OPSLAG_VERSIE) !== OPMAAK_VERSIE) {
        window.sessionStorage.removeItem(OPSLAG_HISTORIE);
        window.sessionStorage.removeItem(OPSLAG_SESSIES);
        window.sessionStorage.setItem(OPSLAG_VERSIE, OPMAAK_VERSIE);
      }
    } catch {
      // Privémodus: er is dan toch niets bewaard.
    }

    const zoek = new URLSearchParams(window.location.search);
    const gesprek = zoek.get("gesprek");
    const startvraag = zoek.get("vraag")?.trim();
    const bewaardItem = gesprek ? leesBewaardItem(`gesprek:${gesprek}`) : null;
    const historie = leesOpslag<Item[]>(OPSLAG_HISTORIE)[comboRef.current];

    if (bewaardItem && Array.isArray(bewaardItem.gesprek)) {
      // De sessie van toen bestaat niet meer; een vervolgvraag start een nieuwe.
      zetSessie(comboRef.current);
      setItems(bewaardItem.gesprek as Item[]);
      setBewaard("ja");
    } else if (startvraag) {
      // Wie met een vraag binnenkomt, krijgt geen onboarding ertussen.
      void verstuur(startvraag);
    } else if (historie?.length) {
      setItems(historie);
    } else if (onboardingGezien()) {
      naWachten(() => toonSuggesties(true), WACHT_PAGINALAAD);
    } else {
      void toonOnboarding();
    }
    // Alleen bij het laden van de pagina.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Andere LLM of transport: ander gesprek. Het vorige blijft bewaard.
  useEffect(() => {
    if (comboRef.current === combo) return;
    const vorige = comboRef.current;
    comboRef.current = combo;
    if (itemsRef.current.some((item) => item.soort === "gebruiker"))
      bewaarHistorie(vorige, itemsRef.current);
    const historie = leesOpslag<Item[]>(OPSLAG_HISTORIE)[combo];
    setBewaard("nee");
    if (historie?.length) {
      setItems(historie);
      return;
    }
    setItems([]);
    naWachten(() => toonSuggesties(true));
  }, [combo, bewaarHistorie, naWachten, toonSuggesties]);

  // Demo aan of uit: draaiboek opnieuw beginnen. Niet bij het laden: dan kan
  // een startvraag (?vraag=) het draaiboek al gestart hebben.
  const vorigeDemo = useRef(demo);
  useEffect(() => {
    if (vorigeDemo.current === demo) return;
    vorigeDemo.current = demo;
    demoStand.current = { scenario: null, beurt: 0 };
  }, [demo]);

  // Grenzen voor de energiekaart: uit RegelRecht, of uit het draaiboek.
  useEffect(() => {
    if (demo) {
      setDrempel(DEMO_DREMPEL);
      return;
    }
    let actief = true;
    fetch(
      `${API}/regelrecht/definities?law=${encodeURIComponent(WALLET_WET)}`,
      {
        signal: AbortSignal.timeout(4000),
      },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const def = d?.definities;
        if (actief && def)
          setDrempel({
            kwh: Number(def.DREMPEL_ELEKTRICITEIT_KWH),
            gas: Number(def.DREMPEL_GAS_M3),
          });
      })
      .catch(() => actief && setDrempel(null));
    return () => {
      actief = false;
    };
  }, [demo]);

  // Status van de bronnen (flag "Status van bronnen in de Digitale assistent").
  useEffect(() => {
    if (!toonBronstatus) return;
    if (demo) {
      setStatus(DEMO_STATUS);
      return;
    }
    let actief = true;
    fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) })
      .then((r) => r.json())
      .then((data: ServerStatus) => actief && setStatus(data))
      .catch(() => actief && setStatus(null));
    return () => {
      actief = false;
    };
  }, [demo, toonBronstatus]);

  // Losse onderdelen tonen vanuit het Flags-paneel.
  useEffect(() => {
    const toon = (event: Event) => {
      const soort = (event as CustomEvent<AssistentDemo>).detail;
      if (soort === "testantwoord") {
        setItems((huidig) =>
          huidig.filter((item) => item.soort !== "suggesties"),
        );
        voegToe({ id: nieuwId(), soort: "gebruiker", tekst: TEST_VRAAG });
        setDenkt("Bronnen raadplegen…");
        setTimeout(() => {
          setDenkt(null);
          voegToe({
            id: nieuwId(),
            soort: "assistent",
            tekst: TEST_ANTWOORD,
            bronnen: TEST_BRONNEN,
          });
        }, 1200);
      } else if (soort === "wallet") {
        voegToe(
          {
            id: nieuwId(),
            soort: "deelverzoek",
            bron: "uw Business Wallet",
            omschrijving:
              "De assistent wil uw energieverbruik-attestatie uit uw Business Wallet gebruiken (afgegeven door uw netbeheerder). U bepaalt zelf of u deze gegevens deelt.",
            vanBackend: false,
            staat: "open",
            energie: {
              uitgever: "Stedin (mock)",
              data: {
                credential: {
                  uitgegeven_door: "Stedin (mock)",
                  peiljaar: 2025,
                },
                toestemming: { met_toestemming_ondernemer: true },
                verbruik: {
                  totaal: {
                    jaarlijks_elektriciteitsverbruik_kwh: 61250,
                    jaarlijks_gasverbruik_m3: 9800,
                  },
                },
              },
            },
          },
          { focus: true },
        );
      } else {
        const spec =
          soort === "eml"
            ? vraagSpec({
                maatregelen: [
                  {
                    code: "GC1",
                    omschrijving:
                      "Pas een klokregeling toe en regel deze in (ruimteverwarming)",
                  },
                  {
                    code: "GC3",
                    omschrijving: "Pas een weersafhankelijke regeling toe",
                  },
                  {
                    code: "GF4",
                    omschrijving:
                      "Vervang gloei-, halogeen- en spaarlampen door LED-lampen",
                  },
                  {
                    code: "FD3",
                    omschrijving:
                      "Pas nachtafdekking toe bij semi-verticale koelmeubels",
                  },
                  {
                    code: "FD7",
                    omschrijving:
                      "Isoleer de wanden van koelcellen om warmte buiten te houden",
                  },
                ],
                provenance: { source: "RegelRecht" },
                data: {
                  vraag: {
                    intro: `Op basis van de Erkende Maatregelenlijst (EML 2023) gelden voor ${persona.bedrijf.handelsnaam ?? "uw bedrijf"} 5 maatregelen.`,
                    tekst: "Geef per maatregel aan of deze is uitgevoerd.",
                  },
                },
              })
            : {
                titel: "Vraag van de assistent",
                intro: "",
                tekst: "Heeft uw bedrijf een koelinstallatie?",
                bron: "RegelRecht",
                velden: [
                  {
                    naam: "koelinstallatie",
                    label: "Heeft uw bedrijf een koelinstallatie?",
                    type: "radio" as const,
                    opties: ["Ja", "Nee"],
                  },
                ],
              };
        if (spec)
          voegToe(
            { id: nieuwId(), soort: "vraag", spec, staat: "open" },
            { focus: true },
          );
      }
    };
    window.addEventListener(ASSISTENT_DEMO_EVENT, toon);
    return () => window.removeEventListener(ASSISTENT_DEMO_EVENT, toon);
  }, [persona.bedrijf.handelsnaam, voegToe]);

  const verzend = (event?: FormEvent) => {
    event?.preventDefault();
    void verstuur(invoer);
  };

  return (
    <section className="mox-card rhc-chat" aria-label="Gesprek">
      {toonBronstatus && status !== undefined && (
        <BronStatus status={status} transport={instellingen.transport} />
      )}

      <div
        ref={berichtenRef}
        className="rhc-chat-messages"
        role="log"
        aria-live="polite"
      >
        {items.map((item) => (
          <div key={item.id} data-item={item.id} className="rhc-chat-rule">
            {item.soort === "gebruiker" && <Gebruiker item={item} />}
            {item.soort === "assistent" && <Assistent item={item} />}
            {item.soort === "fout" && <Fout item={item} />}
            {item.soort === "suggesties" && (
              <Suggesties
                item={item}
                onVraag={(vraag) => void verstuur(vraag)}
                onUitleg={() => void toonOnboarding()}
              />
            )}
            {item.soort === "deelverzoek" && (
              <Deelverzoek
                item={item}
                drempel={drempel}
                onDelen={() => {
                  if (item.vanBackend) {
                    if (bezigRef.current) return;
                    wijzig(item.id, { staat: "gedeeld" });
                    void verstuur("Ja, ik geef toestemming.", {
                      toestemming: true,
                    });
                    return;
                  }
                  scrollNaar.current = item.id;
                  focusOp.current = item.id;
                  wijzig(item.id, { staat: "gedeeld" });
                }}
                onNietDelen={() => {
                  wijzig(item.id, { staat: "geweigerd" });
                  if (item.vanBackend)
                    void verstuur("Nee, ik geef geen toestemming.");
                }}
              />
            )}
            {item.soort === "vraag" && (
              <VraagKaart
                item={item}
                bezig={bezig}
                onVerstuur={(bericht, opgaven, antwoorden) => {
                  wijzig(item.id, { staat: "verstuurd", antwoorden });
                  void verstuur(bericht, { opgaven });
                }}
                onUitleg={(bericht) => void verstuur(bericht)}
              />
            )}
          </div>
        ))}
        {denkt !== null && <Denkt tekst={denkt} />}
      </div>

      <form ref={formRef} className="rhc-chat-input" onSubmit={verzend}>
        <label htmlFor="chat-invoer">
          <VisuallyHidden>Uw vraag</VisuallyHidden>
        </label>
        {/* RHC Textarea geeft geen ref door; dezelfde classes op een textarea. */}
        <textarea
          ref={invoerRef}
          className="utrecht-textarea utrecht-textarea--html-textarea rhc-textarea"
          id="chat-invoer"
          placeholder="Waarmee kan ik u helpen?"
          value={invoer}
          onChange={(event) => setInvoer(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              verzend();
            }
          }}
        />
        <ActionGroup>
          <Button
            type="submit"
            appearance="primary-action-button"
            aria-disabled={bezig || undefined}
          >
            Vraag stellen
          </Button>
          <Button
            appearance="secondary-action-button"
            aria-disabled={!heeftGesprek || bezig || undefined}
            onClick={nieuwGesprek}
          >
            Nieuw gesprek starten
          </Button>
          <Button
            appearance="secondary-action-button"
            aria-disabled={
              !heeftGesprek || bezig || bewaard === "ja" || undefined
            }
            onClick={bewaarGesprek}
          >
            {bewaard === "ja" ? "Gesprek bewaard" : "Bewaar gesprek"}
          </Button>
        </ActionGroup>
        <p className="rhc-visually-hidden" role="status">
          {bewaard === "ja"
            ? "Het gesprek staat nu bij uw bewaarde items."
            : bewaard === "fout"
              ? "Het gesprek kon niet worden bewaard."
              : ""}
        </p>
      </form>

      <Paragraph className="rhc-chat-disclaimer">
        <Icon icon="info-circle" />
        De antwoorden van deze assistent worden door AI gemaakt en kunnen fouten
        bevatten. De assistent gebruikt onder meer het KVK Handelsregister, de
        KOOP Regelingenbank, RegelRecht en de RVO. Controleer belangrijke
        informatie altijd bij de oorspronkelijke bron. Heeft u juridisch advies
        nodig? Vraag het dan aan een adviseur of de organisatie die erover gaat.
      </Paragraph>
    </section>
  );
};

export default Chat;
