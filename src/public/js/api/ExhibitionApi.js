/**
 * 전시회 API
 * 전시회 관련 API 호출을 처리합니다.
 */
import api from './index.js';
import { showErrorMessage } from '../common/util/notification.js';
import { createFilterParams } from '../common/filters.js';

export default class ExhibitionApi {
    /**
     * 전시회 목록을 조회합니다.
     */
    static async getExhibitionList(params = {}) {
        try {
            const pageParams = params.page ? `page=${params.page}&limit=${params.limit || 12}` : '';
            const filterParams = createFilterParams({
                type: params.type,
                year: params.year,
                category: params.category,
                sort: params.sort,
                search: params.search
            });

            const queryString = [pageParams, filterParams]
                .filter(Boolean)
                .join('&');

            const response = await api.get(`/exhibition/api/list${queryString ? `?${queryString}` : ''}`);
            return response;
        } catch (error) {
            console.error('전시회 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('전시회 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    /**
     * 출품 가능한 전시회 목록을 조회합니다.
     */
    static async getSubmittableList() {
        try {
            const response = await api.get('/exhibition/api/submittable');
            return response;
        } catch (error) {
            console.error('출품 가능한 전시회 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('출품 가능한 전시회 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    /**
     * 전시회 상세 정보를 조회합니다.
     */
    static async getDetail(exhibitionId) {
        try {
            const response = await api.get(`/exhibition/api/${exhibitionId}`);
            return response;
        } catch (error) {
            console.error(`전시회 상세 정보(ID: ${exhibitionId})를 가져오는 중 오류 발생:`, error);
            showErrorMessage('전시회 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    /**
     * 전시회 작품 목록을 조회합니다.
     */
    static async getArtworks(exhibitionId) {
        try {
            const response = await api.get(`/exhibition/api/${exhibitionId}/artworks`);
            return response;
        } catch (error) {
            console.error(`전시회 작품 목록(ID: ${exhibitionId})을 가져오는 중 오류 발생:`, error);
            showErrorMessage('전시회 작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    /**
     * 새 전시회를 등록합니다.
     */
    static async createExhibition(formData) {
        try {
            const response = await api.post('/exhibition/api/new', formData);
            return response;
        } catch (error) {
            console.error('전시회 등록 중 오류:', error);
            showErrorMessage('전시회 등록에 실패했습니다.');
            throw error;
        }
    }

    /**
     * 전시회 정보를 수정합니다.
     */
    static async updateExhibition(exhibitionId, updatedData) {
        try {
            const response = await api.put(`/exhibition/api/${exhibitionId}`, updatedData);
            return response;
        } catch (error) {
            console.error('전시회 수정 중 오류:', error);
            showErrorMessage('전시회 정보 수정에 실패했습니다.');
            throw error;
        }
    }

    /**
     * 전시회를 삭제합니다.
     */
    static async deleteExhibition(exhibitionId) {
        try {
            const response = await api.delete(`/exhibition/api/${exhibitionId}`);
            return response;
        } catch (error) {
            console.error('전시회 삭제 중 오류:', error);
            showErrorMessage('전시회 삭제에 실패했습니다.');
            throw error;
        }
    }
}
