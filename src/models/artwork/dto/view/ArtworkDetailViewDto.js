/**
 * 작품 상세 페이지 ViewDTO
 */
class ArtworkDetailViewDto {
    constructor({
        title,
        artwork,
        comments = [],
        relatedArtworks = [],
        commentPagination = null
    }) {
        this.title = title;
        this.artwork = artwork;
        this.comments = comments;
        this.relatedArtworks = relatedArtworks;
        this.commentPagination = commentPagination;
    }

    toView() {
        return {
            title: this.title,
            artwork: this.artwork,
            comments: this.comments,
            relatedArtworks: this.relatedArtworks,
            commentPagination: this.commentPagination
        };
    }
}

export default ArtworkDetailViewDto;
