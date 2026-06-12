import {useParams} from "react-router-dom"
import { useEffect, useState } from "react"
import CollectionsService from "../../services/CollectionsService.ts";
import type { Collection } from "../../interfaces/Collections.types.ts";
import { useNavigate } from "react-router-dom";
import CollectionItemsService from "../../services/CollectionItemsService.ts";
import type {CollectionItem} from "../../interfaces/CollectionItem.types.ts";
import contentsService from "../../services/ContentsService.ts";
import type {CollectionContent} from "../../interfaces/CollectionContent.types.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import SearchService from "../../services/SearchService.ts";
import {useTranslation} from "react-i18next";
import BrandsService from "../../services/BrandsService.ts";
import {useAppearance} from "../../context/AppearanceContext.tsx";

const CollectionsDetails = () => {
    const { id } = useParams()
    const {user} = useAuth()
    const [collection, setCollection] = useState<Collection | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [items, setItems] = useState<CollectionItem[]>([])
    const [contentDetails, setContentDetails] = useState<Record<string, CollectionContent>>({})
    const navigate = useNavigate()
    const isOwner = user?.id === collection?.user_id
    const {t} = useTranslation();
    const {theme} = useAppearance();

    type CollectionTarget = { type: "show" | "radio" | "unknown"; path?: string; }

    const getExternalId = (content: any): string | undefined => {
        return (
            content.external_api_id ||
            content.externalApiId ||
            content.external_id ||
            content.brand_id ||
            content.radio_id ||
            content.station ||
            content.id_api
        );
    };

    const resolveTargetFromContent = async (content: any): Promise<CollectionTarget> => {
        const externalId = getExternalId(content);
        if (content.url) {
            return {
                type: "show",
                path: `/show/${encodeURIComponent(content.url)}`
            };
        }

        if (content.external_url) {
            return {
                type: "show",
                path: `/show/${encodeURIComponent(content.external_url)}`
            };
        }

        try {
            const brands = await BrandsService.getAllBrands();
            const radioMatch = brands.find((brand: any) => {
                const brandId = brand.id?.toLowerCase();
                const brandTitle = brand.title?.toLowerCase();
                const contentTitle = content.title?.toLowerCase();
                const contentExternalId = externalId?.toLowerCase();

                return (
                    brandId === contentExternalId ||
                    brandTitle === contentTitle ||
                    brandId === contentTitle
                );
            });

            if (radioMatch) {
                return {
                    type: "radio",
                    path: `/radio/${radioMatch.id}`
                };
            }
        } catch (err) {
            console.error("Erreur résolution radio depuis collection :", err);
        }

        if (content.title) {
            const shows = await SearchService.searchShows(content.title);
            const showMatch = shows.find((show: any) => show.url);

            if (showMatch?.url) {
                return {
                    type: "show",
                    path: `/show/${encodeURIComponent(showMatch.url)}`
                };
            }
        }
        return {
            type: "unknown"
        };
    };

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                if (!id) return;
                const data = await CollectionsService.getCollectionById(id);
                setCollection(data);
                const itemsData = await CollectionItemsService.getItemsByCollection(id);
                setItems(itemsData);
                console.log("ITEMS :", itemsData);

                const detailsEntries = await Promise.all(
                    itemsData.map(async (item) => {
                        const content = await contentsService.getContentById(item.content_id);
                        if (!content) return null;
                        const resolvedUrl = await resolveTargetFromContent(content);
                        return [
                            item.content_id,
                            {
                                item,
                                title: content.title,
                                description: content.description || "",
                                url: resolvedUrl.path,
                                targetType: resolvedUrl.type
                            }
                        ] as const;
                    })
                );
                const details = Object.fromEntries(detailsEntries.filter(Boolean) as [string, CollectionContent][]);
                setContentDetails(details);
            } catch (err) {
                console.error("Erreur lors de la récupération de la collection :", err);
                setError(t("collections.errors.loadSingle"));
            } finally {
                setLoading(false)
            }
        };
        fetchCollection()
    }, [id]);

    const handleDeleteItem = async (contentId: string) => {
        if (!id) return;
        try {
            await CollectionItemsService.deleteItemFromCollection(id, contentId);
            setItems((prev) => prev.filter((item) => item.content_id !== contentId));
            setContentDetails((prev) => {
                const copy = {...prev};
                delete copy[contentId];
                return copy;
            });
        } catch (err) {
            console.error("Erreur lors de la suppression de l'élément :", err);
            setError(t("collections.errors.deleteItem"));
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>
                <p>{t("collections.loadingSingle")}</p>
            </div>
        );
    }
    if (error || !collection) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>
                <p>{error || t("collections.errors.notFound")}</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen px-6 md:px-12 py-24 ${theme === "dark" ? "bg-app-bg text-app-text" : "bg-neutral-50 text-neutral-800"}`}>

            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/collections')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
                        theme === "dark"
                            ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                            : "bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-sm"
                    }`}
            >
                    {t("collections.details.back")}
                </button>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-rose-500/30 to-blue-500/20 border border-white/10" />
                    <div>
                        <p className="uppercase tracking-[0.2em] text-neutral-500 text-xs font-bold mb-3">
                            {t("collections.details.label")}
                        </p>
                        <h1 className={`text-5xl md:text-7xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                            {collection.name}
                        </h1>

                        <p className={`mt-6 max-w-2xl ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                            {collection.description || t("collections.noDescription")}
                        </p>

                        <div className="flex items-center gap-4 mt-6">
                            <span className="text-sm text-neutral-600">
                                {new Date(collection.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-neutral-500">
                                {collection.is_public ? t("collections.details.publicBadge") : t("collections.details.privateBadge")}
                            </span>
                            <span className="text-sm text-rose-400">
                                {items.length > 1 ? t("collections.details.itemCountPlural", { count: items.length }) : t("collections.details.itemCount", { count: items.length })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`rounded-3xl p-8 border ${
                theme === "dark"
                    ? "bg-neutral-900/40 border-white/5"
                    : "bg-white border-neutral-200 shadow-sm"
            }`}>
                <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                    {t("collections.details.content")}
                </h2>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                            {t("collections.details.empty")}
                        </p>

                        <p className="text-neutral-500 mt-2">
                            {t("collections.details.emptyHint")}
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-6 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                        >
                            {t("collections.details.searchShow")}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={contentDetails[item.content_id]?.title || item.content_id}
                                onClick={() => {
                                    const content = contentDetails[item.content_id];

                                    if (content?.url) {
                                        navigate(content.url);
                                    }
                                }}
                                className={`rounded-xl p-4 flex justify-between items-center cursor-pointer transition border ${
                                    theme === "dark"
                                        ? "bg-neutral-800 border-white/5 hover:bg-neutral-700"
                                        : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                                }`}
                            >
                                <div>
                                    <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                                        {contentDetails[item.content_id]?.title || item.content_id}
                                    </p>
                                    <p className="text-neutral-500 text-sm">
                                        {t("collections.details.position", { pos: item.position })}
                                    </p>
                                    {contentDetails[item.content_id]?.description && (
                                        <p className="text-neutral-400 mt-2">
                                            {contentDetails[item.content_id].description}
                                        </p>
                                    )}
                                    {contentDetails[item.content_id]?.url && (
                                        <p className="text-rose-400 text-xs mt-2">
                                            {contentDetails[item.content_id]?.targetType === "radio"
                                                ? t("collections.details.viewRadio", "Voir la page radio →")
                                                : t("collections.details.viewShow")}
                                        </p>
                                    )}
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={(e) =>{
                                            e.stopPropagation();
                                            handleDeleteItem(item.content_id)
                                        }}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                    {t("collections.delete")}
                                </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionsDetails