// API 기본 설정
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3000/api';

// HTTP 요청을 위한 기본 함수
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include' // 세션 쿠키 포함
    };

    const config = {
        ...defaultOptions,
        ...options
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// API 서비스 객체
export const api = {
    // GET 요청
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

    // POST 요청
    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // PUT 요청
    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // DELETE 요청
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

// 특정 도메인별 API 서비스들
export const userApi = {
    getUsers: () => api.get('/admin/users'),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

export const artworkApi = {
    getArtworks: () => api.get('/admin/artworks'),
    getArtwork: (id) => api.get(`/admin/artworks/${id}`),
    updateArtwork: (id, data) => api.put(`/admin/artworks/${id}`, data),
    deleteArtwork: (id) => api.delete(`/admin/artworks/${id}`),
    updateArtworkStatus: (id, status) => api.put(`/admin/artworks/${id}/status`, { status })
};

export const exhibitionApi = {
    getExhibitions: () => api.get('/admin/exhibitions'),
    getExhibition: (id) => api.get(`/admin/exhibitions/${id}`),
    createExhibition: (data) => api.post('/admin/exhibitions', data),
    updateExhibition: (id, data) => api.put(`/admin/exhibitions/${id}`, data),
    deleteExhibition: (id) => api.delete(`/admin/exhibitions/${id}`)
};

export default api;
