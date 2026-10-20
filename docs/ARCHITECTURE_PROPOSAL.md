# Architectuurvoorstel — nog te besluiten

Dit document is een voorstel voor bespreking, geen definitieve technische keuze.

## Aanbevolen startvorm
Een **mobile-first Progressive Web App (PWA)** is een goede eerste kandidaat: de gebruiker kan de webapp op de telefoon openen/installeren en de camera gebruiken zonder meteen twee native apps te onderhouden.

## Kandidaat-stack
- **UI/API:** TypeScript met een volwassen full-stack webframework (bijvoorbeeld Next.js). Alternatieven vergelijken op ontwikkelervaring, onderhoud en hosting.
- **Database:** PostgreSQL voor relationele financiële gegevens en transacties.
- **Bestandsopslag:** private object storage in een gekozen EU-regio; geen bonnetjes publiek via een URL beschikbaar maken.
- **Authenticatie:** beheerde auth-oplossing of bewezen bibliotheek; geen eigen cryptografie of wachtwoordprotocol ontwerpen.
- **OCR:** provider-abstractie zodat leverancier later kan wisselen. Eerst extractie voorstellen, nooit boekingen blind definitief maken.
- **E-mail:** aparte service voor uitgaande e-mail met afleverstatussen; voor inkomende facturen liever eerst een dedicated inbox/provider-webhook dan een complete mailboxclient.
- **Achtergrondtaken:** queue/worker voor OCR, PDF-generatie, e-mail en retries.
- **Hosting:** EU-regio waar mogelijk, met verwerkersvoorwaarden, back-ups en herstelprocedure gecontroleerd.

## Financiële domeinregels
- Gebruik integer centen of een geschikte decimal-implementatie; gebruik geen floating-point voor geldberekeningen.
- Leg valuta, btw-tarief, btw-bedrag, factuurdatum, boekingsdatum en bron vast.
- Voorkom dubbele verwerking met idempotency keys en/of documentfingerprints.
- Definitieve journaalposten worden niet stil overschreven. Fouten worden via een correctieboeking en audit trail hersteld.
- Factuurnummering moet voorspelbaar, uniek en controleerbaar zijn; regels worden vóór implementatie inhoudelijk gevalideerd.
- Houd OCR-resultaat, gebruikerscorrecties en definitieve boeking als onderscheiden stappen bij.

## Nog te beantwoorden ontwerpvragen
1. Is dit alleen voor één onderneming/eigenaar of moeten meerdere ondernemingen/gebruikers ondersteund worden?
2. Is een PWA voldoende, of is offline werken/native camera-functionaliteit essentieel?
3. Welke rechtsvorm en Nederlandse boekhoud-/btw-situaties vallen binnen de eerste scope?
4. Hoe komen inkomende facturen binnen: upload, doorgestuurde e-mail, mailboxkoppeling of alle drie?
5. Welke e-mailprovider wordt gebruikt voor uitgaande facturen en hoe willen we verzendstatus bewijzen?
6. Moet bankimport in de MVP of is handmatig afletteren voorlopig voldoende?
7. Welke hosting- en OCR-diensten zijn acceptabel qua gegevenslocatie, privacyvoorwaarden en kosten?
8. Welke export verwacht de boekhouder?

## Architectuurvolgorde
Bouw eerst een modulaire applicatie met duidelijke grenzen tussen documenten, facturen, boekingen, e-mail en rapportages. Start niet met microservices. Splits processen alleen uit als schaal, betrouwbaarheid of operationele noodzaak dat later rechtvaardigt.
