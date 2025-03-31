/**
 * 작품 기본 DTO
 */
export default class ArtworkBaseDto {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.image = data.image || '';
        this.imagePath = data.imagePath || '';
        this.artistId = data.artistId || null;
        this.artistName = data.artistName || '';
        this.department = data.department || '';
        this.medium = data.medium || '';
        this.size = data.size || '';
        this.year = data.year || '';
        this.isFeatured = data.isFeatured || false;
        this.exhibitionId = data.exhibitionId || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            image: this.image,
            imagePath: this.imagePath,
            artistId: this.artistId,
            artistName: this.artistName,
            department: this.department,
            medium: this.medium,
            size: this.size,
            year: this.year,
            isFeatured: this.isFeatured,
            exhibitionId: this.exhibitionId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
