/**
 * 작품 관련 API
 */
import api from './index';
import { showErrorMessage } from '../common/util.js';

class ArtworkAPI {
    // 작품 목록 조회
    static async getList(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });
            return await api.get(`/artwork/api/list?${queryParams.toString()}`);
        } catch (error) {
            console.error('작품 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 작품 상세 정보 조회
    static async getDetail(artworkId) {
        try {
            return await api.get(`/api/artworks/${artworkId}`);
        } catch (error) {
            console.error(`작품 상세 정보(ID: ${artworkId})를 가져오는 중 오류 발생:`, error);
            showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 작품 데이터 조회 (통합 API)
    static async getData(artworkId, type = 'default') {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('type', type);
            return await api.get(`/artwork/api/data/${artworkId}?${queryParams.toString()}`);
        } catch (error) {
            console.error(`작품 데이터(ID: ${artworkId}, 타입: ${type})를 가져오는 중 오류 발생:`, error);
            showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }
}

export default ArtworkAPI;
