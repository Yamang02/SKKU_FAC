/**
 * 전시회 API
 * 전시회 관련 API 호출을 처리합니다.
 */
import { apiClient, ApiResponse } from './client';
import { Exhibition, PaginationParams } from '../../types';

export interface ExhibitionListParams extends PaginationParams {
    type?: string;
    year?: string;
    category?: string;
    submission?: string;
    sort?: string;
    search?: string;
    searchType?: string;
}

export interface ExhibitionListResponse {
    exhibitions: Exhibition[];
    total: number;
    page: number;
    limit: number;
    pageInfo: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
}

export class ExhibitionApi {
    /**
     * 전시회 목록을 조회합니다.
     */
    static async getExhibitionList(params: ExhibitionListParams = {}): Promise<ApiResponse<ExhibitionListResponse>> {
        try {
            // 페이지네이션 파라미터
            const pageParams: string[] = [];
            if (params.page) pageParams.push(`page=${params.page}`);
            if (params.limit) pageParams.push(`limit=${params.limit || 12}`);

            // 필터 파라미터
            const filterParams: string[] = [];
            if (params.type && params.type !== 'all') filterParams.push(`type=${params.type}`);
            if (params.year && params.year !== '' && params.year !== 'all') filterParams.push(`year=${params.year}`);
            if (params.category && params.category !== 'all') filterParams.push(`category=${params.category}`);
            if (params.submission && params.submission !== 'all') filterParams.push(`submission=${params.submission}`);
            if (params.sort) filterParams.push(`sort=${params.sort}`);

            // 검색어 파라미터 - 키워드는 전시회명 검색만 처리
            if (params.search) filterParams.push(`keyword=${encodeURIComponent(params.search)}`);
            if (params.searchType) filterParams.push('searchType=title'); // 전시회명 검색으로 고정

            // 쿼리스트링 조합
            const queryParams = [...pageParams, ...filterParams].join('&');
            const queryString = queryParams ? `?${queryParams}` : '';

            console.log('전시회 목록 API 호출:', `/exhibition/api/list${queryString}`);

            const response = await apiClient.get<any>(`/exhibition/api/list${queryString}`);

            if (!response.success || !response.data) {
                throw new Error(response.error || '전시회 목록을 불러오는데 실패했습니다.');
            }

            // 응답 데이터 포맷 표준화
            const responseData = response.data;
            const result: ExhibitionListResponse = {
                exhibitions: responseData.exhibitions || [],
                total: responseData.total || 0,
                page: parseInt(params.page?.toString() || '1'),
                limit: parseInt(params.limit?.toString() || '12'),
                pageInfo: responseData.page || {
                    currentPage: parseInt(params.page?.toString() || '1'),
                    totalPages: Math.ceil((responseData.total || 0) / (parseInt(params.limit?.toString() || '12'))),
                    totalItems: responseData.total || 0
                }
            };

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error('전시회 목록을 가져오는 중 오류 발생:', error);
            return {
                success: false,
                error: '전시회 목록을 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 출품 가능한 전시회 목록을 조회합니다.
     */
    static async getSubmittableList(): Promise<ApiResponse<Exhibition[]>> {
        try {
            const response = await apiClient.get<{ exhibitions: Exhibition[] }>('/exhibition/api/submittable');

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data.exhibitions,
                };
            }

            return {
                success: false,
                error: response.error || '출품 가능한 전시회 목록을 불러오는데 실패했습니다.',
            };
        } catch (error) {
            console.error('출품 가능한 전시회 목록을 가져오는 중 오류 발생:', error);
            return {
                success: false,
                error: '출품 가능한 전시회 목록을 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 주요 전시회 목록을 조회합니다.
     */
    static async getFeaturedExhibitions(limit: number = 5): Promise<ApiResponse<Exhibition[]>> {
        try {
            const response = await apiClient.get<{ exhibitions: Exhibition[] }>(`/exhibition/api/featured?limit=${limit}`);

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data.exhibitions,
                };
            }

            return {
                success: false,
                error: response.error || '주요 전시회 목록을 불러오는데 실패했습니다.',
            };
        } catch (error) {
            console.error('주요 전시회 목록을 가져오는 중 오류 발생:', error);
            return {
                success: false,
                error: '주요 전시회 목록을 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 전시회 상세 정보를 조회합니다.
     */
    static async getExhibitionDetail(exhibitionId: string): Promise<ApiResponse<Exhibition>> {
        try {
            const response = await apiClient.get<Exhibition>(`/exhibition/api/detail/${exhibitionId}`);
            return response;
        } catch (error) {
            console.error(`전시회 상세 정보(ID: ${exhibitionId})를 가져오는 중 오류 발생:`, error);
            return {
                success: false,
                error: '전시회 정보를 불러오는데 실패했습니다.',
            };
        }
    }

    /**
     * 전시회 생성 (관리자용)
     */
    static async createExhibition(exhibitionData: Partial<Exhibition>): Promise<ApiResponse<Exhibition>> {
        try {
            const response = await apiClient.post<Exhibition>('/admin/exhibition/api/new', exhibitionData);
            return response;
        } catch (error) {
            console.error('전시회 생성 중 오류:', error);
            return {
                success: false,
                error: '전시회 생성에 실패했습니다.',
            };
        }
    }

    /**
     * 전시회 수정 (관리자용)
     */
    static async updateExhibition(exhibitionId: string, exhibitionData: Partial<Exhibition>): Promise<ApiResponse<Exhibition>> {
        try {
            const response = await apiClient.put<Exhibition>(`/admin/exhibition/api/${exhibitionId}`, exhibitionData);
            return response;
        } catch (error) {
            console.error('전시회 수정 중 오류:', error);
            return {
                success: false,
                error: '전시회 수정에 실패했습니다.',
            };
        }
    }

    /**
     * 전시회 삭제 (관리자용)
     */
    static async deleteExhibition(exhibitionId: string): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.delete<void>(`/admin/exhibition/api/${exhibitionId}`);
            return response;
        } catch (error) {
            console.error('전시회 삭제 중 오류:', error);
            return {
                success: false,
                error: '전시회 삭제에 실패했습니다.',
            };
        }
    }
}

export default ExhibitionApi;
