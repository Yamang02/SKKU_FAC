/**
 * @typedef {Object} Exhibition
 * @property {string} id - 전시회 고유 ID
 * @property {string} title - 전시회 제목
 * @property {string} description - 전시회 설명
 * @property {string} startDate - 전시 시작일 (YYYY-MM-DD)
 * @property {string} endDate - 전시 종료일 (YYYY-MM-DD)
 * @property {string} location - 전시 장소
 * @property {string} thumbnail - 썸네일 이미지 URL
 * @property {string[]} images - 전시회 이미지 URL 배열
 * @property {boolean} isActive - 전시회 활성화 상태
 * @property {boolean} isSubmissionOpen - 작품 제출 가능 여부
 * @property {string} createdAt - 생성일시
 * @property {string} updatedAt - 수정일시
 */

/**
 * 전시회 데이터 유효성 검사
 * @param {Exhibition} exhibition - 검사할 전시회 데이터
 * @returns {boolean} 유효성 검사 결과
 */
export function validateExhibition(exhibition) {
    if (!exhibition || typeof exhibition !== 'object') return false;
    if (!exhibition.id || typeof exhibition.id !== 'string') return false;
    if (!exhibition.title || typeof exhibition.title !== 'string') return false;
    if (!exhibition.description || typeof exhibition.description !== 'string') return false;
    if (!exhibition.startDate || typeof exhibition.startDate !== 'string') return false;
    if (!exhibition.endDate || typeof exhibition.endDate !== 'string') return false;
    if (!exhibition.location || typeof exhibition.location !== 'string') return false;
    if (!exhibition.thumbnail || typeof exhibition.thumbnail !== 'string') return false;
    if (!Array.isArray(exhibition.images)) return false;
    if (typeof exhibition.isActive !== 'boolean') return false;
    if (typeof exhibition.isSubmissionOpen !== 'boolean') return false;
    if (!exhibition.createdAt || typeof exhibition.createdAt !== 'string') return false;
    if (!exhibition.updatedAt || typeof exhibition.updatedAt !== 'string') return false;
    return true;
}

export default class Exhibition {
    constructor(
        id,
        title,
        description,
        startDate,
        endDate,
        exhibitionType,
        image = null,
        subtitle = null,
        location = null,
        artists = []
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.exhibitionType = exhibitionType;
        this.image = image;
        this.subtitle = subtitle;
        this.location = location;
        this.artists = artists;
    }

    validate() {
        if (!this.title) {
            throw new Error('Title is required');
        }
        if (!this.startDate) {
            throw new Error('Start date is required');
        }
        if (!this.endDate) {
            throw new Error('End date is required');
        }
        if (this.startDate > this.endDate) {
            throw new Error('Start date must be before end date');
        }
    }
}
