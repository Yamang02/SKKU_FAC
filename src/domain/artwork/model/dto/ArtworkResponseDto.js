/**
 * 작품 응답 데이터를 위한 DTO
 */
export default class ArtworkResponseDTO {
    constructor(artwork) {
        this.id = artwork.id;
        this.title = artwork.title;
        this.description = artwork.description;
        this.image = artwork.image || null;
        this.imageId = artwork.imageId;
        this.artist = artwork.artist;
        this.department = artwork.department;
        this.year = artwork.year;
        this.medium = artwork.medium;
        this.size = artwork.size;
        this.exhibitionId = artwork.exhibitionId;
        this.exhibition = artwork.exhibition;
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
            artistId: this.artist.id,
            artistName: this.artist.name,
            department: this.department,
            year: this.year,
            medium: this.medium,
            size: this.size,
            exhibitionId: this.exhibitionId,
            exhibitionTitle: this.exhibition.title,
            isFeatured: this.isFeatured,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
