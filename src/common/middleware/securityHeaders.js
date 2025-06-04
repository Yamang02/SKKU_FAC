import logger from '../utils/Logger.js';
import Config from '../../config/Config.js';

const config = Config.getInstance();

/**
 * 보안 헤더 통계 및 모니터링
 */
export class SecurityHeadersMonitor {
    static stats = {
        totalRequests: 0,
        cspViolations: 0,
        blockedRequests: 0,
        headerViolations: 0,
        startTime: Date.now()
    };

    static recordRequest() {
        this.stats.totalRequests++;
    }

    static recordCSPViolation() {
        this.stats.cspViolations++;
    }

    static recordBlockedRequest() {
        this.stats.blockedRequests++;
    }

    static recordHeaderViolation() {
        this.stats.headerViolations++;
    }

    static getStats() {
        const uptime = Date.now() - this.stats.startTime;
        return {
            ...this.stats,
            uptime: Math.floor(uptime / 1000),
            violationRate: `${((this.stats.cspViolations / this.stats.totalRequests) * 100).toFixed(2)}%`
        };
    }

    static reset() {
        this.stats = {
            totalRequests: 0,
            cspViolations: 0,
            blockedRequests: 0,
            headerViolations: 0,
            startTime: Date.now()
        };
    }
}

/**
 * 환경별 CSP 정책 설정
 */
const cspPolicies = {
    production: {
        'default-src': ['\'self\''],
        'script-src': ['\'self\'', '\'unsafe-inline\'', 'https://cdn.jsdelivr.net'],
        'style-src': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
        'img-src': ['\'self\'', 'data:', 'https://res.cloudinary.com'],
        'font-src': ['\'self\'', 'https://fonts.gstatic.com'],
        'connect-src': ['\'self\''],
        'frame-src': ['\'none\''],
        'object-src': ['\'none\''],
        'base-uri': ['\'self\''],
        'form-action': ['\'self\''],
        'frame-ancestors': ['\'none\''],
        'upgrade-insecure-requests': [],
        'block-all-mixed-content': []
    },
    development: {
        'default-src': ['\'self\''],
        'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'http://localhost:*'],
        'style-src': ['\'self\'', '\'unsafe-inline\''],
        'img-src': ['\'self\'', 'data:', 'http:', 'https:'],
        'font-src': ['\'self\'', 'data:', 'http:', 'https:'],
        'connect-src': ['\'self\'', 'http://localhost:*', 'ws://localhost:*'],
        'frame-src': ['\'self\''],
        'object-src': ['\'none\''],
        'base-uri': ['\'self\''],
        'form-action': ['\'self\'']
    },
    test: {
        'default-src': ['\'self\''],
        'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
        'style-src': ['\'self\'', '\'unsafe-inline\''],
        'img-src': ['\'self\'', 'data:'],
        'connect-src': ['\'self\''],
        'object-src': ['\'none\'']
    }
};

/**
 * CSP 정책을 문자열로 변환
 */
function buildCSPString(policy) {
    return Object.entries(policy)
        .map(([directive, sources]) => {
            if (sources.length === 0) {
                return directive;
            }
            return `${directive} ${sources.join(' ')}`;
        })
        .join('; ');
}

/**
 * 강화된 Content Security Policy 설정
 */
export function advancedCSP() {
    const environment = config.getEnvironment();
    const policy = cspPolicies[environment] || cspPolicies.development;

    // 설정 파일에서 CSP 오버라이드 가능
    const configOverrides = config.get('security.csp.directives', {});
    const mergedPolicy = { ...policy, ...configOverrides };

    const cspString = buildCSPString(mergedPolicy);

    return (req, res, next) => {
        SecurityHeadersMonitor.recordRequest();

        // 환경별 CSP 적용
        if (config.isProduction()) {
            res.setHeader('Content-Security-Policy', cspString);
        } else {
            // 개발환경에서는 report-only 모드
            res.setHeader('Content-Security-Policy-Report-Only', cspString);
        }

        logger.debug('CSP 헤더 설정', {
            environment,
            policy: cspString.substring(0, 100) + '...',
            path: req.path
        });

        next();
    };
}

/**
 * Cross-Origin 정책 강화
 */
export function crossOriginPolicies() {
    return (req, res, next) => {
        const isSecureEndpoint = req.path.startsWith('/admin/') ||
            req.path.startsWith('/api/') ||
            req.path.startsWith('/user/');

        // Cross-Origin-Opener-Policy
        if (config.isProduction() || isSecureEndpoint) {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        }

        // Cross-Origin-Resource-Policy
        if (config.isProduction()) {
            if (isSecureEndpoint) {
                res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
            } else {
                res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            }
        }

        // Cross-Origin-Embedder-Policy (매우 엄격한 보안이 필요한 경우만)
        if (config.isProduction() && req.path.startsWith('/admin/secure/')) {
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        }

        next();
    };
}

/**
 * Permissions Policy (Feature Policy) 강화
 */
