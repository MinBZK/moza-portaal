"use client";

import { useQueries } from "@tanstack/react-query";
import { getArticles } from "@/network/actualiteiten/fetchers/getArticles";
import { ALL_SUBJECTS } from "./_subjectGroups";

export function useSubjectCounts(): Record<string, number | null> {
  const queries = useQueries({
    queries: ALL_SUBJECTS.map((subject) => ({
      queryKey: ["article-count", subject],
      queryFn: () => getArticles({ subjects: [subject], limit: 1 }),
      staleTime: 1000 * 60 * 60, // 1 hour
    })),
  });

  const counts: Record<string, number | null> = {};
  ALL_SUBJECTS.forEach((subject, i) => {
    const query = queries[i];
    counts[subject] = query.data ? query.data.total : null;
  });

  return counts;
}
