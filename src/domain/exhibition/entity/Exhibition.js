/**
 * 전시회 도메인 엔티티
 */
class Exhibition {
    constructor(data) {
        this.id = data.id;
        this.code = data.code;
        this.title = data.title;
        this.subtitle = data.subtitle;
        this.description = data.description;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.image = data.image;
        this.exhibitionType = data.exhibitionType || 'regular'; // 기본값은 정기 전시회
    }
}

export default Exhibition;
