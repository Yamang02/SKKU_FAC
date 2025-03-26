/**
 * 전시 도메인 - API 모듈
 * 서버 API 통신 관련 함수들을 제공합니다.
 */
import { showErrorMessage } from '/js/common/util/index.js';

/**
 * 전시회 상세 정보 가져오기
 * @param {string} exhibitionId - 전시회 ID
 * @returns {Promise<Object>} 전시회 상세 데이터
 */
export async function fetchExhibitionDetail(exhibitionId) {
    try {
        // API 요청
        const response = await fetch(`/api/exhibitions/${exhibitionId}`);

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`전시회 상세 정보(ID: ${exhibitionId})를 가져오는 중 오류 발생:`, error);
        showErrorMessage('전시회 정보를 불러오는데 실패했습니다.');
        throw error;
    }
}

/**
 * 전시회 작품 목록 가져오기
 * @param {string} exhibitionId - 전시회 ID
 * @returns {Promise<Array>} 작품 목록 데이터
 */
export async function fetchExhibitionArtworks(exhibitionId) {
    try {
        // API 요청
        const response = await fetch(`/api/exhibitions/${exhibitionId}/artworks`);

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`전시회 작품 목록(ID: ${exhibitionId})을 가져오는 중 오류 발생:`, error);
        showErrorMessage('전시회 작품 목록을 불러오는데 실패했습니다.');
        throw error;
    }
}

/**
 * 전시회 목록 가져오기
 * @param {Object} params - 요청 파라미터
 * @returns {Promise<Object>} 전시회 목록 데이터
 */
export async function fetchExhibitions(params = {}) {
    try {
        // URL 파라미터 생성
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        // API 요청
        const response = await fetch(`/api/exhibitions?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('전시회 목록을 가져오는 중 오류 발생:', error);
        showErrorMessage('전시회 목록을 불러오는데 실패했습니다.');
        throw error;
    }
}
