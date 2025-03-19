import Artwork from '../../domain/artwork/entity/Artwork.js';
import ArtworkRepository from '../../domain/artwork/repository/ArtworkRepository.js';
import artworksData from '../data/artwork.js';

/**
 * 작품 리포지토리 구현체
 * @implements {ArtworkRepository}
 */
class ArtworkRepositoryImpl extends ArtworkRepository {
    /**
     * @inheritdoc
     */
    async findById(id) {
        const data = artworksData.find(art => art.id === parseInt(id));
        return data ? new Artwork(data) : null;
    }

    /**
     * @inheritdoc
     */
    async searchArtworks({ keyword, exhibition, year, department, featured, limit = 12, offset = 0 }) {
        let filteredArtworks = [...artworksData];

        // 키워드 검색
        if (keyword) {
            const searchRegex = new RegExp(keyword, 'i');
            filteredArtworks = filteredArtworks.filter(art =>
                searchRegex.test(art.title) ||
                searchRegex.test(art.artist) ||
                searchRegex.test(art.description)
            );
        }

        // 전시회 필터
        if (exhibition) {
            filteredArtworks = filteredArtworks.filter(art => art.exhibitionId === parseInt(exhibition));
        }

        // 연도 필터
        if (year) {
            filteredArtworks = filteredArtworks.filter(art => art.year === parseInt(year));
        }

        // 학과 필터
        if (department) {
            filteredArtworks = filteredArtworks.filter(art => art.department === department);
        }

        // 주목할 만한 작품 필터
        if (featured) {
            filteredArtworks = filteredArtworks.filter(art => art.featured);
        }

        // 페이지네이션
        const total = filteredArtworks.length;
        const items = filteredArtworks
            .slice(offset, offset + limit)
            .map(data => new Artwork(data));

        return {
            items,
            total
        };
    }

    /**
     * @inheritdoc
     */
    async findByExhibitionId(exhibitionId) {
        const filteredArtworks = artworksData.filter(art => art.exhibitionId === parseInt(exhibitionId));
        return filteredArtworks.map(data => new Artwork(data));
    }

    /**
     * @inheritdoc
     */
    async findRelatedArtworks(artworkId) {
        const artwork = await this.findById(artworkId);
        if (!artwork) return [];

        // 같은 작가의 다른 작품이나 같은 학과의 작품을 관련 작품으로 추천
        const relatedArtworks = artworksData
            .filter(art => art.id !== parseInt(artworkId) &&
                (art.artist === artwork.artist || art.department === artwork.department))
            .slice(0, 4)
            .map(data => new Artwork(data));

        return relatedArtworks;
    }

    /**
     * @inheritdoc
     */
    async getDepartments() {
        return [...new Set(artworksData.map(art => art.department))].sort();
    }

    /**
     * @inheritdoc
     */
    async getYears() {
        return [...new Set(artworksData.map(art => art.year))].sort((a, b) => b - a);
    }

    /**
     * @inheritdoc
     */
    async create(artwork) {
        const newId = Math.max(...artworksData.map(art => art.id)) + 1;
        const newArtwork = { ...artwork, id: newId };
        artworksData.push(newArtwork);
        return new Artwork(newArtwork);
    }

    /**
     * @inheritdoc
     */
    async update(id, artwork) {
        const index = artworksData.findIndex(art => art.id === parseInt(id));
        if (index === -1) return null;

        artworksData[index] = { ...artworksData[index], ...artwork };
        return new Artwork(artworksData[index]);
    }

    /**
     * @inheritdoc
     */
    async delete(id) {
        const index = artworksData.findIndex(art => art.id === parseInt(id));
        if (index === -1) return false;

        artworksData.splice(index, 1);
        return true;
    }
}

export default ArtworkRepositoryImpl;
