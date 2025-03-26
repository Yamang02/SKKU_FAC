import ArtworkRepository from '../repositories/ArtworkRepository.js';

export default class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
    }

    async getArtworkList(page, limit, searchType, keyword) {
        return await this.artworkRepository.findAll({
            page,
            limit,
            searchType,
            keyword
        });
    }

    async getArtworkDetail(artworkId) {
        const artwork = await this.artworkRepository.findById(artworkId);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }
        return artwork;
    }

    async createArtwork(artworkData) {
        return await this.artworkRepository.create(artworkData);
    }

    async updateArtwork(artworkId, artworkData) {
        const artwork = await this.artworkRepository.findById(artworkId);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }
        await this.artworkRepository.update(artworkId, artworkData);
    }

    async deleteArtwork(artworkId) {
        const artwork = await this.artworkRepository.findById(artworkId);
        if (!artwork) {
            throw new Error('작품을 찾을 수 없습니다.');
        }
        await this.artworkRepository.delete(artworkId);
    }

    async getArtworksByExhibition(exhibitionId, page, limit) {
        return await this.artworkRepository.findByExhibitionId(exhibitionId, {
            page,
            limit
        });
    }
}
