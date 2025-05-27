/**
 * 보안 설정
 */

// Content Security Policy 설정
export const cspConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['\'self\''],
            scriptSrc: [
                '\'self\'',
                '\'unsafe-inline\'',
                'https://developers.kakao.com',
                'https://t1.kakaocdn.net',
                'https://k.kakaocdn.net',
                'https://cdn.jsdelivr.net',
                'blob:'
            ],
            styleSrc: [
                '\'self\'',
                'https://cdnjs.cloudflare.com',
                'https://fonts.googleapis.com',
                '\'unsafe-inline\''
            ],
            fontSrc: [
                '\'self\'',
                'https://fonts.googleapis.com',
                'https://cdnjs.cloudflare.com',
                'https://fonts.gstatic.com',
                '\'unsafe-inline\''
            ],
            imgSrc: [
                '\'self\'',
                'https://res.cloudinary.com/dw57ytzhg/',
                'https://res.cloudinary.com/dvkr4k6n8/',
                'data:',
                'blob:'
            ],
            connectSrc: [
                '\'self\'',
                'https://developers.kakao.com',
                'https://t1.kakaocdn.net',
                'https://k.kakaocdn.net',
                'https://cdn.jsdelivr.net'
            ],
            frameSrc: [
                '\'self\'',
                'https://developers.kakao.com'
            ],
            objectSrc: [
                '\'self\'',
                'https://developers.kakao.com'
            ],
            formAction: [
                '\'self\'',
                'https://*.kakao.com'
            ],
            workerSrc: [
                '\'self\'',
                'blob:'
            ],
            scriptSrcAttr: ['\'unsafe-inline\'']
        }
    },
    crossOriginEmbedderPolicy: false
};

// Rate Limiter 설정
export const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15분
    max: 300, // IP당 최대 요청 수
    skip: (req) => req.path === '/health' // 헬스체크 엔드포인트 제외
};

// 정적 파일 설정
export const staticFileConfig = {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
        // 캐시 설정
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24시간
    }
};