export function permissionsPolicy() {
    const policies = {
        // 카메라, 마이크 등 민감한 기능 차단
        camera: '()',
        microphone: '()',
        geolocation: '()',
        payment: '()',
        usb: '()',
        bluetooth: '()',

        // 센서 관련 기능 차단
        accelerometer: '()',
        gyroscope: '()',
        magnetometer: '()',

        // 허용할 기능들
        fullscreen: '(self)',
        'picture-in-picture': '()',
        'screen-wake-lock': '()',

        // 개발환경에서만 허용
        ...(config.isDevelopment() && {
            'sync-xhr': '(self)'
        })
    };

    const policyString = Object.entries(policies)
        .map(([feature, allowlist]) => `${feature}=${allowlist}`)
        .join(', ');

    return (req, res, next) => {
        res.setHeader('Permissions-Policy', policyString);
        next();
    };
}

/**
 * 보안 헤더 위반 감지
 */
export function securityHeadersValidator() {
    return (req, res, next) => {
        // 의심스러운 헤더 검사
        const suspiciousHeaders = [
            'x-forwarded-host',
            'x-original-host',
            'x-rewrite-url'
        ];

        suspiciousHeaders.forEach(header => {
            if (req.headers[header]) {
                SecurityHeadersMonitor.recordHeaderViolation();

                logger.warn('의심스러운 헤더 감지', {
                    header,
                    value: req.headers[header],
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path
                });
            }
        });

        // Host 헤더 검증
        const allowedHosts = config.get('security.allowedHosts', []);
        const host = req.get('Host');

        if (config.isProduction() && host && allowedHosts.length > 0) {
            if (!allowedHosts.includes(host)) {
                SecurityHeadersMonitor.recordBlockedRequest();
                logger.warn('허용되지 않은 Host 헤더', {
                    host,
                    allowedHosts,
                    ip: req.ip
                });

                return res.status(400).json({
                    error: 'Invalid host header'
                });
            }
        }

        next();
    };
}

/**
 * 응답 헤더 보안 강화
 */
export function responseHeaderSecurity() {
    return (req, res, next) => {
        // 기존 setHeader 메서드 래핑
        const originalSetHeader = res.setHeader.bind(res);

        res.setHeader = function (name, value) {
            const headerName = name.toLowerCase();

            // 민감한 정보 누출 방지
            const sensitiveHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
            if (sensitiveHeaders.includes(headerName)) {
                logger.debug('민감한 헤더 제거', { header: headerName });
                return;
            }

            // Location 헤더 검증 (Open Redirect 방지)
            if (headerName === 'location') {
                const location = value.toString();
                if (location.startsWith('http://') || location.startsWith('https://')) {
                    const allowedDomains = config.get('security.allowedRedirectDomains', []);
                    const url = new URL(location);

                    if (allowedDomains.length > 0 && !allowedDomains.includes(url.hostname)) {
                        logger.warn('허용되지 않은 외부 리다이렉션 시도', {
                            location,
                            allowedDomains,
                            ip: req.ip
                        });
                        SecurityHeadersMonitor.recordBlockedRequest();
                        return;
                    }
                }
            }

            return originalSetHeader(name, value);
        };

        next();
    };
}

/**
 * CSP 위반 리포트 처리
 */
export function cspReportHandler() {
    return (req, res, next) => {
        if (req.path === '/csp-report' && req.method === 'POST') {
            SecurityHeadersMonitor.recordCSPViolation();

            logger.warn('CSP 위반 보고', {
                report: req.body,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return res.status(204).end();
        }

        next();
    };
}

/**
 * 통합 보안 헤더 설정
 */
export function setupAdvancedSecurityHeaders(app) {
    logger.info('고급 보안 헤더 설정 시작');

    // 1. 요청 검증 (가장 먼저)
    app.use(securityHeadersValidator());

    // 2. 응답 헤더 보안 (래핑)
    app.use(responseHeaderSecurity());

    // 3. CSP 설정
    app.use(advancedCSP());

    // 4. Cross-Origin 정책
    app.use(crossOriginPolicies());

    // 5. Permissions Policy
    app.use(permissionsPolicy());

    // 6. CSP 리포트 핸들러
    app.use(cspReportHandler());

    logger.success('고급 보안 헤더 설정 완료');
}

/**
 * 보안 헤더 통계 조회
 */
export function getSecurityHeadersStats(req, res) {
    const stats = SecurityHeadersMonitor.getStats();

    res.json({
        success: true,
        data: {
            stats,
            environment: config.getEnvironment(),
            policies: {
                csp: cspPolicies[config.getEnvironment()],
                permissionsPolicy: 'active'
            }
        },
        timestamp: new Date().toISOString()
    });
}

export default {
    advancedCSP,
    crossOriginPolicies,
    permissionsPolicy,
    securityHeadersValidator,
    responseHeaderSecurity,
    cspReportHandler,
    setupAdvancedSecurityHeaders,
    getSecurityHeadersStats,
    SecurityHeadersMonitor
};
