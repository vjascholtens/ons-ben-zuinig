# Agile werkwijze met GitHub

## Werkritme
- Werk met korte iteraties van één week als praktische start; pas dit aan op basis van de hoeveelheid werk.
- Plan alleen werk dat in kleine Issues kan worden afgerond en gedemonstreerd.
- Sluit iedere iteratie af met een korte demo en bespreking: wat werkte, wat blokkeerde en wat wordt aangepast?
- Houd de backlog geprioriteerd; start niet aan een nieuwe grote feature zolang essentiële CI/security- of dataintegriteitsproblemen openstaan.

## Projectboard
Maak één GitHub Project met deze kolommen/statussen:
`Backlog → Ready → In progress → In review → Done`

Aanbevolen velden: Priority (`P0`–`P2`), Area, Size (`XS/S/M/L`) en Release/Milestone. Gebruik `L` als signaal om een Issue eerst kleiner te knippen.

## Labels
De labelset staat als bronbestand in `.github/labels.json`. De workflow `Sync labels` maakt labels aan of werkt ze bij en labelt de eerste Issues. De workflow heeft `issues: write` alleen op deze gerichte label-sync workflow en draait wanneer het labelmanifest of de workflow verandert; je kunt hem ook handmatig starten.

- Prioriteit: `P0`, `P1`, `P2`
- Type: `decision`, `chore`, `feature`, `bug`, `security`, `docs`
- Overkoepelend: `epic`, `epic:accounting`, `epic:invoicing`, `epic:email`, `epic:ops`, `epic:receipts`, `epic:platform`
- Status: `blocked`

## Afhankelijkheden
Zet afhankelijkheden expliciet in de Issue-body met GitHub-verwijzingen, bijvoorbeeld `Depends on #1, #3` of `Blokkeert op #1 en #3`. Houd Issues die parallel onderzocht kunnen worden uit elkaar. Gebruik de afhankelijkheden om de volgorde op het Project-board te bepalen.

## Issue → branch → PR
1. Elke wijziging start met een Issue met context, acceptatiecriteria en eventuele risico's.
2. Branchnamen: `feat/<issue>-korte-naam`, `fix/<issue>-korte-naam` of `chore/<issue>-korte-naam`.
3. Houd branches klein en laat ze niet weken openstaan.
4. PR beschrijft wat verandert, hoe het is getest en eventuele migratie-/privacy-impact.
5. Koppel de PR aan het Issue met `Closes #<nummer>`.
6. Merge pas als de vereiste checks groen zijn en de wijziging is bekeken. Voor geldberekeningen, autorisatie en datamigraties is extra review verplicht.

## GitHub Actions
- **Nu:** de YAML-syntaxis van GitHub-configuratie controleren. Deze check zegt niets over de correctheid van applicatiecode.
- **Label-sync:** `Sync labels` beheert repositorylabels en labelt de startbacklog; controleer de Action-run.
- **Na stackkeuze:** build, formatter/linter, typecheck, unit tests en integratietests verplicht maken.
- **Vóór release:** end-to-end tests van de bonnetjes- en factuurflow, dependency/security checks, migratiecontrole en hersteltest.
- Workflows krijgen minimale `permissions`; secrets staan alleen in GitHub Secrets/Environments en nooit in code of logs.
- Gebruik bij productiegevoelige workflows pinning naar een gecontroleerde action-versie/SHA, dependencyupdates en review van workflowwijzigingen.

## Definition of Ready
Een Issue heeft een duidelijk gebruikersdoel, meetbare acceptatiecriteria, scopegrens, prioriteit en de nodige afhankelijkheden.

## Definition of Done
- Acceptatiecriteria zijn getest.
- Relevante unit-/integratietests zijn toegevoegd of bijgewerkt.
- Logging toont geen wachtwoorden, tokens, volledige factuurinhoud of andere gevoelige data.
- Documentatie/schema/migraties zijn bijgewerkt.
- CI slaagt; PR is gekoppeld aan het Issue.
- Voor financiële regels is de inhoudelijke aanname expliciet vastgelegd en zo nodig door een boekhoudkundige deskundige gevalideerd.
