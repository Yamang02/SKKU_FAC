/**
 * 뷰 파일 경로 상수
 */
export const ViewPath = {
    ADMIN: {
        LAYOUT: 'admin/layout/AdminLayout.ejs',
        DASHBOARD: 'admin/AdminDashboard.ejs',
        MANAGEMENT: {
            USER: {
                LIST: 'admin/management/user/UserManagementList.ejs',
                DETAIL: 'admin/management/user/UserManagementDetail.ejs'
            },
            EXHIBITION: {
                LIST: 'admin/management/exhibition/ExhibitionManagementList.ejs',
                DETAIL: 'admin/management/exhibition/ExhibitionManagementDetail.ejs'
            },
            ARTWORK: {
                LIST: 'admin/management/artwork/ArtworkManagementList.ejs'
            },
            NOTICE: {
                LIST: 'admin/management/notice/NoticeManagementList.ejs'
            }
        }
    },
    MAIN: {
        HOME: 'home/Home.ejs',
        EXHIBITION: {
            LIST: 'exhibition/ExhibitionList.ejs',
            DETAIL: 'exhibition/ExhibitionDetail.ejs'
        },
        ARTWORK: {
            LIST: 'artwork/ArtworkList.ejs',
            DETAIL: 'artwork/ArtworkDetail.ejs'
        },
        NOTICE: {
            LIST: 'notice/NoticeList.ejs',
            DETAIL: 'notice/NoticeDetail.ejs'
        }
    },
    ERROR: {
        ERROR: 'common/error.ejs'
    }
};
