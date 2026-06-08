import type {ThemeColors} from "./ThemeColors.types.ts";
import type {User} from "./Users.types.ts";
import type {ApiDiffusion} from "./Shows.types.ts";
import type {Brand} from "./Brands.types.ts";

export interface RadioCardProps {
    id: string;
    title: string;
    description?: string;
    liveStream: string;
    theme: string;
    brandTheme: ThemeColors;
    isPodcast?: boolean;
    isWeb?: boolean;
    host?: string;
}

export interface StarRatingProps {
    rating: number;
    hover: number;
    onRate: (rating: number) => void;
    onHover: (rating: number) => void;
    disabled: boolean;
    theme: string;
}

export interface CommentFormProps {
    dbContentId: string;
    theme: string;
    onPostReview: (text: string) => Promise<void>;
}

export interface CommentItemProps {
    comment: any;
    usersCache: Record<string, User>;
    currentUserId: string | null;
    isLoggedIn: boolean;
    theme: string;
    onPostReply: (text: string, parentId: string) => Promise<void>;
    onDeleteReview: (reviewId: string, parentId?: string) => Promise<void>;
}

export interface RadioCommunityZoneProps {
    contentId: string;
    theme: "dark" | "light";
    currentUserId: string | null;
    loadingReviews?: boolean;
    ratingSummary?: any;
    userRating?: number;
    totalVotes?: number;
    comments?: any[];
    usersCache?: Record<string, any>;
    handleRateStation?: (rating: number) => Promise<void>;
    handleDeleteRating?: () => Promise<void>;
    onPostReview?: (text: string) => Promise<void>;
    onPostReply?: (text: string, parentId: string) => Promise<void>;
    handleDeleteReview?: (reviewId: string, parentId?: string) => Promise<void>;
    onLikeInteraction?: (reviewId: string, actionType: "like" | "dislike" | "remove") => Promise<void>;
}

export interface RadioListsSectionProps {
    filteredDiffusions: ApiDiffusion[];
    webRadios?: Brand["webRadios"];
    localRadios?: Brand["localRadios"];
    theme: string;
    matchedTheme: any;
}
