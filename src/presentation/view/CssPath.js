export const CssPath = {
    ADMIN: {
        STYLE: '/css/admin/AdminStyle.css',
        DASHBOARD: '/css/admin/AdminDashboard.css',
        USER: {
            LIST: '/css/admin/management/user/UserManagementList.css',
            DETAIL: '/css/admin/management/user/UserManagementDetail.css'
        },
        EXHIBITION: {
            LIST: '/css/admin/management/exhibition/ExhibitionManagementList.css'
        },
        ARTWORK: {
            LIST: '/css/admin/management/artwork/ArtworkManagementList.css'
        },
        NOTICE: {
            LIST: '/css/admin/management/notice/NoticeManagementList.css'
        }
    },
    COMMON: {
        STYLE: '/css/common/common.css'
    }
};

/**
 * 현재 페이지에 필요한 CSS 파일 경로들을 반환합니다.
 * @param {string} currentPage - 현재 페이지의 URL 경로
 * @returns {string[]} CSS 파일 경로 배열
 */
export function getPageCssFiles(currentPage) {
    const cssFiles = [];

    // 기본 관리자 스타일은 항상 포함
    cssFiles.push(CssPath.ADMIN.STYLE);

    // 페이지별 스타일 추가
    switch (currentPage) {
        case '/admin':
            cssFiles.push(CssPath.ADMIN.DASHBOARD);
            break;
        case '/admin/users':
            cssFiles.push(CssPath.ADMIN.USER.LIST);
            break;
        case '/admin/management/user/:id':
            cssFiles.push(CssPath.ADMIN.USER.DETAIL);
            break;
        case '/admin/exhibitions':
            cssFiles.push(CssPath.ADMIN.EXHIBITION.LIST);
            break;
        case '/admin/artworks':
            cssFiles.push(CssPath.ADMIN.ARTWORK.LIST);
            break;
        case '/admin/notices':
            cssFiles.push(CssPath.ADMIN.NOTICE.LIST);
            break;
    }

    return cssFiles;
}
