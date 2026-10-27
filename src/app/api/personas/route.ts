import { getDemoPersonas } from "@/demo";

export async function GET() {
  return Response.json(await getDemoPersonas());
}
