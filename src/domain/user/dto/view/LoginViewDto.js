/**
 * 로그인 페이지 ViewDTO
 */
class LoginViewDto {
    constructor({
        title = '로그인',
        error = null,
        redirectUrl = '/'
    }) {
        this.title = title;
        this.error = error;
        this.redirectUrl = redirectUrl;
    }

    toView() {
        return {
            title: this.title,
            error: this.error,
            redirectUrl: this.redirectUrl
        };
    }
}

export default LoginViewDto;
