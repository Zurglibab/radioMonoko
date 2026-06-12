import type {User} from "./Users.types.ts";
import type {Collection} from "./Collections.types.ts";
import type {RatingContent} from "./RatingContents.types.ts";
import type {Review} from "./Reviews.types.ts";


export interface ExportUserProfile {
    profile: User,
    favorites: any,
    statuses: any,
    collections: Collection[],
    ratings: RatingContent[],
    reviews: Review[],
}