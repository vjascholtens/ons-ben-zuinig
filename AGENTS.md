# AGENTS.md — werkinstructies voor AI-agents

Dit bestand geldt voor de hele repository. Het is bedoeld voor ChatGPT, Google Jules en andere ontwikkelagents. Volg ook eventuele specifiekere `AGENTS.md`-bestanden in submappen als die later worden toegevoegd.

## 1. Doel en productgrenzen

**Ons Ben Zuinig** is een mobile-first Nederlandse administratie-PWA. De prioriteit is een betrouwbare, controleerbare en veilige documentworkflow; financiële automatisering komt pas nadat de relevante gegevens- en fiscale regels zijn gevalideerd.

De afgesproken MVP richt zich in eerste instantie op één hoofdgebruiker en één onderneming/administratie. Houd records wel expliciet aan een administratie gekoppeld, zodat latere uitbreiding mogelijk blijft. Bouw niet uit eigen beweging een bankkoppeling, automatische aangifte, automatische betalingen, mailbox-sync, multi-userbeheer of offline financiële mutaties.

De beoogde eerste verticale slice is:

`foto/bestandsupload → veilige private opslag → OCR-voorstellen/mock → menselijke controle → document terugvinden`

Werk in kleine, end-to-end aantoonbare stappen. Voeg geen brede, niet-werkende infrastructuur toe alleen om alvast op toekomstige features vooruit te lopen.

## 2. Lees eerst de projectcontext

Controleer vóór elke taak de actuele repository, openstaande Issues/PR's en relevante CI-status. Gebruik deze documenten als context en volgorde van besluitvorming:

- `README.md` — lokale installatie en projectoverzicht.
- `docs/PRODUCT_VISION.md` — MVP-scope en expliciete uitsluitingen.
- `docs/DECISIONS.md` — besluiten, voorstellen en openstaande keuzes; let goed op de status van elk besluit.
- `docs/ARCHITECTURE_PROPOSAL.md` — architectuur en technische afwegingen.
- `docs/SECURITY_AND_PRIVACY.md` — privacy- en security-eisen.
- `docs/FINANCIAL_DATA_CONVENTIONS.md` — voorgestelde financiële conventies; deze zijn niet automatisch formeel goedgekeurd.
- `docs/GITHUB_WORKFLOW.md` en `CONTRIBUTING.md` — branch-, Issue-, PR- en reviewproces.
- `docs/ROADMAP.md` en `docs/ISSUE_BACKLOG.md` — volgorde en afhankelijkheden.
- `docs/last_chat.md` — overdracht en eerdere besprekingen.

**Let op:** `docs/last_chat.md`, de roadmap en eerdere chatberichten zijn context, geen bewijs van de huidige live status. Controleer Issues, PR's, branch, workflowruns en Supabase-configuratie waar mogelijk opnieuw. Claim nooit dat een instelling, integratietest, deployment of databasewijziging is uitgevoerd zonder dat te hebben geverifieerd.

## 3. Technische stack en conventies

- Next.js App Router, React en TypeScript.
- Tailwind CSS voor styling.
- pnpm als package manager; versie staat in `package.json` en `pnpm-lock.yaml`.
- Node.js volgens de `engines`-instelling in `package.json` (momenteel minimaal 22.13.0).
- Supabase PostgreSQL, Auth en private Storage als voorlopige prototype-richting.
- ESLint, TypeScript, Vitest en Playwright voor kwaliteitscontroles.
- Houd financiële domeinlogica gescheiden van React/UI-, HTTP- en opslagdetails. Geef pure domeinfuncties de voorkeur waar dat logisch is.
- Volg de bestaande code- en mapstructuur. Voeg geen framework of dependency toe als de bestaande stack de taak kan oplossen.
- Houd dependencies en lockfile synchroon; wijzig nooit alleen de lockfile met de hand.

Gebruik de bestaande scripts:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Voer ten minste lint, typecheck en unit tests uit voor relevante wijzigingen. Voer voor wijzigingen aan routes, uploads, authenticatie, database-integratie of gebruikersstromen ook de productiebuild en relevante Playwright-tests uit. Als een controle niet kan draaien, meld precies welke controle niet is uitgevoerd en waarom; presenteer die niet als geslaagd.

## 4. GitHub- en agentwerkwijze

