/**
 * 작품 목록 페이지 ViewDTO
 */
class ArtworkListViewDto {
    constructor({
        title = '작품 목록',
        artworks = [],
        exhibitions = [],
        keyword = '',
        exhibition = '',
        year = '',
        department = '',
        pagination = null
    }) {
        this.title = title;
        this.artworks = artworks;
        this.exhibitions = exhibitions;
        this.keyword = keyword;
        this.exhibition = exhibition;
        this.year = year;
        this.department = department;
        this.pagination = pagination;
    }

    toView() {
        return {
            title: this.title,
            artworks: this.artworks,
            exhibitions: this.exhibitions,
            keyword: this.keyword,
            exhibition: this.exhibition,
            year: this.year,
            department: this.department,
            pagination: this.pagination
        };
    }
}

export default ArtworkListViewDto;
