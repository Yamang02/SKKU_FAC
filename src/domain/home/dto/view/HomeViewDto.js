/**
 * 홈 페이지 ViewDTO
 */
class HomeViewDto {
    constructor({
        title = '성균관대학교 미술관',
        featuredArtworks = [],
        recentExhibitions = [],
        recentNotices = []
    }) {
        this.title = title;
        this.featuredArtworks = featuredArtworks;
        this.recentExhibitions = recentExhibitions;
        this.recentNotices = recentNotices;
    }

    toView() {
        return {
            title: this.title,
            featuredArtworks: this.featuredArtworks,
            recentExhibitions: this.recentExhibitions,
            recentNotices: this.recentNotices
        };
    }
}

export default HomeViewDto;
