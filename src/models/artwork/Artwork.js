/**
 * 작품 모델 클래스
 */
export default class Artwork {
    constructor({
        id = null,
        title,
        description,
        department,
        student_id,
        artist,
        image_path = null,
        image = null,
        created_at = new Date(),
        updated_at = new Date()
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.department = department;
        this.student_id = student_id;
        this.artist = artist;
        this.image_path = image_path;
        this.image = image;
        this.created_at = created_at;
        this.updated_at = updated_at;
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
     * 작품 데이터를 객체로 변환
     * @returns {Object} 작품 데이터 객체
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            department: this.department,
            student_id: this.student_id,
            artist: this.artist,
            image_path: this.image_path,
            image: this.image,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    /**
     * 작품 데이터를 업데이트
     * @param {Object} data - 업데이트할 데이터
     */
    update(data) {
        Object.assign(this, data);
        this.updated_at = new Date();
    }
}
