export interface Exhibition {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    exhibitionType: string;
    imageUrl: string | null;
    imagePublicId: string | null;
    location: string;
    artists: string[];
    artworkCount: number;
    isActive: boolean;
    isSubmissionOpen: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExhibitionSimple {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    exhibitionType: string;
    location: string;
    isActive: boolean;
    isSubmissionOpen: boolean;
    isFeatured: boolean;
}

export interface CreateExhibitionRequest {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    exhibitionType: string;
    location: string;
    isActive?: boolean;
    isSubmissionOpen?: boolean;
    isFeatured?: boolean;
}

export interface UpdateExhibitionRequest {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    exhibitionType?: string;
    location?: string;
    isActive?: boolean;
    isSubmissionOpen?: boolean;
    isFeatured?: boolean;
}

export interface ExhibitionListResponse {
    exhibitions: ExhibitionSimple[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ExhibitionFilters {
    exhibitionType?: string;
    location?: string;
    isActive?: boolean;
    isSubmissionOpen?: boolean;
    isFeatured?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
}
