/**
 * 작품 요청 데이터를 위한 DTO
 */
export default class ArtworkRequestDTO {
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
    }

    validate() {
        if (!this.title) {
            throw new Error('제목은 필수입니다.');
        }
        if (!this.artistId) {
            throw new Error('작가 ID는 필수입니다.');
        }
        if (!this.artistName) {
            throw new Error('작가 이름은 필수입니다.');
        }
        if (!this.department) {
            throw new Error('학과는 필수입니다.');
        }
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
            exhibitionName: this.exhibitionName
        };
    }
}
