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
    }
}

module.exports = Exhibition; 