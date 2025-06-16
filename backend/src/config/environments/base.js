/**
 * 모든 환경의 공통 기본 설정
 */
export const baseConfig = {
    // 기본 보안 설정
    security: {
        csp: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ['\'self\''],
                    scriptSrc: [
                        '\'self\'',
                        '\'unsafe-inline\'',
                        'https://cdn.jsdelivr.net',
                        'blob:'
                    ],
                    styleSrc: [
                        '\'self\'',
                        '\'unsafe-inline\'',
                        'https://fonts.googleapis.com'
                    ],
                    fontSrc: [
                        '\'self\'',
                        'https://fonts.googleapis.com',
                        'https://fonts.gstatic.com'
                    ],
                    imgSrc: [
                        '\'self\'',
                        'data:',
                        'blob:',
                        'https://res.cloudinary.com'
                    ],
                    connectSrc: [
                        '\'self\'',
                        'https://api.cloudinary.com',
                        'https://res.cloudinary.com'
                    ],
                    frameSrc: ['\'none\''],
                    objectSrc: ['\'none\''],
                    baseUri: ['\'self\''],
                    formAction: ['\'self\''],
                    frameAncestors: ['\'none\'']
                }
            },
            crossOriginEmbedderPolicy: false
        }
    },

    // 기본 스토리지 설정
    storage: {
        environment: 'test',
        uploadDir: 'test'
    },

    // 기본 세션 설정
    session: {
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/'
        },
        rolling: true,
        unset: 'destroy',
        proxy: false
    }
};

/**
 * 설정 병합 유틸리티
 */
export const mergeConfig = (base, override) => {
    const merged = { ...base };

    for (const key in override) {
        if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])) {
            merged[key] = mergeConfig(merged[key] || {}, override[key]);
        } else {
            merged[key] = override[key];
        }
    }

    return merged;
};