1. Controleer de huidige branch en werkboom voordat je begint. Behoud bestaande wijzigingen van de gebruiker; overschrijf of verwijder ze niet.
2. Werk nooit rechtstreeks op `main`. Gebruik een korte branch, bijvoorbeeld `feat/<issue>-<naam>`, `fix/<issue>-<naam>` of `chore/<issue>-<naam>`.
3. Koppel wijzigingen aan een bestaand Issue. Bespreek of maak eerst een Issue als de taak breed is of acceptatiecriteria ontbreken.
4. Houd een PR klein en gericht. Neem in de PR op: doel, belangrijke wijzigingen, tests, migratie-impact, privacy/security-impact en openstaande beperkingen. Koppel het Issue met `Closes #<nummer>` als de PR het daadwerkelijk afrondt.
5. Controleer de diff op onbedoelde wijzigingen, debugcode, secrets, testdata en gegenereerde bestanden vóór je de PR opent.
6. Laat een PR beoordelen en vereiste CI-checks slagen voordat er wordt gemerged. **Merge of force-push niet op eigen initiatief**; doe dit alleen als de gebruiker dat expliciet heeft opgedragen en de vereiste controles zijn afgerond.
7. Controleer branch protection in GitHub; ga er niet van uit dat `main` beschermd is. Eerdere projectnotities vermelden dat bescherming nog handmatig moest worden ingesteld. Als je dit niet live kunt verifiëren, benoem dat als openstaand risico.
8. ChatGPT en Jules mogen niet gelijktijdig aan dezelfde branch of dezelfde wijziging werken. Controleer actieve PR's en branches om dubbel werk of conflicterende edits te voorkomen. Pak bij voorkeur een afzonderlijk Issue en een eigen branch.
9. Werk documentatie en beslissingen bij wanneer gedrag, datacontracten of een geaccepteerde architectuurkeuze verandert. Verander geen status van een voorgesteld besluit naar “besloten” zonder onderbouwing en expliciete bevestiging.

Gebruik de bestaande PR-template en de richtlijnen in `.github/PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md` en `docs/GITHUB_WORKFLOW.md`.

## 5. Security, privacy en Supabase

De app is **niet vrijgegeven voor echte financiële documenten** totdat de relevante privacy-, security- en operationele gates aantoonbaar zijn afgerond. Gebruik in code, tests, demo's, Issues, screenshots en logs uitsluitend synthetische documenten en fictieve gegevens.

- Deel of commit nooit wachtwoorden, access tokens, API-keys, Supabase service-role keys, echte bonnetjes, echte facturen, klantgegevens of productie-exportbestanden.
- Zet lokale geheimen in een niet-gecommitte lokaal env-bestand of de aangewezen secret store. Controleer altijd dat secrets niet in Git, logs, foutmeldingen, PR's of CI-artifacts terechtkomen.
- Een Supabase service-role key mag nooit in browser/client-code worden gebruikt. Beperk browsertoegang tot publieke, daarvoor bedoelde configuratie.
- Valideer uploads server-side op inhoudelijk bestandstype (magic bytes waar passend), bestandsgrootte en toegestane verwerking. Vertrouw niet op de extensie, bestandsnaam of clientvalidatie.
- Gebruik private Storage; maak geen publieke document-URL's. Controleer server-side identiteit en autorisatie bij iedere upload, leesactie, download, wijziging en verwijdering.
- RLS en server-side checks vullen elkaar aan; geen van beide mag worden overgeslagen. Records en opslagpaden moeten aantoonbaar aan de juiste administratie/gebruiker zijn gebonden.
- Test negatieve gevallen, waaronder niet-ingelogde toegang, een tweede gebruiker, verkeerde bestandstypen, bestanden boven de limiet, mislukte opslag/metadata-insert en dubbele/gelijktijdige verzoeken.
- Zorg bij gedeeltelijke fouten voor veilige compensatie of opruiming zonder andere gebruikersdata te raken. Maak retries waar nodig idempotent.
- Log geen volledige documenten, financiële inhoud, tokens of onnodige persoonsgegevens.
- Voer geen destructieve wijzigingen of migraties uit op een echt Supabase-project zonder dat de taak dit expliciet toestaat en het doelproject is geverifieerd. Bekijk migraties vóór uitvoering en beschrijf gevolgen.
- Een lokaal geïnstalleerde Supabase CLI of vermelding in een chat betekent niet dat dit agent toegang heeft tot het juiste project. Controleer de feitelijke verbinding/configuratie. Vraag nooit om geheimen in de chat; gebruik de ingestelde connector of secret store.
- Claim niet dat RLS, uploads, herstel, datalocatie of integratie werkt op basis van alleen unit tests. Benoem welke end-to-end checks werkelijk op het testproject zijn uitgevoerd.
- Gebruik geen externe OCR-provider voor echte documenten. Houd de adapter provider-neutraal en gebruik een mock totdat Issue #8 en de privacygate expliciet zijn beoordeeld.
- Back-up, herstel, retentie, verwijdering, incidentafhandeling en relevante verwerkers/subprocessors moeten vóór productie aantoonbaar zijn beoordeeld.

