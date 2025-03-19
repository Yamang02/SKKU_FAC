/**
 * 사용자 정보 DTO
 */
class UserDto {
    constructor(user) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.name = user.name;
        this.role = user.role;
        this.studentId = user.studentId;
        this.artistInfo = user.artistInfo;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }

    /**
     * 사용자 엔티티를 DTO로 변환합니다.
     * @param {Object} user - 사용자 엔티티
     * @returns {UserDto} 변환된 DTO
     */
    static fromEntity(user) {
        return new UserDto(user);
    }

    /**
     * DTO를 일반 객체로 변환합니다.
     * @returns {Object} 변환된 객체
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            name: this.name,
            role: this.role,
            studentId: this.studentId,
            artistInfo: this.artistInfo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export default UserDto;
