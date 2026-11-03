import type { Metadata } from "next";
import FooterContent from "@/app/(footer)/_content";
import { metadataOf } from "@/app/(footer)/_placeholder";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => metadataOf((await params).slug);

/** Pages without their own route, such as those from the footer, with a persona. */
export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FooterContent slug={slug} />;
}
