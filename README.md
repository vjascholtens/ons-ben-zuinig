# Ons Ben Zuinig — boekhoudapp

Een mobielvriendelijke boekhoudapp om bonnetjes en facturen vast te leggen, gegevens te controleren, boekingen te beheren en facturen per e-mail te versturen.

> **Status:** productverkenning / foundation. De repository bevat nog geen applicatiecode. De voorgestelde architectuur is een startpunt en wordt pas definitief na de eerste beslissingen.

## Doel

Een betrouwbare administratie waarin bewijsstukken, facturen, transacties, boekingen en rapportages met elkaar verbonden zijn. Automatische herkenning helpt bij invoer, maar financiële gegevens worden niet stilzwijgend definitief geboekt.

## Begin hier

1. Lees [de productvisie](docs/PRODUCT_VISION.md).
2. Bespreek de open keuzes in [technische beslissingen](docs/DECISIONS.md).
3. Gebruik [de roadmap](docs/ROADMAP.md) en [de backlog](docs/ISSUE_BACKLOG.md) om werk in kleine GitHub Issues op te delen.
4. Volg [de GitHub-werkwijze](docs/GITHUB_WORKFLOW.md) voor Issues, branches, pull requests en Actions.

## Voorgestelde MVP

- Bonnetje of factuur met de telefoon fotograferen/uploaden.
- OCR/AI stelt leverancier, datum, bedragen en btw voor; gebruiker controleert die gegevens.
- Bewijsstuk opslaan en koppelen aan uitgave of boeking.
- Klanten en leveranciers beheren.
- Verkoopfactuur maken, PDF genereren en per e-mail versturen.
- Eenvoudig overzicht van inkomsten, uitgaven, openstaande facturen en btw.
- Boekhoudkundige export en controleerbare wijzigingshistorie.

## Belangrijke uitgangspunten

- Financiële juistheid boven automatisering: onzekere OCR-resultaten vragen om menselijke controle.
- Boekingen krijgen een audit trail; correcties overschrijven geen historische financiële feiten.
- Privacy, toegangscontrole, back-ups en herstel zijn onderdeel van het ontwerp, niet iets voor het einde.
- Nederlandse btw- en bewaarplichten worden vóór productie getoetst aan actuele officiële informatie en met een boekhouder/accountant.

## Ontwikkeling

De definitieve app-stack en bijbehorende build/test-commando's worden in de eerste beslisfase vastgelegd. De huidige GitHub Actions-workflow controleert de workflow-configuratie en whitespace; dit is nadrukkelijk nog geen applicatie-CI.
