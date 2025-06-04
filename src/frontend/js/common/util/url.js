/**
 * URL 관련 유틸리티 함수
 */

/**
 * URL 경로에서 ID를 추출합니다.
 * @param {string} path - URL 경로 (예: '/artwork/123')
 * @param {string} prefix - ID가 포함된 경로의 접두사 (예: 'artwork')
 * @returns {string|null} - 추출된 ID 또는 null
 */
export function extractIdFromPath(path, prefix) {
    const regex = new RegExp(`\\/${prefix}\\/([%a-zA-Z0-9가-힣_]+)`);
    const matches = path.match(regex);
    return matches ? matches[1] : null;
}

/**
 * 현재 URL에서 작품 slug를 추출합니다.
 * @returns {string|null} - 작품 ID 또는 null
 */
export function getArtworkSlug() {
    return extractIdFromPath(window.location.pathname, 'artwork');
}

/**
 * 현재 URL에서 전시회 ID를 추출합니다.
 * @returns {string|null} - 전시회 ID 또는 null
 */
export function getExhibitionId() {
    return extractIdFromPath(window.location.pathname, 'exhibition');
}
