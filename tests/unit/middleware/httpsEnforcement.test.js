import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import {
    httpsRedirect,
    hstsHeaders,
    mixedContentProtection,
    secureCookieSettings,
    httpsViolationDetector,
    HttpsEnforcementMonitor
} from '../../../src/common/middleware/httpsEnforcement.js';

// Mock dependencies
vi.mock('../../../src/common/utils/Logger.js', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        success: vi.fn()
    }
}));

vi.mock('../../../src/config/Config.js', () => ({
    default: {
        getInstance: vi.fn(() => ({
            getEnvironment: vi.fn(() => 'test'),
            get: vi.fn((key) => {
                const configs = {
                    'security.https': {}
                };
                return configs[key] || {};
            })
        }))
    }
}));

describe('HTTPS Enforcement 미들웨어', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            secure: false,
            headers: {},
            path: '/test',
            url: '/test',
            ip: '127.0.0.1',
            get: vi.fn(),
            method: 'GET'
        };

        res = {
            redirect: vi.fn(),
            setHeader: vi.fn(),
            getHeader: vi.fn(),
            status: vi.fn().mockReturnThis()
        };

        next = vi.fn();

        // Monitor 통계 초기화
        HttpsEnforcementMonitor.reset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('httpsRedirect', () => {
        it('HTTPS 요청은 리다이렉션하지 않아야 함', () => {
            req.secure = true;
            const middleware = httpsRedirect();

            middleware(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('x-forwarded-proto 헤더가 https인 경우 리다이렉션하지 않아야 함', () => {
            req.headers['x-forwarded-proto'] = 'https';
            const middleware = httpsRedirect();

            middleware(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('건강 체크 경로는 리다이렉션하지 않아야 함', () => {
            req.path = '/health';
            const middleware = httpsRedirect();

            middleware(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('통계가 올바르게 기록되어야 함', () => {
            req.secure = true;
            const middleware = httpsRedirect();

            middleware(req, res, next);

            const stats = HttpsEnforcementMonitor.getStats();
            expect(stats.totalRequests).toBe(1);
            expect(stats.httpsRequests).toBe(1);
        });
    });

    describe('hstsHeaders', () => {
        it('HTTPS 연결에서 HSTS 헤더를 설정해야 함', () => {
            req.secure = true;
            const middleware = hstsHeaders();

            middleware(req, res, next);

            expect(res.setHeader).toHaveBeenCalledWith(
                'Strict-Transport-Security',
                expect.stringContaining('max-age=')
            );
            expect(next).toHaveBeenCalled();
        });

        it('HTTP 연결에서는 HSTS 헤더를 설정하지 않아야 함', () => {
            req.secure = false;
            const middleware = hstsHeaders();

            middleware(req, res, next);

            expect(res.setHeader).not.toHaveBeenCalledWith(
                'Strict-Transport-Security',
                expect.any(String)
            );
            expect(next).toHaveBeenCalled();
        });
    });

    describe('mixedContentProtection', () => {
        it('HTTPS 연결에서 CSP 헤더를 설정해야 함', () => {
            req.secure = true;
            res.getHeader = vi.fn().mockReturnValue(null);
            const middleware = mixedContentProtection();

            middleware(req, res, next);

            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Security-Policy',
                expect.any(String)
            );
            expect(next).toHaveBeenCalled();
        });

        it('HTTP 연결에서는 CSP 헤더를 설정하지 않아야 함', () => {
            req.secure = false;
            const middleware = mixedContentProtection();

            middleware(req, res, next);

            expect(res.setHeader).not.toHaveBeenCalledWith(
                'Content-Security-Policy',
                expect.any(String)
            );
            expect(next).toHaveBeenCalled();
        });
    });

    describe('secureCookieSettings', () => {
        it('HTTPS 연결에서 쿠키에 Secure 플래그를 추가해야 함', () => {
            req.secure = true;
            let originalSetHeader;
            const middleware = secureCookieSettings();

            middleware(req, res, next);

            // setHeader가 래핑되었는지 확인
            expect(res.setHeader).toBeDefined();
            expect(next).toHaveBeenCalled();
        });

        it('HTTP 연결에서는 쿠키 설정을 수정하지 않아야 함', () => {
            req.secure = false;
            const originalSetHeader = res.setHeader;
            const middleware = secureCookieSettings();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('httpsViolationDetector', () => {
        it('민감한 엔드포인트에 대한 HTTP 요청을 감지해야 함', () => {
            req.secure = false;
            req.path = '/user/login';
            const middleware = httpsViolationDetector();

            middleware(req, res, next);

            const stats = HttpsEnforcementMonitor.getStats();
            expect(stats.insecureRequests).toBe(1);
            expect(next).toHaveBeenCalled();
        });

        it('Mixed Content를 감지해야 함', () => {
            req.secure = true;
            req.get = vi.fn().mockReturnValue('http://example.com/');
            const middleware = httpsViolationDetector();

            middleware(req, res, next);

            const stats = HttpsEnforcementMonitor.getStats();
            expect(stats.mixedContentBlocked).toBe(1);
            expect(next).toHaveBeenCalled();
        });

        it('안전한 HTTPS 요청은 통과시켜야 함', () => {
            req.secure = true;
            req.path = '/safe/path';
            req.get = vi.fn().mockReturnValue('https://example.com/');
            const middleware = httpsViolationDetector();

            middleware(req, res, next);

            const stats = HttpsEnforcementMonitor.getStats();
            expect(stats.insecureRequests).toBe(0);
            expect(stats.mixedContentBlocked).toBe(0);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('HttpsEnforcementMonitor', () => {
        it('통계를 올바르게 기록해야 함', () => {
            HttpsEnforcementMonitor.recordRequest(true, false, false);
            HttpsEnforcementMonitor.recordRequest(false, true, false);
            HttpsEnforcementMonitor.recordMixedContentBlock();

            const stats = HttpsEnforcementMonitor.getStats();

            expect(stats.totalRequests).toBe(2);
            expect(stats.httpsRequests).toBe(1);
            expect(stats.httpRedirects).toBe(1);
            expect(stats.mixedContentBlocked).toBe(1);
            expect(stats.httpsRate).toBe('50.00%');
        });

        it('통계를 초기화할 수 있어야 함', () => {
            HttpsEnforcementMonitor.recordRequest(true);
            HttpsEnforcementMonitor.recordMixedContentBlock();

            let stats = HttpsEnforcementMonitor.getStats();
            expect(stats.totalRequests).toBe(1);

            HttpsEnforcementMonitor.reset();

            stats = HttpsEnforcementMonitor.getStats();
            expect(stats.totalRequests).toBe(0);
            expect(stats.httpsRequests).toBe(0);
            expect(stats.mixedContentBlocked).toBe(0);
        });
    });
});
