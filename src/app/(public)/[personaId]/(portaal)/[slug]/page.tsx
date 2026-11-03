import type { Metadata } from "next";
import Placeholder, { metadataOf } from "@/app/(footer)/_placeholder";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => metadataOf((await params).slug);

/** Pages without content yet, such as those from the footer, with a persona. */
export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Placeholder slug={slug} />;
}
