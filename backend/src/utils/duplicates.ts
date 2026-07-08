import type { ImportedLead } from '../types/lead.types.js';

export function flagDuplicates(leads: ImportedLead[]): number {
  const seenEmails = new Map<string, number>();
  const seenMobiles = new Map<string, number>();
  let duplicates = 0;

  for (const lead of leads) {
    const emailMatch = lead.email ? seenEmails.get(lead.email) : undefined;
    const mobileMatch = lead.mobile_without_country_code
      ? seenMobiles.get(lead.mobile_without_country_code)
      : undefined;
    const original = emailMatch ?? mobileMatch;

    const owner = original ?? lead.row;
    if (original !== undefined) {
      lead.duplicateOf = original;
      duplicates += 1;
    }
    if (lead.email && !seenEmails.has(lead.email)) {
      seenEmails.set(lead.email, owner);
    }
    if (lead.mobile_without_country_code && !seenMobiles.has(lead.mobile_without_country_code)) {
      seenMobiles.set(lead.mobile_without_country_code, owner);
    }
  }
  return duplicates;
}
