export interface ApiPersonality {
    relation: string;
    info: string;
    node: {
        id: string;
        name: string;
    };
}

export interface ApiDiffusion {
    id: string;
    title: string;
    url: string;
    publishedDate?: string;
    parentTitle?: string;
    podcastEpisode?: {
        id: string;
        title: string;
        url: string;
        playerUrl?: string;
    } | null;
    personalities?: ApiPersonality[];
}

export interface ApiShow {
    id: string;
    title: string;
    url?: string;
    standFirst?: string;
    diffusions: ApiDiffusion[];
    taxonomies?: any[];
}