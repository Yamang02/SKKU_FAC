import UserSimpleDTO from './UserSimpleDTO.js';

/**
 * 사용자 상세 DTO
 * 사용자 상세 정보를 응답 형식에 맞게 변환합니다.
 */
export default class UserDetailDTO {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.department = data.department;
        this.role = data.role;
        this.profileImage = data.profileImage;
        this.bio = data.bio;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.artworks = data.artworks ? data.artworks.map(item => new UserSimpleDTO(item)) : [];
    }

    /**
     * DTO를 JSON 형식으로 변환합니다.
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            department: this.department,
            role: this.role,
            profileImage: this.profileImage,
            bio: this.bio,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            artworks: this.artworks.map(item => item.toJSON())
        };
    }
}
