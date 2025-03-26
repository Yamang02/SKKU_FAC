/**
 * 프로필 페이지 ViewDTO
 */
class ProfileViewDto {
    constructor({
        title = '프로필',
        user = null,
        artworks = [],
        comments = [],
        pagination = {
            currentPage: 1,
            totalPages: 1,
            total: 0
        }
    }) {
        this.title = title;
        this.user = user;
        this.artworks = Array.isArray(artworks) ? artworks : [];
        this.comments = Array.isArray(comments) ? comments : [];
        this.pagination = pagination;
    }

    toView() {
        return {
            title: this.title,
            user: this.user || {},
            artworks: this.artworks || [],
            comments: this.comments || [],
            pagination: this.pagination || {
                currentPage: 1,
                totalPages: 1,
                total: 0
            }
        };
    }
}

export default ProfileViewDto;
