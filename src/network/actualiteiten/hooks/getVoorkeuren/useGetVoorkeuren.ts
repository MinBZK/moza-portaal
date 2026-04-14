import { useQuery } from "@tanstack/react-query";
import { getVoorkeuren } from "@/network/actualiteiten/fetchers/getVoorkeuren";

export const useGetVoorkeuren = (
  identificatieType: string,
  identificatieNummer: string,
) =>
  useQuery({
    queryKey: ["actualiteiten", "voorkeuren", identificatieType, identificatieNummer],
    queryFn: () => getVoorkeuren(identificatieType, identificatieNummer),
    enabled: Boolean(identificatieNummer),
  });
