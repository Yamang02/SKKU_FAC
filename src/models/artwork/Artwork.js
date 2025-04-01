/**
 * 작품 모델
 */
export default class Artwork {
    constructor({
        id = 0,
        title = '',
        artistId = 0,
        department = '',
        year = '',
        medium = '',
        size = '',
        description = '',
        image = '',
        imageId = null,
        exhibitionId = 0,
        isFeatured = false,
        createdAt = '',
        updatedAt = '',
        // DTO시 분리될 정보
        exhibitionTitle = '',
        artistName = ''
    }) {
        this.id = id;
        this.title = title;
        this.artistId = artistId;
        this.artistName = artistName;
        this.department = department;
        this.year = year;
        this.medium = medium;
        this.size = size;
        this.description = description;
        this.image = image;
        this.imageId = imageId;
        this.exhibitionId = exhibitionId;
        this.exhibitionTitle = exhibitionTitle;
        this.isFeatured = isFeatured;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * 작품 데이터를 JSON 형태로 변환합니다.
     * @returns {Object} JSON 형태의 작품 데이터
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            artistId: this.artistId,
            artistName: this.artistName,
            department: this.department,
            year: this.year,
            medium: this.medium,
            size: this.size,
            description: this.description,
            image: this.image,
            imageId: this.imageId,
            exhibitionId: this.exhibitionId,
            exhibitionTitle: this.exhibitionTitle,
            isFeatured: this.isFeatured,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * 작품 데이터를 업데이트합니다.
     * @param {Object} data - 업데이트할 데이터
     */
    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date();
    }

    /**
     * 작품 데이터 유효성 검사
     * @returns {boolean} 유효성 검사 결과
     */
    validate() {
        if (!this.title) {
            throw new Error('작품 제목을 입력해주세요.');
        }
        return true;
    }

    /**
     * 작품 모델을 생성합니다.
     * @param {Object} data - 작품 데이터
     * @returns {Artwork} 생성된 작품 모델
     */
    static create(data) {
        return new Artwork(data);
    }
}
