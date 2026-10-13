export type { DemoOnderdeel } from "./types";
export {
  getDemoSubsidies,
  getDemoSubsidieById,
  type DemoSubsidie,
} from "./subsidies";
export { getDemoWetten, getDemoWetById, type DemoWet } from "./wetten";
export {
  getDemoBinnenkort,
  type DemoBinnenkort,
  type DemoVraag,
} from "./binnenkort";
export {
  getDemoOndernemingsgegevens,
  getDemoOndernemingsonderdelen,
  getDemoOndernemingsvragen,
  type DemoGegeven,
  type DemoOnderdeelLink,
} from "./onderneming";
export {
  getDemoZaakById,
  getDemoZaken,
  getDemoZakenVragen,
  type DemoZaak,
  type DemoZaakStap,
} from "./zaken";
export { getDemoBuurtberichten, type DemoBuurtbericht } from "./buurtberichten";
export {
  getDemoBerichten,
  getDemoBerichtById,
  type DemoBericht,
} from "./berichten";
export {
  getDemoVerwerkingen,
  getDemoVerwerkingVerwachtingen,
  getDemoVerwerkingVragen,
  type DemoVerwerking,
} from "./dataverwerking";
export {
  getDemoContactgegevens,
  getDemoContactorganisaties,
  getDemoContactkanalen,
  getDemoContactvragen,
  getDemoProfielIdentiteit,
  type DemoOrganisatie,
  type DemoProfielIdentiteit,
} from "./contactvoorkeuren";
export {
  getDemoPersonas,
  getDemoPersona,
  getDemoOrganisatieId,
  STANDAARD_PERSONA_ID,
  type DemoPersona,
  type DemoBedrijfsorganisatie,
} from "./personas";
export {
  getDemoBedrijfsdetails,
  getDemoBedrijfsonderdeel,
  type DemoBedrijfsdetails,
  type DemoBedrijfsonderdeel,
} from "./bedrijfsonderdelen";
