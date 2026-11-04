
# UX-opleveringen en Definition of Done

Draft 0.1, 23 september 2026

## Wat leveren we op en waarom?

In dit project is de UX-ontwerpoplevering geen plaatje maar een werkende, toegankelijke interface (prototype) plus de afspraken eronder; ontwerpprincipes en -patronen, componenten, design tokens en onderzoeksinzicht. Zo is het ontwerp overdraagbaar, werkend en onderbouwd en kan het bij daadwerkelijke implementatie makkelijker overgenomen worden of hoeft deze niet te worden geïnterpreteerd.

ℹ️ Het prototype is een referentie voor realisatie, geen productiecode.

## Onderdelen van de UX-oplevering

Een UX-oplevering bestaat uit meerdere samenhangende onderdelen. Niet elk onderdeel is bij iedere oplevering even uitgebreid of relevant. De _Definition of Done_ bepaalt per onderdeel wanneer het voldoende is uitgewerkt.

1. **Werkend prototype**. Hierin leggen we echte interactie vast zoals werkende functionaliteit, toetsenbordbediening, focusgedrag en foutpaden. Voorheen was dit _‘platte’_ semantische HTML, CSS en JavaScript zonder framework. Op dit moment integreren we het prototype in de demo-omgeving (React en Next.js), zodat we één omgeving hebben en makkelijker gebruik kunnen maken van de backend en services die ontwikkeld worden.

