import BaseApi from '../common/BaseApi.js';

export class AdminExhibitionApi extends BaseApi {
    static baseEndpoint = '/api/admin/exhibitions';

    // 전시 목록 조회 (관리자)
    static async getExhibitionList(pagination = {}, filters = {}) {
        try {
            const params = {
                ...pagination,
                ...filters
            };

            const response = await this.get(this.baseEndpoint, params);

            return this.safeResponse(response, {
                data: {
                    exhibitions: response.data?.items || [],
                    total: response.data?.total || 0,
                    page: {
                        currentPage: response.data?.page || 1,
                        totalPages: response.data?.totalPages || 1,
                        hasNextPage: response.data?.hasNextPage || false,
                        hasPreviousPage: response.data?.hasPreviousPage || false
                    }
                }
            });
        } catch (error) {
            console.error('Admin exhibition list fetch error:', error);
            return this.errorResponse('전시 목록을 불러오는데 실패했습니다.');
        }
    }

    // 전시 상세 조회 (관리자)
    static async getExhibitionDetail(exhibitionId) {
        try {
            const response = await this.get(`${this.baseEndpoint}/${exhibitionId}`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('Admin exhibition detail fetch error:', error);
            return this.errorResponse('전시 정보를 불러오는데 실패했습니다.');
        }
    }

    // 전시 생성 (관리자)
    static async createExhibition(exhibitionData) {
        try {
            const response = await this.post(this.baseEndpoint, exhibitionData);
            return this.safeResponse(response, null, '전시가 성공적으로 생성되었습니다.');
        } catch (error) {
            console.error('Admin exhibition creation error:', error);
            return this.errorResponse('전시 생성에 실패했습니다.');
        }
    }

    // 전시 수정 (관리자)
    static async updateExhibition(exhibitionId, exhibitionData) {
        try {
            const response = await this.put(`${this.baseEndpoint}/${exhibitionId}`, exhibitionData);
            return this.safeResponse(response, null, '전시 정보가 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('Admin exhibition update error:', error);
            return this.errorResponse('전시 정보 수정에 실패했습니다.');
        }
    }

    // 전시 삭제 (관리자)
    static async deleteExhibition(exhibitionId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/${exhibitionId}`);
            return this.safeResponse(response, null, '전시가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('Admin exhibition deletion error:', error);
            return this.errorResponse('전시 삭제에 실패했습니다.');
        }
    }

    // 전시 상태 변경 (관리자)
    static async updateExhibitionStatus(exhibitionId, status) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${exhibitionId}/status`, { status });
            return this.safeResponse(response, null, `전시 상태가 ${status}로 변경되었습니다.`);
        } catch (error) {
            console.error('Admin exhibition status update error:', error);
            return this.errorResponse('전시 상태 변경에 실패했습니다.');
        }
    }

    // 주요 전시 설정 변경 (관리자)
    static async updateExhibitionFeatured(exhibitionId, isFeatured) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${exhibitionId}/featured`, { isFeatured });
            return this.safeResponse(response, null, isFeatured ? '주요 전시로 설정되었습니다.' : '주요 전시에서 해제되었습니다.');
        } catch (error) {
            console.error('Admin exhibition featured update error:', error);
            return this.errorResponse('주요 전시 설정 변경에 실패했습니다.');
        }
    }

    // 전시 공개/비공개 설정 (관리자)
    static async updateExhibitionVisibility(exhibitionId, isPublic) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${exhibitionId}/visibility`, { isPublic });
            return this.safeResponse(response, null, isPublic ? '전시가 공개되었습니다.' : '전시가 비공개되었습니다.');
        } catch (error) {
            console.error('Admin exhibition visibility update error:', error);
            return this.errorResponse('전시 공개/비공개 설정 변경에 실패했습니다.');
        }
    }

    // 전시 작품 신청 마감/연장 (관리자)
    static async toggleSubmissionStatus(exhibitionId, isSubmissionOpen) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${exhibitionId}/submission`, { isSubmissionOpen });
            return this.safeResponse(response, null, isSubmissionOpen ? '작품 신청이 열렸습니다.' : '작품 신청이 마감되었습니다.');
        } catch (error) {
            console.error('Admin exhibition submission toggle error:', error);
            return this.errorResponse('작품 신청 상태 변경에 실패했습니다.');
        }
    }

    // 전시 참여 작품 목록 조회 (관리자)
    static async getExhibitionArtworks(exhibitionId, pagination = {}, filters = {}) {
        try {
            const params = {
                ...pagination,
                ...filters
            };

            const response = await this.get(`${this.baseEndpoint}/${exhibitionId}/artworks`, params);

            return this.safeResponse(response, {
                data: {
                    artworks: response.data?.items || [],
                    total: response.data?.total || 0,
                    page: {
                        currentPage: response.data?.page || 1,
                        totalPages: response.data?.totalPages || 1,
                        hasNextPage: response.data?.hasNextPage || false,
                        hasPreviousPage: response.data?.hasPreviousPage || false
                    }
                }
            });
        } catch (error) {
            console.error('Admin exhibition artworks fetch error:', error);
            return this.errorResponse('전시 참여 작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 전시에 작품 추가 (관리자)
    static async addArtworkToExhibition(exhibitionId, artworkId) {
        try {
            const response = await this.post(`${this.baseEndpoint}/${exhibitionId}/artworks`, { artworkId });
            return this.safeResponse(response, null, '작품이 전시에 성공적으로 추가되었습니다.');
        } catch (error) {
            console.error('Admin exhibition artwork addition error:', error);
            return this.errorResponse('전시에 작품 추가에 실패했습니다.');
        }
    }

    // 전시에서 작품 제거 (관리자)
    static async removeArtworkFromExhibition(exhibitionId, artworkId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/${exhibitionId}/artworks/${artworkId}`);
            return this.safeResponse(response, null, '작품이 전시에서 성공적으로 제거되었습니다.');
        } catch (error) {
            console.error('Admin exhibition artwork removal error:', error);
            return this.errorResponse('전시에서 작품 제거에 실패했습니다.');
        }
    }

    // 전시 통계 조회 (관리자)
    static async getExhibitionStats() {
        try {
            const response = await this.get(`${this.baseEndpoint}/stats`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('Admin exhibition stats fetch error:', error);
            return this.errorResponse('전시 통계를 불러오는데 실패했습니다.');
        }
    }

    // 특정 전시 통계 조회 (관리자)
    static async getExhibitionDetailStats(exhibitionId) {
        try {
            const response = await this.get(`${this.baseEndpoint}/${exhibitionId}/stats`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('Admin exhibition detail stats fetch error:', error);
            return this.errorResponse('전시 상세 통계를 불러오는데 실패했습니다.');
        }
    }
}

export default AdminExhibitionApi;
