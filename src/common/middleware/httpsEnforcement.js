import logger from '../utils/Logger.js';
import Config from '../../config/Config.js';

const config = Config.getInstance();

/**
 * HTTPS Enforcement 통계 및 모니터링
 */
export class HttpsEnforcementMonitor {
    static stats = {
        totalRequests: 0,
        httpsRequests: 0,
        httpRedirects: 0,
        insecureRequests: 0,
        mixedContentBlocked: 0,
        startTime: Date.now()
    };

    static recordRequest(isHttps, wasRedirected = false, hadInsecureContent = false) {
        this.stats.totalRequests++;

        if (isHttps) {
            this.stats.httpsRequests++;
        }

        if (wasRedirected) {
            this.stats.httpRedirects++;
        }

        if (hadInsecureContent) {
            this.stats.insecureRequests++;
        }
    }

    static recordMixedContentBlock() {
        this.stats.mixedContentBlocked++;
    }

    static getStats() {
        const uptime = Date.now() - this.stats.startTime;
        const httpsRate =
            this.stats.totalRequests > 0
                ? ((this.stats.httpsRequests / this.stats.totalRequests) * 100).toFixed(2)
                : '0.00';

        return {
            ...this.stats,
            uptime: Math.floor(uptime / 1000),
            httpsRate: `${httpsRate}%`,
            redirectRate: `${((this.stats.httpRedirects / this.stats.totalRequests) * 100).toFixed(2)}%`
        };
    }

    static reset() {
        this.stats = {
            totalRequests: 0,
            httpsRequests: 0,
            httpRedirects: 0,
            insecureRequests: 0,
            mixedContentBlocked: 0,
            startTime: Date.now()
        };
    }
}

/**
 * 환경별 HTTPS 정책 설정
 */
const httpsPolicy = {
    production: {
        enforceHttps: true,
        hstsMaxAge: 31536000, // 1년
        hstsIncludeSubDomains: true,
        hstsPreload: true,
        upgradeInsecureRequests: true,
        blockMixedContent: true,
        secureOnly: true
    },
    development: {
        enforceHttps: false,
        hstsMaxAge: 0,
        hstsIncludeSubDomains: false,
        hstsPreload: false,
        upgradeInsecureRequests: false,
        blockMixedContent: false,
        secureOnly: false
    },
    test: {
        enforceHttps: false,
        hstsMaxAge: 3600, // 1시간 (테스트용)
        hstsIncludeSubDomains: false,
        hstsPreload: false,
        upgradeInsecureRequests: false,
        blockMixedContent: false,
        secureOnly: false
    }
};

/**
 * 현재 환경의 HTTPS 정책 가져오기
 */
function getCurrentHttpsPolicy() {
    const environment = config.getEnvironment();
    const policy = httpsPolicy[environment] || httpsPolicy.development;

    // 설정 파일에서 오버라이드 가능
    const configOverrides = config.get('security.https', {});

    return {
        ...policy,
        ...configOverrides
    };
}

/**
 * HTTPS 리다이렉션 미들웨어
 */
