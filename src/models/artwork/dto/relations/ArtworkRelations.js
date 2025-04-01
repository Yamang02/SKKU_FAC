/**
 * 작품 관계 데이터를 관리하는 클래스
 */
export default class ArtworkRelations {
    constructor() {
        this.artist = null;
        this.exhibition = null;
        this.image = null;
    }

    /**
     * 관계 데이터가 모두 로드되었는지 확인
     * @returns {boolean}
     */
    isLoaded() {
        return this.artist !== null &&
            this.exhibition !== null &&
            this.image !== null;
    }
}
