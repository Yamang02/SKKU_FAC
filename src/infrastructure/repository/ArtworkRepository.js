import { Artwork } from '../../domain/artwork/Artwork.js';
import artworkData from '../data/artwork.js';
import { getCommentsByArtworkId } from '../data/comment.js';

export default class ArtworkRepository {
    constructor() {
        this.artworks = artworkData.map(data => new Artwork(
            data.id,
            data.title,
            data.description,
            data.image,
            data.department,
            data.year,
            data.isFeatured,
            data.exhibitionId,
            data.artist
        ));
    }

    async findAll() {
        return this.artworks;
    }

    async findById(id) {
        return this.artworks.find(artwork => artwork.id === id);
    }

    async findByExhibitionId(exhibitionId) {
        return this.artworks.filter(artwork => artwork.exhibitionId === exhibitionId);
    }

    async searchArtworks(query) {
        if (typeof query === 'object') {
            return this.artworks;
        }

        if (typeof query === 'string') {
            return this.artworks.filter(artwork =>
                artwork.title.includes(query) ||
                artwork.description.includes(query)
            );
        }

        return this.artworks;
    }

    async getDepartments() {
        return [...new Set(this.artworks.map(artwork => artwork.department))];
    }

    async getYears() {
        return [...new Set(this.artworks.map(artwork => artwork.year))];
    }

    async create(artworkData) {
        const artwork = new Artwork(
            this.artworks.length + 1,
            artworkData.title,
            artworkData.description,
            artworkData.imageUrl,
            artworkData.department,
            artworkData.year,
            artworkData.featured || false,
            artworkData.exhibitionId,
            artworkData.artist
        );
        this.artworks.push(artwork);
        return artwork;
    }

    async update(id, artworkData) {
        const index = this.artworks.findIndex(artwork => artwork.id === id);
        if (index === -1) return null;

        const artwork = this.artworks[index];
        Object.assign(artwork, artworkData);
        return artwork;
    }

    async delete(id) {
        const index = this.artworks.findIndex(artwork => artwork.id === id);
        if (index === -1) return false;

        this.artworks.splice(index, 1);
        return true;
    }

    async deleteByExhibitionId(exhibitionId) {
        this.artworks = this.artworks.filter(artwork => artwork.exhibitionId !== exhibitionId);
        return true;
    }

    async getFeaturedArtworks() {
        return this.artworks.filter(artwork => artwork.featured);
    }

    /**
     * 작품의 댓글 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     * @param {number} page - 페이지 번호
     */
    async getComments(artworkId, page = 1) {
        return getCommentsByArtworkId(artworkId, page);
    }

    /**
     * 관련 작품 목록을 조회합니다.
     * @param {number} artworkId - 작품 ID
     */
    async getRelatedArtworks(artworkId) {
        const artwork = this.artworks.find(art => art.id === artworkId);
        if (!artwork) return [];

        // 같은 전시회의 다른 작품들을 가져옵니다 (현재 작품 제외)
        return this.artworks.filter(art =>
            art.exhibitionId === artwork.exhibitionId &&
            art.id !== artworkId
        ).slice(0, 3); // 최대 3개까지만 표시
    }
}
