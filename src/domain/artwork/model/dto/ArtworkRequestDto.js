/**
 * 작품 요청 데이터를 위한 DTO
 */
export default class ArtworkRequestDTO {
    constructor(data = {}) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.image = data.image;
        this.imageId = data.imageId;
        this.artistId = data.artistId;
        this.artistName = data.artistName;
        this.department = data.department;
        this.exhibitionId = data.exhibitionId;
        this.exhibitionName = data.exhibitionName;
        this.year = data.year;
        this.medium = data.medium;
        this.size = data.size;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            image: this.image,
            imageId: this.imageId,
            artistId: this.artistId,
            artistName: this.artistName,
            department: this.department,
            exhibitionId: this.exhibitionId,
            exhibitionName: this.exhibitionName,
            year: this.year,
            medium: this.medium,
            size: this.size
        };
    }
}
