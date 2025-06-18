/**
 * 뷰 파일 경로 상수
 */
export const ViewPath = {
    MAIN: {
        LAYOUT: 'main/layout/MainLayout.ejs',
        HOME: 'main/home/HomePage.ejs',
        ABOUT: 'main/about/about.ejs',
        USER: {
            LOGIN: 'main/user/Login.ejs',
            REGISTER: 'main/user/Register.ejs',
            PROFILE: 'main/user/Profile.ejs',
            FORGOT_PASSWORD: 'main/user/ForgotPassword.ejs',
            RESET_PASSWORD: 'main/user/ResetPassword.ejs'
        },
        EXHIBITION: {
            LIST: 'main/exhibition/ExhibitionList.ejs',
            DETAIL: 'main/exhibition/ExhibitionDetail.ejs'
        },
        ARTWORK: {
            LIST: 'main/artwork/ArtworkList.ejs',
            DETAIL: 'main/artwork/ArtworkDetail.ejs',
            REGISTER: 'main/artwork/ArtworkRegister.ejs'
        },
        NOTICE: {
            LIST: 'main/notice/NoticeList.ejs',
            DETAIL: 'main/notice/NoticeDetail.ejs'
        }
    },
    SUCCESS: 'common/success.ejs',
    ERROR: 'common/error.ejs',
    COMMON: {
        PAGINATION: 'common/pagination.ejs'
    }
};
