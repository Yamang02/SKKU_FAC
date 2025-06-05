/**
 * API 공통 설정
 */

// API 기본 URL
const API_BASE_URL = '';

// CSRF 매니저 (전역 객체 사용)
const csrfManager = window.csrfManager || {
    getToken: () => null,
    refreshToken: () => Promise.resolve(null),
    addToHeaders: (headers) => Promise.resolve(headers),
    addToData: (data) => Promise.resolve(data),
    addToFormData: (formData) => Promise.resolve(formData)
};

// API 응답 처리 함수
const handleResponse = async response => {
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
            method: 'POST',
            credentials: 'include' // 세션 쿠키 포함
        };

        try {
            // FormData가 아닌 경우에만 Content-Type 헤더 추가 및 데이터 JSON 변환
            if (!isFormData) {
                // JSON 데이터에 CSRF 토큰 추가
                const dataWithCSRF = await csrfManager.addToData(data);

                // 헤더에 CSRF 토큰 추가
                const headersWithCSRF = await csrfManager.addToHeaders({
                    'Content-Type': 'application/json',
                    ...options.headers
                });

                requestOptions.headers = headersWithCSRF;
                requestOptions.body = JSON.stringify(dataWithCSRF);
            } else {
                // FormData에 CSRF 토큰 추가
                await csrfManager.addToFormData(data);

                // 헤더에 CSRF 토큰 추가 (Content-Type은 브라우저가 자동 설정)
                const headersWithCSRF = await csrfManager.addToHeaders({
                    ...options.headers
                });

                requestOptions.headers = headersWithCSRF;
                requestOptions.body = data;
            }

            const response = await fetch(API_BASE_URL + url, requestOptions);

            // CSRF 토큰 오류인 경우 토큰 갱신 후 재시도
            if (response.status === 403) {
                const responseData = await response.clone().json().catch(() => ({}));
                if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                    console.log('CSRF 토큰 오류, 토큰 갱신 후 재시도...');

                    // 토큰 갱신
                    await csrfManager.refreshToken();

                    // 요청 재구성
                    if (!isFormData) {
                        const dataWithCSRF = await csrfManager.addToData(data);
                        const headersWithCSRF = await csrfManager.addToHeaders({
                            'Content-Type': 'application/json',
                            ...options.headers
                        });
                        requestOptions.headers = headersWithCSRF;
                        requestOptions.body = JSON.stringify(dataWithCSRF);
                    } else {
                        // FormData는 이미 수정되었으므로 새로 생성
                        const newFormData = new FormData();
                        for (const [key, value] of data.entries()) {
                            if (key !== '_csrf') {
                                newFormData.append(key, value);
                            }
                        }
                        await csrfManager.addToFormData(newFormData);

                        const headersWithCSRF = await csrfManager.addToHeaders({
                            ...options.headers
                        });
                        requestOptions.headers = headersWithCSRF;
                        requestOptions.body = newFormData;
                    }

                    // 재시도
                    const retryResponse = await fetch(API_BASE_URL + url, requestOptions);
                    return handleResponse(retryResponse);
                }
            }

            return handleResponse(response);
        } catch (error) {
            console.error('POST 요청 중 오류:', error);
            throw error;
        }
    },

    put: async (url, data, options = {}) => {
        try {
            // JSON 데이터에 CSRF 토큰 추가
            const dataWithCSRF = await csrfManager.addToData(data);

            // 헤더에 CSRF 토큰 추가
            const headersWithCSRF = await csrfManager.addToHeaders({
                'Content-Type': 'application/json',
                ...options.headers
            });

            const response = await fetch(API_BASE_URL + url, {
                ...options,
                method: 'PUT',
                credentials: 'include',
                headers: headersWithCSRF,
                body: JSON.stringify(dataWithCSRF)
            });

            // CSRF 토큰 오류인 경우 토큰 갱신 후 재시도
            if (response.status === 403) {
                const responseData = await response.clone().json().catch(() => ({}));
                if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                    console.log('CSRF 토큰 오류, 토큰 갱신 후 재시도...');

                    await csrfManager.refreshToken();
                    const retryDataWithCSRF = await csrfManager.addToData(data);
                    const retryHeadersWithCSRF = await csrfManager.addToHeaders({
                        'Content-Type': 'application/json',
                        ...options.headers
                    });

                    const retryResponse = await fetch(API_BASE_URL + url, {
                        ...options,
                        method: 'PUT',
                        credentials: 'include',
                        headers: retryHeadersWithCSRF,
                        body: JSON.stringify(retryDataWithCSRF)
                    });
                    return handleResponse(retryResponse);
                }
            }

            return handleResponse(response);
        } catch (error) {
            console.error('PUT 요청 중 오류:', error);
            throw error;
        }
    },

    delete: async (url, options = {}) => {
        try {
            // 헤더에 CSRF 토큰 추가
            const headersWithCSRF = await csrfManager.addToHeaders({
                'Content-Type': 'application/json',
                ...options.headers
            });

            const response = await fetch(API_BASE_URL + url, {
                ...options,
                method: 'DELETE',
                credentials: 'include',
                headers: headersWithCSRF
            });

            // CSRF 토큰 오류인 경우 토큰 갱신 후 재시도
            if (response.status === 403) {
                const responseData = await response.clone().json().catch(() => ({}));
                if (responseData.code === 'CSRF_TOKEN_MISSING' || responseData.code === 'CSRF_TOKEN_INVALID') {
                    console.log('CSRF 토큰 오류, 토큰 갱신 후 재시도...');

                    await csrfManager.refreshToken();
                    const retryHeadersWithCSRF = await csrfManager.addToHeaders({
                        'Content-Type': 'application/json',
                        ...options.headers
                    });

                    const retryResponse = await fetch(API_BASE_URL + url, {
                        ...options,
                        method: 'DELETE',
                        credentials: 'include',
                        headers: retryHeadersWithCSRF
                    });
                    return handleResponse(retryResponse);
                }
            }

            return handleResponse(response);
        } catch (error) {
            console.error('DELETE 요청 중 오류:', error);
            throw error;
        }
    }
};

export default api;
