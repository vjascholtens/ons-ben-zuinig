# Voorgestelde GitHub Issue-backlog

Dit is de startbacklog. Grote onderdelen zijn epics of groepen Issues; houd uitvoerbare Issues klein en splits ze op zodra een taak groter wordt dan ongeveer 1–3 dagen.

## Epic 0 — Fundament en besluiten

### 0.1 — MVP-scope en gebruikers vastleggen
**Type:** decision · **Prioriteit:** P0

Bepaal gebruiker(s), ondersteunde ondernemingsvorm(en), belangrijkste workflows en wat buiten de MVP valt.

**Acceptatiecriteria**
- De MVP heeft expliciete in-scope/out-of-scope lijsten.
- De kerngebruiker en gebruikersrollen zijn beschreven.
- Open vragen staan als besluiten in `docs/DECISIONS.md`.

### 0.2 — Nederlandse boekhoud- en btw-eisen valideren
**Type:** decision · **Prioriteit:** P0

Leg de beoogde factuurvelden, btw-situaties, nummering, correcties, bewaarplicht en gewenste export vast met een boekhoudkundige deskundige.

**Acceptatiecriteria**
- De eerste ondersteunde scenario's zijn gedocumenteerd.
- Onzekerheden en niet-ondersteunde scenario's zijn expliciet.
- Er is een referentie-/testset voor financiële berekeningen afgesproken.

### 0.3 — Stack, hosting en leveranciers kiezen
**Type:** decision · **Prioriteit:** P0

**Acceptatiecriteria**
- App-framework, database, opslag, auth, OCR en e-mail zijn besloten.
- Dataverwerking, regio, retentie en kosten zijn vergeleken.
- `docs/DECISIONS.md` bevat motivering en alternatieven.

### 0.4 — Repo-basis, Projectboard en branch protection inrichten
**Type:** chore · **Prioriteit:** P0

**Acceptatiecriteria**
- Projectboard en labels bestaan.
- `main` is beschermd; direct pushen is uitgeschakeld waar mogelijk.
- PR-template en Issue forms worden gebruikt.
- Basisbranch en mergebeleid zijn gedocumenteerd.

### 0.5 — Echte applicatie-CI implementeren na stackkeuze
**Type:** chore · **Prioriteit:** P0

**Acceptatiecriteria**
- Pull requests voeren formatter/linter, typecheck, test en build uit.
- Een falende check blokkeert merge.
- Workflow gebruikt minimale permissies en geen hardcoded secrets.

## Epic 1 — Toegang en bedrijfsprofiel

### 1.1 — Veilig inloggen en uitloggen
**Prioriteit:** P1

**Acceptatiecriteria:** gebruiker kan veilig inloggen/uitloggen; niet-ingelogde gebruikers kunnen geen administratiegegevens opvragen; mislukte toegang wordt veilig afgehandeld en getest.

### 1.2 — Ondernemingsprofiel en basisinstellingen
**Prioriteit:** P1

**Acceptatiecriteria:** gebruiker kan bedrijfsgegevens en standaardvoorkeuren beheren; wijzigingen worden gevalideerd; factuur-/belastingvelden zijn gebaseerd op gevalideerde eisen.

## Epic 2 — Bonnetjes en inkomende documenten

### 2.1 — Bon fotograferen of bestand uploaden vanaf mobiel
**Prioriteit:** P1

**Acceptatiecriteria:** werkt op gangbare mobiele browsers; toont uploadstatus en begrijpelijke fouten; bestandsgrootte/type wordt gevalideerd; gebruiker kan het document terugvinden.

### 2.2 — Document veilig opslaan en documentstatus bijhouden
**Prioriteit:** P1

**Acceptatiecriteria:** bestanden zijn niet publiek; toegang wordt geautoriseerd; status en uploadtijd worden vastgelegd; mislukte uploads leiden niet tot een schijnbaar voltooid document.

### 2.3 — OCR-voorstellen voor bon/factuur tonen
**Prioriteit:** P1

