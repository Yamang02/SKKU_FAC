import artwork from '../config/data/artwork.js';
import { getRelatedArtworks } from '../config/data/relatedArtwork.js';

export default class ArtworkRepository {
    constructor() {
        this.artworks = artwork;
        this.getRelatedArtworks = getRelatedArtworks;
    }

    /**
     * 모든 작품을 조회합니다.
     */
    async findArtworks({ page = 1, limit = 12, search, exhibitionId } = {}) {
        let filteredArtworks = [...this.artworks];

        if (search) {
            filteredArtworks = filteredArtworks.filter(artwork =>
                artwork.title.includes(search) ||
                artwork.description.includes(search)
            );
        }

        if (exhibitionId) {
            filteredArtworks = filteredArtworks.filter(artwork =>
                artwork.exhibition_id === exhibitionId
            );
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const total = filteredArtworks.length;

        return {
            items: filteredArtworks.slice(start, end),
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * ID로 작품을 조회합니다.
     */
    async findArtworkById(id) {
        return this.artworks.find(artwork => artwork.id === Number(id));
    }

    /**
     * 전시회 ID로 작품을 조회합니다.
     */
    async findArtworksByExhibitionId(exhibitionId, { page = 1, limit = 12 } = {}) {
        const filteredArtworks = this.artworks.filter(artwork =>
            artwork.exhibition_id === exhibitionId
        );

        const start = (page - 1) * limit;
        const end = start + limit;
        const total = filteredArtworks.length;

        return {
            items: filteredArtworks.slice(start, end),
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * 새로운 작품을 생성합니다.
     */
    async createArtwork(artworkData) {
        const newArtwork = {
            id: (Math.max(...this.artworks.map(a => a.id)) + 1).toString(),
            ...artworkData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.artworks.push(newArtwork);
        return newArtwork;
    }

    /**
     * 작품 정보를 수정합니다.
     */
    async updateArtwork(id, artworkData) {
        const index = this.artworks.findIndex(artwork => artwork.id === id);
        if (index === -1) return null;

        this.artworks[index] = {
            ...this.artworks[index],
            ...artworkData,
            updated_at: new Date().toISOString()
        };
        return this.artworks[index];
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(id) {
        const index = this.artworks.findIndex(artwork => artwork.id === id);
        if (index === -1) return false;

        this.artworks.splice(index, 1);
        return true;
    }

    /**
     * 추천 작품을 조회합니다.
     */
    async findRelatedArtworks(artworkId) {
        const artwork = await this.findArtworkById(artworkId);
        if (!artwork) return { items: [], total: 0 };

        const relatedArtworks = this.artworks
            .filter(a => a.id !== artworkId && a.exhibition_id === artwork.exhibition_id)
            .slice(0, 4);

        return {
            items: relatedArtworks,
            total: relatedArtworks.length
        };
    }

    /**
     * 추천 작품을 조회합니다.
     */
    async findFeaturedArtworks(limit = 6) {
        return this.artworks.filter(artwork => artwork.isFeatured).slice(0, limit);
    }

    async findComments(artworkId, { page = 1, limit = 10 } = {}) {
        // 임시로 빈 댓글 목록 반환
        return {
            items: [],
            total: 0,
            page: Number(page),
            totalPages: 1,
            limit: Number(limit)
        };
    }
}