2. **Componentenbibliotheek**. Elk component met zijn varianten, staten, instelbare eigenschappen en een beschrijving van wanneer deze wordt ingezet. Met de nieuwe React-opzet vervalt dit grotendeels, omdat we voor een groot deel gebruik kunnen maken van [de componenten uit de Rijkshuisstijl Community](https://rijkshuisstijl-community.vercel.app/?path=/docs/react-components-readme--docs). Deze worden actief onderhouden en beschreven. Componenten die ontbreken of tekortschieten ontwikkelen we zelf. Hoe, of en wanneer we hierin de Rijkshuisstijl Community betrekken is een open vraag die we delen met MijnOverheid (MOBu) en overheid.nl.

3. **Design tokens**. Ontwerp-eigenschappen in een bronbestand dat zowel [design tooling](https://tokens.studio/) als front-end bedient (‘tweerichtingsverkeer’). [Style Dictionary](https://styledictionary.com/) zet basistokens om naar CSS custom properties. De tokenarchitectuur bevat twee lagen: opties (de beschikbare waarden uit de Rijkshuisstijl) en toepassing (de semantische verwijzing die bepaalt hoe een optie wordt ingezet). Ook deze opzet vervalt grotendeels; hij blijft echter wel relevant bij het afleiden van de (mijn.)overheid.nl-stijl uit de Rijkshuisstijl en ontwerp en implementatie van nieuwe componenten.

4. **Ontwerpprincipes**. Een principe legt uit wat wel en niet mag, en waarom. We beschrijven alleen principes die niet beschreven zijn in [de rijkshuisstijl](https://www.rijkshuisstijl.nl/modules/product/DigitalStyleGuide/default/grouplist.aspx?ItemId=11962).

5. **Ontwerppatronen**. Bijvoorbeeld context wisselen, interacteren op inhoud (berichtenbox) en de chat-interface. Uitgeschreven redenering achter een patroon. Dit vangt wat code níet toont. We leunen zoveel mogelijk op bestaande, bewezen conventies en beschrijven alleen de patronen die dat niet zijn (in de Rijkshuisstijl Community, als onderdeel van het NL Design System maar ook betrouwbare bronnen als GOV.UK, de Nielsen Norman Group, W3C WAI en het Baymard Institute).

6. **Onderzoeksopbrengst**. Onderzoeksopzet, hoe itereren we het prototype op basis van bevindingen, wat zijn goede persona’s en scenario’s om te staven, etc. Aannames worden getoetst en vertaald naar het prototype.

7. **Schrijfwijzer**. Aanspreekvorm, terminologie, notatie en microcopy. Dit gaat om UI-tekst, niet de content uit (externe) bronnen.

De overheid.nl-stijl, ontwerpprincipes en -patronen en nieuwe of aangepaste componenten delen we zoveel mogelijk met andere projecten binnen het _‘Klavertje vier’_ om consistentie in beeldtaal en gebruikerservaring te waarborgen en dubbel werk te voorkomen.

### Wat we niet leveren

We leveren geen Figma-schermen als eindproduct en geen pixelspecificaties, losse wireframes of functioneel ontwerp naast de code. Die vertaalstap kost tijd, verliest informatie en introduceert afwijkingen.

## Definition of done

Wanneer is een oplevering _‘af’_, en waaraan is dat te toetsen?

Een UX-oplevering is af wanneer het ontwerp voldoende uitgewerkt, onderbouwd, toegankelijk en overdraagbaar is om zonder aanvullende ontwerpinterpretatie te kunnen worden gerealiseerd.

De oplevering bevat niet alleen de gewenste situatie, maar ook relevante interacties, staten en uitzonderingen.

Keuzes zijn gebaseerd op gebruikersbehoeften, onderzoek en bestaande patronen of richtlijnen. De keten ziet er als volgt uit:

`requirement of gebruikerswens/behoefte` → `hypothese/aannames` → `onderzoek` → `inzicht en bevindingen` → `ontwerpbeslissing` → `wijzigingen aan prototype` → `indien nodig wijziging aan of nieuwe component of patroon`

Hierbij zijn `onderzoek` → `inzicht en bevindingen` → `ontwerpbeslissing` → `wijzigingen aan prototype` een iteratief proces totdat volledig aan requirement of gebruikerswens/behoefte voldaan wordt.

### Algemeen

- [ ] Is de oplevering makkelijk vindbaar en staat deze op de plek waar deze te verwachten is?
  - [ ] staat een link naar de oplevering in het backlogitem?
- [ ] Is bijbehorende documentatie duidelijk, compleet en onderbouwd?
- [ ] Kan iedereen ermee aan de slag zonder ontbrekende ontwerpbeslissingen zelf te moeten invullen?
- [ ] Wat is de status van een oplevering?
  - [ ] is iets concept, moet deze nog gevalideerd worden met gebruikers, of is iets bewezen en klaar om over te nemen?
  - [ ] indien gevalideerd, heeft een ontwikkelaar deze beoordeeld?
  - [ ] zijn de relevante back-end en/of service koppeling gereed?
  - [ ] wordt echte of fictieve data gebruikt?
- [ ] Waar het ontwerp nog niet definitief is, is dit expliciet aangegeven en duidelijk wie welke beslissing nog moet nemen.

### Prototype-scherm of -flow

- [ ] Welke gebruikersbehoefte, requirement of onderzoeksvraag wordt met een ontwerpkeuze opgelost?
- [ ] Is duidelijk welke delen van het prototype representatief zijn voor productie en welke alleen bedoeld zijn om een UX-vraag te onderzoeken?
- [ ] Wanneer is iets klaar om met gebruikers te toetsen?
- [ ] Is de flow van begin tot eind te doorlopen, en niet alleen het eindscherm?
- [ ] Zijn de _‘unhappy paths’_ uitgewerkt? Wat gebeurt er bijv. bij een fout van systeem of gebruiker, bij lange laadtijd, een leeg of verkeerd ingevuld verplicht formulierveld, een externe koppeling die eruit ligt?
  - [ ] zijn lege, ladende en foutieve staten ontworpen?
- [ ] Voldoet de oplevering aan de toegankelijkheidseisen (WCAG 2.2 AA) voor zover van toepassing? Bijv.:
  - [ ] is deze met het toetsenbord te bedienen, in een logische volgorde en met zichtbare focus?
  - [ ] werkt het scherm bij inzoomen (tot 400%) en bij vergrote tekst (tot 200%), zonder verlies van inhoud of functie?
  - [ ] zijn structuur, inhoud, statusmeldingen en foutmeldingen benaderbaar en begrijpelijk ook voor bijv. screenreadergebruikers?
  - [ ] werkt het op een klein scherm en met aanraakbediening?
  - [ ] is voorzien in foutidentificatie en correctiesuggesties?
  - [ ] is buiten automatisch toetsbare technische toegankelijkheid ook handmatig getoetst?
- [ ] Welke beslissingen moet een ontwikkelaar zelf nog nemen?
  - [ ] zijn er afhankelijkheden met backend, services en externe systemen en zijn deze duidelijk?
  - [ ] kan een ontwikkelaar functionaliteit, scherm of flow realiseren zonder zelf UX-beslissingen te moeten nemen?
- [ ] Is duidelijk welke onderdelen echt werken en welke zijn gesimuleerd?
  - [ ] is getest met realistische data, bijv. lange namen, veel items of juist geen items, in plaats van ideale voorbeelddata?
- [ ] Zijn afhankelijkheden met backend en/of services duidelijk?

### Componentgebruik en componentuitbreiding

Dit geldt grotendeels voor de ontwerpbouwstenen die niet afkomstig zijn van de Rijkshuisstijl Community; we bouwen niet wat al beschikbaar is.

- [ ] Is gedocumenteerd hoe en wanneer het component ingezet wordt, en wanneer juist niet? (Dit geldt met name voor niet-beschikbare of ontoereikende bestaande componenten.)
- [ ] Zijn alle varianten en staten (in isolatie) aanwezig, inclusief uitzonderingen, leeg, ladend, fout en uitgeschakeld?
- [ ] Houdt het component zich aan de huisstijl en maakt het gebruik van de relevante design tokens?
- [ ] Is het component (in isolatie) toegankelijk: semantisch correct, bedienbaar met het toetsenbord en met voldoende contrast?
- [ ] Welke afwijkingen of uitbreidingen zijn gemaakt op een bestaand component?

### Design tokens

De technische/visuele infrastructuur die consistentie in beeldtaal en interactie waarborgt.

- [ ] Houden de tokens zich aan de bestaande (Rijkshuisstijl Community) conventie?
- [ ] Is een nieuwe semantische waarde toegevoegd in de toepassingslaag, en maakt deze gebruik van de optielaag?
- [ ] Worden geen losse, ‘hardcoded’ waarden gebruikt?
- [ ] Voldoet elke kleurcombinatie aan de contrasteis?

### Ontwerpprincipes

- [ ] Is het ontwerpprincipe duidelijk gedocumenteerd, met het waarom erbij en niet alleen de regel?
- [ ] Staat er een voorbeeld bij van wat wel en wat niet volgens het principe is?
- [ ] Waar is dit principe op gebaseerd? Bijv.:
  - [ ] gebruikersonderzoek
  - [ ] bewezen extern principe
  - [ ] bestaande overheid.nl-conventie
  - [ ] Rijkshuisstijl
  - [ ] WCAG
  - [ ] platformconventie

### Ontwerppatronen

Ontwerppatronen zijn (UI) oplossingen voor terugkerende problemen en vraagstukken. Patronen bestaan veelal uit combinaties van componenten of meerdere pagina’s.

- [ ] Is er een bestaand, bewezen patroon dat we kunnen gebruiken?
- [ ] Benoemt het patroon welk probleem het oplost?
- [ ] Is duidelijk wanneer het patroon níet geldt?
- [ ] Zijn er afgevallen alternatieven, en wat is de reden waarom ze afvielen?
- [ ] Welke componenten en schermen raakt het patroon?

### Schrijfwijzer en microcopy

Ontwerpregels voor tekst en taal. Dit geldt voornamelijk voor UI-tekst, niet voor teksten uit databronnen.

- [ ] Volgen de teksten de schrijfwijzer\* en zijn deze op B1-niveau en genderneutraal?
- [ ] Zijn dingen als datumnotatie, terminologie en typografische stijl consistent?
- [ ] Benoemen lege staten wat er nog niet is én wat de gebruiker kan doen?
- [ ] Zijn waarschuwingen en foutmeldingen specifiek genoeg, begrijpelijk en handelingsgericht: staat erin wat een gebruiker zelf kan doen indien een fout optreedt?
- [ ] Is nieuwe terminologie toegevoegd aan de schrijfwijzer?

\*De schrijfwijzer beoordeelt teksten automatisch met een Claude Code skill.

### Onderzoek

Onderzoeksoutput is input of bewijsvoering voor ontwerpkeuzes.

- [ ] Staat de onderzoeksvraag vooraf vast, en geeft het onderzoek antwoord op díe vraag?
- [ ] Sluiten de deelnemers aan bij het product en de functionaliteit?
- [ ] Zijn bevindingen gescheiden van interpretatie en aanbeveling?
- [ ] Is vastgelegd welke aannames nog onzeker zijn en welke daarvan prioriteit hebben?
- [ ] Heeft elke bevinding een vervolg: een aanpassing in het prototype, een nieuwe toetsbare aanname, of een besluit om er niets mee te doen, met reden?
- [ ] Zijn de persona’s en scenario’s bijgewerkt als het onderzoek daar aanleiding toe geeft?
- [ ] Zijn de onderzoeksresultaten publiekelijk te raadplegen (op mijnoverheidzakelijk.nl en gebruikersonderzoeken.nl)?
