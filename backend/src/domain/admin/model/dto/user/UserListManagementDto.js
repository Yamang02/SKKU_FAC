import UserManagementDto from './UserManagementDto.js';

/**
 * 관리자 페이지용 사용자 목록 DTO
 * 페이지네이션 정보와 함께 사용자 목록을 제공합니다.
 */
export default class UserListManagementDto {
    constructor(data = {}) {
        // 사용자 목록 데이터
        this.items = Array.isArray(data.items) ? data.items.map(user => new UserManagementDto(user)) : [];

        // 페이지네이션 정보
        this.total = data.total || 0;
        this.page = data.page || null;

        // 필터링 정보
        this.filters = data.filters || {};
    }
}
