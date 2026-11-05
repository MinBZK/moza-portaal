---
name: reviewing-against-platformland
description: Use when reviewing or designing MijnOverheid Zakelijk (MoZa, moza-portaal) screens, flows, PRs or research plans against the Platformland principles for next-generation public services, or when asked whether something strijkt tegen de haren van de ontwerpvisie, shows the naden, fits journaal/account/takenlijst, or falls into a known anti-pattern.
---

# Toetsen aan de Platformland-principes (MoZa)

## Overzicht

MoZa wil een nieuwe generatie publieke dienst zijn: de dienst komt naar de
ondernemer, laat zien hoe de overheid in elkaar zit waar dat helpt, en
versterkt diens informatiepositie. Toets een ontwerp aan de principes en
anti-patterns hieronder. Noem bij elke bevinding het principe bij naam.

## Principes

| Principe | Toetsvraag |
|---|---|
| **Efficiëntie is een val** | Lost het ontwerp iets op wat zwaar is voor de ondernemer (zaken met meerdere organisaties tegelijk, zelf inschrijven, verlengen of opzeggen, bezwaar en beroep), of alleen wat duur is voor de overheid (handmatige verwerking, papier, post, telefoon)? |
| **Drie kosten van bureaucratie** | Verlaagt het de **leerkosten** (weten dát een regeling bestaat en of je er recht op hebt), de **nalevingskosten** (formulieren, bewijsstukken, termijnen) en de **psychologische kosten** (stress, stigma, wantrouwen)? |
| **Van aanvragen naar proactief** | De oude dienst is actief en transactioneel: zoeken, aanvragen, wachten. De nieuwe dienst komt naar de ondernemer: aanbevelen, vooraf invullen, automatisch verlengen. Is ook bewust gekozen wanneer de dienst onderbreekt, wanneer die om input vraagt en wanneer om bevestiging? |
| **Complexiteit verminderen** | Helpt het bij zaken met meerdere organisaties, bij wijzigingen in de situatie, bij de status van lopende zaken, en bij correctie met terugwerkende kracht? Respecteert het de autonomie en waardigheid van de ondernemer? |
| **Informatiepositie** | Krijgt de ondernemer de informatie die past bij diens probleem of situatie, ook als de overheid die informatie zelf niet of niet in die vorm nodig heeft? Informatiepositie is de basis voor rechtsbescherming. Dit geldt ook voor de burger over wie gegevens gaan, zoals een werknemer of kandidaat: ziet die wie diens gegevens gebruikt en waarvoor? |
| **Co-creatie (Public Service Logic)** | Is de ondernemer actieve medemaker van waarde, en de overheid facilitator? Of is de ondernemer passieve klant van een output, en telt alleen interne efficiëntie? |
| **Diensten, geen websites** | Is het een dienst die ook op andere plekken ontsloten kan worden, of alleen een pagina in dit portaal? |
| **De hele ontwikkeling (event sourcing)** | Is te zien wat er met een zaak is gebeurd, niet alleen de huidige status? |
| **Journaal, account, takenlijst** | **Journaal** (verleden): besluiten, gebeurtenissen en datagebruik op een rij, met een route naar hulp en bezwaar. **Account** (heden): wat speelt er, welke aanbevelingen, waar begin je. **Takenlijst** (toekomst): wat moet er gebeuren en wat komt eraan, ook werk dat de overheid vóór je doet. |
| **Abstractiedienst en ontbundelen** | Beheert één dienst de relaties met meerdere organisaties, zodat de ondernemer niet met elk apart hoeft? Zijn diensten ontbundeld tot bouwstenen voor journaal, account en takenlijst? |
| **Vijf naden laten zien** | Zie je 1 met welke organisaties je te maken hebt, 2 waar de verantwoordelijkheid ligt, 3 waar beleid en wet staan, 4 hoe je de dienst kunt beïnvloeden (bezwaar, wijzigen, klacht), 5 welke maatschappelijke organisaties kunnen helpen? Toon ze **op het moment van gebruik, met progressive disclosure: net genoeg, zonder de taak in de weg te zitten**. Maat: vooraan de gewone zin (wie, wat, wanneer); wetsartikelen, beleid en details achter een uitklapper of (i). |
| **Conway's Law** | Volgt de indeling de taak van de ondernemer, of de manier waarop de overheid georganiseerd is? |

## Anti-patterns

| Anti-pattern | Herken je aan |
|---|---|
| **Mijn Portaal is Hun Portaal** | Indeling, taal of volgorde naar de organisaties, niet naar de taak |
| **Informatie en zaken regelen gesplitst** | Uitleg op de ene plek, de handeling op een andere |
| **Gaslighting** | De gebruiker de schuld geven als die niet doet wat verwacht wordt; wantrouwen uitstralen; fouten zonder herstelroute |
| **Eerst "basis op orde", dan "burger centraal"** | Gebruikerswaarde uitstellen tot systemen en gegevens klaar zijn |
| **Proactief door meer gegevensuitwisseling** | Proactief gelijkstellen aan meer gegevens delen tussen organisaties |
| **Van mijnenveld naar one-stop-shop** | Alles in één loket schuiven en daarmee de naden verbergen |
| **EDI-wallet als data-sluis** | De wallet alleen als doorgeefluik tussen organisaties, zonder betere informatiepositie voor de gebruiker |

## Uitvoer

Lever de toets in deze vorm, in het Nederlands:

1. **Oordeel** in één of twee zinnen.
2. **Sluit aan**: per punt het onderdeel van het ontwerp, het principe bij naam, en waarom.
3. **Schuurt**: per punt het onderdeel, het principe of anti-pattern bij naam, wat schuurt, en een concreet voorstel dat de taak niet in de weg zit.
4. **Spanning met een eerder besluit**: punten waar het kader schuurt met een besluit dat al vastligt (in de PR, het projectgeheugen of van de gebruiker). Noem beide kanten; draai het besluit niet zelf terug.
5. **Buiten dit kader**: wat je uit eigen kennis toevoegt, apart.

## Veelgemaakte fouten

- Toetsen aan algemene ideeën over digitale overheid in plaats van aan deze principes. Gevolg: de naden, de drie kosten en de anti-patterns ontbreken.
- Een naad zo zichtbaar maken dat die de taak blokkeert. Net genoeg, op het moment van gebruik.
- Proactief vertalen naar meer gegevens ophalen, of naar één groot loket.
- Alleen naar het scherm kijken en niet naar wat ervoor en erna gebeurt (journaal, takenlijst).
