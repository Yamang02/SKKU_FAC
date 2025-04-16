/**
 * 간단한 전시회 정보를 위한 DTO
 */
export default class ExhibitionSimpleDto {
    constructor(exhibition) {
        this.id = exhibition.id;
        this.title = exhibition.title;
        this.isFeatured = exhibition.isFeatured;
        this.imageUrl = exhibition.imageUrl || '';
        this.isSubmissionOpen = exhibition.isSubmissionOpen === true;
    }

}
