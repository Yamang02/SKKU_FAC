/**
 * 전시회 요청 DTO
 * 전시회 생성/수정 시 사용되는 데이터 전송 객체
 */
export default class ExhibitionRequestDTO {
    constructor(data = {}) {
        this.title = data.title || '';
        this.description = data.description || '';
        this.startDate = data.startDate || '';
        this.endDate = data.endDate || '';
        this.exhibitionType = data.exhibitionType || '';
        this.image = data.image || null;
        this.subtitle = data.subtitle || '';
        this.location = data.location || '';
        this.artists = data.artists || [];
    }

    /**
     * DTO 데이터 유효성 검사
     * @returns {boolean} 유효성 검사 결과
     */
    validate() {
        if (!this.title) {
            throw new Error('전시회 제목은 필수입니다.');
        }
        if (!this.startDate) {
            throw new Error('전시 시작일은 필수입니다.');
        }
        if (!this.endDate) {
            throw new Error('전시 종료일은 필수입니다.');
        }
        if (this.startDate > this.endDate) {
            throw new Error('전시 시작일은 종료일보다 이전이어야 합니다.');
        }
        return true;
    }

    /**
     * DTO를 JSON 형태로 변환
     * @returns {Object} JSON 형태의 DTO 데이터
     */
    toJSON() {
        return {
            title: this.title,
            description: this.description,
            startDate: this.startDate,
            endDate: this.endDate,
            exhibitionType: this.exhibitionType,
            image: this.image,
            subtitle: this.subtitle,
            location: this.location,
            artists: this.artists
        };
    }
}
