# Ons Ben Zuinig — boekhoudapp

Een mobielvriendelijke boekhoudapp om bonnetjes en facturen vast te leggen, gegevens te controleren, boekingen te beheren en facturen per e-mail te versturen.

## Besluiten en veiligheidsgrenzen

- **MVP-gebruiker:** één hoofdgebruiker en één Nederlandse onderneming/administratie.
- **App-stack:** Next.js App Router + TypeScript, Tailwind CSS, pnpm, ESLint, Vitest en Playwright.
- **Backendrichting voor prototype:** Supabase PostgreSQL, Auth en private Storage in een expliciet gekozen Frankfurt-project (`eu-central-1`). Dit is nog geen productie-go: verwerkersvoorwaarden, subprocessors, dataflows, retentie, logs/CDN en RLS moeten vóór echte documenten worden goedgekeurd.
- **Online-first:** geen offline financiële mutaties of cache van bonnetjes/facturen in de MVP.
- **Financiële dataconventies:** geen floating-point voor geld; financiële schema's wachten op #14 en de inhoudelijke validatie van #2.
- **Upload:** server-side magic-bytecontrole, limiet 15 MB, private Storage en RLS; de bestandsselectie is geen bewijs dat het bestand veilig of fiscaal correct is.
- **OCR:** voor de demo is alleen fixturegestuurde mock-OCR beschikbaar. Dit herkent de geüploade foto niet en verstuurt geen document naar een externe OCR-provider. Een echte provider blijft geblokkeerd tot #8 en de privacy-/DPA-/regiogate formeel zijn afgerond.
- **Back-up/herstel:** afzonderlijke RPO/RTO-taak in #15.

Lees de [productvisie](docs/PRODUCT_VISION.md), het [architectuurbesluit](docs/ARCHITECTURE_PROPOSAL.md), de [financiële dataconventies](docs/FINANCIAL_DATA_CONVENTIONS.md), het [besluitenlog](docs/DECISIONS.md) en de [roadmap](docs/ROADMAP.md).

## Lokaal starten

Vereist Node.js 22 en pnpm 12.

1. Maak een eigen Supabase prototype-project aan en kies expliciet Frankfurt (`eu-central-1`). Controleer eerst of de dataverwerkingsvoorwaarden voor je doel passen. Gebruik tot die tijd alleen synthetische bestanden.
2. Kopieer `.env.example` naar `.env.local` en vul `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in. Commit nooit `.env.local` of andere credentials. Gebruik geen service-role key in de frontend.
3. Voer beide migraties in tijdsvolgorde toe op het prototypeproject: eerst `supabase/migrations/202610200001_receipt_storage.sql`, daarna `supabase/migrations/20261020222000_receipt_review.sql`. Gebruik de Supabase CLI nadat je het juiste project hebt gelinkt, of review en voer beide SQL-bestanden in die volgorde uit in de Supabase SQL Editor.
4. Maak de enige toegestane login-gebruiker aan via Supabase Auth Dashboard. De app staat geen self-service accountcreatie toe.
5. Voeg `http://localhost:3000/auth/callback` toe aan de toegestane redirect URLs van Supabase Auth.
6. Installeer en start:

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Als Supabase niet is geconfigureerd, toont de app alleen de lokale demo. Als Supabase is geconfigureerd, kunnen alleen bestaande accounts inloggen.

## Kwaliteitscontroles

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

De pull-requestworkflow voert lint, typecheck, unit tests, build en een credentialvrije E2E-smokecheck automatisch uit. Genereer de volledig synthetische PDF/JPEG-bonnen en de bestandsgroottefixture met `pnpm fixtures`; het JSON-manifest in `fixtures/synthetic/receipts.json` is de ene bron voor de fixtures en hun verwachte bedragen. De testfixture van 15 MiB + 1 byte wordt alleen lokaal gegenereerd en niet als grote binary gecommit.

Installeer voor het eerst Playwright Chromium met `pnpm exec playwright install chromium`.

De geauthenticeerde vrijdag-demo-flow gebruikt alleen testaccount A in een apart Supabase-prototype. Zet in `.env.local` de bestaande `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `OBZ_TEST_USER_A_EMAIL` en `OBZ_TEST_USER_A_PASSWORD`; deel of commit deze waarden nooit. Start de flow met `pnpm exec playwright test tests/e2e/receipt-workflow.spec.ts`. De test uploadt uitsluitend een synthetische PDF en maakt records aan in de administratie van dat testaccount. Voer dit niet uit tegen productie of met echte documenten.

## Eerste documentworkflow

- De server verifieert de Supabase-sessie met `getClaims()`.
- De server controleert bestandsgrootte en het werkelijke bestandstype via binaire signatures. Client-validatie is alleen voor gebruiksgemak.
- Het opslagpad gebruikt UUID's en niet de oorspronkelijke bestandsnaam.
- De `receipts`-bucket is private en de migratie geeft RLS policies voor de administratie-eigenaar.
- De metadata worden aan een expliciete administratie gekoppeld. Er worden nog geen bedragen, btw-velden, facturen of boekingen gemodelleerd.
- Bij mislukken van de metadata-insert probeert de server het opgeslagen object op te ruimen.
- Een document staat na upload op `uploaded`. Voor de demo kiest de gebruiker een committed synthetische fixture; de deterministische mock slaat een voorstel op in `receipt_extractions.proposal` zonder het bronbestand te lezen of extern te versturen.
- De gebruiker kan het voorstel corrigeren en bevestigen. Bevestigde waarden worden apart in `receipt_extractions.confirmed_data` opgeslagen; het oorspronkelijke voorstel blijft bewaard.
- Dit is alleen document-/extractiemetadata: geen boeking, grootboekmutatie of definitieve btw-aangifte. De mock-OCR-uitkomst is niet afgeleid van de gekozen foto.

## Privacy-gate vóór echte bonnetjes

De regionale keuze is geen zelfstandige GDPR-garantie. Controleer DPA/verwerkersvoorwaarden, actuele subprocessors, supporttoegang, logs/telemetrie, Storage/CDN, retentie/verwijdering, toegangsregels en back-ups. Test eigenaar- en niet-eigenaarstoegang vóór productie.

## Volgende issues

- [#2 Nederlandse boekhoud- en btw-eisen](https://github.com/vjascholtens/ons-ben-zuinig/issues/2)
- [#7 Backendfundament en privacy-gate](https://github.com/vjascholtens/ons-ben-zuinig/issues/7)
- [#8 OCR- en e-maildiensten](https://github.com/vjascholtens/ons-ben-zuinig/issues/8)
- [#14 Financiële dataconventies](https://github.com/vjascholtens/ons-ben-zuinig/issues/14)
- [#15 Back-up/herstel met RPO/RTO](https://github.com/vjascholtens/ons-ben-zuinig/issues/15)
- [#17 Beveiligde bon-upload](https://github.com/vjascholtens/ons-ben-zuinig/issues/17)

**Gebruik deze prototypeversie niet met echte financiële gegevens totdat de privacy-/security-gate is afgetekend.**
