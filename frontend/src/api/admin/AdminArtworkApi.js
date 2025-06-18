/**
 * 관리자용 작품 API
 * Admin 도메인의 작품 관리 기능을 제공합니다.
 */
import api from '../../utils/api.js';
import BaseApi from '../common/BaseApi.js';

export class AdminArtworkApi extends BaseApi {
    static baseEndpoint = '/api/admin/artworks';

    // 작품 목록 조회 (관리자)
    static async getArtworkList(pagination = {}, filters = {}) {
        try {
            const params = {
                ...pagination,
                ...filters
            };

            const response = await this.get(this.baseEndpoint, params);

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
            console.error('Admin artwork list fetch error:', error);
            return this.errorResponse('작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 작품 상세 조회 (관리자)
    static async getArtworkDetail(artworkId) {
        try {
            const response = await this.get(`${this.baseEndpoint}/${artworkId}`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('Admin artwork detail fetch error:', error);
            return this.errorResponse('작품 정보를 불러오는데 실패했습니다.');
        }
    }

    // 작품 생성 (관리자)
    static async createArtwork(artworkData) {
        try {
            const response = await this.post(this.baseEndpoint, artworkData);
            return this.safeResponse(response, null, '작품이 성공적으로 생성되었습니다.');
        } catch (error) {
            console.error('Admin artwork creation error:', error);
            return this.errorResponse('작품 생성에 실패했습니다.');
        }
    }

    // 작품 수정 (관리자)
    static async updateArtwork(artworkId, artworkData) {
        try {
            const response = await this.put(`${this.baseEndpoint}/${artworkId}`, artworkData);
            return this.safeResponse(response, null, '작품 정보가 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('Admin artwork update error:', error);
            return this.errorResponse('작품 정보 수정에 실패했습니다.');
        }
    }

    // 작품 삭제 (관리자)
    static async deleteArtwork(artworkId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/${artworkId}`);
            return this.safeResponse(response, null, '작품이 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('Admin artwork deletion error:', error);
            return this.errorResponse('작품 삭제에 실패했습니다.');
        }
    }

    // 작품 상태 변경 (관리자)
    static async updateArtworkStatus(artworkId, status) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${artworkId}/status`, { status });
            return this.safeResponse(response, null, `작품 상태가 ${status}로 변경되었습니다.`);
        } catch (error) {
            console.error('Admin artwork status update error:', error);
            return this.errorResponse('작품 상태 변경에 실패했습니다.');
        }
    }

    // 주요 작품 설정 변경 (관리자)
    static async updateArtworkFeatured(artworkId, isFeatured) {
        try {
            const response = await this.patch(`${this.baseEndpoint}/${artworkId}/featured`, { isFeatured });
            return this.safeResponse(response, null, isFeatured ? '주요 작품으로 설정되었습니다.' : '주요 작품에서 해제되었습니다.');
        } catch (error) {
            console.error('Admin artwork featured update error:', error);
            return this.errorResponse('주요 작품 설정 변경에 실패했습니다.');
        }
    }

    // 작품 승인 (관리자)
    static async approveArtwork(artworkId) {
        try {
            const response = await this.post(`${this.baseEndpoint}/${artworkId}/approve`);
            return this.safeResponse(response, null, '작품이 승인되었습니다.');
        } catch (error) {
            console.error('Admin artwork approval error:', error);
            return this.errorResponse('작품 승인에 실패했습니다.');
        }
    }

    // 작품 거부 (관리자)
    static async rejectArtwork(artworkId, reason = '') {
        try {
            const response = await this.post(`${this.baseEndpoint}/${artworkId}/reject`, { reason });
            return this.safeResponse(response, null, '작품이 거부되었습니다.');
        } catch (error) {
            console.error('Admin artwork rejection error:', error);
            return this.errorResponse('작품 거부에 실패했습니다.');
        }
    }

    // 작품 이미지 업로드 (관리자)
    static async uploadArtworkImage(artworkId, imageFile) {
        try {
            const formData = this.createFormData({ image: imageFile });
            const response = await this.postFormData(`${this.baseEndpoint}/${artworkId}/image`, formData);
            return this.safeResponse(response, null, '이미지가 성공적으로 업로드되었습니다.');
        } catch (error) {
            console.error('Admin artwork image upload error:', error);
            return this.errorResponse('이미지 업로드에 실패했습니다.');
        }
    }

    // 작품 통계 조회 (관리자)
    static async getArtworkStats() {
        try {
            const response = await this.get(`${this.baseEndpoint}/stats`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('Admin artwork stats fetch error:', error);
            return this.errorResponse('작품 통계를 불러오는데 실패했습니다.');
        }
    }
}

export default AdminArtworkApi;
