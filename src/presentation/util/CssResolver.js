import { getPageCssFiles } from '../constant/CssPath.js';

/**
 * CSS 파일 경로를 해석하는 클래스
 */
export class CssResolver {
    /**
     * 현재 페이지에 필요한 CSS 파일 목록을 반환합니다.
     * @param {string} currentPage - 현재 페이지 URL
     * @returns {Array} CSS 파일 경로 목록
     */
    static getPageCssFiles(currentPage) {
        return getPageCssFiles(currentPage);
    }
}
