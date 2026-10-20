# Besluitenlog

Leg belangrijke keuzes hier vast. Een beslissing krijgt datum, status, context, keuze, alternatieven en gevolgen. Voeg nieuwe besluiten toe in plaats van oude beslissingen stil te herschrijven.

## Open besluiten

### D-001 — Productscope en gebruiker
- **Status:** Open
- **Vraag:** Is de eerste versie voor één ondernemer/onderneming, of moeten meerdere ondernemingen en gebruikers vanaf dag één kunnen inloggen?
- **Waarom belangrijk:** beïnvloedt autorisatie, datamodel en teststrategie.

### D-002 — App-vorm en stack
- **Status:** Open
- **Voorstel:** mobile-first PWA; vergelijk TypeScript/full-stack framework en alternatieven op onderhoud, ervaring, hosting en testbaarheid.
- **Waarom belangrijk:** bepaalt projectstructuur en echte build/test-CI.

### D-003 — Hosting, database en bestandsopslag
- **Status:** Open
- **Eisen:** private opslag, gecontroleerde datalokatie, herstelbare back-ups, toegang op least-privilege basis en passende verwerkersvoorwaarden.

### D-004 — OCR-provider
- **Status:** Open
- **Eisen:** herkenning van Nederlandstalige facturen/bonnen, btw-regels, confidence/onzekerheid, privacyvoorwaarden, kosten en mogelijkheid tot providerwissel.

### D-005 — E-mailproces
- **Status:** Open
- **Vraag:** aparte inbox voor inkoopfacturen, providerwebhooks of volledige mailboxkoppeling? Welke service verzendt uitgaande facturen en rapporteert afleverfouten?

### D-006 — Boekhoudkundige regels en export
- **Status:** Open
- **Actie:** scope en rekenregels met boekhouder/accountant toetsen; gewenste export en btw-situaties vastleggen voordat de boekingskern wordt gebouwd.

### D-007 — Bankkoppeling en e-facturatie
- **Status:** Open
- **Voorstel:** niet automatisch in MVP opnemen; eerst bewijsstukken, facturen en boekingen betrouwbaar maken. Heropenen op basis van echte behoefte/eisen.

## Beslisregel
Geen onomkeerbare technische keuze nemen op basis van een onbevestigde productaanname. Bij een kleine, omkeerbare keuze mag de simpelste onderhoudbare optie winnen.
