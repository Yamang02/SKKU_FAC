/**
 * 전시회 목록 페이지 ViewDTO
 */
class ExhibitionListViewDto {
    constructor({
        title = '전시회 목록',
        exhibitions = [],
        pagination = null
    }) {
        this.title = title;
        this.exhibitions = exhibitions;
        this.pagination = pagination;
    }

    toView() {
        return {
            title: this.title,
            exhibitions: this.exhibitions,
            pagination: this.pagination
        };
    }
}

export default ExhibitionListViewDto;
