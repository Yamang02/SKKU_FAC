export interface Artwork {
    id: string;
    title: string;
    slug: string;
    medium: string;
    size: string;
    year: string;
    description: string;
    imageUrl: string;
    isFeatured: boolean;
    userId: string;
    artistName: string;
    artistAffiliation: string;
    RepresentativeExhibitionexhibitionId: string | null;
    exhibitions: Exhibition[];
    relatedArtworks: Artwork[];
    submittableExhibitions: Exhibition[];
}

export interface ArtworkSimple {
    id: string;
    title: string;
    slug: string;
    medium: string;
    size: string;
    year: string;
    imageUrl: string;
    artistName: string;
    artistAffiliation: string;
    isFeatured: boolean;
}

export interface CreateArtworkRequest {
    title: string;
    medium: string;
    size: string;
    year: string;
    description: string;
    artistName: string;
    artistAffiliation: string;
    isFeatured?: boolean;
}

export interface UpdateArtworkRequest {
    title?: string;
    medium?: string;
    size?: string;
    year?: string;
    description?: string;
    artistName?: string;
    artistAffiliation?: string;
    isFeatured?: boolean;
}

export interface ArtworkListResponse {
    artworks: ArtworkSimple[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ArtworkFilters {
    artistName?: string;
    artistAffiliation?: string;
    year?: string;
    medium?: string;
    isFeatured?: boolean;
    search?: string;
}

// Exhibition 타입을 임포트하기 위한 타입 참조
interface Exhibition {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
}
