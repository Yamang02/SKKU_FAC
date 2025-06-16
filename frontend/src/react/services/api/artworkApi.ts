/**
 * 작품 관련 API
 */
import { apiClient, ApiResponse } from './client';
import { Artwork, PaginationParams } from '../../types';

export interface ArtworkListResponse {
    artworks: Artwork[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ArtworkFilters {
    exhibition?: string;
    artist?: string;
    medium?: string;
    year?: string;
    search?: string;
    searchType?: string;
    sort?: string;
}

export class ArtworkApi {
    /**
     * 작품 목록 조회
     */
    static async getArtworkList(
        pagination: PaginationParams,
        filters: ArtworkFilters = {}
    ): Promise<ApiResponse<ArtworkListResponse>> {
        try {
            // 페이지네이션 파라미터
            const pageParams = new URLSearchParams();
            if (pagination.page) pageParams.append('page', pagination.page.toString());
            if (pagination.limit) pageParams.append('limit', pagination.limit.toString());

            // 필터 파라미터
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    pageParams.append(key, value.toString());
                }
            });

            const queryString = pageParams.toString();
            const url = `/artwork/api/list${queryString ? `?${queryString}` : ''}`;

            console.log('작품 목록 API 호출:', url);
            const response = await apiClient.get<ArtworkListResponse>(url);
            console.log('작품 목록 API 응답:', response);

            return response;
        } catch (error) {
            console.error('작품 목록을 가져오는 중 오류 발생:', error);
            return {
                success: false,
                error: '작품 목록을 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 추천 작품 목록 조회
     */
    static async getFeaturedArtworks(): Promise<ApiResponse<Artwork[]>> {
        try {
            const response = await apiClient.get<{ artworks: Artwork[] }>('/artwork/api/featured');

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data.artworks,
                };
            }

            return {
                success: false,
                error: response.error || '추천 작품 목록을 불러오는데 실패했습니다.',
            };
        } catch (error) {
            console.error('추천 작품 목록을 가져오는 중 오류 발생:', error);
            return {
                success: false,
                error: '추천 작품 목록을 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 작품 상세 정보 조회
     */
    static async getArtworkDetail(artworkSlug: string): Promise<ApiResponse<Artwork>> {
        try {
            const response = await apiClient.get<Artwork>(`/artwork/api/detail/${artworkSlug}`);
            return response;
        } catch (error) {
            console.error(`작품 상세 정보(ID: ${artworkSlug})를 가져오는 중 오류 발생:`, error);
            return {
                success: false,
                error: '작품 정보를 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 관리자용 작품 목록 조회
     */
    static async getArtworkManagementList(
        pagination: PaginationParams,
        filters: ArtworkFilters = {}
    ): Promise<ApiResponse<ArtworkListResponse>> {
        try {
            const pageParams = new URLSearchParams();
            if (pagination.page) pageParams.append('page', pagination.page.toString());
            if (pagination.limit) pageParams.append('limit', pagination.limit.toString());

            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    pageParams.append(key, value.toString());
                }
            });

            const queryString = pageParams.toString();
            const url = `/admin/management/artwork/list${queryString ? `?${queryString}` : ''}`;

            return await apiClient.get<ArtworkListResponse>(url);
        } catch (error) {
            console.error('관리자용 작품 목록을 가져오는 중 오류 발생:', error);
            return {
                success: false,
                error: '작품 목록을 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 작품 등록
     */
    static async createArtwork(formData: FormData): Promise<ApiResponse<Artwork>> {
        try {
            // FormData 내용 로깅 (개발 목적)
            if (process.env.NODE_ENV === 'development') {
                for (const [key, value] of formData.entries()) {
                    if (key === 'image' && value instanceof File) {
                        console.log('이미지 파일:', value.name, value.type, value.size + 'bytes');
                    } else {
                        console.log(key + ':', value);
                    }
                }
            }

            const response = await apiClient.post<Artwork>('/artwork/api/new', formData);

            if (!response) {
                throw new Error('유효하지 않은 서버 응답입니다.');
            }

            return response;
        } catch (error) {
            console.error('작품 등록 중 오류:', error);
            return {
                success: false,
                error: '작품 등록에 실패했습니다.',
            };
        }
    }

    /**
     * 작품 수정
     */
    static async updateArtwork(artworkId: string, updatedData: Partial<Artwork>): Promise<ApiResponse<Artwork>> {
        try {
            const response = await apiClient.put<Artwork>(`/artwork/api/${artworkId}`, updatedData);
            console.log('작품 수정 API 응답:', response);
            return response;
        } catch (error) {
            console.error('작품 수정 중 오류:', error);
            return {
                success: false,
                error: '작품 정보 수정에 실패했습니다.',
            };
        }
    }

    /**
     * 작품 삭제
     */
    static async deleteArtwork(artworkId: string): Promise<ApiResponse<void>> {
        try {
            console.log('작품 삭제 API 호출 시작');
            const response = await apiClient.delete<void>(`/artwork/api/${artworkId}`);
            console.log('작품 삭제 API 응답:', response);
            return response;
        } catch (error) {
            console.error('작품 삭제 중 오류:', error);
            return {
                success: false,
                error: '작품 삭제에 실패했습니다.',
            };
        }
    }

    /**
     * 출품하기
     */
    static async submitArtworkToExhibition(
        artworkId: string,
        exhibitionId: string
    ): Promise<ApiResponse<void>> {
        try {
            return await apiClient.post<void>('/artwork/api/exhibiting', {
                artworkId,
                exhibitionId,
            });
        } catch (error) {
            console.error('출품 중 오류:', error);
            return {
                success: false,
                error: '출품에 실패했습니다.',
            };
        }
    }

    /**
     * 출품 취소하기
     */
    static async cancelArtworkSubmission(
        artworkId: string,
        exhibitionId: string
    ): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(`/artwork/api/exhibiting/${artworkId}/${exhibitionId}`);
        } catch (error) {
            console.error('출품 취소 중 오류:', error);
            return {
                success: false,
                error: '출품 취소에 실패했습니다.',
            };
        }
    }
}

export default ArtworkApi;
