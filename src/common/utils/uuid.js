import { v4 as uuidv4 } from 'uuid';

/**
 * 도메인별 UUID 생성 함수
 * @param {string} domain - 도메인 이름 (예: artwork, exhibition, artist 등)
 * @returns {string} 도메인_UUID 형식의 식별자
 */
export function generateDomainUUID(domain) {
    const uuid = uuidv4();
    return `${domain}_${uuid}`;
}

// 도메인 상수
export const DOMAINS = {
    ARTWORK: 'artwork',
    EXHIBITION: 'exhibition',
    ARTIST: 'artist',
    IMAGE: 'image',
    USER: 'user'
};
