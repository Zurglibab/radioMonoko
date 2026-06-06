import type {ThemeColors} from "../../interfaces/ThemeColors.types.ts";

export const BRAND_THEMES: Record<string, ThemeColors> = {
    FRANCEINTER:   { color: "from-[#e20134]", text: "text-[#e20134]", bgHover: "hover:bg-[#e20134]/10", borderHover: "hover:border-[#e20134]/30", glow: "rgba(226,1,52,0.25)" },
    FRANCEINFO:    { color: "from-[#ffc203]", text: "text-[#ffc203]", bgHover: "hover:bg-[#ffc203]/10", borderHover: "hover:border-[#ffc203]/30", glow: "rgba(255,194,3,0.25)" },
    FRANCEMUSIQUE: { color: "from-[#a90042]", text: "text-[#a90042]", bgHover: "hover:bg-[#a90042]/10", borderHover: "hover:border-[#a90042]/30", glow: "rgba(169,0,66,0.25)" },
    FRANCECULTURE: { color: "from-[#762b84]", text: "text-[#762b84]", bgHover: "hover:bg-[#762b84]/10", borderHover: "hover:border-[#762b84]/30", glow: "rgba(118,43,132,0.25)" },
    MOUV:          { color: "from-[#00FB8E]", text: "text-[#00FB8E]", bgHover: "hover:bg-[#00FB8E]/10", borderHover: "hover:border-[#00FB8E]/30", glow: "rgba(0,251,142,0.25)" },
    FIP:           { color: "from-[#e2007a]", text: "text-[#e2007a]", bgHover: "hover:bg-[#e2007a]/10", borderHover: "hover:border-[#e2007a]/30", glow: "rgba(226,0,122,0.25)" },
    FRANCEBLEU:    { color: "from-[#0078d8]", text: "text-[#0078d8]", bgHover: "hover:bg-[#0078d8]/10", borderHover: "hover:border-[#0078d8]/30", glow: "rgba(0,120,216,0.25)" },
};