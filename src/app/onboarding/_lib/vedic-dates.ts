// Next ~24 months of Shukla Pratipada (first day of the Vedic lunar month).
// Used in the confirmation screen to tell the user when their first blueprint arrives.
// Dates computed from a Drik panchang reference for IST.
// Format: ISO date string (YYYY-MM-DD).
//
// If the current date is past every entry, we fall back to a "in the next few weeks"
// phrasing so the page does not show a stale date.

export const SHUKLA_PRATIPADA_DATES: string[] = [
  '2026-05-17',
  '2026-06-16',
  '2026-07-15',
  '2026-08-13',
  '2026-09-12',
  '2026-10-11',
  '2026-11-10',
  '2026-12-09',
  '2027-01-08',
  '2027-02-07',
  '2027-03-08',
  '2027-04-07',
  '2027-05-06',
  '2027-06-05',
  '2027-07-04',
  '2027-08-03',
  '2027-09-01',
  '2027-10-01',
  '2027-10-30',
  '2027-11-29',
  '2027-12-29',
  '2028-01-27',
  '2028-02-26',
  '2028-03-26',
];

export function nextShuklaPratipada(now: Date = new Date()): string | null {
  const today = now.toISOString().slice(0, 10);
  for (const d of SHUKLA_PRATIPADA_DATES) {
    if (d >= today) return d;
  }
  return null;
}

export function formatVedicDate(iso: string): string {
  // e.g. "17 May 2026"
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  const date = new Date(Date.UTC(y, m - 1, d));
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
