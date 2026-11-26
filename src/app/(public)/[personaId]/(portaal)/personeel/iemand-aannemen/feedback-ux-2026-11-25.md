# Feedback prototype Financieel CV, 25 november 2026

Bron: Word-document "Feedback prototype Financieel CV - MoZa", via Ravi. Letterlijk overgenomen (copy-paste), zonder de schermafbeeldingen; tussen haken staat wat er op de schermafbeelding te zien is.

```text
1. Beginblokje
   Ik denk dat de zin ‘’neemt u iemand aan die niet zelfstandig het minimumloon kan verdienen’’ wellicht wat onduidelijk is voor de ondernemer. Dat Klinkt voor mij erg specifiek. Daarom zou ik het algemener houden, bijvoorbeeld: ‘’ Wilt u iemand met een afstand tot de arbeidsmarkt aannemen? Bekijk welke regelingen mogelijk zijn en wat deze u kunnen opleveren’’.
   [tegel op Personeel en rollen]

2. Voorbeeldberekening

3. Ik vind de voorbeeldberekening zoals die nu is een grote verbetering ten opzichte van de vorige keer. De kleurtjes zijn weg bij de getallen (groen/rood), dat maakt het wat minder suggesties. Daarnaast zijn de uitleggen bij loonkostensubsidie, loondispensatie en loonkostenvoordeel erg fijn.
   [voorbeeldberekening met uitklap per regeling]

4. We kunnen misschien wel de benamingen nog wat sterker maken om het aantrekkelijker te maken. Zoals:
   1) Geschatte totale loonkosten
   2) Mogelijk voordeel regelingen
   3) Geschatte loonkosten voor werkgever
   [Loonkosten / Regelingen / Geschatte loonkosten per jaar]

5. ‘’Hoeveel procent van het werk van een collega in dezelfde functie kan een kandidaat doen’’ vind ik een vrij lastige vraag. Ik kan me voorstellen dat de ondernemer zich afvraagt waar hij deze informatie moet vinden. Ik denk dat we het iets duidelijker moeten maken dat dit een schatting/indicatie is. Bijvoorbeeld door het zo te formuleren: ‘’Maak een inschatting. Denk aan hoeveel werk de kandidaat in dezelfde tijd kan uitvoeren ten opzichte van een collega zonder arbeidsbeperking’’.
   [vraag 4, schuif op 60 procent]

6. De knop ‘’ja, ik wil regelingen aanvragen’’ dekt voor mij niet helemaal de lading op het keuzemenu dat daarna komt. Dat gaat namelijk nog over informatie van de potentiële werknemer en nog niet over regelingen. Misschien kan deze knop beter ‘’verder naar kandidaat’’ of ‘’gegevens kandidaat invullen’’. Dat voelt logischer.
   [knop Ja, ik wil regelingen aanvragen]

7. Ik vind het regelingenoverzicht erg goed. Deze zou ik zo laten.
   [Kies de regelingen, stap Controleren en versturen]

8. Heel uitgebreid overzicht, houdt de aandacht weg van de simpele berekening. Daarbij zit er soms een verschil tussen naar een nieuwe website gestuurd worden of meer informatie krijgen, waarom is dat? Misschien beter om eerst informatie te geven en dan te vragen of ze nog meer informatie nodig hebben. Zo ja, dan doorverwijzen naar nieuwe website.
   [Lees wat er kan, met het zijpaneel van Ondernemersplein open]

9. Hulptekst bij de optie ‘’weet ik niet’’ bij de vraag ‘’staat de kandidaat in het doelgroepregister van UWV’’?
   Voorstel hulptekst:  Bij "Weet ik niet": ‘’Vraag het de kandidaat. Die kan een doelgroepverklaring aanvragen bij UWV, of u doet dat met toestemming. U ziet de uitkomst alvast met en zonder de regelingen die hiervan afhangen.’’
   [vraag 1 met de (i) over het doelgroepregister open]

10. Hulptekst in de vorm van een ‘’i’’ bij de volgende vraag:
   [vraag 2, Heeft de kandidaat een uitkering?]
   Voorstel hulptekst: ‘’ Niet zeker welke uitkering het is? Kijk op de uitkeringsbrief of vraag het de kandidaat’’.
```

De nummering is van ons; in het document is het een opsomming.

## Wat we ermee deden

| #    | Wat                 | Gedaan                                                                                                                                                                                                                                                                                                                              |
| ---- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tegel algemener     | "Neemt u iemand aan met een afstand tot de arbeidsmarkt? Bekijk welke regelingen kunnen gelden en wat ze opleveren, of vraag ze direct aan." De tweede knop (Regelingen aanvragen) blijft, dus "of vraag ze direct aan" blijft ook.                                                                                                 |
| 2, 3 | Voorbeeldberekening | Niets: positief.                                                                                                                                                                                                                                                                                                                    |
| 4    | Benamingen          | Geschatte totale loonkosten / Mogelijk voordeel van regelingen / Uw geschatte loonkosten per jaar. "Uw" in plaats van "voor werkgever" (u-vorm), en "per jaar" blijft staan.                                                                                                                                                        |
| 5    | Procentvraag        | Zichtbare hint onder de vraag: "Maak een inschatting. Denk aan hoeveel werk de kandidaat in dezelfde tijd kan doen, vergeleken met een collega in dezelfde functie." Niet "zonder arbeidsbeperking": de schrijfwijzer vraagt een vergelijking die niemand als afwijkend neerzet, en de vraag zegt al "collega in dezelfde functie". |
| 6    | Knop                | "Kandidaat kiezen": zo heet de volgende stap in de stappenbalk en de paginatitel.                                                                                                                                                                                                                                                   |
| 7    | Regelingenoverzicht | Niets: positief.                                                                                                                                                                                                                                                                                                                    |
| 8    | Lees wat er kan     | Het zijpaneel geeft eerst de korte uitleg en wie de regeling uitvoert. Het artikel van Ondernemersplein staat ingeklapt onder "Meer uitleg van Ondernemersplein"; daarna de link naar Ondernemersplein.                                                                                                                             |
| 9    | Weet ik niet        | "Vraag het de kandidaat. U kunt ook bij UWV controleren of de kandidaat in het doelgroepregister staat (opent in een nieuw tabblad). Tot dan rekenen wij alsof de kandidaat er niet in staat." De rest van het voorstel niet: zie hieronder.                                                                                        |
| 10   | Uitkering           | (i) met: "Niet zeker welke uitkering het is? Kijk op de uitkeringsbrief of vraag het de kandidaat."                                                                                                                                                                                                                                 |

### Niet overgenomen bij 9

- "U ziet de uitkomst alvast met en zonder de regelingen die hiervan afhangen": zo rekent het prototype niet. Bij "Weet ik niet" rekent het alsof de kandidaat niet in het register staat.
- "Die kan een doelgroepverklaring aanvragen bij UWV, of u doet dat met toestemming": de vraag gaat over het doelgroepregister, de doelgroepverklaring is iets anders (loonkostenvoordeel). En `_begrippen.tsx` zegt nu "De werknemer vraagt die zelf aan". Eerst nagaan bij UWV of de jurist wie de verklaring mag aanvragen.
