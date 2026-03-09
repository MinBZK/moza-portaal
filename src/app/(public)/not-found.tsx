import Card from "@/components/card";
import Link from "next/link";
import Button from "@/components/button";

export default function PublicNotFound() {
  return (
    <div className="container mx-auto space-y-4 py-8">
      <h1 className="text-h1 text-center">Pagina niet gevonden</h1>
      <Card className="space-y-4">
        <p className="text-center">
          De pagina die u zoekt bestaat niet of is verplaatst.
        </p>
        <div className="mt-4 flex justify-center">
          <Link href="/">
            <Button type="button">Terug naar de startpagina</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
