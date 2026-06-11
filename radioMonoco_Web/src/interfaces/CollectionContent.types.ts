import type {CollectionItem} from "./CollectionItem.types.ts";

export interface CollectionContent {
    item: CollectionItem;
    title: string;
    description?: string;
    url?: string;
    external_api_id?: string;
    targetType?: "show" | "radio" | "unknown";
}