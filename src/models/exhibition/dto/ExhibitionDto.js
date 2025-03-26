/**
 * 전시회 DTO 클래스
 * 전시회 데이터를 전송하기 위한 객체입니다.
 */
class ExhibitionDto {
    constructor(exhibition) {
        this.id = exhibition.id;
        this.title = exhibition.title;
        this.subtitle = exhibition.subtitle;
        this.description = exhibition.description;
        this.start_date = exhibition.start_date;
        this.end_date = exhibition.end_date;
        this.thumbnail = exhibition.thumbnail;
        this.code = exhibition.code;
        this.created_at = exhibition.created_at;
        this.updated_at = exhibition.updated_at;
    }
}

export default ExhibitionDto;
