/**
 * Static mapping from SBI 2008 code prefixes to relevant Ondernemersplein subjects.
 * Used to pre-suggest topics for entrepreneurs based on their KVK SBI codes.
 *
 * SBI codes: https://www.kvk.nl/sbi/
 * Subject values must match the actual `subjects` field on articles in the
 * Ondernemersplein OpenData API (not the theme/subjectsview display names).
 */
export const sbiSubjectSuggestions: Record<string, string[]> = {
  // A - Landbouw, bosbouw en visserij
  "01": ["Klimaat, energie en natuur", "Exporteren"],
  "02": ["Klimaat, energie en natuur"],
  "03": ["Klimaat, energie en natuur", "Exporteren"],

  // C - Industrie
  "10": ["Productveiligheid en verpakking", "Exporteren"],       // Voedingsmiddelen
  "25": ["Productveiligheid en verpakking", "Exporteren"],       // Metaalproducten
  "26": ["Product, dienst en innovatie", "Exporteren"],          // Elektronica

  // F - Bouwnijverheid
  "41": ["Omgevingswet", "Verzekeringen en uitkeringen", "Arbeidsvoorwaarden"], // Algemene bouw
  "42": ["Omgevingswet", "Verzekeringen en uitkeringen"],                        // Grond/waterbouw
  "43": ["Omgevingswet", "Verzekeringen en uitkeringen", "Arbeidsvoorwaarden"], // Gespecialiseerde bouw

  // G - Groot- en detailhandel
  "45": ["Verkoopvoorwaarden en reclame"],                        // Autohandel
  "46": ["Exporteren", "Importeren", "Zakelijk vervoer en logistiek"], // Groothandel
  "47": ["Verkoopvoorwaarden en reclame"],                        // Detailhandel

  // H - Vervoer en opslag
  "49": ["Zakelijk vervoer en logistiek", "Energie"],
  "52": ["Zakelijk vervoer en logistiek", "Importeren"],

  // I - Horeca
  "55": ["Verzekeringen en uitkeringen", "Arbeidsvoorwaarden", "Personeel aannemen en inhuren"],
  "56": ["Verzekeringen en uitkeringen", "Arbeidsvoorwaarden", "Personeel aannemen en inhuren"],

  // J - Informatie en communicatie
  "62": ["Product, dienst en innovatie", "Bedrijf starten of overnemen"],  // IT-dienstverlening
  "63": ["Product, dienst en innovatie"],                                   // Informatiedienstverlening

  // K - Financiële instellingen
  "64": ["Belastingen en heffingen", "Verzekeringen en uitkeringen"],
  "66": ["Verzekeringen en uitkeringen"],

  // M - Specialistische zakelijke diensten
  "69": ["Juridische zaken", "Administratie"],                    // Juridisch/accountancy
  "70": ["Bedrijfsvoering"],                                      // Management-advies
  "71": ["Omgevingswet", "Bedrijfsvoering"],                     // Architecten/ingenieurs
  "72": ["Product, dienst en innovatie"],                         // R&D
  "74": ["Product, dienst en innovatie"],                         // Design

  // N - Verhuur en overige zakelijke diensten
  "78": ["Personeel aannemen en inhuren", "Loon en vergoedingen"], // Uitzendwerk
  "81": ["Omgevingswet", "Klimaat, energie en natuur"],           // Schoonmaak/landschap

  // Q - Gezondheids- en welzijnszorg
  "86": ["Verzekeringen en uitkeringen", "Arbeidsomstandigheden en ziekte"], // Gezondheidszorg
  "87": ["Arbeidsvoorwaarden", "Arbeidsomstandigheden en ziekte"],           // Verpleging
  "88": ["Arbeidsvoorwaarden", "Personeel"],                                  // Welzijnszorg
};

/**
 * Get suggested Ondernemersplein subjects based on SBI codes.
 * Matches on 2-digit SBI prefix.
 */
export function getSuggestedSubjects(sbiCodes: string[]): string[] {
  const subjects = new Set<string>();

  for (const code of sbiCodes) {
    const prefix = code.substring(0, 2);
    const suggestions = sbiSubjectSuggestions[prefix];
    if (suggestions) {
      suggestions.forEach((s) => subjects.add(s));
    }
  }

  return [...subjects];
}
