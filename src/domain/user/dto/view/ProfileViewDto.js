/**
 * 프로필 페이지 ViewDTO
 */
class ProfileViewDto {
    constructor({
        title = '프로필',
        user,
        artworks = [],
        comments = [],
        pagination = null
    }) {
        this.title = title;
        this.user = user;
        this.artworks = artworks;
        this.comments = comments;
        this.pagination = pagination;
    }

    toView() {
        return {
            title: this.title,
            user: this.user,
            artworks: this.artworks,
            comments: this.comments,
            pagination: this.pagination
        };
    }
}

export default ProfileViewDto;
