import type {ThemeColors} from "./ThemeColors.types.ts";
import type {User} from "./Users.types.ts";
import type {ApiDiffusion} from "./Shows.types.ts";
import type {Brand} from "./Brands.types.ts";
import type {Review} from "./Reviews.types.ts";
import type {RefObject} from "react";
import type {Collection} from "./Collections.types.ts";

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
    currentUser: User | null;
    isLoggedIn: boolean;
    theme: string;
    onPostReply: (text: string, parentId: string) => Promise<void>;
    onDeleteReview: (reviewId: string, parentId?: string) => Promise<void>;
}

export interface RadioCommunityZoneProps {
    contentId: string;
    theme: "dark" | "light";
    currentUser: User | null;
    loadingReviews?: boolean;
    ratingSummary?: any;
    userRating?: number;
    totalVotes?: number;
    comments?: any[];
    usersCache?: Record<string, any>;
    handleRateStation?: (rating: number) => Promise<void>;
    handleDeleteRating?: () => Promise<void>;
    onPostReview?: (text: string) => Promise<void>;
    onPostReply?: (text: string, parentId: string) => Promise<Review | null>;
    handleDeleteReview?: (reviewId: string, parentId?: string) => Promise<void>;
    onLikeInteraction?: (reviewId: string, actionType: "like" | "dislike" | "remove") => Promise<void>;
    onUpdateReview: (id: string, commentData: { comment: string; }) => Promise<Review | null>
}

export interface RadioListsSectionProps {
    filteredDiffusions: ApiDiffusion[];
    webRadios?: Brand["webRadios"];
    localRadios?: Brand["localRadios"];
    theme: string;
    matchedTheme: any;
}

export interface Message {
    id: string;
    channelId: string;
    senderId: string;
    content: string;
    createdAt: string;
}

export interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
}

export interface ChatContainerProps {
    channelId: string;
    channelName: string;
    currentUserId: string;
    onBack: () => void;
    onCloseAll: () => void;
}

export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export interface CollectionMenuProps {
    theme: string;
    menuRef: RefObject<HTMLDivElement | null>;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    isInAnyCollection: boolean;
    collections: Collection[];
    collectionItemStates: Record<string, boolean>;
    toggleCollectionItem: (collectionId: string) => void;
}

export interface EnhancedCommentItemProps extends CommentItemProps {
    onLikeInteraction: (reviewId: string, actionType: "like" | "dislike" | "remove") => Promise<void>;
    onUpdateReview: (reviewId: string, commentData: { comment: string; }) => Promise<Review | null>;
}
