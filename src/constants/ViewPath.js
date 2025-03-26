/**
 * 뷰 파일 경로 상수
 */
export const ViewPath = {
    ADMIN: {
        LAYOUT: 'admin/layout/AdminLayout.ejs',
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
                LIST: 'admin/management/artwork/ArtworkManagementList.ejs',
                DETAIL: 'admin/management/artwork/ArtworkManagementDetail.ejs'
            },
            NOTICE: {
                LIST: 'admin/management/notice/NoticeManagementList.ejs',
                DETAIL: 'admin/management/notice/NoticeManagementDetail.ejs'
            }
        }
    },
    MAIN: {
        LAYOUT: 'main/layout/MainLayout.ejs',
        HOME: 'main/home/HomePage.ejs',
        ABOUT: 'main/about/about.ejs',
        USER: {
            LOGIN: 'main/user/Login.ejs',
            REGISTER: 'main/user/RegisterPage.ejs',
            PROFILE: 'main/user/ProfilePage.ejs'
        },
        EXHIBITION: {
            LIST: 'main/exhibition/ExhibitionList.ejs',
            DETAIL: 'main/exhibition/ExhibitionDetail.ejs'
        },
        ARTWORK: {
            LIST: 'main/artwork/ArtworkList.ejs',
            DETAIL: 'main/artwork/ArtworkDetail.ejs'
        },
        NOTICE: {
            LIST: 'main/notice/NoticeList.ejs',
            DETAIL: 'main/notice/NoticeDetail.ejs'
        }
    },
    ERROR: 'common/error.ejs'
};
