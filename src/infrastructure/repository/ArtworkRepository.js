import { Artwork } from '../../domain/artwork/Artwork.js';

export default class ArtworkRepository {
    constructor() {
        this.artworks = [
            new Artwork(
                1,
                '작품 1',
                '작품 1의 설명입니다.',
                '/images/artwork1.jpg',
                '회화과',
                2024,
                1
            ),
            new Artwork(
                2,
                '작품 2',
                '작품 2의 설명입니다.',
                '/images/artwork2.jpg',
                '조각과',
                2024,
                1
            ),
            new Artwork(
                3,
                '작품 3',
                '작품 3의 설명입니다.',
                '/images/artwork3.jpg',
                '서예과',
                2024,
                1
            )
        ];
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
        return this.artworks.filter(artwork =>
            artwork.title.toLowerCase().includes(query.toLowerCase()) ||
            artwork.description.toLowerCase().includes(query.toLowerCase())
        );
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
            artworkData.exhibitionId
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
        // 임시로 모든 작품을 반환
        return this.artworks;
    }
}
