/**
 * 작품 도메인 - API 모듈
 * 서버 API 통신 관련 함수들을 제공합니다.
 */
import { showLoading, showErrorMessage } from './util.js';

/**
 * 작품 목록 가져오기
 * @param {Object} params - 요청 파라미터
 * @returns {Promise<Object>} 작품 목록 데이터
 */
export async function fetchArtworks(params = {}) {
    try {
        showLoading(true);

        // URL 파라미터 생성
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        // API 요청
        const response = await fetch(`/api/artworks?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('작품 목록을 가져오는 중 오류 발생:', error);
        showErrorMessage('작품 목록을 불러오는데 실패했습니다.');
        throw error;
    } finally {
        showLoading(false);
    }
}

/**
 * 작품 상세 정보 가져오기
 * @param {string} artworkId - 작품 ID
 * @returns {Promise<Object>} 작품 상세 데이터
 */
export async function fetchArtworkDetail(artworkId) {
    try {
        showLoading(true);

        // API 요청
        const response = await fetch(`/api/artworks/${artworkId}`);

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`작품 상세 정보(ID: ${artworkId})를 가져오는 중 오류 발생:`, error);
        showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
        throw error;
    } finally {
        showLoading(false);
    }
}

/**
 * 전시회 목록 가져오기
 * @returns {Promise<Array>} 전시회 목록 데이터
 */
export async function fetchExhibitions() {
    try {
        // API 요청
        const response = await fetch('/api/exhibitions');

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('전시회 목록을 가져오는 중 오류 발생:', error);
        throw error;
    }
}
