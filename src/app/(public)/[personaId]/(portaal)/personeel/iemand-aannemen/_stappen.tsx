const STAPPEN = [
  "Kandidaat",
  "Gegevens per bron",
  "Wat het oplevert",
  "Concept-aanvraag",
] as const;

/** Waar de ondernemer is in Iemand aannemen (1 tot 4). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 | 4 }) => (
  <ol className="mox-hiring-steps" aria-label="Stappen">
    {STAPPEN.map((stap, i) => (
      <li key={stap} aria-current={i + 1 === huidige ? "step" : undefined}>
        {i + 1}. {stap}
      </li>
    ))}
  </ol>
);

export default Stappen;
