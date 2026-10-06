import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

/** "2026-04-22" wordt "22 april 2026". parseISO leest de datum als lokale tijd. */
export const formatDatum = (datum: string) =>
  format(parseISO(datum), "d MMMM yyyy", { locale: nl });
