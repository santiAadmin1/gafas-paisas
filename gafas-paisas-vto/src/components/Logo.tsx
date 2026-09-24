type LogoProps = {
  /** "mark": solo el icono de gafas con skyline. "full": icono + wordmark. */
  variant?: "mark" | "full";
  /**
   * "blue": chip azul con icono blanco (sobre fondos claros).
   * "white": icono/texto azul, sin relleno (para fondos blancos).
   * "dark": icono/texto blanco, sin relleno (para fondos negros/oscuros).
   */
  theme?: "blue" | "white" | "dark";
  className?: string;
};

/**
 * Logo vectorial de Gafas Paisas: silueta de gafas con el skyline de
 * Medellín recortado dentro de los lentes, más el wordmark en script.
 * Reconstruido en SVG a partir de la identidad de marca provista.
 */
export function Logo({ variant = "full", theme = "dark", className = "" }: LogoProps) {
  const ink = theme === "blue" || theme === "dark" ? "#ffffff" : "#0b5fdb";
  const bg = theme === "blue" ? "#0b5fdb" : "transparent";

  return (
    <div className={`inline-flex items-center gap-3 no-select ${className}`}>
      <svg
        viewBox="0 0 200 100"
        className="h-9 w-auto shrink-0"
        role="img"
        aria-label="Gafas Paisas"
      >
        {bg !== "transparent" && (
          <rect x="0" y="0" width="200" height="100" rx="14" fill={bg} />
        )}
        <clipPath id="lensClip">
          <rect x="8" y="26" width="72" height="50" rx="25" />
          <rect x="120" y="26" width="72" height="50" rx="25" />
        </clipPath>

        {/* Skyline recortado dentro de los lentes */}
        <g clipPath="url(#lensClip)" fill={ink}>
          <rect x="0" y="60" width="200" height="20" />
          <rect x="10" y="50" width="14" height="30" />
          <rect x="28" y="58" width="12" height="22" />
          <rect x="44" y="44" width="16" height="36" />
          <rect x="64" y="56" width="10" height="24" />
          <rect x="86" y="40" width="14" height="40" />
          <rect x="104" y="52" width="12" height="28" />
          <rect x="120" y="60" width="10" height="20" />
          <rect x="134" y="46" width="16" height="34" />
          <rect x="154" y="58" width="12" height="22" />
          <rect x="170" y="38" width="6" height="42" />
          <rect x="167" y="34" width="12" height="6" />
          <rect x="184" y="54" width="12" height="26" />
        </g>

        {/* Montura */}
        <g fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round">
          <rect x="8" y="26" width="72" height="50" rx="25" />
          <rect x="120" y="26" width="72" height="50" rx="25" />
          <path d="M80 46 Q100 36 120 46" />
          <path d="M8 40 L-2 34" />
          <path d="M192 40 L202 34" />
        </g>
      </svg>

      {variant === "full" && (
        <span className="flex flex-col leading-none">
          <span
            className="font-script text-2xl -mb-1"
            style={{ color: ink, fontFamily: "var(--font-script)" }}
          >
            Gafas
          </span>
          <span
            className="font-sans font-extrabold tracking-wide text-lg"
            style={{ color: ink }}
          >
            PAISAS
          </span>
        </span>
      )}
    </div>
  );
}
