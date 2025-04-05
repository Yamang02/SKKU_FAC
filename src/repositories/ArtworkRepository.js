import Artwork from '../models/artwork/Artwork.js';
import artworkData from '../config/data/artwork.js';
import path from 'path';
import fs from 'fs/promises';
import Page from '../models/common/page/Page.js';

export default class ArtworkRepository {
    constructor() {
        // TODO: DB 연동 시 아래 코드로 변경
        /*
        this.db = new Database(); // DB 연결 설정
        */

        // 현재는 임시 데이터 사용
        this.artworks = artworkData.map(data => {
            return new Artwork({
                ...data,
                artistName: data.artistName || '',
                imageId: data.imageId || null,
                exhibitionId: data.exhibitionId !== undefined ? data.exhibitionId : 0,
                createdAt: data.createdAt || '',
                updatedAt: data.updatedAt || ''
            });
        });

        this.artworkFilePath = path.join(process.cwd(), 'src', 'config', 'data', 'artwork.js');
    }

    /**
     * 모든 작품을 조회합니다.
     * @returns {Promise<Array<Artwork>>} 작품 목록
     */
    async findAll() {
        // TODO: DB 연동 시 아래 쿼리로 변경
        /*
        const query = `
            SELECT
                a.*,
                u.name as artist_name,
                e.title as exhibition_title
            FROM artworks a
            LEFT JOIN users u ON a.artist_id = u.id
            LEFT JOIN exhibitions e ON a.exhibition_id = e.id
            ORDER BY a.created_at DESC
        `;
        const [rows] = await this.db.query(query);
        return rows.map(row => new Artwork({
            ...row,
            artistName: row.artist_name,
            imagePath: row.image_path,
            exhibitionId: row.exhibition_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        */

        return this.artworks;
    }