**Acceptatiecriteria:** leverancier, datum, factuurnummer, bedragen, btw en valuta worden waar mogelijk voorgesteld; onzekerheid wordt zichtbaar gemaakt; OCR-fouten zijn herstelbaar.

### 2.4 — Gegevens controleren en corrigeren vóór verwerking
**Prioriteit:** P1

**Acceptatiecriteria:** gebruiker kan velden aanpassen; oorspronkelijke OCR en goedgekeurde waarden blijven onderscheidbaar; niet-gecontroleerde documenten worden niet stil automatisch geboekt.

### 2.5 — Dubbele documenten signaleren
**Prioriteit:** P1

**Acceptatiecriteria:** systeem detecteert waarschijnlijke duplicaten; gebruiker kan signalen beoordelen; twee verschillende legitieme documenten worden niet zonder uitleg geblokkeerd.

### 2.6 — Leveranciers beheren en aan documenten koppelen
**Prioriteit:** P1

**Acceptatiecriteria:** leverancier toevoegen/bewerken; document koppelen; onvolledige leveranciersgegevens worden duidelijk aangegeven.

## Epic 3 — Boekhoudkundige kern

### 3.1 — Rekeningschema en boekingsregels modelleren
**Prioriteit:** P1

**Acceptatiecriteria:** rekeningen en categorieën zijn configureerbaar volgens de gevalideerde scope; btw-regels zijn versieerbaar/testbaar; niet-ondersteunde gevallen worden niet stil verkeerd verwerkt.

### 3.2 — Uitgave koppelen aan bewijsstuk en boeking
**Prioriteit:** P1

**Acceptatiecriteria:** iedere uitgave verwijst naar bronbewijs; totalen en btw zijn controleerbaar; status van concept naar bevestigd is expliciet.

### 3.3 — Journaalposten en correcties met audit trail
**Prioriteit:** P1

**Acceptatiecriteria:** journaalposten zijn in balans volgens het gekozen model; definitieve boekingen worden niet stil overschreven; correcties zijn herleidbaar en hebben tests.

### 3.4 — Basisoverzichten en export voor boekhouder
**Prioriteit:** P1

**Acceptatiecriteria:** inkomsten/uitgaven en relevante totalen zijn filterbaar; export is reproduceerbaar; totalen sluiten aan op boekingen; formaat is afgestemd met de beoogde boekhouder.

## Epic 4 — Verkoopfacturen

### 4.1 — Klantenbeheer
**Prioriteit:** P1

**Acceptatiecriteria:** klantgegevens zijn valideerbaar en herbruikbaar; toegang is beperkt tot bevoegde gebruikers; e-mailadressen krijgen plausibele invoervalidatie.

### 4.2 — Conceptfactuur en PDF opstellen
**Prioriteit:** P1

**Acceptatiecriteria:** factuur bevat gevalideerde verplichte velden; bedragen/btw worden door geteste domeinlogica berekend; concepten zijn duidelijk van definitieve facturen onderscheiden.

### 4.3 — Unieke factuurnummering en definitief maken
**Prioriteit:** P1

**Acceptatiecriteria:** nummering voorkomt duplicaten bij gelijktijdige aanvragen; definitieve facturen zijn traceerbaar; annulering/correctie volgt goedgekeurde regels.

### 4.4 — Factuur per e-mail verzenden en status registreren
**Prioriteit:** P1

**Acceptatiecriteria:** verzonden factuur en ontvanger zijn te herleiden; verzendresultaat en fouten worden opgeslagen; retries veroorzaken geen onbedoelde dubbele verzending.

### 4.5 — Openstaande posten en herinneringen
**Prioriteit:** P2

**Acceptatiecriteria:** factuurstatus en vervaldatum zijn zichtbaar; herinneringen kunnen als concept worden gecontroleerd; automatische verzending kan worden beperkt/uitgezet en heeft een verzendlog.

## Epic 5 — E-mail en inkomende facturen

### 5.1 — E-mailsjablonen en verzendlog beheren
**Prioriteit:** P1

