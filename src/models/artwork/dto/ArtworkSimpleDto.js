/**
 * 간단한 작품 정보를 위한 DTO
 */
export default class ArtworkSimpleDTO {
    constructor(artwork, type = 'card') {
        this.id = artwork.id;
        this.title = artwork.title;
        this.imageId = artwork.imageId;
        this.image = artwork.imageId && artwork.image ? artwork.image : null;
        this.artistName = artwork.artistName;
        this.department = artwork.department;
        this.exhibitionId = artwork.exhibitionId;
        this.exhibitionTitle = artwork.exhibitionTitle;
        this.createdAt = artwork.createdAt;
        this.type = type;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            imageId: this.imageId,
            image: this.image,
            artistName: this.artistName,
            department: this.department,
            exhibitionId: this.exhibitionId,
            exhibitionTitle: this.exhibitionTitle,
            type: this.type
        };
    }
}
