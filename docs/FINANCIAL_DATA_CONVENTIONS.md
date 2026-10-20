# Financiële dataconventies (voorstel vóór het datamodel)

**Status:** voorstel voor formele goedkeuring in [Issue #14](https://github.com/vjascholtens/ons-ben-zuinig/issues/14). Geen definitief fiscaal advies; de toepasselijke Nederlandse regels worden daarnaast gevalideerd in [Issue #2](https://github.com/vjascholtens/ons-ben-zuinig/issues/2).

## 1. Geldrepresentatie

- Gebruik **geen JavaScript `number`/float** en geen SQL `REAL` of `DOUBLE PRECISION` voor financiële waarden.
- Gebruik in TypeScript exacte decimale rekenkunde (een kleine, geteste Decimal-implementatie) en serialize financiële waarden tussen API en UI als decimale strings, niet als JSON floating-point nummers.
- Gebruik in PostgreSQL `NUMERIC/DECIMAL` met expliciet gekozen precisie/schaal voor opgeslagen bedragen. Kies kolomprecisie bij het ontwerpen van het schema; gebruik niet het locale-afhankelijke SQL-type `money`.
- Houd hoeveelheden, eenheidsprijzen, kortingen, btw-percentages en berekende geldbedragen als verschillende concepten met hun eigen expliciete precisie.
- Bewaar geldbedragen niet als geformatteerde tekst. Opmaak voor weergave (bijv. € 12,34) gebeurt pas in de presentatielaag.
- Bewaar een ISO 4217-valutacode bij elk document/factuur en elke financiële transactie. De eerste administratie verwacht primair EUR; als buitenlandse valuta voorkomen, worden valuta en eventuele omrekening expliciet vastgelegd.

PostgreSQL documenteert `numeric` als exact en waarschuwt dat floating-pointtypen benaderingen opslaan. Zie https://www.postgresql.org/docs/current/datatype-numeric.html.

## 2. Btw en afronding

Per factuurregel moet het model ruimte bieden voor:
- btw-code/behandeling, niet alleen een getal;
- toegepast btw-percentage of een expliciete reden waarom dat niet van toepassing is;
- belastbare grondslag;
- berekend btw-bedrag;
- netto- en brutobedrag;
- eventuele korting en hoeveelheid/eenheidsprijs.

Een nultarief, vrijstelling en verleggingsregeling mogen niet stilzwijgend als dezelfde behandeling worden gemodelleerd. De daadwerkelijk toegestane codes en de Nederlandse afrondingsregels worden vastgelegd na validatie in #2.

**Afrondingsconventie:** reken intern exact en rond alleen af op expliciet vastgelegde domeingrenzen. Bewaar de berekeningsbasis en de afgeronde bedragen zodat totalen reproduceerbaar zijn. De afronding per regel versus per factuurtotaal is een besluit dat op basis van de toepasselijke regels in #2 moet worden bevestigd vóór implementatie van de boekingslogica.

## 3. Factuurnummering

- Een conceptfactuur is duidelijk een concept; deze verbruikt niet ongemerkt een definitief factuurnummer.
- Ken het definitieve nummer atomair toe bij het definitief maken/versturen volgens de gevalideerde nummeringsregels.
- Garandeer uniciteit op de juiste administratie/onderneming en nummerreeks.
- Een definitief uitgegeven nummer wordt niet opnieuw gebruikt; annulering of correctie verloopt volgens expliciete, traceerbare regels.
- Parallelle aanvragen mogen geen dubbele nummers opleveren.

De precieze reeks-/jaarmodel- en correctieregels worden in #2 inhoudelijk gevalideerd.

## 4. Bron, status en audit trail

Houd deze fasen uit elkaar:
1. origineel bronbestand;
2. OCR- of extractieresultaat;
3. door de gebruiker gecontroleerde/bevestigde waarden;
4. definitieve factuur, betaling of boeking.

Financiële records moeten minimaal voldoende metadata bevatten voor:
- administratie/onderneming;
- bronstuk en externe referentie waar aanwezig;
- status en relevante statusovergangen;
- aanmaak-/wijzigingstijdstippen;
- gebruikers-/actorreferentie waar van toepassing;
- bevestigings- en definitiefmakingsmoment;
- herleidbare wijzigings-/correctiehistorie.

Gebruik een append-only audit trail voor betekenisvolle financiële mutaties. Definitieve boekingen worden niet stil overschreven; correcties leggen oude en nieuwe toestand of de bijbehorende correctieboeking traceerbaar vast.

## 5. Testvereisten

Voordat financiële functionaliteit wordt gebouwd, moeten tests gevalideerde voorbeelden dekken voor:
- decimale precisie en afrondingsgrenzen;
- regel- en factuurtotalen;
- meerdere btw-behandelingen;
- korting, hoeveelheden en eenheidsprijzen met meer precisie dan het eindbedrag;
- factuurnummering onder gelijktijdige aanvragen;
- correcties en audit trail;
- herberekening/reproduceerbaarheid van bestaande boekingen.

De voorbeeldverwachtingen worden inhoudelijk gevalideerd; tests mogen niet slechts de implementatie bevestigen.

## 6. Volgorde

- De pure app-scaffold in #13 mag parallel lopen.
- Geen financieel database-schema, definitieve factuurlogica of boekings-UI vóór goedkeuring van deze conventies in #14 en de inhoudelijke validatie die voor de betreffende functionaliteit nodig is uit #2.
