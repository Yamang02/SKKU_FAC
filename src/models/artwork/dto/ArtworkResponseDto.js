/**
 * 작품 응답 데이터를 위한 DTO
 */
export default class ArtworkResponseDTO {
    constructor(artwork) {
        this.id = artwork.id;
        this.title = artwork.title;
        this.description = artwork.description;
        this.imageId = artwork.imageId;
        this.image = artwork.imageId ? `/uploads/artworks/${artwork.image}` : null;
        this.artistId = artwork.artistId;
        this.artistName = artwork.artistName;
        this.department = artwork.department;
        this.year = artwork.year;
        this.medium = artwork.medium;
        this.size = artwork.size;
        this.exhibitionId = artwork.exhibitionId;
        this.exhibitionTitle = artwork.exhibitionTitle;
        this.isFeatured = artwork.isFeatured;
        this.createdAt = artwork.createdAt;
        this.updatedAt = artwork.updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            imageId: this.imageId,
            image: this.image,
            artistId: this.artistId,
            artistName: this.artistName,
            department: this.department,
            year: this.year,
            medium: this.medium,
            size: this.size,
            exhibitionId: this.exhibitionId,
            exhibitionTitle: this.exhibitionTitle,
            isFeatured: this.isFeatured,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
