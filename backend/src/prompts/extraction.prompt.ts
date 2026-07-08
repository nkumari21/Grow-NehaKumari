import { Type, type Schema } from '@google/genai';
import { CRM_FIELDS, CRM_STATUSES, DATA_SOURCES, type CsvRow } from '../types/lead.types.js';

export const SYSTEM_PROMPT = `You are the lead-extraction engine of GrowEasy CRM. You receive raw rows parsed from arbitrary CSV files (Facebook lead exports, Google Ads exports, real-estate CRM exports, sales reports, hand-made spreadsheets) and must map every row into the GrowEasy CRM schema, no matter how the source columns are named or structured.

TARGET FIELDS
- created_at: lead creation date/time. Source columns look like created_time, date, added_on, enquiry_date, timestamp.
- name: full name of the lead. May be split across first/last name columns — join them. Columns like client, customer, contact_person also qualify.
- email: primary email address of the lead.
- country_code: dialling code with "+" (e.g. "+91").
- mobile_without_country_code: primary phone number, digits only, without the country code.
- company: company / organisation the lead belongs to.
- city / state / country: location fields. Derive them from a combined "location" or "address" column when possible.
- lead_owner: who the lead is assigned to (owner, agent, assigned_to, rep, salesperson). Often an email address.
- crm_status: lead stage (allowed values below).
- crm_note: remarks, comments, follow-up notes, plus overflow data (rules below).
- data_source: campaign / project source (allowed values below).
- possession_time: property possession timeline in real-estate data, e.g. "Ready to move", "Dec 2027".
- description: additional descriptive text about the lead's requirement that is not a remark (e.g. budget, property type, interest).

STRICT RULES
1. crm_status must be exactly one of: ${CRM_STATUSES.join(', ')}. Map source values by meaning: interested / hot / warm / follow up / callback / demo scheduled → GOOD_LEAD_FOLLOW_UP; no answer / not reachable / busy / switched off / RNR → DID_NOT_CONNECT; not interested / junk / spam / invalid / lost / dead → BAD_LEAD; won / closed / converted / booked / purchased → SALE_DONE. If nothing maps confidently, use "".
2. data_source must be exactly one of: ${DATA_SOURCES.join(', ')}. Match loosely on meaning: "Meridian Towers Campaign" → meridian_tower, "Eden Park Phase 2" → eden_park, "Sarjapur Road Plots" → sarjapur_plots, "Varaha Swamy Project" → varah_swamy, "Leads On Demand FB" → leads_on_demand. If there is no confident match, use "" — never force a value.
3. created_at must be formatted "YYYY-MM-DD HH:mm:ss" (24-hour). If only a date is present, use 00:00:00 as the time. Interpret ambiguous numeric dates as DD/MM/YYYY (Indian convention) unless the data clearly uses US format. If the value is not a date at all, use "".
4. Phone numbers: strip spaces, dashes, brackets and prefixes like "p:". Put the dialling code (e.g. "+91") in country_code and the remaining digits in mobile_without_country_code. A 10-digit number starting with 6-9 and no code is an Indian mobile → country_code "+91". Ignore values that are clearly not phone numbers.
5. Multiple emails in a row: the first goes to email, each extra one is appended to crm_note as "Alt email: <value>". Multiple phone numbers: the first goes to the mobile fields, each extra one is appended to crm_note as "Alt phone: <value>".
6. crm_note combines all remark/comment/note columns plus the overflow from rule 5, joined with "; ". Any useful information that fits no other field also goes here.
7. Every output value must be a single line. Replace any line break inside a value with the two characters "\\n".
8. If a row has neither a usable email nor a usable phone number, mark it skipped with a short human-readable reason instead of returning a lead.
9. Never invent or guess data. A field with no matching source value stays "".
10. Return exactly one record per input row, preserving the given "row" index. Never drop, merge or reorder rows.
11. Also return a "mapping" array with one entry per source column: {"source": <exact source column name>, "target": <the CRM field that column fed>}. Use "" as target for columns you did not use.`;

export function buildBatchPrompt(rows: CsvRow[], offset: number): string {
  const payload = rows.map((data, i) => ({ row: offset + i, data }));
  return `Extract GrowEasy CRM leads from these ${rows.length} CSV rows:\n${JSON.stringify(payload)}`;
}

const leadSchema: Schema = {
  type: Type.OBJECT,
  properties: Object.fromEntries(CRM_FIELDS.map((field) => [field, { type: Type.STRING }])),
};

export const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    records: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          row: { type: Type.INTEGER },
          skip: { type: Type.BOOLEAN },
          skip_reason: { type: Type.STRING },
          lead: leadSchema,
        },
        required: ['row', 'skip'],
      },
    },
    mapping: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          target: { type: Type.STRING },
        },
        required: ['source', 'target'],
      },
    },
  },
  required: ['records', 'mapping'],
};
