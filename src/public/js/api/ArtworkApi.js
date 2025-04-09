/**
 * 작품 관련 API
 */
import api from './index.js';
import { showErrorMessage } from '../common/util/notification.js';
import { createFilterParams } from '../common/filters.js';

class ArtworkApi {
    // 작품 목록 조회
    static async getArtworkList(pagination, filters = {}) {
        try {
            const pageParams = pagination.toQueryParams();
            const filterParams = createFilterParams(filters);
            const queryString = [pageParams, filterParams]
                .filter(Boolean)
                .join('&');

            return await api.get(`/artwork/api/list?${queryString}`);
        } catch (error) {
            console.error('작품 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 추천 작품 목록 조회
    static async getFeaturedArtworks() {
        try {
            return await api.get('/artwork/api/featured');
        } catch (error) {
            console.error('추천 작품 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('추천 작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 작품 상세 정보 조회
    static async getArtworkDetail(artworkId) {
        try {
            return await api.get(`/artwork/api/detail/${artworkId}`);
        } catch (error) {
            console.error(`작품 상세 정보(ID: ${artworkId})를 가져오는 중 오류 발생:`, error);
            showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 작품 목록 조회
    static async getArtworkManagementList(pagination, filters = {}) {
        try {
            const pageParams = pagination.toQueryParams();
            const filterParams = createFilterParams(filters);
            const queryString = [pageParams, filterParams]
                .filter(Boolean)
                .join('&');

            return await api.get(`/admin/management/artwork/list?${queryString}`);
        } catch (error) {
            console.error('관리자용 작품 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {string|number} id - 작품 ID
     * @returns {Promise<Object>} 관련 작품 목록
     */
    static async getRelatedArtworks(id) {
        try {
            return await api.get(`/artwork/api/related/${id}`);
        } catch (error) {
            console.error('관련 작품 조회 중 오류:', error);
            showErrorMessage('관련 작품을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 작품 등록
    static async createArtwork(formData) {
        try {
            console.log('작품 등록 API 호출 시작');

            // FormData 내용 로깅 (개발 목적으로만 사용)
            console.log('FormData 내용:');
            for (const [key, value] of formData.entries()) {
                if (key === 'image') {
                    console.log('이미지 파일:', value.name, value.type, value.size + 'bytes');
                } else {
                    console.log(key + ':', value);
                }
            }

            const response = await api.post('/artwork/api/new', formData);
            console.log('작품 등록 API 응답:', response);
            return response;
        } catch (error) {
            console.error('작품 등록 중 오류:', error);
            showErrorMessage('작품 등록에 실패했습니다: ' + error.message);
            throw error;
        }
    }
}

export default ArtworkApi;
