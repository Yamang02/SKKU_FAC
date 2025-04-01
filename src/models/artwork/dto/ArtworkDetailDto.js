
/**
 * 작품 상세 정보를 위한 DTO
 */
export default class ArtworkDetailDto {
    constructor(data = {}) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.imageId = data.imageId;
        this.image = data.imageId ? `/uploads/artworks/${data.image}` : null;
        this.artistId = data.artistId;
        this.artistName = data.artistName;
        this.department = data.department;
        this.year = data.year;
        this.medium = data.medium;
        this.size = data.size;
        this.exhibitionId = data.exhibitionId;
        this.exhibitionTitle = data.exhibitionTitle;
        this.isFeatured = data.isFeatured;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.relatedArtworks = data.relatedArtworks || [];
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
            updatedAt: this.updatedAt,
            relatedArtworks: this.relatedArtworks
        };
    }
}