**Acceptatiecriteria:** sjablonen zijn aanpasbaar; gevoelige informatie verschijnt niet in logs; verzendfouten zijn zichtbaar en opnieuw te proberen.

### 5.2 — Inkomende facturen via dedicated e-mailadres ontvangen
**Prioriteit:** P2

**Acceptatiecriteria:** toegestane bijlagen worden veilig verwerkt; afzender, ontvangsttijd en bron worden bewaard; ongeldige bijlagen worden veilig afgewezen; duplicaten worden herkend.

## Epic 6 — Betalingen, rapportage en productie

### 6.1 — Betaling registreren en factuur afletteren
**Prioriteit:** P2

**Acceptatiecriteria:** gedeeltelijke/volledige betaling is volgens scope te registreren; resterend saldo klopt; wijzigingen zijn traceerbaar.

### 6.2 — Back-up en herstelprocedure automatiseren en testen
**Prioriteit:** P1 vóór productie

**Acceptatiecriteria:** database en documenten zijn opgenomen in back-upplan; herstel is in een niet-productieomgeving aangetoond; hersteldoel en verantwoordelijkheden zijn gedocumenteerd.

### 6.3 — Security- en privacy-releasechecklist uitvoeren
**Prioriteit:** P1 vóór productie

**Acceptatiecriteria:** autorisatie, secretbeheer, retentie, dataverwerkers, audit trail en foutlogging zijn beoordeeld; bevindingen zijn opgelost of expliciet geaccepteerd.

### 6.4 — Bankimport en afletteren onderzoeken
**Prioriteit:** P3 / later

**Acceptatiecriteria:** gebruikersbehoefte, providerdekking, kosten, machtigingen en privacyrisico's zijn vergeleken; alleen na expliciet besluit implementeren.

### 6.5 — E-facturatie/Peppol-behoefte beoordelen
**Prioriteit:** P3 / later

**Acceptatiecriteria:** toepasselijke verplichtingen en gewenste scenario's zijn actueel onderzocht; scopebesluit en impact op factuurmodel zijn vastgelegd.


## GitHub Issue-index

De echte uitvoerbare backlog en afhankelijkheden staan in GitHub. Deze links zijn de huidige ankerpunten:

### Fundament
- [#1 MVP-scope en gebruikersmodel](https://github.com/vjascholtens/ons-ben-zuinig/issues/1)
- [#2 Nederlandse boekhoud- en btw-eisen valideren](https://github.com/vjascholtens/ons-ben-zuinig/issues/2)
- [#3 Frontend/app-stack](https://github.com/vjascholtens/ons-ben-zuinig/issues/3)
- [#4 GitHub Project, labels en branch protection](https://github.com/vjascholtens/ons-ben-zuinig/issues/4)
- [#5 Echte applicatie-CI — Depends on #1, #3](https://github.com/vjascholtens/ons-ben-zuinig/issues/5)
- [#7 Backendfundament: database, auth, opslag en hosting](https://github.com/vjascholtens/ons-ben-zuinig/issues/7)
- [#8 OCR- en e-maildiensten](https://github.com/vjascholtens/ons-ben-zuinig/issues/8)
- [#6 Mobiele bon-uploadflow — geblokkeerd door #1 en #3](https://github.com/vjascholtens/ons-ben-zuinig/issues/6)

### Functionele Epics
- [#9 Bon-categorieën, uitgaven en boekingen](https://github.com/vjascholtens/ons-ben-zuinig/issues/9)
- [#10 Verkoopfacturen en factuurstatussen](https://github.com/vjascholtens/ons-ben-zuinig/issues/10)
- [#11 E-mailverzending en maandelijkse totaalmail](https://github.com/vjascholtens/ons-ben-zuinig/issues/11)
- [#12 Back-ups, herstel en boekhoudexport](https://github.com/vjascholtens/ons-ben-zuinig/issues/12)

Labels worden gedefinieerd in `.github/labels.json` en aangemaakt/toegewezen door de gerichte workflow `Sync labels`. De echte app-CI volgt pas na de stackkeuze.
