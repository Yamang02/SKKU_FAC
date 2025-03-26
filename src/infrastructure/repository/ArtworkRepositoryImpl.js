class ArtworkRepositoryImpl {
    constructor() {
        this.artworks = new Map();
        this.nextId = 1;
    }

    // ... existing code ...

    async findByUserId(userId, offset = 0, limit = 10) {
        const userArtworks = Array.from(this.artworks.values())
            .filter(artwork => artwork.userId === userId)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(offset, offset + limit);

        return userArtworks;
    }

    async countByUserId(userId) {
        return Array.from(this.artworks.values())
            .filter(artwork => artwork.userId === userId)
            .length;
    }

    /**
     * 모든 작품을 조회합니다.
     * @returns {Promise<Array>} 작품 목록
     */
    async findAll() {
        return Array.from(this.artworks.values());
    }

    /**
     * 작품을 수정합니다.
     * @param {number} id - 작품 ID
     * @param {Object} updateData - 수정할 데이터
     * @returns {Promise<Object>} 수정된 작품
     */
    async update(id, updateData) {
        const artwork = this.artworks.get(id);
        if (!artwork) return null;

        const updatedArtwork = { ...artwork, ...updateData, updatedAt: new Date() };
        this.artworks.set(id, updatedArtwork);
        return updatedArtwork;
    }

    /**
     * 작품을 삭제합니다.
     * @param {number} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async delete(id) {
        return this.artworks.delete(id);
    }
}

export default ArtworkRepositoryImpl;
