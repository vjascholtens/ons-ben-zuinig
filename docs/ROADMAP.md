# Roadmap en releases

De roadmap is volgordelijk, maar geen belofte van vaste opleverdata. We werken in kleine, demonstrabele slices en herprioriteren na elke review.

## Fase 0 — Scope en fundering
**Doel:** voorkomen dat we op ongetoetste aannames bouwen.
- MVP-gebruikers, processen en uitsluitingen vastleggen.
- Nederlandse boekhoud-/btw-eisen met een deskundige valideren.
- Stack, hostingregio, opslag, OCR en e-mailproviders kiezen.
- Datamodel, security-baseline, lokale ontwikkelomgeving en CI opzetten.
- GitHub Project, labels, Issue forms, PR-template en branch protection instellen.
**Exit:** besluiten staan in `docs/DECISIONS.md`; lege of kapotte builds worden door CI tegengehouden zodra app-code bestaat.

## Fase 1 — Bewijsstukken op de telefoon
- Inloggen en ondernemingsprofiel.
- Foto maken/uploaden, veilige opslag, voortgang en foutmeldingen.
- OCR-voorstellen met confidence/onzekerheid en handmatige controle.
- Statussen, duplicaatsignalering en leverancierskoppeling.
**Exit:** gebruiker kan een bon uploaden, controleren, corrigeren en later terugvinden zonder gegevensverlies.

## Fase 2 — Uitgaven en boekhoudkundige kern
- Uitgave aan bewijsstuk koppelen.
- Rekeningschema en btw-categorieën op basis van gevalideerde eisen.
- Dubbel boekhouden, journaalposten, correctieposten en audit trail.
- Basisrapporten en exports.
**Exit:** een geteste boeking is traceerbaar naar het bronbestand en correcties zijn historisch zichtbaar.

## Fase 3 — Verkoopfacturen en e-mail
- Klanten, factuurnummering, factuurlayout en PDF.
- Verzenden per e-mail met aflever-/foutstatus.
- Openstaande facturen, betalingen registreren en herinneringen.
- Mailtemplates, verzendlog en veilige omgang met adressen/bijlagen.
**Exit:** gebruiker kan een factuur aanmaken, versturen en opvolgen.

## Fase 4 — Integraties en gebruiksgemak
- Inkoopfacturen via een speciaal e-mailadres of providerintegratie.
- Bankimport en afletteren, als de gekozen scope dat rechtvaardigt.
- Export voor boekhouder en rijkere rapportages.
- Eventuele e-facturatie/Peppol-integratie na requirements-check.

## Fase 5 — Productie en beheer
- Hersteltest van back-ups, monitoring, foutmeldingen en incidentprocedure.
- Security- en privacy-review, retentie/verwijderen en toegangscontrole.
- Toegankelijkheid, mobiele browser-testmatrix en performance.
- Releasechecklist, supportproces en documentatie.

## Prioriteitsregels
1. Eerst gegevensintegriteit, beveiliging en de hoofdworkflow.
2. Daarna snelheid en automatisering.
3. Integraties pas bouwen als de handmatige workflow correct en bruikbaar is.
