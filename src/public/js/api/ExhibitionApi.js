/**
 * 전시회 API
 * 전시회 관련 API 호출을 처리합니다.
 */
import api from './index.js';
import { showErrorMessage } from '../common/util/notification.js';

export default class ExhibitionApi {
    /**
     * 전시회 목록을 조회합니다.
     * @param {Object} params - 검색 및 필터링 파라미터
     * @returns {Promise<Object>} 검색 결과와 페이지네이션 정보
     */
    static async getExhibitionList(params = {}) {
        try {


            // 페이지네이션 파라미터
            const pageParams = [];
            if (params.page) pageParams.push(`page=${params.page}`);
            if (params.limit) pageParams.push(`limit=${params.limit || 12}`);

            // 필터 파라미터
            const filterParams = [];
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


            const response = await api.get(`/exhibition/api/list${queryString}`);

            // 응답 데이터 포맷 표준화
            const result = {
                // API 응답 구조 처리 (success, data 객체 포함 여부 확인)
                items: response.success && response.data && response.data.exhibitions
                    ? response.data.exhibitions
                    : (response.exhibitions || []),

                // 총 개수 처리
                total: response.success && response.data && response.data.total
                    ? response.data.total
                    : (response.total || 0),

                // 페이지 정보
                page: parseInt(params.page) || 1,
                limit: parseInt(params.limit) || 12,

                // 페이지 관련 메타데이터
                pageInfo: response.success && response.data && response.data.page
                    ? response.data.page
                    : {
                        currentPage: parseInt(params.page) || 1,
                        totalPages: response.success && response.data && response.data.total
                            ? Math.ceil(response.data.total / (parseInt(params.limit) || 12))
                            : Math.ceil((response.total || 0) / (parseInt(params.limit) || 12)),
                        totalItems: response.success && response.data && response.data.total
                            ? response.data.total
                            : (response.total || 0)
                    }
            };

            return result;
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
     * 주요 전시회 목록을 조회합니다.
     * @param {number} limit - 최대 표시할 전시회 수
     * @returns {Promise<Object>} 주요 전시회 목록
     */
    static async getFeaturedExhibitions(limit = 5) {
        try {
            const response = await api.get(`/exhibition/api/featured?limit=${limit}`);
            return response;
        } catch (error) {
            console.error('주요 전시회 목록을 가져오는 중 오류 발생:', error);
            showErrorMessage('주요 전시회 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }
}
