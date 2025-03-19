/**
 * 전시회 도메인 서비스
 * 순수한 도메인 로직을 처리합니다.
 */
class ExhibitionDomainService {
    /**
     * 전시회 제목의 유효성을 검사합니다.
     * @param {string} title - 전시회 제목
     * @throws {Error} 유효하지 않은 제목일 경우
     */
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            throw new Error('전시회 제목은 필수입니다.');
        }
        if (title.length < 2 || title.length > 100) {
            throw new Error('전시회 제목은 2자 이상 100자 이하여야 합니다.');
        }
    }

    /**
     * 전시회 설명의 유효성을 검사합니다.
     * @param {string} description - 전시회 설명
     * @throws {Error} 유효하지 않은 설명일 경우
     */
    validateDescription(description) {
        if (!description || typeof description !== 'string') {
            throw new Error('전시회 설명은 필수입니다.');
        }
        if (description.length < 10 || description.length > 1000) {
            throw new Error('전시회 설명은 10자 이상 1000자 이하여야 합니다.');
        }
    }

    /**
     * 전시회 날짜의 유효성을 검사합니다.
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     * @throws {Error} 유효하지 않은 날짜일 경우
     */
    validateDates(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime())) {
            throw new Error('시작 날짜가 유효하지 않습니다.');
        }
        if (isNaN(end.getTime())) {
            throw new Error('종료 날짜가 유효하지 않습니다.');
        }
        if (start > end) {
            throw new Error('종료 날짜는 시작 날짜보다 늦어야 합니다.');
        }
    }

    /**
     * 전시회 타입의 유효성을 검사합니다.
     * @param {string} exhibitionType - 전시회 타입
     * @throws {Error} 유효하지 않은 타입일 경우
     */
    validateExhibitionType(exhibitionType) {
        const validTypes = ['regular', 'special', 'permanent'];
        if (!validTypes.includes(exhibitionType)) {
            throw new Error('유효하지 않은 전시회 타입입니다.');
        }
    }

    /**
     * 전시회 정보의 전체 유효성을 검사합니다.
     * @param {Object} exhibition - 전시회 정보
     * @throws {Error} 유효하지 않은 정보가 있을 경우
     */
    validateExhibition(exhibition) {
        this.validateTitle(exhibition.title);
        this.validateDescription(exhibition.description);
        this.validateDates(exhibition.startDate, exhibition.endDate);
        this.validateExhibitionType(exhibition.exhibitionType);
    }
}

export default ExhibitionDomainService;
