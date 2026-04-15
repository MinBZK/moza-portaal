export type SectionKey = "berichten" | "informatie" | "regelgeving" | "subsidies";

export const SECTION_LABELS: Record<SectionKey, string> = {
  berichten: "Berichten over uw buurt",
  informatie: "Informatie",
  regelgeving: "Wetten en regelgeving",
  subsidies: "Subsidies en financiering",
};

export const SUBJECT_GROUPS: { label: string; subjects: string[] }[] = [
  {
    label: "Personeel",
    subjects: [
      "Personeel",
      "Personeel aannemen en inhuren",
      "Personeel ontslaan",
      "Arbeidsvoorwaarden",
      "Arbeidsomstandigheden en ziekte",
      "Loon en vergoedingen",
      "Buitenlands personeel",
      "Identiteit van uw personeel",
    ],
  },
  {
    label: "Bedrijfsvoering",
    subjects: [
      "Bedrijfsvoering",
      "Administratie",
      "Juridische zaken",
      "Verzekeringen en uitkeringen",
      "Beveiliging en preventie",
    ],
  },
  {
    label: "Belastingen en financiën",
    subjects: ["Belastingen en heffingen"],
  },
  {
    label: "Internationaal ondernemen",
    subjects: [
      "Internationaal ondernemen",
      "Exporteren",
      "Importeren",
      "Zakelijk vervoer en logistiek",
    ],
  },
  {
    label: "Duurzaamheid en omgeving",
    subjects: [
      "Klimaat, energie en natuur",
      "Energie",
      "Omgevingswet",
      "Bedrijfshuisvesting",
    ],
  },
  {
    label: "Product, dienst en innovatie",
    subjects: [
      "Product, dienst en innovatie",
      "Productveiligheid en verpakking",
      "Verkoopvoorwaarden en reclame",
    ],
  },
  {
    label: "Bedrijf starten of stoppen",
    subjects: [
      "Bedrijf starten of overnemen",
      "Bedrijf stoppen of overdragen",
      "Bedrijf stoppen of failliet gaan",
    ],
  },
];

export const ALL_SUBJECTS = SUBJECT_GROUPS.flatMap((g) => g.subjects);
