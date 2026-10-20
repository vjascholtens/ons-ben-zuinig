# Security en privacy

Dit project gaat potentieel gevoelige persoonsgegevens en financiële administratie verwerken. De applicatie is nog niet klaar voor echte financiële data; gebruik voorlopig alleen synthetische testgegevens.

## Ontwerpprincipes
- Private opslag voor bonnetjes en facturen; autoriseer iedere download en iedere wijziging server-side.
- Minimaal noodzakelijke toegang voor gebruikers, services en GitHub Actions.
- Secrets uitsluitend in de secret store van de hostingprovider/GitHub, nooit in de repository, logs of Issues.
- Valideer bestandstype, bestandsgrootte en verwerking van uploads; vertrouw niet alleen op de bestandsnaam of client.
- Leg audit events vast zonder onnodig de volledige inhoud van documenten of persoonsgegevens in logs te kopiëren.
- Bescherm tegen dubbel indienen/verwerken van uploads, e-mails en betalingen.
- Documenteer retentie, verwijdering, back-ups, herstel en incidentafhandeling vóór productie.

## Financiële integriteit
- Bewaar de oorspronkelijke bron, OCR-uitkomst, door de gebruiker bevestigde gegevens en uiteindelijke boeking op een manier waarop verschillen traceerbaar blijven.
- Definitieve boekingen worden via expliciete correcties hersteld, niet stil overschreven.
- Test geldbedragen en btw-regels met referentiewaarden die inhoudelijk zijn gevalideerd.

## Vóór productie
Voer een security- en privacyreview uit, bepaal verwerkers en datalocatie, test autorisatie en herstel back-ups aantoonbaar in een niet-productieomgeving. Doe geen claims over fiscale compliance voordat de toepasselijke eisen deskundig zijn gevalideerd.
