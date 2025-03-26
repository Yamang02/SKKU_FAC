import { CssPath } from '../constant/CssPath.js';

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

/**
 * 현재 페이지에 필요한 CSS 파일 목록을 반환합니다.
 * @param {string} currentPage - 현재 페이지 URL
 * @returns {Array} CSS 파일 경로 목록
 */
function getPageCssFiles(currentPage) {
    const cssFiles = [];
    const isAdminPage = currentPage.startsWith('/admin');

    // 페이지 타입에 따른 기본 스타일 로드
    if (isAdminPage) {
        // 관리자 페이지는 adminStyle.css를 먼저 로드하고, 그 다음 페이지별 스타일을 로드
        cssFiles.push(CssPath.ADMIN.STYLE);
    } else {
        // 메인 페이지는 메인 전용 스타일만 로드
        cssFiles.push(
            CssPath.MAIN.BASE.RESET,
            CssPath.MAIN.BASE.VARIABLES,
            CssPath.MAIN.BASE.TYPOGRAPHY,
            CssPath.MAIN.BASE.LAYOUT,
            CssPath.MAIN.BASE.COMPONENTS,
            CssPath.MAIN.BASE.UTILITIES
        );
    }

    // URL 패턴에 따른 CSS 매핑
    const cssMapping = {
        // 관리자 페이지
        '/admin/dashboard': [CssPath.ADMIN.DASHBOARD],
        '/admin/management/user/list': [CssPath.ADMIN.MANAGEMENT.USER.LIST],
        '/admin/management/user/:id': [CssPath.ADMIN.MANAGEMENT.USER.DETAIL],
        '/admin/management/exhibition': [CssPath.ADMIN.MANAGEMENT.EXHIBITION.LIST],
        '/admin/management/exhibition/:id': [CssPath.ADMIN.MANAGEMENT.EXHIBITION.DETAIL],
        '/admin/management/artwork': [CssPath.ADMIN.MANAGEMENT.ARTWORK.LIST],
        '/admin/management/artwork/:id': [CssPath.ADMIN.MANAGEMENT.ARTWORK.DETAIL],
        '/admin/management/notice': [CssPath.ADMIN.MANAGEMENT.NOTICE.LIST],
        '/admin/management/notice/:id': [CssPath.ADMIN.MANAGEMENT.NOTICE.DETAIL],

        // 메인 페이지
        '/exhibition': [CssPath.MAIN.EXHIBITION.LIST],
        '/exhibition/:id': [CssPath.MAIN.EXHIBITION.DETAIL],
        '/artwork': [CssPath.MAIN.ARTWORK.LIST],
        '/artwork/:id': [CssPath.MAIN.ARTWORK.DETAIL],
        '/notice': [CssPath.MAIN.NOTICE.LIST],
        '/notice/:id': [CssPath.MAIN.NOTICE.DETAIL]
    };

    // URL 패턴 매칭
    for (const [pattern, files] of Object.entries(cssMapping)) {
        if (currentPage.match(new RegExp(pattern.replace(':id', '\\d+')))) {
            // 관리자 페이지일 때는 관리자 CSS만, 메인 페이지일 때는 메인 CSS만 추가
            if ((isAdminPage && pattern.startsWith('/admin')) ||
                (!isAdminPage && !pattern.startsWith('/admin'))) {
                cssFiles.push(...files);
            }
        }
    }

    return cssFiles;
}

