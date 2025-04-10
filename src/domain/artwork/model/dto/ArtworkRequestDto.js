/**
 * 작품 요청 데이터를 위한 DTO
 */
export default class ArtworkRequestDTO {
    constructor(data = {}) {
        this.id = data.id || '';
        this.title = data.title || null;
        this.description = data.description || '';
        this.userId = data.userId || null;
        this.exhibitionId = data.exhibitionId || 0;
        this.year = data.year || '';
        this.medium = data.medium || '';
        this.size = data.size || '';
    }
}
