export const ViewPath = {
    // 관리자 페이지
    ADMIN: {
        ROOT: 'admin',
        LAYOUT: 'admin/layout/AdminLayout.ejs',
        DASHBOARD: 'admin/AdminDashboard.ejs',
        MANAGEMENT: {
            USER: {
                LIST: 'admin/management/user/UserManagementList.ejs',
                DETAIL: 'admin/management/user/UserManagementDetail.ejs'
            },
            EXHIBITION: {
                LIST: 'admin/management/exhibition/ExhibitionManagementList.ejs'
            },
            ARTWORK: {
                LIST: 'admin/management/artwork/ArtworkManagementList.ejs'
            },
            NOTICE: {
                LIST: 'admin/management/notice/NoticeManagementList.ejs'
            }
        }
    },
    USER: {
        LOGIN: 'user/Login.ejs',
        REGISTER: 'user/Register.ejs',
        PROFILE: 'user/Profile.ejs',
        PROFILE_EDIT: 'user/ProfileEdit.ejs',
        FORGOT_PASSWORD: 'user/ForgotPassword.ejs'
    },
    HOME: {
        MAIN: 'home/HomePage.ejs'
    },
    EXHIBITION: {
        LIST: 'exhibition/ExhibitionList.ejs',
        DETAIL: 'exhibition/ExhibitionDetail.ejs',
        DETAIL_MODAL: 'exhibition/ExhibitionDetailModal.ejs'
    },
    ARTWORK: {
        LIST: 'artwork/ArtworkList.ejs',
        DETAIL: 'artwork/ArtworkDetail.ejs'
    },
    NOTICE: {
        LIST: 'notice/NoticeList.ejs',
        DETAIL: 'notice/NoticeDetail.ejs'
    },
    ERROR: {
        ERROR: 'common/error.ejs'
    },
    COMMON: {
        FOOTER: 'common/footer.ejs',
        HEADER: 'common/header.ejs',
        HEAD: 'common/head.ejs',
        PAGINATION: 'common/pagination.ejs',
        ABOUT: 'common/AboutPage.ejs'
    }
};