    /**
     * 작품 목록을 조회합니다.
     */
    async findArtworks(options = {}) {
        try {
            // 1. 기본값 설정
            const page = options.page || 1;
            const limit = options.limit || 12;
            const sortField = options.sortField || 'createdAt';
            const sortOrder = options.sortOrder || 'desc';

            // 2. 필터링
            let filteredArtworks = [...this.artworks];

            if (options.isFeatured !== undefined) {
                filteredArtworks = filteredArtworks.filter(artwork => artwork.isFeatured === options.isFeatured);
            }
            if (options.exhibitionId) {
                filteredArtworks = filteredArtworks.filter(artwork => artwork.exhibitionId === Number(options.exhibitionId));
            }
            if (options.searchType && options.keyword) {
                const keyword = options.keyword.toLowerCase();
                filteredArtworks = filteredArtworks.filter(artwork => {
                    switch (options.searchType) {
                    case 'title':
                        return artwork.title.toLowerCase().includes(keyword);
                    case 'artist':
                        return artwork.artistName.toLowerCase().includes(keyword);
                    case 'department':
                        return artwork.department.toLowerCase().includes(keyword);
                    default:
                        return true;
                    }
                });
            }

            // 3. 정렬
            filteredArtworks.sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];
                return sortOrder === 'asc' ?
                    (aValue > bValue ? 1 : -1) :
                    (aValue < bValue ? 1 : -1);
            });

            // 4. 페이지네이션
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex);

            // 5. Page 객체 생성
            const total = filteredArtworks.length;
            const pageInfo = new Page(total, { page, limit });

            // 6. 결과 반환
            return {
                items: paginatedArtworks,
                total,
                page: pageInfo
            };
        } catch (error) {
            console.error('작품 목록 조회 중 오류:', error);
            throw error;
        }
    }

    /**
     * ID로 작품을 찾습니다.
     * @param {string|number} id - 작품 ID
     * @returns {Promise<Artwork|null>} 작품 정보
     */
    async findArtworkById(id) {
        const artwork = this.artworks.find(a => a.id === Number(id));
        return artwork || null;
    }

    /**
     * 전시회 ID로 작품을 찾습니다.
     * @param {string|number} exhibitionId - 전시회 ID
     * @returns {Promise<Array<Artwork>>} 작품 목록
     */
    async findArtworksByExhibitionId(exhibitionId, params = {}) {
        const { page = 1, limit = 10 } = params;
        const filteredArtworks = this.artworks.filter(a => a.exhibitionId === Number(exhibitionId));

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex);

        return {
            items: paginatedArtworks,
            total: filteredArtworks.length
        };
    }

    /**
     * 작품 데이터를 파일에 저장합니다.
     * @private
     */
    async _saveToFile() {
        const artworkContent = `/**
 * 작품 데이터
 */
const artwork = ${JSON.stringify(this.artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artistId: artwork.artistId,
        artistName: artwork.artistName,
        exhibitionId: artwork.exhibitionId,
        department: artwork.department || '',
        medium: artwork.medium || '',
        size: artwork.size || '',
        description: artwork.description || '',
        imageId: artwork.imageId,
        isFeatured: artwork.isFeatured || false,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt
    })), null, 2)};

export default artwork;
`;
        await fs.writeFile(this.artworkFilePath, artworkContent, 'utf8');
    }

    /**
     * 작품을 생성합니다.
     * @param {Object} artworkData - 작품 데이터
     * @returns {Promise<Artwork>} 생성된 작품
     */
    async createArtwork(artworkData) {
        // 작품 데이터 검증
        if (!artworkData) {
            throw new Error('작품 데이터가 없습니다.');
        }

        // 필수 필드 검증
        if (!artworkData.title || !artworkData.artistId || !artworkData.department) {
            throw new Error('필수 필드가 누락되었습니다.');
        }

        // 새로운 ID 생성
        const newId = this.artworks.length > 0
            ? Math.max(...this.artworks.map(a => a.id)) + 1
            : 1;

        // exhibitionId 처리
        if (artworkData.exhibitionId !== undefined && artworkData.exhibitionId !== null) {
            artworkData.exhibitionId = Number(artworkData.exhibitionId);
        }

        // Artwork 인스턴스 생성 및 검증
        const artwork = new Artwork({
            ...artworkData,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        artwork.validate();

        // 작품 추가
        this.artworks.push(artwork);

        // 파일에 저장
        await this._saveToFile();
        return artwork;
    }

    /**
     * 작품을 수정합니다.
     * @param {string|number} id - 작품 ID
     * @param {Object} artworkData - 수정할 작품 데이터
     * @returns {Promise<Artwork|null>} 수정된 작품
     */
    async updateArtwork(id, artworkData) {
        const index = this.artworks.findIndex(a => a.id === Number(id));
        if (index === -1) return null;

        // exhibitionId 처리
        if (artworkData.exhibitionId !== undefined && artworkData.exhibitionId !== null) {
            artworkData.exhibitionId = Number(artworkData.exhibitionId);
        }

        // Artwork 인스턴스 생성 및 검증
        const updatedArtwork = new Artwork({
            ...this.artworks[index],
            ...artworkData,
            updatedAt: new Date().toISOString()
        });
        updatedArtwork.validate();

        this.artworks[index] = updatedArtwork;
        await this._saveToFile();
        return updatedArtwork;
    }

    /**
     * 작품을 삭제합니다.
     * @param {string|number} id - 작품 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteArtwork(id) {
        const index = this.artworks.findIndex(a => a.id === Number(id));
        if (index === -1) return false;

        this.artworks.splice(index, 1);
        await this._saveToFile();
        return true;
    }

    /**
     * 모든 작가 목록을 반환합니다.
     * @returns {Promise<Array<Object>>} 작가 목록
     */
    async findArtists() {
        const uniqueArtists = [...new Set(this.artworks.map(a => a.artistName))];
        return uniqueArtists.map(artistName => ({
            id: artistName,
            name: artistName
        }));
    }

    /**
     * 관련 작품을 찾습니다.
     * @param {string|number} artworkId - 작품 ID
     * @returns {Promise<{items: Array<Artwork>, total: number}>} 관련 작품 목록
     */
    async findRelatedArtworks(artworkId) {
        try {
            const numId = Number(artworkId);

            // 관련 작품 ID 목록 가져오기
            const relatedIds = this.getRelatedArtworks ? this.getRelatedArtworks(numId) : [];

            // ID가 없거나 비어있으면 빈 배열 반환
            if (!relatedIds || !Array.isArray(relatedIds) || relatedIds.length === 0) {
                return { items: [], total: 0 };
            }

            // 관련 작품 찾기
            const relatedArtworks = this.artworks.filter(a => relatedIds.includes(Number(a.id)));

            return {
                items: relatedArtworks,
                total: relatedArtworks.length
            };
        } catch (error) {
            return { items: [], total: 0 };
        }
    }

    /**
     * 추천 작품을 찾습니다.
     * @param {number} limit - 반환할 작품 수
     * @returns {Promise<Array<Artwork>>} 추천 작품 목록
     */
    async findFeaturedArtworks(limit) {
        if (!this.db) {
            // 메모리 모드
            return this.artworks
                .filter(artwork => artwork.isFeatured)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }

        // DB 모드
        const query = `
            SELECT * FROM artworks
            WHERE is_featured = true
            ORDER BY created_at DESC
            LIMIT ?
        `;

        const [rows] = await this.db.query(query, [limit]);
        return rows.map(row => new Artwork(row));
    }

    /**
     * 작품 댓글을 찾습니다.
     * @param {string|number} artworkId - 작품 ID
     * @param {Object} params - 페이지네이션 파라미터
     * @returns {Promise<Array<Object>>} 댓글 목록
     */
    async findComments(artworkId, { _page = 1, _limit = 10 } = {}) {
        // TODO: 댓글 기능 구현
        return [];
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

    /**
     * 특정 작가의 다른 작품들을 조회합니다.
     * @param {number} artistId - 작가 ID
     * @param {number} limit - 조회할 최대 작품 수
     * @param {number} excludeId - 제외할 작품 ID
     * @returns {Promise<Array>} 작품 목록
     */
    async findByArtistId(artistId, limit, excludeId) {
        try {
            return this.artworks
                .filter(artwork => Number(artwork.artistId) === Number(artistId) && artwork.id !== Number(excludeId))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        } catch (error) {
            console.error('작가의 작품 조회 중 오류 발생:', error);
            return [];
        }
    }

    /**
     * 같은 전시회의 다른 작품들을 조회합니다.
     * @param {number} exhibitionId - 전시회 ID
     * @param {number} limit - 조회할 최대 작품 수
     * @param {number} excludeId - 제외할 작품 ID
     * @returns {Promise<Array>} 작품 목록
     */
    async findByExhibitionId(exhibitionId, limit, excludeId) {
        try {
            return this.artworks
                .filter(artwork => Number(artwork.exhibitionId) === Number(exhibitionId) && artwork.id !== Number(excludeId))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        } catch (error) {
            console.error('전시회의 작품 조회 중 오류 발생:', error);
            return [];
        }
    }
}
