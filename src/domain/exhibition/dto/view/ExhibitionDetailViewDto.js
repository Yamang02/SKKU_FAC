/**
 * 전시회 상세 페이지 ViewDTO
 */
class ExhibitionDetailViewDto {
    constructor({
        title,
        exhibition,
        artworks = [],
        pagination = null
    }) {
        this.title = title;
        this.exhibition = exhibition;
        this.artworks = artworks;
        this.pagination = pagination;
    }

    toView() {
        return {
            title: this.title,
            exhibition: this.exhibition,
            artworks: this.artworks,
            pagination: this.pagination
        };
    }
}

export default ExhibitionDetailViewDto;
