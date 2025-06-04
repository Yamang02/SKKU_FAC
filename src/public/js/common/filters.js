/**
 * 도메인별 필터 정의
 */
const ArtworkFilters = {
    // 작품 목록 필터
    list: {
        keyword: '',
        exhibition: '',
        year: ''
    },

    // 관리자용 필터
    management: {
        keyword: '',
        artistId: '',
        status: 'all'
    }
};

/**
 * 필터 파라미터 생성
 * @param {Object} filters - 필터 객체
 * @returns {string} URL 쿼리 파라미터 문자열
 */
function createFilterParams(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, value);
        }
    });
    return params.toString();
}

/**
 * 필터 객체 복제
 * @param {Object} filters - 원본 필터 객체
 * @returns {Object} 새로운 필터 객체
 */
function cloneFilters(filters) {
    return { ...filters };
}

/**
 * 필터 초기화
 * @param {Object} filters - 필터 객체
 * @returns {Object} 초기화된 필터 객체
 */
function resetFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
        acc[key] = '';
        return acc;
    }, {});
}

export { ArtworkFilters, createFilterParams, cloneFilters, resetFilters };
