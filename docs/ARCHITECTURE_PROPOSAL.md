# Architectuurbesluit — eerste app-stack

**Status:** gekozen startstack voor de MVP; backendproviders blijven onderwerp van #7 en #8.

## App-vorm
Een **mobile-first Progressive Web App (PWA)**, als responsieve webapp die op desktop en mobiel werkt en later aan het startscherm kan worden toegevoegd. We maken geen afzonderlijke iOS- en Android-app in de eerste versie.

PWA betekent niet dat we direct offline boekhouden bouwen. De MVP is online-first. Service-worker caching van financiële documenten of gebruikersgegevens wordt niet toegevoegd zonder expliciet beveiligings- en synchronisatieontwerp.

## Gekozen app-stack
- **Framework:** Next.js App Router.
- **Taal:** TypeScript met strict type checking.
- **UI/styling:** Tailwind CSS; houd componenten toegankelijk en vermijd een omvangrijk design-systeem voordat we dat nodig hebben.
- **Package manager:** pnpm met lockfile gecommit.
- **Linter:** de actuele aanbevolen ESLint-configuratie van Next.js.
- **Unit-/componenttests:** Vitest; gebruik zuivere domeinfuncties voor geldberekeningen waar dat kan.
- **End-to-endtests:** Playwright voor belangrijke gebruikersstromen en browserchecks.
- **Build/CI:** minimaal install --frozen-lockfile, lint, typecheck, unit tests en production build op elke pull request; e2e tests toevoegen zodra de eerste UI en testomgeving bestaan.

Bij het scaffolden gebruiken we de dan ondersteunde stabiele versies en leggen we exacte versies vast in package manifests en lockfile. We pinnen niet langdurig naar een versie alleen omdat die vandaag 'latest' heet.

## Mobiele camera en upload
Gebruik eerst een toegankelijke uploadflow waarmee de gebruiker een bestaande foto of PDF kan kiezen. Bied waar ondersteund de camera-optie aan, maar vertrouw niet op één HTML `capture`-gedrag: browserondersteuning en het gekozen camera-gedrag verschillen. Test minimaal iOS Safari en Android Chrome en zorg altijd voor een gewone bestandsselectie als fallback.

## Codeorganisatie
Start als een **modulaire monoliet**, niet als microservices. Scheid UI/routes van domeinlogica en externe adapters, bijvoorbeeld:
- `features/receipts`
- `features/invoicing`
- `features/accounting`
- `features/email`
- `features/reports`
- `lib/validation`
- `lib/money`
- `lib/auth` (integratie met de later gekozen provider)

Domeinlogica voor bedragen, btw, factuurnummering en boekingen hoort niet verstopt te zitten in UI-componenten. Externe OCR- en e-maildiensten worden via kleine adapters aangeroepen, zodat leveranciers later vervangen kunnen worden.

## Beveiligingsgrenzen
- Vertrouw geen client-side checks als autorisatie; verifieer toegang aan de serverkant voor elke gegevensactie.
- Valideer invoer en bestanden server-side; laat secrets nooit naar de browserlekken.
- Vermijd gevoelige documenten in browsercache, analytics of logs.
- Beperk de GitHub Actions-permissies en houd echte gegevens uit fixtures.
- De gekozen database, auth, object storage en hostingregio worden separaat besloten in #7; OCR en e-mailproviders in #8.

## Waarom deze keuze
Next.js biedt een officiële App Router en actuele documentatie voor TypeScript, PWA-manifesten en installatie van een webapp. De officiële tooling biedt ook een gestandaardiseerde start voor linting en build. Vitest is geschikt voor veel unit-/componenttests; Playwright past bij end-to-end browserstromen. Zie de links hieronder.

## Officiële technische referenties
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js installatie en aanbevolen defaults](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js PWA-gids](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Next.js met Vitest](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js met Playwright](https://nextjs.org/docs/app/guides/testing/playwright)
- [MDN: camera-capture attribuut en browserbeperkingen](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)

## Nog niet besloten
- Database, auth, private documentopslag, hosting en datalokatie: #7.
- OCR-provider, uitgaande e-mail en ontvangst van inkomende facturen: #8.
- Nederlandse boekhoud- en btw-scope: #2.


## Financiële dataconventies vóór het model
Voor het scaffolden mag de app-shell bestaan zonder financieel schema. Gebruik voor financiële waarden nooit JS floating point of SQL `REAL/DOUBLE PRECISION`; kies exact decimaal rekenen en PostgreSQL `NUMERIC/DECIMAL` met expliciete precisie. Btw-behandeling/percentages, grondslag, btw-bedrag, valuta, afrondingsgrenzen, factuurnummering en audit-trail-velden zijn beschreven in [FINANCIAL_DATA_CONVENTIONS.md](FINANCIAL_DATA_CONVENTIONS.md) en worden goedgekeurd via [Issue #14](https://github.com/vjascholtens/ons-ben-zuinig/issues/14), met fiscale validatie uit [Issue #2](https://github.com/vjascholtens/ons-ben-zuinig/issues/2). Geen financieel schema of boekingslogica vóór die voorwaarden zijn afgerond.

## Voorlopige backendhypothese (nog geen productie-go)
De gewenste richting voor bespreking in #7 is PostgreSQL, private S3-compatibele objectopslag in een goedgekeurde EU-regio, beheerde authenticatie met server-side autorisatie, en een beheerde hostingomgeving met back-ups/herstel. De definitieve provider en voorwaarden moeten worden beoordeeld voordat echte documenten mogen worden opgeslagen.

Voor #8 houden we OCR provider-neutraal. Amazon Textract AnalyzeExpense mag als kandidaat worden onderzocht, maar niet als standaard productieprovider worden aangenomen voordat de actuele regio-, contract-, retentie- en AI-opt-out-instellingen zijn gecontroleerd. Ontwikkeling gebruikt synthetische documenten en een mock-adapter totdat die beslissing is gemaakt. De AWS FAQ vermeldt voorwaarden rond gebruik van inputs voor serviceverbetering en mogelijke opslag buiten de gekozen regio tenzij opt-out is ingesteld: https://aws.amazon.com/textract/faqs/.
