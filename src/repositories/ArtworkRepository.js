import Artwork from '../models/artwork/Artwork.js';
import Image from '../models/common/image/Image.js';
import { getRelatedArtworks } from '../config/data/relatedArtwork.js';
import artworkData from '../config/data/artwork.js';
import imageData from '../config/data/image.js';
import path from 'path';
import fs from 'fs/promises';

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
                image: data.image || '',
                exhibitionId: data.exhibitionId !== undefined ? data.exhibitionId : 0,
                createdAt: data.createdAt || '',
                updatedAt: data.updatedAt || ''
            });
        });

        this.images = imageData.map(data => new Image(data));
        this.getRelatedArtworks = getRelatedArtworks;
        this.artworkFilePath = path.join(process.cwd(), 'src', 'config', 'data', 'artwork.js');
        this.imageFilePath = path.join(process.cwd(), 'src', 'config', 'data', 'image.js');
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
     * 모든 작품을 반환합니다.
     * @returns {Promise<Array<Artwork>>} 작품 목록
     */
    async findArtworks({ page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', searchType, keyword, artistId, exhibitionId, isFeatured } = {}) {
        let filteredArtworks = [...this.artworks];

        // 검색 조건 적용
        if (searchType && keyword) {
            filteredArtworks = filteredArtworks.filter(artwork => {
                switch (searchType) {
                case 'title':
                    return artwork.title.toLowerCase().includes(keyword.toLowerCase());
                case 'artist':
                    return artwork.artistName.toLowerCase().includes(keyword.toLowerCase());
                case 'department':
                    return artwork.department.toLowerCase().includes(keyword.toLowerCase());
                default:
                    return true;
                }
            });
        }

        // 작가 ID로 필터링
        if (artistId) {
            filteredArtworks = filteredArtworks.filter(artwork => artwork.artistId === Number(artistId));
        }

        // 전시회 ID로 필터링
        if (exhibitionId) {
            filteredArtworks = filteredArtworks.filter(artwork => artwork.exhibitionId === Number(exhibitionId));
        }

        // 추천 작품 필터링
        if (isFeatured !== undefined) {
            filteredArtworks = filteredArtworks.filter(artwork => artwork.isFeatured === isFeatured);
        }

        // 정렬 적용
        filteredArtworks.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            return sortOrder === 'asc' ?
                (aValue > bValue ? 1 : -1) :
                (aValue < bValue ? 1 : -1);
        });

        // 페이지네이션 적용
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex);

        return {
            items: paginatedArtworks,
            total: filteredArtworks.length,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(filteredArtworks.length / limit)
        };
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
        exhibitionId: artwork.exhibitionId,
        department: artwork.department || '',
        medium: artwork.medium || '',
        size: artwork.size || '',
        description: artwork.description || '',
        image: artwork.image,
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
        if (!artworkData.title || !artworkData.artistId || !artworkData.artistName || !artworkData.department) {
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
    async findFeaturedArtworks(limit = 6) {
        // TODO: DB 연동 시 아래 쿼리로 변경
        /*
        const query = `
            SELECT * FROM artworks
            WHERE is_featured = true
            ORDER BY created_at DESC
            LIMIT ?
        `;
        const [rows] = await this.db.query(query, [limit]);
        return rows.map(row => new Artwork(row));
        */

        // 현재는 메모리에서 필터링
        return this.artworks
            .filter(artwork => artwork.isFeatured)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
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
     * 이미지 데이터를 파일에 저장합니다.
     * @private
     */
    async _saveImageToFile() {
        const imageContent = `/**
 * 이미지 데이터
 */
const image = ${JSON.stringify(this.images.map(image => ({
        id: image.id,
        originalName: image.originalName,
        storedName: image.storedName,
        filePath: image.filePath,
        fileSize: image.fileSize,
        mimeType: image.mimeType,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt
    })), null, 2)};

export default image;
`;
        await fs.writeFile(this.imageFilePath, imageContent, 'utf8');
    }

    /**
     * 이미지를 저장합니다.
     * @param {Object} imageData - 이미지 데이터
     * @returns {Promise<number>} 저장된 이미지 ID
     */
    async saveImage(imageData) {
        // 임시 구현
        const image = new Image({
            ...imageData,
            id: this.images.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        this.images.push(image);
        await this._saveImageToFile();
        return image.id;
    }

    /**
     * 이미지를 ID로 조회합니다.
     * @param {number} id - 이미지 ID
     * @returns {Promise<Image|null>} 이미지 객체
     */
    async findImageById(id) {
        return this.images.find(img => img.id === id) || null;
    }

    /**
     * 이미지를 삭제합니다.
     * @param {number} id - 이미지 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    async deleteImage(id) {
        const index = this.images.findIndex(img => img.id === id);
        if (index === -1) return false;
        this.images.splice(index, 1);
        await this._saveImageToFile();
        return true;
    }
}
