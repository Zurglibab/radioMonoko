export interface Brand {
    id: string;
    title: string;
    baseline: string | null;
    description: string;
    websiteUrl: string;
    playerUrl: string | null;
    liveStream: string | null;
    createdAt?: string;
    updatedAt?: string;
    webRadios?: Brand[];
    localRadios?: Brand[];
}