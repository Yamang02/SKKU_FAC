/**
 * API 공통 설정
 */

// API 기본 URL
const API_BASE_URL = '';

// API 응답 처리 함수
const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');

    // HTML 응답 확인 (서버 오류 페이지인 경우)
    if (contentType && contentType.includes('text/html')) {
        console.error('서버에서 HTML 응답을 반환했습니다. 서버 오류가 발생했을 수 있습니다.');
        throw new Error('서버 오류가 발생했습니다. 관리자에게 문의하세요.');
    }

    try {
        const data = await response.json();
        // ApiResponse에서 성공 여부 확인
        if (!data.success) {
            // 서버에서 반환된 에러 메시지 사용
            const errorMessage = data.error || '요청 처리 중 오류가 발생했습니다.';
            const error = new Error(errorMessage);
            error.isApiError = true;
            error.statusCode = response.status;
            error.apiResponse = data;
            throw error;
        }

        return data;
    } catch (error) {
        if (error.isApiError) {
            // 이미 처리된 API 에러는 그대로 전달
            throw error;
        } else if (error instanceof SyntaxError) {
            // JSON 파싱 오류
            console.error('JSON 파싱 오류:', error);
            throw new Error('서버 응답을 처리할 수 없습니다. 관리자에게 문의하세요.');
        } else {
            // 기타 오류
            console.error('응답 처리 중 오류:', error);
            throw error;
        }
    }
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
        // FormData 객체인지 확인
        const isFormData = data instanceof FormData;

        // 기본 설정
        const requestOptions = {
            ...options,
            method: 'POST'
        };

        // FormData가 아닌 경우에만 Content-Type 헤더 추가 및 데이터 JSON 변환
        if (!isFormData) {
            requestOptions.headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            requestOptions.body = JSON.stringify(data);
        } else {
            // FormData인 경우 headers만 설정 (Content-Type은 브라우저가 자동 설정)
            requestOptions.headers = {
                ...options.headers
            };
            requestOptions.body = data;
        }

        const response = await fetch(API_BASE_URL + url, requestOptions);
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
