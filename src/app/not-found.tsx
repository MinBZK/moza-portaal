import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";

export default function GlobalNotFound() {
  return (
    <>
      <Heading level={1}>Pagina niet gevonden</Heading>
      <div className="mox-card">
        <Paragraph>De pagina die u zoekt bestaat niet.</Paragraph>
        <Paragraph>
          <Link
            href="/"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Terug naar de startpagina
          </Link>
        </Paragraph>
      </div>
    </>
  );
}
