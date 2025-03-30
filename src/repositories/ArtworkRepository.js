import artwork from '../config/data/artwork.js';
import { getRelatedArtworks } from '../config/data/relatedArtwork.js';
import fs from 'fs';
import path from 'path';

export default class ArtworkRepository {
    constructor() {
        this.artworks = artwork;
        this.getRelatedArtworks = getRelatedArtworks;
        this.artworkFilePath = path.join(process.cwd(), 'src', 'config', 'data', 'artwork.js');
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
     * @param {string|number} id - 작품 ID
     * @returns {Promise<Object|null>} 작품 정보
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
     * @param {Object} artworkData - 작품 데이터
     * @returns {Promise<Object>} 생성된 작품 정보
     */
    async createArtwork(artworkData) {
        // 새로운 ID 생성
        const newId = this.artworks.length > 0
            ? Math.max(...this.artworks.map(a => Number(a.id))) + 1
            : 1;

        // 새로운 작품 객체 생성
        const newArtwork = {
            id: newId,
            title: artworkData.title,
            artist: artworkData.artist_name,
            department: artworkData.department,
            year: new Date().getFullYear().toString(),
            medium: artworkData.medium || '',
            size: artworkData.size || '',
            description: artworkData.description || '',
            image: artworkData.image_url || '/images/artwork-placeholder.jpg',
            exhibition: artworkData.exhibition_title || '',
            exhibitionId: artworkData.exhibition_id || null,
            isFeatured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // 메모리에 작품 추가
        this.artworks.push(newArtwork);

        // 파일에 작품 데이터 저장
        const fileContent = `/**
 * 작품 데이터
 */
const artwork = ${JSON.stringify(this.artworks, null, 4)};

export default artwork;
`;

        try {
            await fs.promises.writeFile(this.artworkFilePath, fileContent, 'utf8');
        } catch (error) {
            console.error('작품 데이터 파일 저장 중 오류:', error);
            throw new Error('작품 데이터를 저장하는 중 오류가 발생했습니다.');
        }

        return newArtwork;
    }

    /**
     * 작품 정보를 수정합니다.
     * @param {string|number} id - 작품 ID
     * @param {Object} artworkData - 업데이트할 작품 데이터
     * @returns {Promise<Object|null>} 업데이트된 작품 정보
     */
    async updateArtwork(id, artworkData) {
        const index = this.artworks.findIndex(artwork => artwork.id === id);
        if (index === -1) return null;

        // 메모리 데이터 업데이트
        this.artworks[index] = {
            ...this.artworks[index],
            ...artworkData,
            updated_at: new Date().toISOString()
        };

        // 파일에 데이터 저장
        const fileContent = `/**
 * 작품 데이터
 */
const artwork = ${JSON.stringify(this.artworks, null, 4)};

export default artwork;
`;

        try {
            await fs.promises.writeFile(this.artworkFilePath, fileContent, 'utf8');
        } catch (error) {
            console.error('작품 데이터 파일 저장 중 오류:', error);
            throw new Error('작품 데이터를 저장하는 중 오류가 발생했습니다.');
        }

        return this.artworks[index];
    }

    /**
     * 작품을 삭제합니다.
     */
    async deleteArtwork(id) {
        const index = this.artworks.findIndex(artwork => artwork.id === Number(id));
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

    /**
     * 모든 작가를 조회합니다.
     */
    async findArtists({ page = 1, limit = 100 } = {}) {
        // 작품 목록에서 중복 없는 작가 목록 추출
        const artists = [...new Set(this.artworks.map(artwork => artwork.artist_name))]
            .map(name => ({
                id: name,
                name: name
            }));

        const start = (page - 1) * limit;
        const end = start + limit;
        const total = artists.length;

        return {
            items: artists.slice(start, end),
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        };
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

    /**
     * 작품 제목과 작가 이름으로 작품을 조회
     * @param {string} title - 작품 제목
     * @param {string} artist_name - 작가 이름
     * @returns {Promise<Object|null>} 작품 정보
     */
    async findByTitleAndArtist(title, artist_name) {
        const query = `
            SELECT * FROM artworks
            WHERE title = ? AND artist_name = ?
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const [rows] = await this.db.query(query, [title, artist_name]);
        return rows[0] || null;
    }
}
