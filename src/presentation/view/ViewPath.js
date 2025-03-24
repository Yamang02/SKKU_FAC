export const ViewPath = {
    // 관리자 페이지
    ADMIN: {
        ROOT: 'admin',
        LAYOUT: 'admin/layout/AdminLayout.ejs',
        SIDEBAR: 'admin/layout/AdminSidebar.ejs',
        HEADER: 'admin/layout/AdminHeader.ejs',
        DASHBOARD: 'admin/AdminDashboard.ejs',
        USER: {
            LIST: 'admin/management/user/UserManagementList.ejs'
        },
        EXHIBITION: {
        },
        ARTWORK: {

        },
        NOTICE: {
            LIST: 'admin/notice/NoticeManagement.ejs',
        }
    },
    USER: {
        LOGIN: 'user/Login.ejs',
        REGISTER: 'user/Register.ejs',
        PROFILE: 'user/Profile.ejs'
    },
    HOME: {
        MAIN: 'home/HomePage.ejs'
    },
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
    },
    ERROR: {
        ERROR: 'error/Error.ejs'
    },
    COMMON: {
        FOOTER: 'common/Footer.ejs',
        HEADER: 'common/Header.ejs'
    }
};
