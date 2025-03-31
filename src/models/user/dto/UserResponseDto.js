/**
 * 사용자 응답 DTO
 * 사용자 정보를 응답 형식에 맞게 변환합니다.
 */
export default class UserResponseDTO {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.name = data.name;
        this.email = data.email;
        this.department = data.department;
        this.role = data.role;
        this.isClubMember = data.isClubMember;
        this.studentYear = data.studentYear;
        this.affiliation = data.affiliation;
        this.profileImage = data.profileImage;
        this.bio = data.bio;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
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
            department: this.department,
            role: this.role,
            isClubMember: this.isClubMember,
            studentYear: this.studentYear,
            affiliation: this.affiliation,
            profileImage: this.profileImage,
            bio: this.bio,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
