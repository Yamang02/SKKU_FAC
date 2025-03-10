/**
 * 전시회 데이터 전송 객체 (DTO)
 * 프레젠테이션 레이어로 전달되는 데이터 구조
 */
class ExhibitionDTO {
    constructor(exhibition) {
        this.id = exhibition.id;
        this.code = exhibition.code;
        this.title = exhibition.title;
        this.subtitle = exhibition.subtitle;
        this.description = exhibition.description;
        this.startDate = exhibition.startDate;
        this.endDate = exhibition.endDate;
        this.image = exhibition.image;
        this.fullTitle = exhibition.title + (exhibition.subtitle ? ': ' + exhibition.subtitle : '');
    }
}

export default ExhibitionDTO; 
