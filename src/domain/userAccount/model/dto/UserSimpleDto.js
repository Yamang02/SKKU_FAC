/**
 * 사용자 간단 정보 DTO
 * 사용자의 간단한 정보를 응답 형식에 맞게 변환합니다.
 */
export default class UserSimpleDTO {
    constructor(data, type = 'default') {
        this.id = data.id;
        this.name = data.name;
        this.department = data.department;
        this.profileImage = data.profileImage;
        this.type = type;
    }

    /**
     * DTO를 JSON 형식으로 변환합니다.
     */
    toJSON() {
        const baseData = {
            id: this.id,
            name: this.name,
            department: this.department,
            profileImage: this.profileImage
        };

        switch (this.type) {
        case 'card':
            return {
                ...baseData,
                type: 'user'
            };
        case 'modal':
            return {
                ...baseData,
                type: 'user',
                modalTitle: '사용자 정보'
            };
        default:
            return baseData;
        }
    }
}
