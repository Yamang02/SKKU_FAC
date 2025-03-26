/**
 * 로그인 페이지 ViewDTO
 */
class LoginViewDto {
    constructor({
        title = '로그인',
        error = null,
        redirectUrl = '/',
        username = ''
    }) {
        this.title = title;
        this.error = error;
        this.redirectUrl = redirectUrl;
        this.username = username;
    }

    toView() {
        return {
            title: this.title,
            error: this.error || null,
            redirectUrl: this.redirectUrl,
            username: this.username
        };
    }
}

export default LoginViewDto;
