import { useQuery } from "@tanstack/react-query";
import { getVoorkeuren } from "@/network/actualiteiten/fetchers/getVoorkeuren";

export const useGetVoorkeuren = () =>
  useQuery({
    queryKey: ["actualiteiten", "voorkeuren"],
    queryFn: () => getVoorkeuren(),
  });
