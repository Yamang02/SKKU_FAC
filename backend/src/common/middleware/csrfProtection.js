import csrf from 'csrf';
import logger from '../utils/Logger.js';
import config from '../../config/Config.js';

// CSRF 토큰 생성기 인스턴스
const tokens = new csrf();

/**
 * CSRF 보호 미들웨어 설정
 */
export function setupCSRFProtection(app) {

    // CSRF 보호가 비활성화된 경우 (테스트 환경 등)
    if (config.get('security.csrf.disabled', false)) {
        logger.warn('CSRF 보호가 비활성화되었습니다');
        return;
    }

    // CSRF 시크릿 키 설정
    const secret = config.get('security.csrf.secret') || 'default-csrf-secret-change-in-production';

    if (secret === 'default-csrf-secret-change-in-production' && config.isProduction()) {
        logger.error('프로덕션 환경에서 기본 CSRF 시크릿을 사용하고 있습니다. 보안상 위험합니다.');
    }

    // CSRF 토큰 생성 및 검증 미들웨어
    app.use((req, res, next) => {
        // 세션이 없는 경우 초기화
        if (!req.session) {
            logger.error('CSRF 보호를 위해서는 세션이 필요합니다');
            return next(new Error('Session required for CSRF protection'));
        }

        // CSRF 시크릿이 세션에 없는 경우 생성
        if (!req.session.csrfSecret) {
            req.session.csrfSecret = tokens.secretSync();
        }

        // CSRF 토큰 생성 함수를 req 객체에 추가
        req.csrfToken = () => {
            return tokens.create(req.session.csrfSecret);
        };

        // 템플릿에서 사용할 수 있도록 res.locals에 토큰 추가
        res.locals.csrfToken = req.csrfToken();

        next();
    });

    // CSRF 토큰 검증 미들웨어
    app.use((req, res, next) => {
        // GET, HEAD, OPTIONS 요청은 검증하지 않음
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }

        // 제외할 경로들 (API 문서, 건강 체크 등)
        const excludePaths = config.get('security.csrf.excludePaths', ['/api-docs', '/health', '/favicon.ico']);

        if (excludePaths.some(path => req.path.startsWith(path))) {
            return next();
        }

        // API 엔드포인트 처리 전략
        if (req.path.startsWith('/api/')) {
            // JWT 토큰이 있는 경우 CSRF 검증 생략 (프론트엔드 프레임워크 대비)
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                return next();
            }

            // API 요청이지만 JWT가 없는 경우 (현재 방식 유지)
            // 추후 프론트엔드 분리 시 점진적 마이그레이션 가능
        }

        // CSRF 토큰 추출
        const token =
            req.body['_csrf'] ||
            req.query['_csrf'] ||
            req.headers['csrf-token'] ||
            req.headers['x-csrf-token'] ||
            req.headers['x-xsrf-token'];

        if (!token) {
            logger.warn('CSRF 토큰이 누락됨', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    error: 'CSRF token missing',
                    code: 'CSRF_TOKEN_MISSING'
                });
            }

            req.flash('error', 'Security token is missing. Please try again.');
            return res.redirect(req.get('Referrer') || '/');
        }

        // CSRF 토큰 검증
        if (!tokens.verify(req.session.csrfSecret, token)) {
            logger.warn('CSRF 토큰 검증 실패', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                providedToken: token.substring(0, 10) + '...' // 보안상 일부만 로깅
            });

            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid CSRF token',
                    code: 'CSRF_TOKEN_INVALID'
                });
            }

            req.flash('error', 'Security token is invalid. Please try again.');
            return res.redirect(req.get('Referrer') || '/');
        }

        // 검증 성공
        logger.debug('CSRF 토큰 검증 성공', {
            method: req.method,
            url: req.url,
            ip: req.ip
        });

        next();
    });

    logger.info('CSRF 보호 미들웨어 설정 완료');
}

/**
 * CSRF 토큰을 JSON 응답으로 제공하는 엔드포인트
 */
export function csrfTokenEndpoint(req, res) {
    try {
        const token = req.csrfToken();
        res.json({
            success: true,
            csrfToken: token
        });
    } catch (error) {
        logger.error('CSRF 토큰 생성 실패:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate CSRF token'
        });
    }
}

/**
 * 개발용 CSRF 토큰 정보 조회 엔드포인트
 */
export function csrfDebugEndpoint(req, res) {

    if (config.isProduction()) {
        return res.status(404).json({
            success: false,
            error: 'Not found'
        });
    }

    try {
        res.json({
            success: true,
            debug: {
                hasSession: !!req.session,
                hasSecret: !!req.session?.csrfSecret,
                token: req.csrfToken(),
                sessionId: req.session?.id
            }
        });
    } catch (error) {
        logger.error('CSRF 디버그 정보 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get CSRF debug info'
        });
    }
}
