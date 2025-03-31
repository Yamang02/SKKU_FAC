/**
 * 작품 응답 데이터를 위한 DTO
 */
export default class ArtworkResponseDTO {
    constructor(data = {}) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.image = data.image;
        this.imagePath = data.imagePath;
        this.artistId = data.artistId;
        this.artistName = data.artistName;
        this.department = data.department;
        this.exhibitionId = data.exhibitionId;
        this.exhibitionName = data.exhibitionName;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
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
            exhibitionId: this.exhibitionId,
            exhibitionName: this.exhibitionName,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
