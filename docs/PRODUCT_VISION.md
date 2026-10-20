# Productvisie

## Visie
**Maak de administratie vanaf de telefoon eenvoudig, maar houd iedere financiële uitkomst controleerbaar.** Een gebruiker legt bewijsstukken vast, controleert voorgestelde gegevens en volgt facturen en uitgaven van bronstuk tot betaling, boeking en rapportage.

## MVP-gebruiker en uitgangspunt
De eerste release is gericht op **één hoofdgebruiker die één Nederlandse onderneming/administratie beheert**. We voegen in de MVP geen uitnodigingen voor extra gebruikers of apart boekhouder-account toe. De boekhouder kan de afgesproken gegevensexport ontvangen.

Dit is een werkbare startaanname. Als de onderneming meerdere juridische entiteiten of meerdere dagelijks actieve gebruikers heeft, moeten we dat vóór implementatie van het financiële datamodel herzien.

Het datamodel moet records vanaf het begin expliciet aan een administratie/onderneming koppelen. Daarmee kunnen we later meerdere ondernemingen of rollen toevoegen zonder te vertrouwen op impliciete globale gegevens. Dat is geen vrijbrief om multi-tenant access-control nu al volledig te bouwen: autorisatie moet bij iedere query en mutatie server-side worden afgedwongen.

## MVP-doelen
1. Een bonnetje of inkoopfactuur vanaf een telefoon vastleggen en veilig terugvinden.
2. OCR stelt leverancier, datum, factuurnummer, bedragen, btw en valuta voor; de gebruiker controleert en corrigeert vóór verwerking.
3. Een leveranciers- en klantenbestand bijhouden.
4. Uitgaven categoriseren en controleerbaar boeken volgens de gevalideerde boekhoudkundige scope.
5. Verkoopfacturen maken, als PDF vastleggen en per e-mail verzenden.
6. Factuurstatussen beheren, betalingen handmatig registreren en open posten volgen.
7. Een maandelijkse totaalmail kunnen versturen met overeengekomen totalen, openstaande posten en documenten die aandacht vragen.
8. Financiële overzichten en export voor de boekhouder leveren.
9. Back-ups, herstel, audit trail, privacy en toegangscontrole vanaf het begin meenemen.

## Eerste verticale slice
We bouwen en demonstreren eerst de kleinste volledige route:
**mobiele foto/upload → veilig documentrecord → gecontroleerde metadata/OCR-voorstellen → document terugvinden**.

Pas daarna breiden we uit naar definitieve uitgaven en boekingen. OCR-resultaten worden niet automatisch definitief geboekt.

## Buiten de MVP
- Automatisch indienen van belastingaangiften.
- Automatische betalingen of bankopdrachten.
- Een live bankkoppeling of automatische bankafstemming (later evalueren).
- Volledige mailbox-sync/IMAP; inkomende facturen starten met upload of een beperkte integratie na besluit.
- Afzonderlijke inlogaccounts/rollen voor boekhouder of medewerkers.
- Volledig uitgewerkte multi-onderneming-UI.
- Peppol/e-facturatie tenzij actuele eisen of gebruikersbehoefte dit noodzakelijk maken.
- Offline wijzigingen aan financiële administratie. De eerste PWA is online-first om synchronisatieconflicten en onbeveiligde lokale financiële opslag te voorkomen.

## Principes
- Financiële juistheid gaat vóór automatisering.
- Gebruik decimal- of integer-centenlogica, nooit floating-point voor geldberekeningen.
- Definitieve boekingen worden niet stil overschreven; correcties zijn traceerbaar.
- Bronbestand, OCR-uitkomst, door de gebruiker bevestigde waarden en boeking blijven onderscheidbaar.
- Geen echte bonnetjes, klantgegevens of andere financiële persoonsgegevens in Issues, testfixtures of logs.
- Nederlandse fiscale en boekhoudkundige regels worden gevalideerd met actuele officiële informatie en een boekhoudkundige deskundige voordat ze als ondersteund worden gepresenteerd.

## Succescriteria
- De gebruiker kan op een gangbare telefoon een bon uploaden en terugvinden.
- Fouten, retries en onzekere OCR-velden zijn zichtbaar en herstelbaar.
- Elk geboekt bedrag is te herleiden tot bronbewijs en wijzigingshistorie.
- Een factuur kan worden aangemaakt, verstuurd en opgevolgd.
- De maandelijkse samenvatting gebruikt dezelfde gevalideerde brongegevens als de rapportage.
- Een back-up kan aantoonbaar worden hersteld.
- Geld- en btw-berekeningen hebben geautomatiseerde tests met inhoudelijk gevalideerde voorbeelden.
