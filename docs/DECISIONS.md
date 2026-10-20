# Besluitenlog

Leg belangrijke keuzes hier vast. Een beslissing krijgt status, context, keuze, alternatieven en gevolgen. Werk dit document bij zodra een keuze is gemaakt.

## Open besluiten

### D-001 — Productscope en gebruiker
- **Status:** Open · **GitHub:** [#1](https://github.com/vjascholtens/ons-ben-zuinig/issues/1)
- **Vraag:** Is de eerste versie voor één ondernemer/onderneming, of moeten meerdere ondernemingen en gebruikers vanaf dag één kunnen inloggen?
- **Waarom belangrijk:** beïnvloedt autorisatie, datamodel en teststrategie.

### D-002 — Nederlandse boekhoud- en btw-eisen
- **Status:** Open · **GitHub:** [#2](https://github.com/vjascholtens/ons-ben-zuinig/issues/2)
- **Actie:** valideer factuurvelden, btw-situaties, nummering, correcties, bewaarplicht en exports met actuele officiële informatie en een boekhoudkundige deskundige.

### D-003 — Frontend/app-stack
- **Status:** Open · **GitHub:** [#3](https://github.com/vjascholtens/ons-ben-zuinig/issues/3)
- **Scope:** PWA versus native, frontend/full-stack framework, mobiele camera-ervaring, toegankelijkheid, lokale ontwikkelervaring en testbaarheid.
- **Afhankelijkheid:** #1. Houd dit besluit gescheiden van backend- en dienstkeuzes.

### D-004 — Backendfundament: database, authenticatie, opslag en hosting
- **Status:** Open · **GitHub:** [#7](https://github.com/vjascholtens/ons-ben-zuinig/issues/7)
- **Eisen:** private documentopslag, passende datalokatie en verwerkersvoorwaarden, least-privilege toegang, herstelbare back-ups en beheersbare kosten.
- **Afhankelijkheid:** #1; kan parallel aan #3 worden onderzocht.

### D-005 — OCR- en e-maildiensten
- **Status:** Open · **GitHub:** [#8](https://github.com/vjascholtens/ons-ben-zuinig/issues/8)
- **Eisen:** herkenning van Nederlandstalige bonnen/facturen, zichtbare onzekerheid, privacyvoorwaarden, kosten, veilige e-mailverzending, aflever-/foutstatus en voorkomen van dubbele verzending.
- **Afhankelijkheid:** #1; kan parallel aan #3 en #7 worden onderzocht.

### D-006 — Bankkoppeling en e-facturatie
- **Status:** Open
- **Voorstel:** niet automatisch in de MVP opnemen; eerst bewijsstukken, facturen en boekingen betrouwbaar maken. Heropenen op basis van actuele eisen en concrete behoefte.

## Beslisregel
Geen onomkeerbare technische keuze nemen op basis van een onbevestigde productaanname. Bij een kleine, omkeerbare keuze mag de simpelste onderhoudbare optie winnen.
