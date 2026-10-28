import { UiIcon } from "./UiIcon";

export const INSTAGRAM_URL = "https://www.instagram.com/gafaspaisas.co/";

type Props = { variant?: "light" | "dark" | "solid" | "subtle"; compact?: boolean; iconOnly?: boolean; className?: string };

/** Enlace externo real, sin depender de una API o de autenticar con Instagram. */
export function InstagramLink({ variant = "light", compact = false, iconOnly = false, className = "" }: Props) {
  const variants = {
    light: "border-white/20 bg-white/10 text-white hover:bg-white/20",
    dark: "border-[#dce8f7] bg-white text-[#12325c] hover:bg-[#eef6ff]",
    solid: "border-[#1677ed] bg-[#0068e8] text-white hover:bg-[#0053c2]",
    subtle: "border-white/15 bg-white/[.055] text-[#cbdfff] hover:bg-white/15",
  };
  return <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Visitar Instagram de Gafas Paisas, @gafaspaisas.co (abre en una nueva pestaña)" className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${variants[variant]} ${iconOnly ? "!h-10 !w-10 !p-0" : ""} ${className}`}>
    <UiIcon name="instagram" size={17} />
    {!iconOnly && <span>{compact ? "Instagram" : "@gafaspaisas.co"}</span>}
    {!iconOnly && <UiIcon name="arrow-up-right" size={13} className="opacity-70" />}
  </a>;
}
