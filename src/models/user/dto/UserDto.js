/**
 * 사용자 정보를 위한 기본 DTO
 */
export default class UserDTO {
    constructor(data = {}) {
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.department = data.department;
        this.role = data.role;
        this.profileImage = data.profileImage;
        this.profileImagePath = data.profileImagePath;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            department: this.department,
            role: this.role,
            profileImage: this.profileImage,
            profileImagePath: this.profileImagePath,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
