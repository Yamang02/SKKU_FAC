/* global $ */
/**
 * CSRF 보호를 위한 JavaScript 유틸리티
 */

// CSRF 토큰 가져오기
function getCSRFToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
}

// 모든 AJAX 요청에 CSRF 토큰 자동 추가
(function () {
    const token = getCSRFToken();

    if (!token) {
        console.warn('CSRF token not found in meta tag');
        return;
    }

    // jQuery가 있는 경우 자동 설정
    if (typeof $ !== 'undefined') {
        $.ajaxSetup({
            beforeSend: function (xhr, settings) {
                // GET, HEAD, OPTIONS 요청은 제외
                if (!/^(GET|HEAD|OPTIONS)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader('X-CSRF-Token', token);
                }
            }
        });
    }

    // fetch API 래퍼 함수
    window.csrfFetch = function (url, options = {}) {
        const method = (options.method || 'GET').toUpperCase();

        // GET, HEAD, OPTIONS 요청이 아닌 경우 CSRF 토큰 추가
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            options.headers = options.headers || {};
            options.headers['X-CSRF-Token'] = token;
        }

        return fetch(url, options);
    };

    // XMLHttpRequest 자동 설정
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._method = method.toUpperCase();
        this._url = url;
        return originalOpen.call(this, method, url, async, user, password);
    };

    XMLHttpRequest.prototype.send = function (data) {
        // GET, HEAD, OPTIONS 요청이 아니고 같은 도메인인 경우 CSRF 토큰 추가
        if (!['GET', 'HEAD', 'OPTIONS'].includes(this._method) &&
            (!this._url || !this._url.startsWith('http') || this._url.startsWith(window.location.origin))) {
            this.setRequestHeader('X-CSRF-Token', token);
        }
        return originalSend.call(this, data);
    };
})();

// 폼 제출 시 CSRF 토큰 자동 추가
document.addEventListener('DOMContentLoaded', function () {
    const token = getCSRFToken();

    if (!token) return;

    // 모든 폼에 CSRF 토큰 히든 필드 추가
    const forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
        // GET 메서드가 아닌 폼에만 추가
        const method = (form.method || 'GET').toUpperCase();
        if (method !== 'GET') {
            // 이미 CSRF 토큰이 있는지 확인
            const existingToken = form.querySelector('input[name="_csrf"]');
            if (!existingToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_csrf';
                csrfInput.value = token;
                form.appendChild(csrfInput);
            }
        }
    });
});

// 동적으로 생성된 폼을 위한 헬퍼 함수
window.addCSRFToken = function (form) {
    const token = getCSRFToken();
    if (!token) return;

    const method = (form.method || 'GET').toUpperCase();
    if (method !== 'GET') {
        const existingToken = form.querySelector('input[name="_csrf"]');
        if (!existingToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_csrf';
            csrfInput.value = token;
            form.appendChild(csrfInput);
        }
    }
};

// CSRF 토큰 갱신 함수 (필요한 경우)
window.refreshCSRFToken = function () {
    return fetch('/csrf-token')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.setAttribute('content', data.csrfToken);
                }

                // 모든 폼의 CSRF 토큰 업데이트
                const forms = document.querySelectorAll('form input[name="_csrf"]');
                forms.forEach(input => {
                    input.value = data.csrfToken;
                });

                return data.csrfToken;
            }
            throw new Error('Failed to refresh CSRF token');
        });
};
