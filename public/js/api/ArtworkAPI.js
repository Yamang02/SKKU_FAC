/**
 * 작품 관련 API
 */
import api from './index.js';
import { showErrorMessage } from '../common/util/notification.js';
import Pagination from '../common/pagination.js';
import { createFilterParams } from '../common/filters.js';

class ArtworkAPI {
    // 작품 목록 조회
    static async getList(pagination, filters = {}) {
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

    // 작품 상세 정보 조회
    static async getDetail(artworkId) {
        try {
            return await api.get(`/artwork/api/detail/${artworkId}`);
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

    // 관리자용 작품 목록 조회
    static async getManagementList(pagination, filters = {}) {
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

    // 주요 작품 목록 조회
    static async getFeatured() {
        try {
            return await api.get('/artwork/api/featured');
        } catch (error) {
            console.error('주요 작품 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('주요 작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }
}

export default ArtworkAPI;
