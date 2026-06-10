import {memo, useRef} from "react";
import {RadioCard} from "./RadioCard.tsx";
import type {RadioListsSectionProps} from "../../interfaces/Props.types.ts";
import { useTranslation } from "react-i18next";

export const RadioListsSection = memo(({ filteredDiffusions, webRadios, localRadios, theme, matchedTheme }: RadioListsSectionProps) => {
    const { t } = useTranslation();
    const episodesRef = useRef<HTMLDivElement>(null);
    const webRef = useRef<HTMLDivElement>(null);
    const localRef = useRef<HTMLDivElement>(null);

    return (
        <div className="space-y-24 max-w-[1400px] mx-auto w-full">
            {filteredDiffusions.length > 0 && (
                <section className="space-y-6 w-full animate-fadeIn">
                    <div className={`flex items-end justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
                        <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>{t("radio.podcastsAndRecentShows")}</h3>
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>{filteredDiffusions.length} {t("radio.episodes")}</span>
                    </div>
                    <div className="relative w-full">
                        <div ref={episodesRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-none w-full snap-x snap-mandatory">
                            {filteredDiffusions.map((episode, index) => {
                                const producer = episode.personalities?.find(p => p.relation === "producer")?.node.name;
                                return (
                                <RadioCard key={`api-ep-${episode.id || index}`} id={`api-ep-${episode.id || index}`} title={episode.title} description={episode.parentTitle ? episode.parentTitle.replace(/["'«»]|<<|>>/g, "") : t("radio.showAvailableReplay")} liveStream={episode.podcastEpisode!.url} theme={theme} brandTheme={matchedTheme} isPodcast host={producer} />
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {webRadios && webRadios.length > 0 && (
                <section className="space-y-6 w-full">
                    <div className={`flex items-end justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
                        <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>{t("radio.webRadios")}</h3>
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>{webRadios.length} {t("radio.stations")}</span>
                    </div>
                    <div className="relative w-full">
                        <div ref={webRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-none w-full snap-x snap-mandatory">
                            {webRadios.map((r) => (
                                <RadioCard key={r.id} id={r.id} title={r.title} description={r.description} liveStream={r.liveStream || ""} theme={theme} brandTheme={matchedTheme} isWeb />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {localRadios && localRadios.length > 0 && (
                <section className="space-y-6 w-full">
                    <div className={`flex items-end justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
                        <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>{t("radio.regionalStations")}</h3>
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'opacity-40' : 'text-neutral-400'}`}>{localRadios.length} {t("radio.stations")}</span>
                    </div>
                    <div className="relative w-full">
                        <div ref={localRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-none w-full snap-x snap-mandatory">
                            {localRadios.map((r) => (
                                <RadioCard key={r.id} id={r.id} title={r.title} description={r.description} liveStream={r.liveStream || ""} theme={theme} brandTheme={matchedTheme} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
});