import logger from '../utils/Logger.js';

/**
 * 보안 이벤트 모니터링
 */
export class SecurityMonitor {
    static events = [];
    static alerts = [];
    static stats = {
        totalEvents: 0,
        criticalEvents: 0,
        blockedIPs: new Set(),
        startTime: Date.now()
    };

    static recordEvent(type, severity, data) {
        const event = {
            id: Date.now() + Math.random(),
            type,
            severity,
            data,
            timestamp: new Date().toISOString(),
            ip: data.ip || 'unknown'
        };

        this.events.unshift(event);
        this.stats.totalEvents++;

        if (severity === 'critical') {
            this.stats.criticalEvents++;
            this.alerts.unshift(event);
        }

        // 최근 1000개 이벤트만 보관
        if (this.events.length > 1000) {
            this.events = this.events.slice(0, 1000);
        }

        // 최근 100개 알림만 보관
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(0, 100);
        }

        logger.info(`보안 이벤트 기록: ${type}`, { severity, ...data });
    }

    static blockIP(ip, reason) {
        this.stats.blockedIPs.add(ip);
        this.recordEvent('IP_BLOCKED', 'critical', { ip, reason });
    }

    static getStats() {
        return {
            ...this.stats,
            blockedIPsCount: this.stats.blockedIPs.size,
            recentEvents: this.events.slice(0, 10),
            recentAlerts: this.alerts.slice(0, 5)
        };
    }
}

/**
 * 보안 모니터링 미들웨어
 */
export function securityMonitoring() {
    return (req, res, next) => {
        const startTime = Date.now();

        // 요청 분석
        const suspiciousPatterns = [
            /\.\.\//, // Path traversal
            /<script/i, // XSS
            /union.*select/i, // SQL Injection
            /eval\s*\(/i // Code injection
        ];

        const isSuspicious = suspiciousPatterns.some(pattern =>
            pattern.test(req.url) ||
            pattern.test(JSON.stringify(req.body || {}))
        );

        if (isSuspicious) {
            SecurityMonitor.recordEvent('SUSPICIOUS_REQUEST', 'high', {
                ip: req.ip,
                url: req.url,
                method: req.method,
                userAgent: req.get('User-Agent')
            });
        }

        // 응답 모니터링
        res.on('finish', () => {
            const duration = Date.now() - startTime;

            if (res.statusCode >= 400) {
                SecurityMonitor.recordEvent('ERROR_RESPONSE', 'medium', {
                    ip: req.ip,
                    statusCode: res.statusCode,
                    url: req.url,
                    duration
                });
            }
        });

        next();
    };
}

/**
 * 통합 보안 대시보드 API
 */
export function getSecurityDashboard(req, res) {
    const { getRateLimitStats } = require('./rateLimiting.js');
    const { getHttpsStats } = require('./httpsEnforcement.js');
    const { getSecurityHeadersStats } = require('./securityHeaders.js');

    res.json({
        success: true,
        data: {
            monitoring: SecurityMonitor.getStats(),
            rateLimiting: getRateLimitStats(),
            https: getHttpsStats(),
            headers: getSecurityHeadersStats(),
            timestamp: new Date().toISOString()
        }
    });
}

export default {
    SecurityMonitor,
    securityMonitoring,
    getSecurityDashboard
};
