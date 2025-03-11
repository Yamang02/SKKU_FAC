/**
 * 홈 도메인 - API 모듈
 * 서버 API 통신 관련 함수들을 제공합니다.
 */
import { showErrorMessage } from './util.js';

/**
 * 추천 작품 목록 가져오기
 * @param {number} limit - 가져올 작품 수
 * @returns {Promise<Array>} 추천 작품 목록 데이터
 */
export async function fetchFeaturedArtworks(limit = 6) {
    try {
        // API 요청
        const response = await fetch(`/api/artworks/featured?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('추천 작품 목록을 가져오는 중 오류 발생:', error);
        showErrorMessage('추천 작품을 불러오는데 실패했습니다.');
        throw error;
    }
}

/**
 * 작품 상세 정보 가져오기
 * @param {string} artworkId - 작품 ID
 * @returns {Promise<Object>} 작품 상세 데이터
 */
export async function fetchArtworkDetail(artworkId) {
    try {
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
    }
}
