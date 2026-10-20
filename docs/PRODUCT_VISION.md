# Productvisie

## Probleem
Bonnetjes zitten verspreid over papier, foto's en e-mail. Facturen, betalingen en btw-administratie moeten handmatig met elkaar worden verbonden. Dat kost tijd en vergroot de kans op fouten en ontbrekende bewijsstukken.

## Visie
**Maak de administratie vanaf de telefoon eenvoudig, maar houd de financiële uitkomst controleerbaar.** Een gebruiker legt een bewijsstuk vast, controleert voorgestelde gegevens en volgt daarna de factuur of uitgave tot en met betaling, boeking en rapportage.

## Primaire gebruiker
Voor de eerste versie gaan we uit van één zelfstandige ondernemer/kleine onderneming die de eigen administratie voert, eventueel met een boekhouder die exports controleert. Meerdere ondernemingen, rollen en gebruikers moeten bewust worden besloten voordat het datamodel vastligt.

## Kernprocessen
1. **Vastleggen:** foto maken of PDF uploaden; datum, bestand en herkomst vastleggen.
2. **Herkennen:** leverancier, factuurnummer, factuurdatum, betaaltermijn, bedragen, btw-tarieven en valuta voorstellen.
3. **Controleren:** gebruiker controleert en corrigeert de herkenning; onzekere velden worden gemarkeerd.
4. **Verwerken:** bewijsstuk aan een klant/leverancier, factuur en boeking koppelen; dubbele documenten signaleren.
5. **Factureren:** conceptfactuur opstellen, factuurnummer toekennen volgens vastgelegde regels, PDF maken en e-mail verzenden.
6. **Opvolgen:** openstaand/betaald/achterstallig tonen en herinneringen voorbereiden of versturen.
7. **Overzicht en export:** inkomsten, uitgaven, open posten, btw-overzicht en gegevens voor de boekhouder leveren.

## MVP: wel
- Mobielvriendelijke webapp/PWA voor foto en upload.
- Inkomende bonnetjes en facturen met menselijke controle van OCR.
- Klanten, leveranciers en verkoopfacturen.
- E-mail voor het versturen van verkoopfacturen en ontvangststatussen.
- Basisboekingen, open posten, eenvoudige rapportages en boekhoudexport.
- Audit trail, rollen/toegangscontrole passend bij het gekozen gebruikersmodel, back-ups en privacy-basics.

## Niet automatisch in de eerste MVP
- Volledige vervanging van ieder professioneel boekhoudpakket.
- Automatisch indienen van belastingaangiften.
- Automatische betalingen of bankopdrachten.
- Alle bankkoppelingen, alle e-mailproviders of volledige IMAP-sync.
- Volledige Peppol/e-facturatie-integratie tenzij dit na scope- en eisenonderzoek als MVP-vereiste blijkt.
- Onbeheerde automatische boekingen op basis van OCR/AI zonder bevestiging.

## Succescriteria
- Een gebruiker kan een bon op een telefoon in enkele stappen vastleggen.
- Elk geboekt bedrag is te herleiden tot een bewijsstuk en een wijzigings-/boekingshistorie.
- De gebruiker ziet herkenningsfouten en kan ze herstellen vóór het boeken.
- Een verkoopfactuur kan worden aangemaakt, verstuurd en gevolgd.
- Een back-up kan aantoonbaar worden teruggezet.
- Berekeningen en btw-behandeling hebben geautomatiseerde tests en zijn inhoudelijk gevalideerd.
