import type {RadioCardProps} from "../../interfaces/Props.types.ts";
import {type Radio, useRadio} from "../../context/RadioContext.tsx";
import {HiOutlinePause, HiOutlinePlay} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

export const RadioCard = ({ title, description, liveStream, theme, brandTheme, isPodcast, isWeb, host }: RadioCardProps) => {
    const { playRadio, isPlaying, currentRadio } = useRadio();
    const { t } = useTranslation();

    const cleanTitle = title
        .replace(/^ICI\s+/, "")
        .replace(/["'«»]|<<|>>/g, "")
        .trim();

    const radioInfo: Radio = {
        name: cleanTitle,
        desc: description || (isPodcast ? t("radio.podcast") : isWeb ? t("radio.webRadio") : t("radio.localRadio")),
        img: "",
        currentShow: cleanTitle,
        host: host || "",
        streamUrl: liveStream,
    };

    const isActive = currentRadio?.streamUrl === radioInfo.streamUrl && isPlaying;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!liveStream) return;

        if (isPodcast && !liveStream.match(/\.(mp3|m3u8|aac|wav)(\?.*)?$/i)) {
            window.open(liveStream, "_blank");
        } else {
            playRadio(radioInfo);
        }
    };

    const initials = cleanTitle.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    const colorHex = brandTheme.text.match(/\[(.*?)\]/)?.[1] || "#f43f5e";

    return (
        <div
            onClick={handleClick}
            className={`group relative w-56 h-72 rounded-[2.2rem] overflow-hidden p-6 flex flex-col justify-between transition-all duration-500 cursor-pointer snap-start flex-shrink-0 border select-none
                ${isActive
                ? "border-current"
                : theme === "dark"
                    ? "bg-neutral-900/40 border-white/[0.03] shadow-md"
                    : "bg-white border-neutral-200/60 shadow-sm hover:shadow-md"
            }
                ${theme === "dark" ? brandTheme.borderHover : "hover:border-neutral-300"}
                ${isActive ? brandTheme.text : ""}`}
            style={{
                borderColor: isActive ? colorHex : undefined
            }}
        >
            <div
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br via-transparent to-transparent"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${colorHex}15, transparent, transparent)` }}
            />

            <div className="flex items-start justify-between relative z-10 w-full">
                <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md border max-w-[65%] truncate
                    ${theme === "dark" ? "bg-white/5 border-white/10 text-white/60" : "bg-neutral-100 border-neutral-200 text-neutral-600"}`}>
                    {isPodcast ? t("radio.podcast") : isWeb ? t("radio.digital") : t("radio.studio")}
                </span>

                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-md shadow-md shrink-0
                        ${isActive
                        ? "text-white scale-100 opacity-100"
                        : theme === "dark"
                            ? "bg-white/10 text-white scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                            : "bg-neutral-100 text-neutral-700 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                    }`}
                    style={{ backgroundColor: isActive ? colorHex : undefined }}
                >
                    {isActive ? <HiOutlinePause size={16} /> : <HiOutlinePlay size={16} className="ml-0.5" />}
                </div>
            </div>

            <div className="space-y-4 relative z-10 w-full">
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black tracking-tighter shadow-inner transition-all duration-500 group-hover:scale-105
                        ${theme === "dark" ? "bg-white/5 border border-white/5" : "bg-neutral-100 border border-neutral-200/50 text-neutral-700"}`}
                    style={{
                        backgroundColor: isActive ? `${colorHex}20` : undefined,
                        borderColor: isActive ? `${colorHex}30` : undefined,
                        color: isActive ? colorHex : undefined
                    }}
                >
                    {initials}
                </div>

                <div className="space-y-1 w-full">
                    <h4
                        className={`text-[15px] font-bold tracking-tight truncate transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}
                        style={{ color: isActive ? colorHex : undefined }}
                    >
                        {cleanTitle}
                    </h4>
                    <p className={`text-[11px] line-clamp-2 leading-relaxed font-medium min-h-[2rem] ${theme === 'dark' ? 'text-neutral-400 opacity-40' : 'text-neutral-500'}`}>
                        {description || t("radio.streamAvailableOnDemand")}
                    </p>
                </div>
            </div>
        </div>
    );
};