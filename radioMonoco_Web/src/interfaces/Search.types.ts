import type {ApiShow} from "./Shows.types.ts";
import type { User } from "./Users.types.ts";
import type {Collection} from "./Collections.types.ts";

export interface SearchResult {
    users: User[];
    collections: Collection[];
    shows: ApiShow[];
}

export interface SearchFilters{
    genre?: string;
    year?: string;
    author?: string;
}