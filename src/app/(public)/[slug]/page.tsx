import Card from "@/components/card";
import Link from "next/link";

export default async function FooterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Format slug to a readable title (optional, but nice)
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="container mx-auto py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-blue-600 hover:underline"
      >
        ← vorige
      </Link>
      <Card>
        <h1 className="text-h1 mb-4">{title}</h1>
        <p className="text-lg">Hier wordt aan gewerkt.</p>
      </Card>
    </div>
  );
}
