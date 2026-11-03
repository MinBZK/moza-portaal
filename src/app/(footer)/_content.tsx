import Placeholder from "./_placeholder";
import About from "./wat-is-mijnoverheid-zakelijk/_about";
import Toegankelijkheid from "./toegankelijkheid/_content";
import Sitemap from "./sitemap/_content";
import English from "./english/_content";
import Veiligheid from "./veiligheid/_content";
import Privacyverklaring from "./privacyverklaring/_content";
import WetEnRegelgeving from "./wet-en-regelgeving/_content";
import Mededelingen from "./mededelingen/_content";
import HerkenOplichting from "./herken-oplichting/_content";
import VeelgesteldeVragen from "./veelgestelde-vragen/_content";
import Contact from "./contact/_content";
import Klachtafhandeling from "./klachtafhandeling/_content";
import AangeslotenOrganisaties from "./aangesloten-organisaties/_content";

/** Content per page from the footer, with and without a persona. */
const CONTENT: Record<string, () => React.JSX.Element> = {
  "wat-is-mijnoverheid-zakelijk": About,
  toegankelijkheid: Toegankelijkheid,
  sitemap: Sitemap,
  english: English,
  veiligheid: Veiligheid,
  privacyverklaring: Privacyverklaring,
  "wet-en-regelgeving": WetEnRegelgeving,
  mededelingen: Mededelingen,
  "herken-oplichting": HerkenOplichting,
  "veelgestelde-vragen": VeelgesteldeVragen,
  contact: Contact,
  klachtafhandeling: Klachtafhandeling,
  "aangesloten-organisaties": AangeslotenOrganisaties,
};

/** The content of a footer page, or a placeholder if there is none yet. */
const FooterContent = ({ slug }: { slug: string }) => {
  const Content = CONTENT[slug];
  return Content ? <Content /> : <Placeholder slug={slug} />;
};

export default FooterContent;
