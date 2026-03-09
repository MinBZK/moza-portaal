import Card from "@/components/card";
import Link from "next/link";
import Button from "@/components/button";

export default function PrivateNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-h1">Pagina niet gevonden</h1>
      <Card className="space-y-4">
        <p>De pagina die u zoekt bestaat niet of is verplaatst.</p>
        <Link href="/">
          <Button type="button">Terug naar Home</Button>
        </Link>
      </Card>
    </div>
  );
}
