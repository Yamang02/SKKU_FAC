/**
 * API 공통 설정
 */

// API 기본 URL
const API_BASE_URL = '';

// API 응답 처리 함수
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || '요청 처리 중 오류가 발생했습니다.');
    }
    return data;
};

// API 요청 함수
const api = {
    get: async (url, options = {}) => {
        const response = await fetch(API_BASE_URL + url, {
            ...options,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        return handleResponse(response);
    },

    post: async (url, data, options = {}) => {
        const response = await fetch(API_BASE_URL + url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    put: async (url, data, options = {}) => {
        const response = await fetch(API_BASE_URL + url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    delete: async (url, options = {}) => {
        const response = await fetch(API_BASE_URL + url, {
            ...options,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        return handleResponse(response);
    }
};

export default api;
