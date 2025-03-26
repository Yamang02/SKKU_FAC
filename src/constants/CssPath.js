/**
 * CSS 파일 경로 상수
 */
export const CssPath = {
    ADMIN: {
        STYLE: '/css/admin/style/adminStyle.css',
        DASHBOARD: '/css/admin/dashboard/AdminDashboard.css',
        MANAGEMENT: {
            USER: {
                LIST: '/css/admin/management/user/list/UserManagementList.css',
                DETAIL: '/css/admin/management/user/detail/UserManagementDetail.css'
            },
            EXHIBITION: {
                LIST: '/css/admin/management/exhibition/list/ExhibitionManagementList.css',
                DETAIL: '/css/admin/management/exhibition/detail/ExhibitionManagementDetail.css'
            },
            ARTWORK: {
                LIST: '/css/admin/management/artwork/list/ArtworkManagementList.css',
                DETAIL: '/css/admin/management/artwork/detail/ArtworkManagementDetail.css'
            },
            NOTICE: {
                LIST: '/css/admin/management/notice/list/NoticeManagementList.css',
                DETAIL: '/css/admin/management/notice/detail/NoticeManagementDetail.css'
            }
        }
    },
    MAIN: {
        BASE: {
            RESET: '/css/common/base/reset.css',
            TYPOGRAPHY: '/css/common/base/typography.css',
            VARIABLES: '/css/common/base/variables.css'
        },
        STYLE: '/css/style.css',
        EXHIBITION: {
            LIST: '/css/main/exhibition/ExhibitionList.css',
            DETAIL: '/css/main/exhibition/ExhibitionDetail.css'
        },
        ARTWORK: {
            LIST: '/css/main/artwork/ArtworkList.css',
            DETAIL: '/css/main/artwork/ArtworkDetail.css'
        },
        NOTICE: {
            LIST: '/css/main/notice/NoticeList.css',
            DETAIL: '/css/main/notice/NoticeDetail.css'
        }
    }
};
