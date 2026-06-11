import { HiBookmark, HiCheck } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import type { CollectionMenuProps } from "../../interfaces/Props.types.ts";

export const CollectionMenu = ({
                                   theme,
                                   menuRef,
                                   isMenuOpen,
                                   setIsMenuOpen,
                                   isInAnyCollection,
                                   collections,
                                   collectionItemStates,
                                   toggleCollectionItem,
                               }: CollectionMenuProps) => {
    const { t } = useTranslation();
    const isDark = theme === "dark";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`h-12 px-6 rounded-2xl font-bold text-xs flex items-center gap-2.5 border transition-all duration-300 group
                    ${isInAnyCollection
                    ? isDark
                        ? "bg-rose-500/10 border-rose-500/50 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400"
                        : "bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 hover:border-rose-400 shadow-sm"
                    : isDark
                        ? "bg-white/[0.02] border-white/10 text-white hover:bg-white/[0.06]"
                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 shadow-sm"
                }`}
            >
                <HiBookmark size={18} className="group-hover:scale-110 transition-transform" />
                <span>{t("radio.save")}</span>
                {isInAnyCollection && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-current" />
                )}
            </button>

            {isMenuOpen && (
                <div className={`absolute top-14 left-0 w-80 py-3 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200
                    ${isDark ? "bg-neutral-900 border-white/10" : "bg-white border-neutral-200"}`}
                >
                    <div className={`px-5 py-3 font-bold text-xs uppercase tracking-wider opacity-70
                        ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
                    >
                        {t("radio.myCollections")}
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {collections.length === 0 ? (
                            <div className="px-5 py-4 text-xs text-center text-neutral-500">
                                {t("radio.noCollection")}
                            </div>
                        ) : (
                            collections.map((col) => {
                                const isIn = collectionItemStates[col.id] ?? false;
                                return (
                                    <button
                                        key={col.id}
                                        onClick={() => toggleCollectionItem(col.id)}
                                        className={`w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 text-sm group
                                            ${isIn
                                            ? isDark ? "bg-rose-500/15 hover:bg-rose-500/25" : "bg-rose-50 hover:bg-rose-100"
                                            : isDark ? "hover:bg-white/5" : "hover:bg-neutral-50"
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                                            ${isIn
                                            ? isDark ? "bg-rose-500 border-rose-400" : "bg-rose-500 border-rose-600"
                                            : isDark ? "border-white/20 group-hover:border-white/40" : "border-neutral-300 group-hover:border-neutral-400"
                                        }`}
                                        >
                                            {isIn && <HiCheck size={14} className="text-white animate-in scale-in duration-200" />}
                                        </div>

                                        <span className={`flex-1 text-left font-medium transition-colors duration-200
                                            ${isIn
                                            ? isDark ? "text-rose-300" : "text-rose-700"
                                            : isDark ? "text-white" : "text-neutral-800"
                                        }`}
                                        >
                                            {col.name}
                                        </span>

                                        {isIn && <div className="w-2 h-2 rounded-full bg-rose-500/80" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
