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
}
export type CreateBrandInput = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBrandInput = Partial<CreateBrandInput>;