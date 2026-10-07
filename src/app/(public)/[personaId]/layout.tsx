import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getDemoPersona } from "@/demo";

/**
 * Alleen bestaande persona's. Een onbekende personaId, zoals "wetten" bij een
 * link zonder persona-cookie, gaat via uitloggen naar de landingspagina. Zo
 * ontstaat er ook geen lus bij een ongeldig cookie.
 */
const PersonaLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ personaId: string }>;
}) => {
  const { personaId } = await params;
  if (!(await getDemoPersona(personaId))) redirect("/api/persona-logout");
  return children;
};

export default PersonaLayout;
