/**
 * CSS 파일 경로 상수
 */
export const CssPath = {
    ADMIN: {
        LAYOUT: '/css/admin/layout/AdminLayout.css',
        STYLE: '/css/admin/style/adminStyle.css',
        DASHBOARD: '/css/admin/dashboard/AdminDashboard.css',
        MANAGEMENT: {
            USER: {
                LIST: '/css/admin/management/user/list/UserManagementList.css',
                DETAIL: '/css/admin/management/user/detail/UserManagementDetail.css'
            },
            EXHIBITION: {
                LIST: '/css/admin/management/exhibition/list/ExhibitionManagementList.css'
            },
            ARTWORK: {
                LIST: '/css/admin/management/artwork/list/ArtworkManagementList.css'
            },
            NOTICE: {
                LIST: '/css/admin/management/notice/list/NoticeManagementList.css'
            }
        }
    },
    MAIN: {
        STYLE: '/css/style.css',
        EXHIBITION: {
            LIST: '/css/exhibition/ExhibitionList.css'
        },
        ARTWORK: {
            LIST: '/css/artwork/ArtworkList.css',
            DETAIL: '/css/artwork/ArtworkDetail.css'
        },
        NOTICE: {
            LIST: '/css/notice/NoticeList.css',
            DETAIL: '/css/notice/NoticeDetail.css'
        }
    }
};

/**
 * 현재 페이지에 필요한 CSS 파일 목록을 반환합니다.
 * @param {string} currentPage - 현재 페이지 URL
 * @returns {Array} CSS 파일 경로 목록
 */
export function getPageCssFiles(currentPage) {
    const cssFiles = [];

    // URL 패턴에 따른 CSS 매핑
    const cssMapping = {
        // 관리자 페이지
        '/admin/dashboard': [CssPath.ADMIN.LAYOUT, CssPath.ADMIN.STYLE, CssPath.ADMIN.DASHBOARD],
        '/admin/management/user': [CssPath.ADMIN.LAYOUT, CssPath.ADMIN.STYLE, CssPath.ADMIN.MANAGEMENT.USER.LIST],
        '/admin/management/user/:id': [CssPath.ADMIN.LAYOUT, CssPath.ADMIN.STYLE, CssPath.ADMIN.MANAGEMENT.USER.DETAIL],
        '/admin/management/exhibition': [CssPath.ADMIN.LAYOUT, CssPath.ADMIN.STYLE, CssPath.ADMIN.MANAGEMENT.EXHIBITION.LIST],
        '/admin/management/artwork': [CssPath.ADMIN.LAYOUT, CssPath.ADMIN.STYLE, CssPath.ADMIN.MANAGEMENT.ARTWORK.LIST],
        '/admin/management/notice': [CssPath.ADMIN.LAYOUT, CssPath.ADMIN.STYLE, CssPath.ADMIN.MANAGEMENT.NOTICE.LIST],

        // 메인 페이지
        '/exhibition': [CssPath.MAIN.STYLE, CssPath.MAIN.EXHIBITION.LIST],
        '/artwork': [CssPath.MAIN.STYLE, CssPath.MAIN.ARTWORK.LIST],
        '/artwork/:id': [CssPath.MAIN.STYLE, CssPath.MAIN.ARTWORK.DETAIL],
        '/notice': [CssPath.MAIN.STYLE, CssPath.MAIN.NOTICE.LIST],
        '/notice/:id': [CssPath.MAIN.STYLE, CssPath.MAIN.NOTICE.DETAIL]
    };

    // URL 패턴 매칭
    for (const [pattern, files] of Object.entries(cssMapping)) {
        if (currentPage.match(new RegExp(pattern.replace(':id', '\\d+')))) {
            cssFiles.push(...files);
            break;
        }
    }

    return cssFiles;
}
