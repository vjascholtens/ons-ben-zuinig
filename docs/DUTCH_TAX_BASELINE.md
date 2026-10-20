# Nederlandse fiscale basis voor de eerste factuurslice

**Status:** brongecontroleerde MVP-conventie; geen individueel fiscaal advies. Deze regels beschrijven de eerste binnenlandse scenario's. Controleer uitzonderingen en de concrete ondernemingssituatie vóór gebruik met echte facturen.

## Ondersteunde btw-behandelingen

Modelleer de behandeling als een expliciete code, niet uitsluitend als een percentage:

- `standard`: het toepasselijke reguliere tarief. 21% is het algemene tarief; 9% geldt alleen voor de wettelijk aangewezen goederen en diensten.
- `zero_rate`: 0% uitsluitend als de specifieke prestatie wettelijk onder het nultarief valt. Leg de grond/toelichting vast. Dit is niet hetzelfde als vrijgesteld.
- `exempt`: btw-vrijgestelde prestatie met een reden/rechtsgrond. Er wordt geen btw berekend; behandel dit niet als een belaste prestatie tegen 0%.
- `reverse_charge`: btw verlegd. De leverancier brengt geen btw in rekening en vermeldt waar vereist “btw verlegd” plus het btw-identificatienummer van de afnemer. De toepassing is scenario-afhankelijk; deze MVP beslist niet automatisch dat verlegging van toepassing is.
- `kor`: leverancier neemt deel aan de KOR. Er wordt geen btw aan de klant berekend en de deelnemer kan in beginsel geen btw op zakelijke kosten en investeringen terugvragen. Dit is een vrijstellingsregeling en niet hetzelfde als het 0%-tarief.

Sla bij ieder voorstel de oorspronkelijke tekst, gekozen behandeling en onderbouwing afzonderlijk op. De app mag op basis van alleen een herkend percentage niet automatisch een fiscale code definitief maken.

## KOR-checklist (Nederlandse KOR)

Toon dit als checklist, niet als automatische juridische conclusie. Controleer minimaal:
1. Is de onderneming in Nederland gevestigd?
2. Is de relevante omzet maximaal € 20.000 in zowel het kalenderjaar van aanmelding als het kalenderjaar daarvoor?
3. Zijn de activiteiten en omzetsoorten geschikt voor de regeling? Sommige vrijgestelde omzet telt anders mee voor de grens.
4. Is daadwerkelijke deelname bevestigd, en is de ingangsdatum bekend?
5. Wordt de grens gedurende deelname overschreden? Bij overschrijding stopt de vrijstelling onmiddellijk; ook de handeling waarmee de grens wordt overschreden valt niet meer onder de KOR.

Bij deelname mag geen btw aan klanten worden berekend en is voorbelasting niet aftrekbaar. De UI moet status, periode, bron en eventuele onzekerheid vastleggen; de gebruiker moet deelname/geschiktheid bevestigen. De MVP berekent de omzetgrens niet zolang de omzetgegevens ontbreken.

## Verplichte factuurvelden voor de standaard-binnenlandse route

Wanneer een ondernemer verplicht is een btw-factuur uit te reiken, toon/verifieer minimaal:
- volledige juridische naam en feitelijk adres van leverancier en afnemer;
- btw-identificatienummer van de leverancier;
- KvK-nummer van de leverancier als deze bij KVK is ingeschreven;
- factuurdatum en uniek opeenvolgend factuurnummer (één of meer reeksen zijn mogelijk; geen nummer wordt tweemaal gebruikt);
- leverdatum of datum van vooruitbetaling;
- omschrijving en hoeveelheid/omvang van geleverde goederen/diensten;
- bedrag exclusief btw, uitgesplitst naar btw-tarief, waar nodig eenheidsprijs;
- toegepast btw-tarief en btw-bedrag.

Bij verlegging kan ook het btw-identificatienummer van de afnemer vereist zijn en moet “btw verlegd” worden vermeld. Voor een vereenvoudigde factuur (onder meer bij een bedrag van € 100 of lager inclusief btw) kunnen aangepaste eisen gelden. Internationale leveringen, intracommunautaire prestaties, fiscale eenheden en andere bijzondere regelingen vallen buiten de automatische MVP-conclusie en krijgen een handmatige controle/status “speciale regels controleren”.

## Factuurdeadline

Standaard: verstuur de factuur uiterlijk op de **15e dag van de maand na de maand waarin is geleverd**. Pas aparte regels toe wanneer voor het scenario een officiële uitzondering geldt, zoals specifieke situaties met grensoverschrijdende prestaties of vooruitbetalingen. Een factuurdatum en leverdatum blijven aparte velden.

## Afronding

- Gebruik de rekenkundige methode voor centafronding: derde decimaal lager dan 5 naar beneden, 5 of hoger naar boven.
- Kies voor de eerste MVP **afronding per factuurregel**. Bereken de btw exact per regel, rond per regel af op twee decimalen en sommeer daarna de opgeslagen afgeronde regelbedragen.
- Meng afronding per regel en per factuurtotaal niet binnen dezelfde administratie; bewaar de gekozen methode bij de factuur/administratie.
- De btw-aangifte hanteert aparte afrondingsregels op hele euro's; die zijn niet hetzelfde als het opslaan van factuurregels op centen.

## Definitief factuurnummer

Een concept heeft geen definitief nummer. Ken het nummer pas toe bij definitief maken, binnen een administratie/onderneming en reeks, atomair in een databasetransactie. Parallelle aanvragen moeten unieke opeenvolgende nummers opleveren. Een al definitief gebruikt nummer wordt niet hergebruikt; een correctie krijgt een expliciete verwijzing naar de originele factuur en vervangt die niet stilzwijgend.

## Synthetische referenties

Zie [`docs/fixtures/tax-scenarios.json`](fixtures/tax-scenarios.json) voor toetsbare voorbeelden van 21%, 9%, 0%, vrijstelling, verlegging, KOR en centafronding. Dit zijn classificatie-/rekentests, geen bevestiging dat een specifieke echte prestatie onder een bepaald regime valt.

## Officiële bronnen (geraadpleegd 20 oktober 2026)

- [Belastingdienst — Factuureisen](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/factuureisen/factuureisen)
- [Belastingdienst — Facturen maken en termijn](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/)
- [Belastingdienst — Btw-bedrag afronden](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/btw-bedrag_afronden)
- [Belastingdienst — Tarieven en vrijstellingen](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/tarieven_en_vrijstellingen/tarieven_en_vrijstellingen)
- [Belastingdienst — KOR](https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/kor-voorwaarden)
- [Belastingdienst — Gevolgen van KOR-deelname](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/hoe_werkt_de_btw/kleineondernemersregeling/wat-betekent-meedoen-met-de-kleineondernemersregeling/)
- [Belastingdienst — Btw verlegd op de factuur](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/factuureisen/aangepaste_regels_facturen/u_maakt_gebruik_van_de_verleggingsregeling)

## Scopegrenzen en aannames

- De eerste geautomatiseerde scenario's richten zich op Nederlandse binnenlandse transacties die door de gebruiker zijn geclassificeerd.
- Geen automatische beslissing voor buitenlandse situaties, margeregeling, fiscale eenheid, bijzondere vrijstellingen, gemengde prestaties of uitzonderingen; vraag menselijke controle.
- Deze documentatie en synthetische tests zijn geen vervanging voor een accountant/boekhouder wanneer de concrete activiteiten of uitzonderingen niet eenduidig zijn.
- Bewaarplicht, uitgebreid correctiebeleid en fiscale/boekhoudexport blijven onderdeel van issue #20.
