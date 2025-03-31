/**
 * 사용자 모델
 */
export default class User {
    constructor({
        id = 0,
        username = '',
        email = '',
        password = '',
        name = '',
        department = '',
        role = 'user',
        isClubMember = false,
        studentYear = '',
        affiliation = '',
        profileImage = '',
        profileImagePath = '',
        isActive = true,
        createdAt = new Date().toISOString(),
        updatedAt = new Date().toISOString()
    }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = name;
        this.department = department;
        this.role = role;
        this.isClubMember = isClubMember;
        this.studentYear = studentYear;
        this.affiliation = affiliation;
        this.profileImage = profileImage;
        this.profileImagePath = profileImagePath;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * 사용자 데이터를 JSON 형태로 변환합니다.
     * @returns {Object} JSON 형태의 사용자 데이터
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            name: this.name,
            department: this.department,
            role: this.role,
            isClubMember: this.isClubMember,
            studentYear: this.studentYear,
            affiliation: this.affiliation,
            profileImage: this.profileImage,
            profileImagePath: this.profileImagePath,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * 사용자가 관리자인지 확인합니다.
     * @returns {boolean} 관리자 여부
     */
    isAdmin() {
        return this.role === 'ADMIN';
    }

    /**
     * 사용자가 작가인지 확인합니다.
     * @returns {boolean} 작가 여부
     */
    isArtist() {
        return this.role === 'ARTIST';
    }

    /**
     * 사용자 데이터 유효성 검사
     * @returns {boolean} 유효성 검사 결과
     * @throws {Error} 유효성 검사 실패 시 에러
     */
    validate() {
        if (!this.username) {
            throw new Error('아이디를 입력해주세요.');
        }
        if (!this.email) {
            throw new Error('이메일을 입력해주세요.');
        }
        if (!this.name) {
            throw new Error('이름을 입력해주세요.');
        }
        if (!this.password) {
            throw new Error('비밀번호를 입력해주세요.');
        }
        if (this.role === 'SKKU_MEMBER' && !this.department) {
            throw new Error('소속 학과를 입력해주세요.');
        }
        if (this.role === 'SKKU_MEMBER' && !this.studentYear) {
            throw new Error('학년을 입력해주세요.');
        }
        if (this.role === 'EXTERNAL_MEMBER' && !this.affiliation) {
            throw new Error('소속을 입력해주세요.');
        }
        return true;
    }

    /**
     * 사용자 정보를 업데이트합니다.
     * @param {Object} data - 업데이트할 데이터
     */
    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
    }
}
