/**
 * 간단한 전시회 정보를 위한 DTO
 */
export default class ExhibitionSimpleDto {
    constructor(exhibition) {
        this.id = exhibition.id;
        this.title = exhibition.title;
        this.isSubmissionOpen = exhibition.isSubmissionOpen === true;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            isSubmissionOpen: this.isSubmissionOpen
        };
    }
}
