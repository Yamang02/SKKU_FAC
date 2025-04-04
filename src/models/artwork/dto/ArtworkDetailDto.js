/**
 * 작품 상세 정보를 위한 DTO
 */
export default class ArtworkDetailDto {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.artist = data.relations?.artist || null;
        this.artistName = data.relations?.artist?.name || '작가 미상';
        this.department = data.department || '';
        this.year = data.year || '';
        this.medium = data.medium || '';
        this.size = data.size || '';
        this.image = data.image || null;  // 이미 service에서 전체 경로를 포함하여 전달
        this.imageId = data.imageId || null;
        this.exhibitionId = data.exhibitionId || null;
        this.exhibition = data.relations?.exhibition || null;
        this.exhibitionTitle = data.relations?.exhibition?.title || '없음';
        this.isFeatured = data.isFeatured || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.relatedArtworkIds = data.relatedArtworkIds || [];
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            imageId: this.imageId,
            image: this.image,
            artistId: this.artist?.id || null,
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
            relatedArtworkIds: this.relatedArtworkIds
        };
    }
}
