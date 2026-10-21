const STAPPEN = [
  "U ziet wat dit voor u betekent",
  "Wij vullen de aanvraag voor u in",
  "U controleert en dient zelf in",
] as const;

/** Waar de ondernemer is in Iemand aannemen (1 tot 4). */
const Stappen = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <ol className="mox-hiring-steps" aria-label="Stappen">
    {STAPPEN.map((stap, i) => (
      <li key={stap} aria-current={i + 1 === huidige ? "step" : undefined}>
        {i + 1}. {stap}
      </li>
    ))}
  </ol>
);

export default Stappen;
