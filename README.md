# Ons Ben Zuinig — boekhoudapp

Een mobielvriendelijke boekhoudapp om bonnetjes en facturen vast te leggen, gegevens te controleren, boekingen te beheren en facturen per e-mail te versturen.

## Besluiten genomen

- **MVP-gebruiker:** één hoofdgebruiker en één Nederlandse onderneming/administratie; extra gebruikers en meerdere ondernemingen vallen buiten de eerste UI-scope.
- **App-stack:** mobile-first PWA op Next.js App Router en TypeScript, met Tailwind CSS, pnpm, ESLint, Vitest en Playwright.
- **Online-first:** geen offline financiële mutaties in de MVP. Camera-invoer heeft een fallback naar gewone bestandsupload.
- **Financiële dataconventies:** geen floating-point voor geld; exacte decimale rekenkunde en expliciete precisie/afronding moeten vóór het financiële schema worden goedgekeurd in #14 en fiscaal worden gevalideerd in #2.

## Begin hier

Lees de [productvisie](docs/PRODUCT_VISION.md), het [architectuurbesluit](docs/ARCHITECTURE_PROPOSAL.md), de [financiële dataconventies](docs/FINANCIAL_DATA_CONVENTIONS.md), het [besluitenlog](docs/DECISIONS.md) en de [roadmap](docs/ROADMAP.md).

## Volgende technische keuzes

- [#7 Backendfundament](https://github.com/vjascholtens/ons-ben-zuinig/issues/7): database, authenticatie, private opslag en hosting.
- [#8 OCR- en e-maildiensten](https://github.com/vjascholtens/ons-ben-zuinig/issues/8): documentherkenning en e-mail.
- [#13 App-scaffold](https://github.com/vjascholtens/ons-ben-zuinig/issues/13): pure app-shell/tooling mag parallel met #2 en #14 doorgaan.
- [#15 Back-up/herstel met RPO/RTO](https://github.com/vjascholtens/ons-ben-zuinig/issues/15): operationele releasevoorwaarde.

## Belangrijke uitgangspunten

- Financiële juistheid boven automatisering; OCR-resultaten worden door de gebruiker gecontroleerd.
- Boekingen zijn herleidbaar naar bronbewijs en correcties laten historie achter.
- Privacy, server-side autorisatie, herstelbare back-ups en dataminimalisatie zijn onderdeel van het ontwerp.
- iOS-installatie van een PWA gebeurt doorgaans vanuit Safari via het deelmenu; push en offline mutaties zijn geen MVP-vereisten.
- Gebruik geen echte bonnetjes, facturen, klantgegevens of secrets in de openbare repository.

## Ontwikkeling

Applicatiecode wordt nog gescaffold. De echte build/test-CI volgt op de gekozen stack en zal formatter/linter, typecheck, tests en productie-build controleren. De huidige basisworkflow controleert alleen GitHub YAML.
