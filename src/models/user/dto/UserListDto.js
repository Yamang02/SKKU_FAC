import UserSimpleDTO from './UserSimpleDTO.js';

/**
 * 사용자 목록 DTO
 * 사용자 목록 조회 결과를 응답 형식에 맞게 변환합니다.
 */
export default class UserListDTO {
    constructor(data) {
        this.items = data.items.map(item => new UserSimpleDTO(item));
        this.total = data.total;
        this.page = data.page;
    }

    /**
     * DTO를 JSON 형식으로 변환합니다.
     */
    toJSON() {
        return {
            items: this.items.map(item => item.toJSON()),
            total: this.total,
            page: this.page
        };
    }
}
