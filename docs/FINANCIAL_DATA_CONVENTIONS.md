# Financiële dataconventies — eerste MVP-slice

**Status:** besloten voor de eerste prototype-slice, gebaseerd op [de Nederlandse fiscale basis](DUTCH_TAX_BASELINE.md). Geen definitief fiscaal advies voor een specifieke onderneming.

## Bedragen en precisie

- Gebruik in financiële domeinlogica **geen JavaScript `number`/floating point** voor geld. Gebruik decimale strings aan API-/UI-grenzen en exacte decimale rekenkunde of integer cents.
- Sla uiteindelijke bedragen en totalen op als PostgreSQL `NUMERIC(12,2)`; gebruik geen SQL `REAL`, `DOUBLE PRECISION` of locale-afhankelijk `money`.
- Hoeveelheid en eenheidsprijs hebben afzonderlijke precisie: `NUMERIC(12,4)`. Een btw-percentage gebruikt `NUMERIC(5,2)`; pas het niet toe alsof het een geldbedrag is.
- Formatteer bedragen alleen in de presentatielaag. Bewaar en verstuur geld als strings zoals `"12.34"`.
- Valideer ISO 4217-valutacodes op drie hoofdletters. De eerste slice kiest standaard `EUR`; elk factuurdocument heeft expliciet een `currency_code`. Eventuele omrekening moet later zowel bronvaluta als koers-/omrekeninformatie bewaren.

PostgreSQL documenteert `numeric` als exact: https://www.postgresql.org/docs/current/datatype-numeric.html.

## Btw per factuurregel

Elke regel bewaart:
- `vat_treatment`: `standard`, `zero_rate`, `exempt`, `reverse_charge` of `kor`;
- `vat_rate NUMERIC(5,2)` of NULL waar een numeriek tarief niet toepasselijk is;
- `vat_reason` voor nultarief, vrijstelling, verlegging en KOR;
- `taxable_base NUMERIC(12,2)`, `vat_amount NUMERIC(12,2)`, `net_amount NUMERIC(12,2)` en `gross_amount NUMERIC(12,2)`;
- hoeveelheid, eenheidsprijs en korting apart.

Het database-schema verhindert dat vrijstelling, verlegging of KOR als een gewoon nultarief wordt opgeslagen. Voor `standard` ondersteunt de eerste slice 9% en 21%; `zero_rate` vereist 0% plus reden. Aanvullende regimes vereisen een expliciete uitbreiding na bronvalidatie.

## Afronding en berekening

- De MVP kiest **btw afronden per factuurregel** volgens de rekenkundige centmethode (derde decimaal 5 of hoger rondt naar boven).
- Bereken exact per regel en sla de uitkomst op twee decimalen op; de factuursom is de som van opgeslagen afgeronde regelbedragen. Meng dit niet met afronden op factuurtotaal binnen dezelfde administratie.
- De btw-aangifte heeft aparte afrondingsregels op hele euro's; voer die niet uit in het factuurregelmodel.
- Synthetische referentiegevallen staan in [`docs/fixtures/tax-scenarios.json`](fixtures/tax-scenarios.json) en [`docs/fixtures/financial-reference-cases.json`](fixtures/financial-reference-cases.json).

## Factuurnummering en finaliseren

- Een conceptfactuur heeft geen definitief factuurnummer. Een nummer wordt alleen toegewezen bij definitief maken.
- `invoice_number_counters` is uniek per administratie, reeks en jaar. De SQL-functie `finalize_invoice` vergrendelt de factuur en de bijbehorende counter met `SELECT ... FOR UPDATE`, verhoogt de counter binnen dezelfde transactie en bewaart het definitieve nummer.
- De unieke index op administratie/reeks/jaar/nummer is de laatste bescherming tegen dubbele nummers.
- Definitieve nummers worden niet hergebruikt; annulering wist of hergebruikt het nummer niet. De eerste slice bevat nog geen volledig correctie-/creditnotamodel (dat blijft #20).
- De SQL-functie controleert de eigenaar via `auth.uid()`; ze wordt niet als anonieme functie uitgevoerd. De countertabel is niet rechtstreeks schrijfbaar door gebruikers.

## Tabellen en audit trail

De eerste financiële migratie voegt `invoices`, `invoice_lines` en `invoice_number_counters` toe. Tabellen hebben RLS en eigenaarsbeleid. Een definitief gemaakte factuur kan niet via de gewone gebruikersrechten worden gewijzigd; correcties horen in een aparte traceerbare workflow. Uitgebreide immutable event-audit en fiscale bewaartermijnen worden verder uitgewerkt in #20 voordat productiegebruik mogelijk is.

Voor inkomende documenten blijven de bronupload, het oorspronkelijke mock-OCR-voorstel en de door de gebruiker bevestigde waarden afzonderlijk. Een bevestigde extractie is documentmetadata, geen boeking of definitieve btw-behandeling.

## Verificatievereisten

De synthetische referenties en unit tests dekken:
- centafronding exact, inclusief derde decimaal 4 versus 5;
- 21%, 9% en expliciet onderscheid tussen nultarief, vrijstelling, verlegging en KOR;
- valuta als ISO-code en bedragrepresentatie als decimale string;
- 20 gelijktijdige finaliseer-verzoeken: 20 unieke, opeenvolgende nummers binnen één reeks.

De migratie introduceert het atomische nummeringsmechanisme, maar echte database-concurrency moet worden getest tegen een apart prototype nadat deze migratie gecontroleerd is toegepast. Er zijn geen echte facturen of financiële gegevens in de fixtures.
