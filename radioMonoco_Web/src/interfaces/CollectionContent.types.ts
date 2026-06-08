import type {CollectionItem} from "./CollectionItem.types.ts";

export interface CollectionContent {
    item: CollectionItem;
    title: string;
    description?: string;
}