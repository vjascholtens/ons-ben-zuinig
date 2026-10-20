# Ons Ben Zuinig — boekhoudapp

Een mobielvriendelijke boekhoudapp om bonnetjes en facturen vast te leggen, gegevens te controleren, boekingen te beheren en facturen per e-mail te versturen.

## Besluiten en guardrails

- **MVP-gebruiker:** één hoofdgebruiker en één Nederlandse onderneming/administratie; extra gebruikers en meerdere ondernemingen vallen buiten de eerste UI-scope.
- **App-stack:** mobile-first PWA op Next.js App Router en TypeScript, met Tailwind CSS, pnpm, ESLint, Vitest en Playwright.
- **Online-first:** geen offline financiële mutaties in de MVP. Camera-invoer heeft een fallback naar gewone bestandsupload.
- **Financiële dataconventies:** geen floating-point voor geld; exacte decimale rekenkunde en expliciete precisie/afronding worden vóór het financiële schema goedgekeurd in #14 en fiscaal gevalideerd in #2.
- **Echte uploads/OCR:** de scaffold toont alleen een lokale bestandsselectie. Echte opslag en OCR wachten op #7/#8 en privacy-/security-goedkeuring.
- **Herstel:** back-up/herstel heeft expliciete RPO/RTO-doelen via #15.

Lees de [productvisie](docs/PRODUCT_VISION.md), het [architectuurbesluit](docs/ARCHITECTURE_PROPOSAL.md), de [financiële dataconventies](docs/FINANCIAL_DATA_CONVENTIONS.md), het [besluitenlog](docs/DECISIONS.md) en de [roadmap](docs/ROADMAP.md).

## Lokaal starten

Vereist Node.js 22 en pnpm 12.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

Beschikbare kwaliteitschecks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Eerste demonstratie

De startpagina bevat een lokale bonselectie om de mobiele UI en client-side feedback te demonstreren. **Er wordt nog geen bestand geüpload of opgeslagen.** De client-side checks zijn alleen gebruiksgemak; een toekomstige server upload-endpoint moet type/inhoud, grootte, autorisatie en opslag server-side opnieuw valideren.

## Volgende technische keuzes

- [#2 Nederlandse boekhoud- en btw-eisen](https://github.com/vjascholtens/ons-ben-zuinig/issues/2)
- [#7 Backendfundament](https://github.com/vjascholtens/ons-ben-zuinig/issues/7)
- [#8 OCR- en e-maildiensten](https://github.com/vjascholtens/ons-ben-zuinig/issues/8)
- [#14 Financiële dataconventies](https://github.com/vjascholtens/ons-ben-zuinig/issues/14)
- [#15 Back-up/herstel met RPO/RTO](https://github.com/vjascholtens/ons-ben-zuinig/issues/15)

## Veiligheidsregel

Gebruik geen echte bonnetjes, facturen, klantgegevens of secrets in deze openbare repository. De scaffold is geen productieboekhouding.
