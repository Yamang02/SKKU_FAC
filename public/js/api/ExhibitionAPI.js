/**
 * 전시회 관련 API
 */
import api from './index.js';
import { showErrorMessage } from '../common/util/notification.js';

class ExhibitionAPI {
    // 출품 가능한 전시회 목록 조회
    static async getSubmittableList() {
        try {
            return await api.get('/exhibition/api/submittable');
        } catch (error) {
            console.error('출품 가능한 전시회 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('전시회 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 전시회 목록 조회
    static async getList(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            return await api.get(`/exhibition/api/list?${queryParams.toString()}`);
        } catch (error) {
            console.error('전시회 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('전시회 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 전시회 상세 정보 조회
    static async getDetail(exhibitionId) {
        try {
            return await api.get(`/exhibition/api/${exhibitionId}`);
        } catch (error) {
            console.error(`전시회 상세 정보(ID: ${exhibitionId})를 가져오는 중 오류 발생:`, error);
            showErrorMessage('전시회 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 전시회 작품 목록 조회
    static async getArtworks(exhibitionId) {
        try {
            return await api.get(`/exhibition/api/${exhibitionId}/artworks`);
        } catch (error) {
            console.error(`전시회 작품 목록(ID: ${exhibitionId})을 가져오는 중 오류 발생:`, error);
            showErrorMessage('전시회 작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }
}

export default ExhibitionAPI;
