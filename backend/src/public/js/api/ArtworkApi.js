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
            const queryString = [pageParams, filterParams].filter(Boolean).join('&');

            '작품 목록 API 호출:', `/artwork/api/list?${queryString}`;
            const response = await api.get(`/artwork/api/list?${queryString}`);
            '작품 목록 API 응답:', response;

            return response;
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
    static async getArtworkDetailForPage(artworkSlug) {
        try {
            return await api.get(`/artwork/api/detail/${artworkSlug}`);
        } catch (error) {
            console.error(`작품 상세 정보(ID: ${artworkSlug})를 가져오는 중 오류 발생:`, error);
            showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 작품 목록 조회
    static async getArtworkManagementList(pagination, filters = {}) {
        try {
            const pageParams = pagination.toQueryParams();
            const filterParams = createFilterParams(filters);
            const queryString = [pageParams, filterParams].filter(Boolean).join('&');

            return await api.get(`/admin/management/artwork/list?${queryString}`);
        } catch (error) {
            console.error('관리자용 작품 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 작품 등록
    static async createArtwork(formData) {
        try {
            // FormData 내용 로깅 (개발 목적으로만 사용)
            for (const [key, value] of formData.entries()) {
                if (key === 'image') {
                    '이미지 파일:', value.name, value.type, value.size + 'bytes';
                } else {
                    key + ':', value;
                }
            }

            const response = await api.post('/artwork/api/new', formData);

            // 응답이 없는 경우 에러 처리
            if (!response) {
                throw new Error('유효하지 않은 서버 응답입니다.');
            }

            return response;
        } catch (error) {
            console.error('작품 등록 중 오류:', error);
            throw error;
        }
    }

    // 작품 수정
    static async updateArtwork(artworkId, updatedData) {
        try {
            const response = await api.put(`/artwork/api/${artworkId}`, updatedData);
            '작품 수정 API 응답:', response;

            return response;
        } catch (error) {
            console.error('작품 수정 중 오류:', error);
            showErrorMessage('작품 정보 수정에 실패했습니다.');
            throw error;
        }
    }

    // 작품 삭제
    static async deleteArtwork(artworkId) {
        try {
            ('작품 삭제 API 호출 시작');

            const response = await api.delete(`/artwork/api/${artworkId}`);
            '작품 삭제 API 응답:', response;

            return response;
        } catch (error) {
            console.error('작품 삭제 중 오류:', error);
            showErrorMessage('작품 삭제에 실패했습니다.');
            throw error;
        }
    }

    // 출품하기
    static async submitArtworkToExhibition(artworkId, exhibitionId) {
        try {
            return await api.post('/artwork/api/exhibiting', { artworkId, exhibitionId });
        } catch (error) {
            console.error('출품 중 오류:', error);
            throw error;
        }
    }

    // 출품 취소하기
    static async cancelArtworkSubmission(artworkId, exhibitionId) {
        try {
            return await api.delete(`/artwork/api/exhibiting/${artworkId}/${exhibitionId}`);
        } catch (error) {
            console.error('출품 취소 중 오류:', error);
            throw error;
        }
    }
}

export default ArtworkApi;
