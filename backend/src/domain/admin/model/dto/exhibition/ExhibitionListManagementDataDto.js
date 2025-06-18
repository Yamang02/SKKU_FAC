/**
 * 관리자 페이지 전시회 목록 데이터를 위한 DTO
 * 페이지네이션 정보와 함께 전시회 목록을 제공합니다.
 */
export default class ExhibitionListManagementDataDto {
    constructor(data = {}) {
        // 전시회 목록 데이터
        this.exhibitions = data.exhibitions || [];

        // 페이지네이션 정보
        this.total = data.total || 0;
        this.page = data.page || null;

        // 필터링 정보
        this.filters = data.filters || {};
    }
}