## 6. Financiële integriteit en fiscale claims

Financiële waarden zijn domeingegevens, geen gewone UI-nummers.

- Gebruik geen JavaScript floating-pointberekeningen of PostgreSQL `REAL`/`DOUBLE PRECISION` voor geld. Gebruik bij financiële logica exacte decimale rekenkunde en PostgreSQL `NUMERIC/DECIMAL` met expliciete precisie.
- Serialiseer geldbedragen tussen API en UI als decimale strings, niet als JSON floating-point nummers. Bewaar valuta expliciet (ISO 4217).
- Houd btw-code/behandeling, tarief, grondslag, btw-bedrag, netto/bruto en afrondingsregels expliciet en traceerbaar. Behandel nultarief, vrijstelling en verlegging niet stilzwijgend als hetzelfde.
- Definitieve factuurnummers moeten atomair en uniek zijn; gelijktijdige verzoeken mogen geen dubbele nummers opleveren.
- Houd bronbestand, OCR-uitkomst, door de gebruiker bevestigde waarden en definitieve boeking onderscheidbaar. Overschrijf definitieve financiële mutaties niet stil; gebruik traceerbare correcties/audit trail.
- Bouw geen definitief financieel schema, boekingslogica of factuurgedrag zolang de relevante voorwaarden uit Issue #2 en #14 nog niet inhoudelijk zijn gevalideerd/goedgekeurd. Controleer hun actuele status voordat je daarop voortbouwt.
- Verzin geen fiscale of wettelijke eisen en presenteer geen ontwerpvoorstel als juridisch/fiscaal advies. Controleer actuele officiële Nederlandse bronnen en leg aanname, bron en resterende onzekerheid vast; schakel waar nodig een boekhoudkundige deskundige in.
- Tests moeten inhoudelijk gevalideerde referentiewaarden bevatten. Tests die alleen de huidige implementatie bevestigen, zijn onvoldoende.

## 7. Datamodel, API's en migraties

- Gebruik expliciete types en valideer onbetrouwbare input aan systeemgrenzen (API, formulier, externe dienst, database).
- Houd databaseconstraints, unieke sleutels en transacties verantwoordelijk voor invarianten die race conditions moeten overleven; vertrouw niet alleen op controles in de UI.
- Geef migraties voorspelbare namen, houd ze gecontroleerd en documenteer wijzigingen in schema of RLS-beleid.
- Ontwerp wijzigingen op basis van bestaande data en backward compatibility. Voeg waar nodig een veilige migratie-/rollbackstrategie toe; voer geen reset of dataverlies veroorzakende actie uit om tests te laten slagen.
- Gebruik geen echte persoonsgegevens in fixtures. Maak expliciete tests voor autorisatie, foutpaden, concurrency en duplicaten bij de betrokken functionaliteit.
- Houd OCR provider-neutraal en behandel OCR-resultaten als **voorstellen**. Onzekere of ontbrekende velden mogen niet ongemerkt een definitieve boeking worden.

## 8. UX en toegankelijkheid

- Ontwikkel mobile-first, met begrijpelijke Nederlandse teksten en een rustige, responsieve interface.
- Houd gewone bestandsupload als fallback beschikbaar, ook wanneer camera-capture wordt ondersteund.
- Geef duidelijke laad-, lege-, succes- en foutstatussen en maak retries veilig.
- Gebruik semantische HTML, label formuliercontrols toegankelijk en behoud toetsenbordbediening en voldoende focusfeedback.
- Bewaar geen financiële documenten offline in de MVP en implementeer geen offline financiële mutaties.
- Test belangrijke flows in gangbare mobiele browsers waar relevant; ga niet uit van native iOS-mogelijkheden die een PWA niet gegarandeerd heeft.

## 9. Definition of Done voor agentwerk

Een taak is pas klaar wanneer:

- de wijziging binnen het afgesproken Issue en de MVP-scope blijft;
- nieuwe/gewijzigde logica de relevante tests heeft;
- lint, typecheck, unit tests en passende build/e2e-checks zijn uitgevoerd, met resultaten eerlijk gerapporteerd;
- autorisatie, foutafhandeling, privacy en financiële integriteit waar relevant zijn meegenomen;
- migraties, beslissingen en documentatie zijn bijgewerkt;
- de diff is nagekeken en geen secrets of echte financiële gegevens bevat;
- een gerichte PR met testbewijs en openstaande risico's klaarstaat.

Sluit je werk af met een korte samenvatting van wat veranderde, de tests die echt zijn uitgevoerd, de PR/branch-link en resterende blokkades. Rapporteer beperkingen expliciet; doe nooit alsof code, CI, Supabase of GitHub-instellingen zijn getest of gewijzigd wanneer dat niet zo is.
