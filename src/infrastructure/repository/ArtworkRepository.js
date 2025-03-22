import { Artwork } from '../../domain/artwork/Artwork.js';
import artworkData from '../data/artwork.js';

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
}
