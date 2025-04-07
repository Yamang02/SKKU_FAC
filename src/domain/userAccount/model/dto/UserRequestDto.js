/**
 * 사용자 요청 DTO
 * 사용자 관련 요청 데이터를 검증하고 변환합니다.
 */
export default class UserRequestDTO {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.department = data.department;
        this.role = data.role || 'USER';
        this.isClubMember = data.isClubMember || false;
        this.studentYear = data.studentYear;
        this.affiliation = data.affiliation;
        this.profileImage = data.profileImage;
        this.bio = data.bio;
    }

    /**
     * DTO 데이터 유효성을 검사합니다.
     * @throws {UserValidationError} 유효성 검사 실패 시
     */
    validate() {
        const errors = [];

        if (!this.username) {
            errors.push('사용자명은 필수입니다.');
        } else if (this.username.length < 3) {
            errors.push('사용자명은 최소 3자 이상이어야 합니다.');
        }

        if (!this.name) {
            errors.push('이름은 필수입니다.');
        }

        if (!this.email) {
            errors.push('이메일은 필수입니다.');
        } else if (!this.isValidEmail(this.email)) {
            errors.push('유효한 이메일 형식이 아닙니다.');
        }

        if (!this.password) {
            errors.push('비밀번호는 필수입니다.');
        } else if (this.password.length < 6) {
            errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
        }

        if (this.role === 'SKKU_MEMBER') {
            if (!this.department) {
                errors.push('학과는 필수입니다.');
            }
            if (!this.studentYear) {
                errors.push('학년은 필수입니다.');
            }
        } else if (this.role === 'EXTERNAL_MEMBER') {
            if (!this.affiliation) {
                errors.push('소속은 필수입니다.');
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    }

    /**
     * 이메일 형식을 검사합니다.
     * @private
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * DTO를 JSON 형식으로 변환합니다.
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            name: this.name,
            email: this.email,
            password: this.password,
            department: this.department,
            role: this.role,
            isClubMember: this.isClubMember,
            studentYear: this.studentYear,
            affiliation: this.affiliation,
            profileImage: this.profileImage,
            bio: this.bio
        };
    }
}
