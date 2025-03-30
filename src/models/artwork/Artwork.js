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
        artist_name,
        image_path = null,
        image_url = null,
        created_at = new Date(),
        updated_at = new Date()
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.department = department;
        this.student_id = student_id;
        this.artist_name = artist_name;
        this.image_path = image_path;
        this.image_url = image_url;
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
            artist_name: this.artist_name,
            image_path: this.image_path,
            image_url: this.image_url,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    /**
     * 작품 데이터를 업데이트
     * @param {Object} data - 업데이트할 데이터
     */
    update(data) {
        Object.keys(data).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                this[key] = data[key];
            }
        });
        this.updated_at = new Date();
    }
}
