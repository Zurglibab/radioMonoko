import type {ApiShow} from "./Shows.types.ts";
import type {User} from "../context/AuthContext.tsx";
import type {Collection} from "./Collections.types.ts";

export interface SearchResult {
    users: User[];
    collections: Collection[];
    shows: ApiShow[];
}