export function httpsRedirect() {
    const policy = getCurrentHttpsPolicy();

    return (req, res, next) => {
        const isHttps =
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https' ||
            req.headers['x-forwarded-ssl'] === 'on' ||
            req.connection.encrypted;

        HttpsEnforcementMonitor.recordRequest(isHttps);

        // HTTPS 강제 적용이 비활성화된 경우 통과
        if (!policy.enforceHttps) {
            return next();
        }

        // 이미 HTTPS인 경우 통과
        if (isHttps) {
            return next();
        }

        // 건강 체크 및 로드 밸런서 요청은 제외
        const healthCheckPaths = ['/health', '/ping', '/status', '/metrics'];
        if (healthCheckPaths.some(path => req.path.startsWith(path))) {
            return next();
        }

        // HTTP → HTTPS 리다이렉션
        const httpsUrl = `https://${req.headers.host}${req.url}`;

        HttpsEnforcementMonitor.recordRequest(isHttps, true);

        logger.info('HTTP → HTTPS 리다이렉션', {
            originalUrl: `http://${req.headers.host}${req.url}`,
            redirectUrl: httpsUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // 301 Permanent Redirect 사용 (SEO에 유리)
        res.status(301).redirect(httpsUrl);
    };
}

/**
 * HSTS (HTTP Strict Transport Security) 헤더 설정
 */
export function hstsHeaders() {
    const policy = getCurrentHttpsPolicy();

    return (req, res, next) => {
        const isHttps =
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https' ||
            req.headers['x-forwarded-ssl'] === 'on' ||
            req.connection.encrypted;

        // HTTPS 연결에서만 HSTS 헤더 설정
        if (isHttps && policy.hstsMaxAge > 0) {
            let hstsValue = `max-age=${policy.hstsMaxAge}`;

            if (policy.hstsIncludeSubDomains) {
                hstsValue += '; includeSubDomains';
            }

            if (policy.hstsPreload) {
                hstsValue += '; preload';
            }

            res.setHeader('Strict-Transport-Security', hstsValue);

            logger.debug('HSTS 헤더 설정', {
                hstsValue,
                path: req.path,
                ip: req.ip
            });
        }

        next();
    };
}

/**
 * Mixed Content 방지 및 Upgrade Insecure Requests
 */
export function mixedContentProtection() {
    const policy = getCurrentHttpsPolicy();

    return (req, res, next) => {
        const isHttps =
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https' ||
            req.headers['x-forwarded-ssl'] === 'on' ||
            req.connection.encrypted;

        if (isHttps) {
            // Upgrade Insecure Requests - 브라우저가 HTTP 리소스를 HTTPS로 자동 업그레이드
            if (policy.upgradeInsecureRequests) {
                res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
            }

            // Mixed Content 차단
            if (policy.blockMixedContent) {
                res.setHeader('Content-Security-Policy', 'block-all-mixed-content');
            }

            // 조합된 CSP 헤더 설정
            const cspDirectives = [];
            if (policy.upgradeInsecureRequests) {
                cspDirectives.push('upgrade-insecure-requests');
            }
            if (policy.blockMixedContent) {
                cspDirectives.push('block-all-mixed-content');
            }

            if (cspDirectives.length > 0) {
                const existingCSP = res.getHeader('Content-Security-Policy');
                const newCSP = cspDirectives.join('; ');

                if (existingCSP) {
                    res.setHeader('Content-Security-Policy', `${existingCSP}; ${newCSP}`);
                } else {
                    res.setHeader('Content-Security-Policy', newCSP);
                }
            }
        }

        next();
    };
}

/**
 * Secure Cookie 설정 미들웨어
 */
export function secureCookieSettings() {
    const policy = getCurrentHttpsPolicy();

    return (req, res, next) => {
        const isHttps =
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https' ||
            req.headers['x-forwarded-ssl'] === 'on' ||
            req.connection.encrypted;

        // 기존 setHeader 메서드를 래핑하여 Set-Cookie 헤더를 수정
        const originalSetHeader = res.setHeader.bind(res);

        res.setHeader = function (name, value) {
            if (name.toLowerCase() === 'set-cookie' && isHttps && policy.secureOnly) {
                // 쿠키 값이 배열인 경우와 문자열인 경우 모두 처리
                let cookies = Array.isArray(value) ? value : [value];

                cookies = cookies.map(cookie => {
                    let cookieStr = cookie.toString();

                    // Secure 플래그 추가 (없는 경우에만)
                    if (!cookieStr.toLowerCase().includes('secure')) {
                        cookieStr += '; Secure';
                    }

                    // SameSite 플래그 추가 (없는 경우에만)
                    if (!cookieStr.toLowerCase().includes('samesite')) {
                        cookieStr += '; SameSite=Strict';
                    }

                    return cookieStr;
                });

                return originalSetHeader('set-cookie', Array.isArray(value) ? cookies : cookies[0]);
            }

            return originalSetHeader(name, value);
        };

        next();
    };
}

/**
 * HTTPS 정책 위반 감지 및 로깅
 */
export function httpsViolationDetector() {
    return (req, res, next) => {
        const isHttps =
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https' ||
            req.headers['x-forwarded-ssl'] === 'on' ||
            req.connection.encrypted;

        // 개발 환경에서는 HTTP 사용이 정상이므로 경고하지 않음
        if (config.isDevelopment()) {
            return next();
        }

        // 민감한 데이터를 포함할 수 있는 요청들
        const sensitiveEndpoints = [
            '/user/login',
            '/auth/login',
            '/user/register',
            '/auth/register',
            '/user/password',
            '/auth/password',
            '/admin',
            '/api',
            '/user/profile'
        ];

        const isSensitiveRequest = sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint));

        if (!isHttps && isSensitiveRequest) {
            HttpsEnforcementMonitor.recordRequest(isHttps, false, true);

            logger.warn('민감한 데이터를 HTTP로 전송 시도 감지', {
                path: req.path,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                referer: req.get('Referer')
            });
        }

        // Mixed content 감지 (Referer 헤더 기반)
        const referer = req.get('Referer');
        if (isHttps && referer && referer.startsWith('http://')) {
            HttpsEnforcementMonitor.recordMixedContentBlock();

            logger.warn('Mixed Content 감지', {
                httpsRequest: req.url,
                httpReferer: referer,
                ip: req.ip
            });
        }

        next();
    };
}

/**
 * 통합 HTTPS Enforcement 설정
 */
export function setupHttpsEnforcement(app) {
    const policy = getCurrentHttpsPolicy();

    logger.info('HTTPS Enforcement 설정 시작', {
        environment: config.getEnvironment(),
        policy: {
            enforceHttps: policy.enforceHttps,
            hstsMaxAge: policy.hstsMaxAge,
            secureOnly: policy.secureOnly
        }
    });

    // 1. HTTPS 리다이렉션 (가장 먼저)
    app.use(httpsRedirect());

    // 2. HSTS 헤더 설정
    app.use(hstsHeaders());

    // 3. Mixed Content 보호
    app.use(mixedContentProtection());

    // 4. Secure Cookie 설정
    app.use(secureCookieSettings());

    // 5. HTTPS 정책 위반 감지
    app.use(httpsViolationDetector());

    logger.success(`HTTPS Enforcement 설정 완료 (정책: ${policy.enforceHttps ? '강제' : '선택적'})`);
}

/**
 * HTTPS 통계 조회
 */
export function getHttpsStats(req, res) {
    const stats = HttpsEnforcementMonitor.getStats();
    const policy = getCurrentHttpsPolicy();

    res.json({
        success: true,
        data: {
            stats,
            policy,
            environment: config.getEnvironment()
        },
        timestamp: new Date().toISOString()
    });
}

export default {
    httpsRedirect,
    hstsHeaders,
    mixedContentProtection,
    secureCookieSettings,
    httpsViolationDetector,
    setupHttpsEnforcement,
    getHttpsStats,
    HttpsEnforcementMonitor
};
