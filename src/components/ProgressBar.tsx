/**
 * Voortgangsbalk. Met value toont hij hoe ver iets is; zonder value is de
 * duur onbekend en loopt er een stuk balk heen en weer (zoals bij laden).
 * In een info-melding krijgt de balk de kleur van die melding (mox.css).
 */
const ProgressBar = ({
  label,
  value,
  max = 100,
  valueText,
}: {
  /** Toegankelijke naam, bijvoorbeeld "Berichten ophalen". */
  label: string;
  /** Huidige waarde; leeg laten als de duur onbekend is. */
  value?: number;
  max?: number;
  /** Wat een schermlezer voorleest, bijvoorbeeld "3 van 14 organisaties". */
  valueText?: string;
}) => {
  const bepaald = value !== undefined;
  const procent = bepaald && max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={bepaald ? 0 : undefined}
      aria-valuemax={bepaald ? max : undefined}
      aria-valuenow={bepaald ? value : undefined}
      aria-valuetext={bepaald ? valueText : undefined}
      className={`mox-progressbar${bepaald ? "" : " mox-progressbar--indeterminate"}`}
    >
      <div
        className="mox-progressbar-track"
        style={bepaald ? { inlineSize: `${procent}%` } : undefined}
      />
    </div>
  );
};

export default ProgressBar;
