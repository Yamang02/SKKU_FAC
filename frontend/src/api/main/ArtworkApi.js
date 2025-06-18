/**
 * 일반 사용자용 작품 API
 * Main 도메인의 작품 관련 기능을 제공합니다.
 */
import api from '../../utils/api.js';
import BaseApi from '../common/BaseApi.js';

export class ArtworkApi extends BaseApi {
    static baseEndpoint = '/api/artworks';

    // 작품 목록 조회 (일반 - 공개된 작품들)
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
            console.error('Artwork list fetch error:', error);
            return this.errorResponse('작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 작품 상세 조회 (일반)
    static async getArtworkDetail(artworkId) {
        try {
            const response = await this.get(`${this.baseEndpoint}/${artworkId}`);
            return this.safeResponse(response);
        } catch (error) {
            console.error('Artwork detail fetch error:', error);
            return this.errorResponse('작품 정보를 불러오는데 실패했습니다.');
        }
    }

    // 작품 등록 (일반 사용자)
    static async submitArtwork(artworkData) {
        try {
            const response = await this.post(`${this.baseEndpoint}/submit`, artworkData);
            return this.safeResponse(response, null, '작품이 성공적으로 제출되었습니다.');
        } catch (error) {
            console.error('Artwork submission error:', error);
            return this.errorResponse('작품 제출에 실패했습니다.');
        }
    }

    // 내 작품 목록 조회
    static async getMyArtworks(pagination = {}, filters = {}) {
        try {
            const params = {
                ...pagination,
                ...filters
            };

            const response = await this.get(`${this.baseEndpoint}/my`, params);

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
            console.error('My artworks fetch error:', error);
            return this.errorResponse('내 작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 내 작품 수정
    static async updateMyArtwork(artworkId, artworkData) {
        try {
            const response = await this.put(`${this.baseEndpoint}/my/${artworkId}`, artworkData);
            return this.safeResponse(response, null, '작품 정보가 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('My artwork update error:', error);
            return this.errorResponse('작품 정보 수정에 실패했습니다.');
        }
    }

    // 내 작품 삭제
    static async deleteMyArtwork(artworkId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/my/${artworkId}`);
            return this.safeResponse(response, null, '작품이 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('My artwork deletion error:', error);
            return this.errorResponse('작품 삭제에 실패했습니다.');
        }
    }

    // 작품 좋아요
    static async likeArtwork(artworkId) {
        try {
            const response = await this.post(`${this.baseEndpoint}/${artworkId}/like`);
            return this.safeResponse(response, null, '작품을 좋아요했습니다.');
        } catch (error) {
            console.error('Artwork like error:', error);
            return this.errorResponse('좋아요 처리에 실패했습니다.');
        }
    }

    // 작품 좋아요 취소
    static async unlikeArtwork(artworkId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/${artworkId}/like`);
            return this.safeResponse(response, null, '좋아요를 취소했습니다.');
        } catch (error) {
            console.error('Artwork unlike error:', error);
            return this.errorResponse('좋아요 취소에 실패했습니다.');
        }
    }

    // 작품 즐겨찾기 추가
    static async addToFavorites(artworkId) {
        try {
            const response = await this.post(`${this.baseEndpoint}/${artworkId}/favorite`);
            return this.safeResponse(response, null, '즐겨찾기에 추가되었습니다.');
        } catch (error) {
            console.error('Add to favorites error:', error);
            return this.errorResponse('즐겨찾기 추가에 실패했습니다.');
        }
    }

    // 작품 즐겨찾기 제거
    static async removeFromFavorites(artworkId) {
        try {
            const response = await this.delete(`${this.baseEndpoint}/${artworkId}/favorite`);
            return this.safeResponse(response, null, '즐겨찾기에서 제거되었습니다.');
        } catch (error) {
            console.error('Remove from favorites error:', error);
            return this.errorResponse('즐겨찾기 제거에 실패했습니다.');
        }
    }

    // 내 즐겨찾기 목록 조회
    static async getMyFavorites(pagination = {}) {
        try {
            const params = pagination;

            const response = await this.get(`${this.baseEndpoint}/favorites`, params);

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
            console.error('My favorites fetch error:', error);
            return this.errorResponse('즐겨찾기 목록을 불러오는데 실패했습니다.');
        }
    }

    // 작품 이미지 업로드
    static async uploadArtworkImage(artworkId, imageFile) {
        try {
            const formData = this.createFormData({ image: imageFile });
            const response = await this.postFormData(`${this.baseEndpoint}/${artworkId}/image`, formData);
            return this.safeResponse(response, null, '이미지가 성공적으로 업로드되었습니다.');
        } catch (error) {
            console.error('Artwork image upload error:', error);
            return this.errorResponse('이미지 업로드에 실패했습니다.');
        }
    }

    // 주요 작품 목록 조회
    static async getFeaturedArtworks(limit = 10) {
        try {
            const response = await this.get(`${this.baseEndpoint}/featured`, { limit });
            return this.safeResponse(response);
        } catch (error) {
            console.error('Featured artworks fetch error:', error);
            return this.errorResponse('주요 작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 최근 작품 목록 조회
    static async getRecentArtworks(limit = 10) {
        try {
            const response = await this.get(`${this.baseEndpoint}/recent`, { limit });
            return this.safeResponse(response);
        } catch (error) {
            console.error('Recent artworks fetch error:', error);
            return this.errorResponse('최근 작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 인기 작품 목록 조회
    static async getPopularArtworks(limit = 10) {
        try {
            const response = await this.get(`${this.baseEndpoint}/popular`, { limit });
            return this.safeResponse(response);
        } catch (error) {
            console.error('Popular artworks fetch error:', error);
            return this.errorResponse('인기 작품 목록을 불러오는데 실패했습니다.');
        }
    }

    // 하위 호환성을 위한 별칭들
    static async getArtworks(pagination, filters) {
        return this.getArtworkList(pagination, filters);
    }

    static async getArtwork(artworkId) {
        return this.getArtworkDetail(artworkId);
    }
}

export default ArtworkApi;
