# Productvisie

## Visie
**Maak de administratie vanaf de telefoon eenvoudig, maar houd iedere financiële uitkomst controleerbaar.** Een gebruiker legt bewijsstukken vast, controleert voorgestelde gegevens en volgt facturen en uitgaven van bronstuk tot betaling, boeking en rapportage.

## MVP-gebruiker en uitgangspunt
De eerste release is gericht op **één hoofdgebruiker die één Nederlandse onderneming/administratie beheert**. We voegen in de MVP geen uitnodigingen voor extra gebruikers of een apart boekhouder-account toe. De boekhouder kan de afgesproken gegevensexport ontvangen.

Het datamodel koppelt records expliciet aan een administratie/onderneming. Dat bereidt uitbreiding voor, zonder meteen een complex multi-tenant platform te bouwen. De feitelijke juridische/administratieve situatie moet vóór definitief datamodel bevestigd worden.

## MVP-doelen
1. Een bonnetje of inkoopfactuur vanaf een telefoon vastleggen en veilig terugvinden.
2. OCR stelt leverancier, datum, factuurnummer, bedragen, btw en valuta voor; de gebruiker controleert en corrigeert vóór verwerking.
3. Een leveranciers- en klantenbestand bijhouden.
4. Uitgaven categoriseren en controleerbaar boeken volgens gevalideerde boekhoudkundige regels.
5. Verkoopfacturen maken, als PDF vastleggen en per e-mail verzenden.
6. Factuurstatussen beheren, betalingen handmatig registreren en open posten volgen.
7. Een maandelijkse totaalmail kunnen versturen met overeengekomen totalen, openstaande posten en documenten die aandacht vragen.
8. Financiële overzichten en export voor de boekhouder leveren.
9. Back-ups, herstel, audit trail, privacy en toegangscontrole vanaf het begin meenemen.

## Eerste verticale slice
We bouwen eerst de kleinste volledige route:
**mobiele foto/upload → veilig documentrecord → gecontroleerde metadata/OCR-voorstellen → document terugvinden**.

De upload- en OCR-implementatie begint pas nadat #7 (private opslag/auth/hosting) en #8 (OCR- en e-maildiensten) een voorlopige, beoordeelde beslissing hebben. Echte financiële documenten blijven buiten het prototype totdat beveiliging en privacyvoorwaarden gecontroleerd zijn. De pure app-scaffold mag parallel doorgaan met #2 en #14.

## Buiten de MVP
- Automatisch indienen van belastingaangiften.
- Automatische betalingen of bankopdrachten.
- Een live bankkoppeling of automatische bankafstemming.
- Volledige mailbox-sync/IMAP; inkomende facturen beginnen met upload, daarna eventueel een beperkte integratie.
- Afzonderlijke inlogaccounts/rollen voor boekhouder of medewerkers.
- Volledig uitgewerkte multi-onderneming-UI.
- Peppol/e-facturatie tenzij actuele eisen of gebruikersbehoefte dit noodzakelijk maken.
- Offline wijzigingen aan financiële administratie. De eerste PWA is online-first om synchronisatieconflicten en onbeveiligde lokale financiële opslag te voorkomen.

## PWA en iOS: verwachtingen
De PWA biedt één codebase voor mobiel en desktop, maar is geen volledige native iOS-app.
- Op iPhone wordt toevoegen aan het beginscherm doorgaans via Safari's deelmenu uitgevoerd; de exacte UI kan per iOS-versie veranderen.
- Browser- en OS-mogelijkheden voor camera-/bestandsselectie verschillen; gewone bestandsupload blijft altijd beschikbaar.
- We vertrouwen in de MVP niet op pushnotificaties als essentieel kanaal.
- Offline financiële mutaties en het cachen van bonnetjes/facturen zijn niet inbegrepen.
- Camera/upload en installatie worden getest op actuele iOS Safari en Android Chrome.

Dit is bewust acceptabel voor de eerste release. Native apps, push en offline gedrag zijn latere productbesluiten.

## Principes
- Financiële juistheid gaat vóór automatisering.
- Geen floating-point rekenen voor geld; zie [financiële dataconventies](FINANCIAL_DATA_CONVENTIONS.md).
- Definitieve boekingen worden niet stil overschreven; correcties zijn traceerbaar.
- Bronbestand, OCR-uitkomst, bevestigde waarden en boeking blijven onderscheidbaar.
- Geen echte bonnetjes, klantgegevens of financiële persoonsgegevens in Issues, testfixtures of logs.
- Nederlandse fiscale en boekhoudkundige regels worden vóór implementatie van de betreffende financiële functionaliteit gevalideerd met actuele officiële informatie en een boekhoudkundige deskundige.
- Back-up en herstel zijn een operationele releasevoorwaarde met expliciete hersteldoelen; zie [Issue #15](https://github.com/vjascholtens/ons-ben-zuinig/issues/15).

## Succescriteria
- De gebruiker kan op een gangbare telefoon een bon uploaden en terugvinden.
- Fouten, retries en onzekere OCR-velden zijn zichtbaar en herstelbaar.
- Elk geboekt bedrag is te herleiden tot bronbewijs en wijzigingshistorie.
- Een factuur kan worden aangemaakt, verstuurd en opgevolgd.
- De maandelijkse samenvatting gebruikt dezelfde gevalideerde brongegevens als de rapportage.
- Een back-up kan aantoonbaar worden hersteld binnen de goedgekeurde RPO/RTO.
- Geld- en btw-berekeningen hebben geautomatiseerde tests met inhoudelijk gevalideerde voorbeelden.
