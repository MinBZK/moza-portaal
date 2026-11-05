const MONTHS = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

/** "mrt" is the usual Dutch abbreviation; the others are the first letters. */
const monthFromName = (name: string) => {
  if (name === "mrt") return 3;
  if (name.length < 3) return undefined;
  const index = MONTHS.findIndex((month) => month.startsWith(name));
  return index < 0 ? undefined : index + 1;
};

/** A two-digit year in the future is from the previous century. */
const fullYear = (year: string, today: Date) => {
  if (year.length === 4) return Number(year);
  if (year.length !== 2) return undefined;
  const century = Math.floor(today.getFullYear() / 100) * 100;
  const value = century + Number(year);
  return value > today.getFullYear() ? value - 100 : value;
};

/**
 * Reads a date as day, month and year in the forms people type: 3-6-2001,
 * 03/06/2001, 3.6.01, 3 6 2001, 03062001, 3 juni 2001 and 3 jun 2001.
 * Returns undefined if it is not an existing date.
 */
export const parseDayMonthYear = (text: string, today = new Date()) => {
  const clean = text.trim().toLowerCase().replace(/\.$/, "");
  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(clean);
  const parts = compact
    ? compact.slice(1)
    : clean.split(/[\s./-]+/).filter(Boolean);
  if (parts.length !== 3) return undefined;

  const [dayText, monthText, yearText] = parts;
  if (!/^\d{1,2}$/.test(dayText) || !/^\d{2}(\d{2})?$/.test(yearText)) {
    return undefined;
  }
  const day = Number(dayText);
  const month = /^\d{1,2}$/.test(monthText)
    ? Number(monthText)
    : monthFromName(monthText);
  const year = fullYear(yearText, today);
  if (!month || !year) return undefined;

  const date = new Date(year, month - 1, day);
  const exists =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return exists ? date : undefined;
};

/** 3 June 2001 becomes "03-06-2001". */
export const formatDayMonthYear = (date: Date) =>
  [date.getDate(), date.getMonth() + 1]
    .map((part) => String(part).padStart(2, "0"))
    .concat(String(date.getFullYear()))
    .join("-");
