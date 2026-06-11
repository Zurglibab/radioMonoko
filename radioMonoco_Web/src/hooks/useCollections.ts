import { useEffect, useRef, useState } from "react";
import collectionsService from "../services/CollectionsService";
import collectionItemsService from "../services/CollectionItemsService";
import type { Collection } from "../interfaces/Collections.types";

interface UseCollectionsOptions {
    dbContentId: string | null;
    currentUserId: string | null | undefined;
    isLoggedIn: boolean;
}

export const useCollections = ({ dbContentId, currentUserId, isLoggedIn }: UseCollectionsOptions) => {
    const [collections, setCollections]                 = useState<Collection[]>([]);
    const [isMenuOpen, setIsMenuOpen]                   = useState(false);
    const [collectionItemStates, setCollectionItemStates] = useState<Record<string, boolean>>({});
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !currentUserId) return;
        collectionsService.getUserCollections(currentUserId)
            .then(setCollections)
            .catch(console.error);
    }, [isLoggedIn, currentUserId]);

    useEffect(() => {
        if (!dbContentId || collections.length === 0) return;
        const check = async () => {
            const states: Record<string, boolean> = {};
            for (const col of collections) {
                try {
                    const items = await collectionItemsService.getItemsByCollection(col.id);
                    states[col.id] = items.some((item: any) => item.content_id === dbContentId);
                } catch (err) {
                    console.error(`[checkCollectionItems] collection ${col.id}:`, err);
                    states[col.id] = false;
                }
            }
            setCollectionItemStates(states);
        };
        check();
    }, [dbContentId, collections]);

    const toggleCollectionItem = async (collectionId: string) => {
        if (!dbContentId) return;
        try {
            const isIn = collectionItemStates[collectionId];
            if (isIn) {
                await collectionItemsService.deleteItemFromCollection(collectionId, dbContentId);
            } else {
                await collectionItemsService.addItemToCollection({
                    collection_id: collectionId,
                    content_id: dbContentId,
                    position: 0,
                    note: null,
                    created_at: new Date(),
                });
            }
            setCollectionItemStates(prev => ({ ...prev, [collectionId]: !isIn }));
        } catch (err) {
            console.error("[toggleCollectionItem]:", err);
        }
    };

    const isInAnyCollection = collections.length > 0 && Object.values(collectionItemStates).some(Boolean);

    return {
        collections,
        isMenuOpen,
        setIsMenuOpen,
        collectionItemStates,
        menuRef,
        toggleCollectionItem,
        isInAnyCollection,
    };
};