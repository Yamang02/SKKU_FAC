/**
 * 회원가입 페이지 ViewDTO
 */
class RegisterViewDto {
    constructor({
        title = '회원가입',
        error = null,
        departments = []
    }) {
        this.title = title;
        this.error = error;
        this.departments = departments;
    }

    toView() {
        return {
            title: this.title,
            error: this.error,
            departments: this.departments
        };
    }
}

export default RegisterViewDto;
