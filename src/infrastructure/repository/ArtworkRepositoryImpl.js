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
}

export default ArtworkRepositoryImpl;
