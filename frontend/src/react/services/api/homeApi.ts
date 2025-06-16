import { ApiResponse, Exhibition, Artwork } from '../../types';
import { apiClient } from './client';

export interface FeaturedExhibitionsResponse {
    exhibitions: Exhibition[];
}

export interface FeaturedArtworksResponse {
    artworks: Artwork[];
}

export const homeApi = {
    /**
     * 주요 전시회 목록을 가져옵니다.
     */
    getFeaturedExhibitions: async (): Promise<ApiResponse<Exhibition[]>> => {
        try {
            const response = await apiClient.get<FeaturedExhibitionsResponse>('/api/exhibitions/featured');

            return {
                success: true,
                data: response.data.exhibitions,
            };
        } catch (error) {
            console.error('주요 전시회 조회 실패:', error);
            return {
                success: false,
                error: '주요 전시회를 불러오는데 실패했습니다.',
            };
        }
    },

    /**
     * 주요 작품 목록을 가져옵니다.
     */
    getFeaturedArtworks: async (): Promise<ApiResponse<Artwork[]>> => {
        try {
            const response = await apiClient.get<FeaturedArtworksResponse>('/api/artworks/featured');

            return {
                success: true,
                data: response.data.artworks,
            };
        } catch (error) {
            console.error('주요 작품 조회 실패:', error);
            return {
                success: false,
                error: '주요 작품을 불러오는데 실패했습니다.',
            };
        }
    },

    /**
     * 홈페이지 데이터를 한 번에 가져옵니다.
     */
    getHomeData: async (): Promise<{
        exhibitions: ApiResponse<Exhibition[]>;
        artworks: ApiResponse<Artwork[]>;
    }> => {
        const [exhibitions, artworks] = await Promise.all([
            homeApi.getFeaturedExhibitions(),
            homeApi.getFeaturedArtworks(),
        ]);

        return {
            exhibitions,
            artworks,
        };
    },
};

export default homeApi;
