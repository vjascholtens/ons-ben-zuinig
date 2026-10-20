# Ons Ben Zuinig — boekhoudapp

Een mobielvriendelijke boekhoudapp om bonnetjes en facturen vast te leggen, gegevens te controleren, boekingen te beheren en facturen per e-mail te versturen.

## Besluiten genomen

- **MVP-gebruiker:** één hoofdgebruiker en één Nederlandse onderneming/administratie; extra gebruikers en meerdere ondernemingen vallen buiten de eerste UI-scope.
- **App-stack:** mobile-first PWA op Next.js App Router en TypeScript, met Tailwind CSS, pnpm, ESLint, Vitest en Playwright.
- **Online-first:** geen offline financiële mutaties in de MVP. Camera-invoer werkt met een fallback naar gewone bestandsupload.

Lees de [productvisie](docs/PRODUCT_VISION.md), het [architectuurbesluit](docs/ARCHITECTURE_PROPOSAL.md), het [besluitenlog](docs/DECISIONS.md) en de [roadmap](docs/ROADMAP.md).

## Volgende technische keuzes

Database, authenticatie, private documentopslag en hosting worden apart vastgelegd in [Issue #7](https://github.com/vjascholtens/ons-ben-zuinig/issues/7). OCR en e-mailproviders vallen onder [Issue #8](https://github.com/vjascholtens/ons-ben-zuinig/issues/8). De Nederlandse boekhoudkundige en btw-scope wordt gevalideerd in [Issue #2](https://github.com/vjascholtens/ons-ben-zuinig/issues/2).

## Belangrijke uitgangspunten

- Financiële juistheid boven automatisering; OCR-resultaten worden door de gebruiker gecontroleerd.
- Boekingen zijn herleidbaar naar bronbewijs en correcties laten historie achter.
- Privacy, autorisatie, herstelbare back-ups en dataminimalisatie zijn onderdeel van het ontwerp.
- Gebruik geen echte bonnetjes, facturen, klantgegevens of secrets in de openbare repository.

## Ontwikkeling

Applicatiecode wordt nog gescaffold. De echte build/test-CI volgt op de gekozen stack en zal formatter/linter, typecheck, tests en productie-build controleren. De huidige basisworkflow controleert alleen GitHub YAML.
