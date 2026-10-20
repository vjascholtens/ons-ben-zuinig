# Ons Ben Zuinig — boekhoudapp

Een mobielvriendelijke boekhoudapp om bonnetjes en facturen vast te leggen, gegevens te controleren, boekingen te beheren en facturen per e-mail te versturen.

## Besluiten en veiligheidsgrenzen

- **MVP-gebruiker:** één hoofdgebruiker en één Nederlandse onderneming/administratie.
- **App-stack:** Next.js App Router + TypeScript, Tailwind CSS, pnpm, ESLint, Vitest en Playwright.
- **Backendrichting voor prototype:** Supabase PostgreSQL, Auth en private Storage in een expliciet gekozen Frankfurt-project (`eu-central-1`). Dit is nog geen productie-go: verwerkersvoorwaarden, subprocessors, dataflows, retentie, logs/CDN en RLS moeten vóór echte documenten worden goedgekeurd.
- **Online-first:** geen offline financiële mutaties of cache van bonnetjes/facturen in de MVP.
- **Financiële dataconventies:** geen floating-point voor geld; financiële schema's wachten op #14 en de inhoudelijke validatie van #2.
- **Upload:** server-side magic-bytecontrole, limiet 15 MB, private Storage en RLS; de bestandsselectie is geen bewijs dat het bestand veilig of fiscaal correct is.
- **OCR:** nog niet aangesloten. #8 moet worden afgerond en de privacy-gate moet slagen voordat documentinhoud naar een OCR-provider gaat.
- **Back-up/herstel:** afzonderlijke RPO/RTO-taak in #15.

Lees de [productvisie](docs/PRODUCT_VISION.md), het [architectuurbesluit](docs/ARCHITECTURE_PROPOSAL.md), de [financiële dataconventies](docs/FINANCIAL_DATA_CONVENTIONS.md), het [besluitenlog](docs/DECISIONS.md) en de [roadmap](docs/ROADMAP.md).

## Lokaal starten

Vereist Node.js 22 en pnpm 12.

1. Maak een eigen Supabase prototype-project aan en kies expliciet Frankfurt (`eu-central-1`). Controleer eerst of de dataverwerkingsvoorwaarden voor je doel passen. Gebruik tot die tijd alleen synthetische bestanden.
2. Kopieer `.env.example` naar `.env.local` en vul `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in. Commit nooit `.env.local` of andere credentials. Gebruik geen service-role key in de frontend.
3. Voer de migratie `supabase/migrations/20261020205631_receipt_storage.sql` toe op het prototypeproject via de Supabase CLI nadat je het juiste project hebt gelinkt, of review en voer de SQL uit in de Supabase SQL Editor.
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

De pull-requestworkflow voert de controles automatisch uit.

## Eerste documentworkflow

- De server verifieert de Supabase-sessie met `getClaims()`.
- De server controleert bestandsgrootte en het werkelijke bestandstype via binaire signatures. Client-validatie is alleen voor gebruiksgemak.
- Het opslagpad gebruikt UUID's en niet de oorspronkelijke bestandsnaam.
- De `receipts`-bucket is private. De migratie schakelt RLS in, trekt onnodige standaardrechten van `anon` en `authenticated` in, en verleent alleen de tabelrechten die de MVP nodig heeft.
- De metadata worden aan een expliciete administratie gekoppeld. Er worden nog geen bedragen, btw-velden, facturen of boekingen gemodelleerd.
- Bij mislukken van de metadata-insert probeert de server het opgeslagen object op te ruimen.
- Een document staat na upload op `uploaded`; OCR en financiële verwerking volgen pas na aparte provider-/domeinbesluiten.

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
