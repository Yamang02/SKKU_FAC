// API 설정
const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:3000',
        timeout: 10000
    },
    production: {
        baseURL: process.env.REACT_APP_API_URL || 'https://your-railway-backend.railway.app',
        timeout: 15000
    }
};

const environment = process.env.NODE_ENV || 'development';
export const apiConfig = API_CONFIG[environment];

// API 엔드포인트
export const API_ENDPOINTS = {
    // 인증
    auth: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        register: '/api/auth/register',
        profile: '/api/auth/profile'
    },

    // 작품
    artworks: {
        list: '/api/artworks',
        detail: (id) => `/api/artworks/${id}`,
        create: '/api/artworks',
        update: (id) => `/api/artworks/${id}`,
        delete: (id) => `/api/artworks/${id}`
    },

    // 전시
    exhibitions: {
        list: '/api/exhibitions',
        detail: (id) => `/api/exhibitions/${id}`,
        create: '/api/exhibitions',
        update: (id) => `/api/exhibitions/${id}`,
        delete: (id) => `/api/exhibitions/${id}`
    },

    // 관리자
    admin: {
        users: '/api/admin/users',
        stats: '/api/admin/stats',
        settings: '/api/admin/settings'
    }
};

// API 클라이언트 설정
export const createApiClient = () => {
    const baseURL = apiConfig.baseURL;

    return {
        get: async (endpoint, options = {}) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return response.json();
        },

        post: async (endpoint, data, options = {}) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return response.json();
        },

        put: async (endpoint, data, options = {}) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return response.json();
        },

        delete: async (endpoint, options = {}) => {
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return response.json();
        }
    };
};

export default createApiClient();
