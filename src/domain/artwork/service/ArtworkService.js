import Artwork from '../entity/Artwork.js';
import ArtworkDTO from '../dto/ArtworkDTO.js';
import artworksData from '../../../infrastructure/data/artworks.js';
import * as exhibitionService from '../../exhibition/service/ExhibitionService.js';

/**
 * ID로 작품을 찾습니다.
 * @param {number} id 작품 ID
 * @returns {ArtworkDTO|null} 찾은 작품 DTO 또는 null
 */
export function getArtworkById(id) {
    const artwork = artworksData.find(art => art.id === parseInt(id));
    if (!artwork) return null;
    
    const artworkEntity = new Artwork(artwork);
    const exhibition = exhibitionService.getExhibitionByCode(artwork.exhibitionId);
    
    // DTO 변환 시 전시회 정보 추가
    const dto = _convertToDTO([artworkEntity])[0];
    if (exhibition) {
        dto.exhibition = exhibition.title;
    }
    
    return dto;
}

/**
 * 작품 목록을 검색 조건에 따라 가져옵니다.
 * @param {Object} filters 검색 필터
 * @returns {Object} 작품 목록과 총 개수
 */
export function getArtworks(filters = {}) {
    return searchArtworks(filters);
}

/**
 * 작품 목록을 검색 조건에 따라 가져옵니다.
 * @param {Object} filters 검색 필터
 * @returns {Object} 작품 목록과 총 개수
 */
export function searchArtworks(filters = {}) {
    const { keyword, exhibition, year, department, limit = 12, offset = 0 } = filters;
    
    // 필터링 로직
    let filteredArtworks = [...artworksData];
    
    if (keyword) {
        const searchTerm = keyword.toLowerCase();
        filteredArtworks = filteredArtworks.filter(art => 
            art.title.toLowerCase().includes(searchTerm) || 
            art.artist.toLowerCase().includes(searchTerm) ||
            art.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (exhibition) {
        filteredArtworks = filteredArtworks.filter(art => 
            art.exhibitionId === exhibition
        );
    }
    
    if (year) {
        filteredArtworks = filteredArtworks.filter(art => 
            art.year === parseInt(year)
        );
    }
    
    if (department) {
        filteredArtworks = filteredArtworks.filter(art => 
            art.department === department
        );
    }
    
    // 총 개수
    const total = filteredArtworks.length;
    
    // 페이지네이션
    const paginatedArtworks = filteredArtworks.slice(offset, offset + limit);
    
    // 엔티티 변환
    const artworkEntities = paginatedArtworks.map(art => new Artwork(art));
    
    return {
        items: _convertToDTO(artworkEntities),
        total
    };
}

/**
 * 학과 목록을 가져옵니다.
 * @returns {Array<string>} 학과 목록
 */
export function getDepartments() {
    const departments = [...new Set(artworksData.map(art => art.department))];
    return departments.sort();
}

/**
 * 연도 목록을 가져옵니다.
 * @returns {Array<number>} 연도 목록
 */
export function getYears() {
    const years = [...new Set(artworksData.map(art => art.year))];
    return years.sort((a, b) => b - a); // 내림차순 정렬
}

/**
 * 엔티티를 DTO로 변환합니다.
 * @param {Array<Artwork>} artworks 작품 엔티티 목록
 * @returns {Array<ArtworkDTO>} 작품 DTO 목록
 */
function _convertToDTO(artworks) {
    return artworks.map(artwork => {
        const exhibition = exhibitionService.getExhibitionByCode(artwork.exhibitionId);
        return new ArtworkDTO(artwork, exhibition);
    });
}