# Besluitenlog

Belangrijke keuzes worden vastgelegd met status, context, alternatieven en gevolgen. Werk dit document bij wanneer een keuze verandert.

## D-001 — MVP-scope en gebruikersmodel
- **Status:** Besloten voor de MVP · **Issue:** [#1](https://github.com/vjascholtens/ons-ben-zuinig/issues/1)
- **Besluit:** eerst één hoofdgebruiker en één Nederlandse onderneming/administratie; geen aparte boekhouder-login of teamuitnodigingen in de MVP.
- **Waarom:** de eerste behoefte is een betrouwbare eigen administratie; extra gebruikers/ondernemingen verhogen autorisatie- en testcomplexiteit.
- **Architectuurvoorwaarde:** bind records expliciet aan een administratie/onderneming zodat uitbreiding later mogelijk blijft. Controleer of de werkelijke juridische/administratieve situatie bij deze aanname past voordat we het datamodel definitief maken.
- **MVP omvat:** bonnetjes/inkomende facturen, gecontroleerde OCR, leveranciers/klanten, categoriseren/boeken, verkoopfacturen, factuurstatussen, e-mailverzending, handmatige betalingregistratie, maandelijkse totaalmail, basisoverzichten/export, back-ups en audit trail.
- **MVP sluit uit:** automatische belastingaangifte/betalingen, live bankkoppeling, volledige mailbox-sync, aparte medewerker/boekhouder-accounts, uitgewerkte multi-onderneming-UI en offline boekingen. Peppol wordt na onderzoek besloten.
- **Nog inhoudelijk te valideren:** Nederlandse btw- en boekhoudregels blijven afhankelijk van #2.

## D-002 — Frontend/app-stack
- **Status:** Besloten startstack · **Issue:** [#3](https://github.com/vjascholtens/ons-ben-zuinig/issues/3)
- **Besluit:** mobile-first PWA met Next.js App Router en TypeScript, Tailwind CSS, pnpm, ESLint, Vitest en Playwright.
- **Waarom:** één codebase voor mobiel/desktop; officiële frameworkondersteuning voor App Router, TypeScript en PWA-manifesten; gangbare testtooling voor domeinfuncties en browserstromen.
- **Beperkingen:** geen offline financiële mutaties in de MVP. Camera-capture is progressive enhancement met normale bestandsupload als fallback; test iOS Safari en Android Chrome.
- **Gevolgen:** scaffold/package scripts en CI worden hierop gebaseerd; versies worden bij scaffolden vastgelegd in lockfile.
- **Referenties:** zie [Architectuurbesluit](ARCHITECTURE_PROPOSAL.md#officiële-technische-referenties).

## D-003 — Backendfundament: database, authenticatie, opslag en hosting
- **Status:** Open · **Issue:** [#7](https://github.com/vjascholtens/ons-ben-zuinig/issues/7)
- **Eisen:** private documentopslag, passende datalokatie/verwerkersvoorwaarden, server-side autorisatie, back-ups en herstel, beheerbare kosten.

## D-004 — OCR- en e-maildiensten
- **Status:** Open · **Issue:** [#8](https://github.com/vjascholtens/ons-ben-zuinig/issues/8)
- **Eisen:** herkenning van Nederlandstalige bonnen/facturen, zichtbare onzekerheid, privacyvoorwaarden, kosten, veilige e-mailverzending en fout-/afleverstatus.

## D-005 — Nederlandse boekhoud- en btw-eisen
- **Status:** Open · **Issue:** [#2](https://github.com/vjascholtens/ons-ben-zuinig/issues/2)
- **Actie:** valideer factuurvelden, btw-situaties, nummering, correcties, bewaarplicht en exports met actuele officiële informatie en een boekhoudkundige deskundige.

## D-006 — Bankkoppeling en e-facturatie
- **Status:** Later te beoordelen
- **Voorstel:** niet in eerste scope opnemen tenzij actuele eisen of concrete behoefte dit noodzakelijk maken.

## D-007 — Financiële dataconventies
- **Status:** Voorstel ter formele goedkeuring · **Issue:** [#14](https://github.com/vjascholtens/ons-ben-zuinig/issues/14)
- **Richting:** geen floating-point voor geld; exact decimaal rekenen in TypeScript en PostgreSQL `NUMERIC/DECIMAL` met expliciete precisie.
- **Vereiste modelvelden:** valuta, btw-code/behandeling, btw-rate, grondslag, btw-bedrag, netto/bruto, factuurstatus, definitiefmakingsmoment, bronstuk, bevestigde OCR-waarden en audit-trail.
- **Nog te bevestigen:** kolomprecisie, afronding per regel versus totaal, Nederlandse btw-codes, factuurnummering en correctieregels. Financiële schema's blijven geblokkeerd op #14 en de inhoudelijke validatie van #2.

## D-008 — Backend en externe diensten (voorlopige hypotheses)
- **Status:** Voorlopig, geen productie-go · **Backend:** [#7](https://github.com/vjascholtens/ons-ben-zuinig/issues/7) · **OCR/e-mail:** [#8](https://github.com/vjascholtens/ons-ben-zuinig/issues/8)
- **Backendrichting:** PostgreSQL, private S3-compatibele objectopslag in een goedgekeurde EU-regio, beheerde authenticatie met server-side autorisatie en beheerde hosting met back-up/herstel.
- **OCRrichting:** provider-neutrale adapter; Amazon Textract AnalyzeExpense wordt als kandidaat vergeleken, niet als reeds goedgekeurde productieprovider.
- **Privacy-gate:** geen echte documenten naar OCR of object storage totdat regio, retentie, verwerkersvoorwaarden, toegangsbeveiliging en eventuele AI-opt-out zijn gecontroleerd. AWS beschrijft voorwaarden rond het gebruik van inputs voor serviceverbetering en mogelijke opslag buiten de regio tenzij opt-out is ingesteld: https://aws.amazon.com/textract/faqs/.
- **E-mailrichting:** transactionele e-mailadapter met verzendstatus en veilige retries; provider nog niet gekozen. Gebruik development-sandbox.

## D-009 — Back-up- en hersteldoelen
- **Status:** Voorstel ter bevestiging · **Issue:** [#15](https://github.com/vjascholtens/ons-ben-zuinig/issues/15)
- **Startvoorstel:** RPO ≤ 24 uur en RTO ≤ 1 werkdag voor de kleinschalige MVP.
- **Productiegate:** de doelen, frequentie, retentie en hersteltest moeten zijn bevestigd en aangetoond vóór productie.

## Beslisregel
Geen onomkeerbare technische keuze nemen op basis van een onbevestigde productaanname. Bij kleine, omkeerbare keuzes wint meestal de simpelste onderhoudbare optie.
