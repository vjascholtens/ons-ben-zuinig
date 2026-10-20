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
- **Status:** Besloten voor de eerste MVP-baseline · **Issue:** [#2](https://github.com/vjascholtens/ons-ben-zuinig/issues/2)
- **Besluit:** documenteer 21%, 9%, wettelijke 0%-gevallen, vrijstelling, verlegging en KOR als afzonderlijke behandelingen; gebruik de verplichte basisfactuurvelden, de 15e-dag-termijn en consistente rekenkundige afronding per regel.
- **Bronnen:** [Belastingdienst-factuureisen](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/factuureisen/factuureisen), [afronding](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/btw-bedrag_afronden), [tarieven en vrijstellingen](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/tarieven_en_vrijstellingen/tarieven_en_vrijstellingen), [KOR](https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/kor-voorwaarden).
- **Begrenzing:** algemene MVP-basis is brongecontroleerd op 20 oktober 2026; bijzondere situaties vereisen menselijke controle. Geen echte facturen of financieel advies tot de concrete ondernemingssituatie is bevestigd. Bewaarplicht/correcties/export blijven bij #20.

## D-006 — Bankkoppeling en e-facturatie
- **Status:** Later te beoordelen
- **Voorstel:** niet in eerste scope opnemen tenzij actuele eisen of concrete behoefte dit noodzakelijk maken.

## D-007 — Financiële dataconventies
- **Status:** Besloten voor de eerste prototypeslice · **Issue:** [#14](https://github.com/vjascholtens/ons-ben-zuinig/issues/14)
- **Besluit:** bedragen/totaalbedragen zijn `NUMERIC(12,2)`; geld aan TypeScript/API-grenzen is een decimale string met exacte rekenkunde (geen floating point); hoeveelheid/eenheidsprijs gebruiken `NUMERIC(12,4)`; btw-tarief `NUMERIC(5,2)); valuta is per factuur een ISO 4217-code.
- **Btw:** elke regel bewaart behandeling, tarief of NULL, reden waar toepasselijk, grondslag, btw, netto en bruto. Nultarief, vrijstelling, verlegging en KOR zijn aparte codes.
- **Afronding:** vaste MVP-conventie is rekenkundig afronden van btw per regel op centen.
- **Nummering:** `public.finalize_invoice` gebruikt een counter per administratie/reeks/jaar, vergrendelt factuur en counter met `SELECT ... FOR UPDATE`, en kent het nummer alleen bij definitief maken toe. Een unieke index voorkomt dubbele definitieve nummers.
- **Migratie:** `supabase/migrations/20261020221000_financial_core.sql`; tabellen hebben RLS en de counter is niet rechtstreeks schrijfbaar door gebruikers. De live DB-concurrencytest blijft vereist na toepassen op een apart prototype.

## D-008 — Backend en externe diensten (prototyperichting)
- **Status:** Voorlopig besloten voor prototype, geen productie-go · **Backend:** [#7](https://github.com/vjascholtens/ons-ben-zuinig/issues/7) · **OCR/e-mail:** [#8](https://github.com/vjascholtens/ons-ben-zuinig/issues/8)
- **Backendrichting:** Supabase PostgreSQL + Auth + private Storage, projectregio Frankfurt (`eu-central-1`). De applicatie gebruikt SSR-cookies en geverifieerde claims; opslag- en tabeltoegang worden beperkt door RLS. Geen service-role key in de browser.
- **Beperking:** regioselectie is een data-location control, geen zelfstandige GDPR-garantie. Supabase documenteert account-/support-/telemetrieverwerking buiten de projectregio en mogelijke wereldwijde CDN-serving van Storage: https://supabase.com/guides/platform/regions en https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq.
- **OCRrichting:** provider-neutrale adapter en mock in development. Azure AI Document Intelligence is de eerste kandidaat om op privacy/retentie te beoordelen; de huidige documentatie zegt dat analysis inputs/results tijdelijk in dezelfde Azure-regio worden bewaard en 24 uur na afronding worden verwijderd: https://learn.microsoft.com/azure/ai-services/document-intelligence/data-privacy-security. Amazon Textract is alternatief, maar vereist specifieke toetsing van AI-services opt-out en regionale verwerking: https://aws.amazon.com/textract/faqs/.
- **E-mailrichting:** transactionele e-mailadapter met verzendstatus, idempotentie en veilige retries; provider nog niet gekozen.
- **Privacy-gate:** geen echte bonnetjes/facturen naar storage of OCR totdat DPA/subprocessors, dataflows, regio, retentie/verwijdering, support/logging/CDN, RLS en back-up/herstel zijn beoordeeld. Prototype uitsluitend met synthetische documenten.

## D-009 — Back-up- en hersteldoelen
- **Status:** Voorstel ter bevestiging · **Issue:** [#15](https://github.com/vjascholtens/ons-ben-zuinig/issues/15)
- **Startvoorstel:** RPO ≤ 24 uur en RTO ≤ 1 werkdag voor de kleinschalige MVP.
- **Productiegate:** de doelen, frequentie, retentie en hersteltest moeten zijn bevestigd en aangetoond vóór productie.

## Beslisregel
Geen onomkeerbare technische keuze nemen op basis van een onbevestigde productaanname. Bij kleine, omkeerbare keuzes wint meestal de simpelste onderhoudbare optie.
